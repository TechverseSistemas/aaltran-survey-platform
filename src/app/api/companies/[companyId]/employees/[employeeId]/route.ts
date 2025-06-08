import { db } from '@/lib/firebase';
import { employeeUpdateSchema } from '@/schemas/employee';
import { Employee, FullEmployee } from '@/types/employees';
import { FieldValue } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

interface RouteContext {
  params: Promise<{
    companyId: string;
    employeeId: string;
  }>;
}

/**
 * @method GET
 * @description Busca um funcionário específico com os nomes de cargo e departamento.
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { companyId, employeeId } = await params;

  try {
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

    const [departmentSnap, positionSnap] = await Promise.all([
      db
        .collection('companies')
        .doc(companyId)
        .collection('departments')
        .doc(employeeData.departmentId)
        .get(),
      db
        .collection('companies')
        .doc(companyId)
        .collection('departments')
        .doc(employeeData.departmentId)
        .collection('positions')
        .doc(employeeData.positionId)
        .get(),
    ]);

    const departmentName = departmentSnap.exists ? departmentSnap.data()?.name : 'Não informado';
    const positionName = positionSnap.exists ? positionSnap.data()?.name : 'Não informado';

    const fullEmployeeData: FullEmployee = {
      ...employeeData,
      departmentName,
      positionName,
    };

    return NextResponse.json(fullEmployeeData, { status: 200 });
  } catch (error) {
    console.error(`Erro ao buscar funcionário ${employeeId}:`, error);
    return NextResponse.json({ error: 'Ocorreu um erro inesperado no servidor.' }, { status: 500 });
  }
}

/**
 * @method PUT
 * @description Atualiza os dados de um funcionário.
 */
export async function PUT(request: NextRequest, { params }: RouteContext) {
  const { companyId, employeeId } = await params;

  try {
    const rawData = await request.json();

    const validatedData = employeeUpdateSchema.parse(rawData);

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
    const docSnap = await employeeRef.get();
    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Funcionário não encontrado.' }, { status: 404 });
    }

    await employeeRef.update({
      ...validatedData,
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

    console.error(`Erro ao atualizar funcionário ${employeeId}:`, error);
    return NextResponse.json({ error: 'Ocorreu um erro inesperado no servidor.' }, { status: 500 });
  }
}

/**
 * @method DELETE
 * @description Deleta um funcionário do banco de dados.
 */
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const { companyId, employeeId } = await params;

  try {
    const employeeRef = db
      .collection('companies')
      .doc(companyId)
      .collection('employees')
      .doc(employeeId);
    const employeeSnap = await employeeRef.get();

    if (!employeeSnap.exists) {
      return NextResponse.json({ error: 'Funcionário não encontrado.' }, { status: 404 });
    }

    await employeeRef.delete();

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Erro ao deletar funcionário ${employeeId}:`, error);
    return NextResponse.json({ error: 'Ocorreu um erro inesperado no servidor.' }, { status: 500 });
  }
}
