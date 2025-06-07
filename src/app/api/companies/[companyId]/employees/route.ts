import { db } from '@/lib/firebase';
import { employeeCreateSchema } from '@/schemas/employee'; // Usando seu schema existente
import { Employee } from '@/types/employees';
import { FieldValue } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

interface RouteContext {
  params: {
    companyId: string;
  };
}

/**
 * @method POST
 * @description Cria um novo funcionário, seu usuário de autenticação e seu perfil de usuário de forma atômica.
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  const { companyId } = params;

  try {
    const rawData = await request.json();
    const validatedData = employeeCreateSchema.parse(rawData);

    const { id_departament: departmentId, id_section: jobTitleId, ...restOfData } = validatedData;

    // const userRecord = await auth.createUser({
    //   email: restOfData.login,
    //   password: restOfData.password,
    //   displayName: restOfData.name,
    //   disabled: false,
    // });

    // const { uid } = userRecord;
    const batch = db.batch();

    const employeeRef = db.collection('companies').doc(companyId).collection('employees').doc();

    const employeeToSave = {
      ...restOfData,
      departmentId,
      jobTitleId,
      // auth_uid: uid,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    if ('password' in employeeToSave) {
      delete (employeeToSave as { password?: string }).password;
    }

    batch.set(employeeRef, employeeToSave);

    const userProfileRef = db.collection('users').doc();
    // const userProfileRef = db.collection('users').doc(uid);
    batch.set(userProfileRef, {
      email: restOfData.login,
      role: 'employee',
      companyId: companyId,
      employeeId: employeeRef.id,
    });

    await batch.commit();

    return NextResponse.json(
      {
        message: 'Funcionário criado com sucesso!',
        employeeId: employeeRef.id,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos.', details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'auth/email-already-exists'
    ) {
      return NextResponse.json(
        { error: 'O login (e-mail) fornecido já está em uso.' },
        { status: 409 }
      );
    }

    console.error(`Erro ao criar funcionário para a empresa ${companyId}:`, error);
    return NextResponse.json({ error: 'Ocorreu um erro inesperado no servidor.' }, { status: 500 });
  }
}

/**
 * @method GET
 * @description Retorna a lista de funcionários de uma empresa, com os nomes dos cargos e departamentos.
 */
export async function GET(request: Request, { params }: RouteContext) {
  const { companyId } = params;

  try {
    const employeesRef = db.collection('companies').doc(companyId).collection('employees');
    const employeesSnapshot = await employeesRef.orderBy('name').get();

    if (employeesSnapshot.empty) {
      return NextResponse.json([], { status: 200 });
    }

    const employeesData = employeesSnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Employee
    );

    const departmentIds = [...new Set(employeesData.map((e) => e.departmentId).filter(Boolean))];
    const jobTitleIds = [...new Set(employeesData.map((e) => e.jobTitleId).filter(Boolean))];

    const departmentPromises = departmentIds.map((id) =>
      db.collection('companies').doc(companyId).collection('departments').doc(id).get()
    );
    const jobTitlePromises = jobTitleIds.map((id) =>
      db.collection('companies').doc(companyId).collection('jobTitles').doc(id).get()
    );

    const [departmentDocs, jobTitleDocs] = await Promise.all([
      Promise.all(departmentPromises),
      Promise.all(jobTitlePromises),
    ]);

    const departmentsMap = new Map(departmentDocs.map((doc) => [doc.id, doc.data()?.name]));
    const jobTitlesMap = new Map(jobTitleDocs.map((doc) => [doc.id, doc.data()?.name]));

    const fullEmployees = employeesData.map((employee) => ({
      ...employee,
      departmentName: departmentsMap.get(employee.departmentId) || 'Não informado',
      jobTitleName: jobTitlesMap.get(employee.jobTitleId) || 'Não informado',
    }));

    return NextResponse.json(fullEmployees);
  } catch (error) {
    console.error(`Erro ao buscar funcionários da empresa ${companyId}:`, error);
    return NextResponse.json({ error: 'Ocorreu um erro inesperado no servidor.' }, { status: 500 });
  }
}
