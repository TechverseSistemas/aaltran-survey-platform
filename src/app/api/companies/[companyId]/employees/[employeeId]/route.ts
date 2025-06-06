// src/app/api/companies/[companyId]/employees/[employeeId]/route.ts

import { auth, db } from '@/lib/firebase';
import { employeeUpdateSchema } from '@/schemas/employee';
import { Employee, FullEmployee } from '@/types/employees';
import { FieldValue } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

interface RouteContext {
  params: {
    companyId: string;
    employeeId: string;
  };
}

/**
 * @method GET
 * @description Busca os dados de um funcionário específico, com os nomes de cargo e departamento.
 */
export async function GET({ params }: RouteContext) {
  try {
    const { companyId, employeeId } = params;

    const employeeRef = db
      .collection('companies')
      .doc(companyId)
      .collection('employees')
      .doc(employeeId);
    const employeeSnap = await employeeRef.get();

    if (!employeeSnap.exists) {
      return NextResponse.json({ error: 'Funcionário não encontrado.' }, { status: 404 });
    }

    const employeeData = { id: employeeSnap.id, ...employeeSnap.data() } as Employee;

    let departmentName = 'Não informado';
    let jobTitleName = 'Não informado';

    const [departmentSnap, jobTitleSnap] = await Promise.all([
      employeeData.departmentId
        ? db
            .collection('companies')
            .doc(companyId)
            .collection('departments')
            .doc(employeeData.departmentId)
            .get()
        : null,
      employeeData.jobTitleId
        ? db
            .collection('companies')
            .doc(companyId)
            .collection('jobTitles')
            .doc(employeeData.jobTitleId)
            .get()
        : null,
    ]);

    if (departmentSnap?.exists) {
      departmentName = departmentSnap.data()?.name;
    }
    if (jobTitleSnap?.exists) {
      jobTitleName = jobTitleSnap.data()?.name;
    }

    const fullEmployeeData: FullEmployee = {
      ...employeeData,
      departmentName,
      jobTitleName,
    };

    return NextResponse.json(fullEmployeeData, { status: 200 });
  } catch (error) {
    console.error(`Erro ao buscar funcionário ${params.employeeId}:`, error);
    return NextResponse.json({ error: 'Ocorreu um erro inesperado no servidor.' }, { status: 500 });
  }
}

/**
 * @method PUT
 * @description Atualiza os dados de um funcionário específico.
 */
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const { companyId, employeeId } = params;
    const rawData = await request.json();

    const validatedData = employeeUpdateSchema.partial().parse(rawData);

    if (Object.keys(validatedData).length === 0) {
      return NextResponse.json(
        { error: 'Nenhum dado fornecido para atualização.' },
        { status: 400 }
      );
    }

    const employeeRef = db
      .collection('companies')
      .doc(companyId)
      .collection('employees')
      .doc(employeeId);
    const employeeSnap = await employeeRef.get();

    if (!employeeSnap.exists) {
      return NextResponse.json({ error: 'Funcionário não encontrado.' }, { status: 404 });
    }

    const employeeData = employeeSnap.data() as Employee;
    const { login, password, ...firestoreData } = validatedData;

    if (login || password) {
      await auth.updateUser(employeeData.auth_uid, {
        ...(login && { email: login }),
        ...(password && { password: password }),
      });
    }

    await employeeRef.update({
      ...firestoreData,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ message: `Funcionário ${employeeId} atualizado com sucesso.` });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos.', details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    console.error(`Erro ao atualizar funcionário ${params.employeeId}:`, error);
    return NextResponse.json({ error: 'Ocorreu um erro inesperado no servidor.' }, { status: 500 });
  }
}

/**
 * @method DELETE
 * @description Deleta um funcionário, seu usuário de autenticação e seu perfil de usuário.
 */
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const { companyId, employeeId } = params;

    const employeeRef = db
      .collection('companies')
      .doc(companyId)
      .collection('employees')
      .doc(employeeId);
    const employeeSnap = await employeeRef.get();

    if (!employeeSnap.exists) {
      return NextResponse.json({ error: 'Funcionário não encontrado.' }, { status: 404 });
    }

    const employeeData = employeeSnap.data() as Employee;
    const { auth_uid } = employeeData;

    await auth.deleteUser(auth_uid);

    const batch = db.batch();
    const userProfileRef = db.collection('users').doc(auth_uid);

    batch.delete(employeeRef);
    batch.delete(userProfileRef);

    await batch.commit();

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Erro ao deletar funcionário ${params.employeeId}:`, error);
    return NextResponse.json({ error: 'Ocorreu um erro inesperado no servidor.' }, { status: 500 });
  }
}
