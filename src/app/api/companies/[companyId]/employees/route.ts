import { db } from '@/lib/firebase';
import { employeeCreateSchema } from '@/schemas/employee';
import { Employee } from '@/types/employees'; // Importamos o tipo atualizado
import { FieldValue, QuerySnapshot } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcrypt';

interface RouteContext {
  params: Promise<{
    companyId: string;
  }>;
}

/**
 * @method POST
 * @description Cria um novo funcionário com a nova estrutura de cargo (position).
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  const { companyId } = await params;

  try {
    const rawData = await request.json();
    const validatedData = employeeCreateSchema.parse(rawData);

    const { departmentId: departmentId, positionId: positionId, ...restOfData } = validatedData;

    const nameParts = validatedData.name.trim().split(' ');
    const newLogin = `${nameParts[0].toLowerCase()}.${nameParts.length > 1 ? nameParts[nameParts.length - 1].toLowerCase() : ''}`;

    const rawPassword = validatedData.cpf.replace(/\D/g, '');
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    let existingEmployee: QuerySnapshot;
    try {
      const employeeQuery = db.collectionGroup('employees').where('login', '==', newLogin).limit(1);
      existingEmployee = await employeeQuery.get();
    } catch (queryError: any) {
      console.warn('Query de verificação de login falhou:', queryError.message);
      existingEmployee = { empty: true } as QuerySnapshot;
    }

    if (!existingEmployee.empty) {
      return NextResponse.json({ error: 'Este nome de usuário já está em uso.' }, { status: 409 });
    }

    const employeeRef = db.collection('companies').doc(companyId).collection('employees').doc();

    const employeeToSave = {
      ...restOfData,
      login: newLogin,
      password: hashedPassword,
      departmentId,
      positionId,
      role: 'employee',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await employeeRef.set(employeeToSave);

    return NextResponse.json(
      {
        message: 'Funcionário criado com sucesso!',
        employeeId: employeeRef.id,
        login: newLogin,
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

    console.error(`Erro ao criar funcionário para a empresa ${companyId}:`, error);
    return NextResponse.json({ error: 'Ocorreu um erro inesperado no servidor.' }, { status: 500 });
  }
}

/**
 * @method GET
 * @description Retorna a lista de funcionários com os nomes de cargo e departamento, usando a nova estrutura.
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { companyId } = await params;

  try {
    const employeesRef = db.collection('companies').doc(companyId).collection('employees');
    const employeesSnapshot = await employeesRef.orderBy('name').get();
    if (employeesSnapshot.empty) {
      return NextResponse.json([], { status: 200 });
    }
    const employeesData = employeesSnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Employee
    );

    const departmentsRef = db.collection('companies').doc(companyId).collection('departments');
    const departmentsSnapshot = await departmentsRef.get();
    const departmentsMap = new Map(
      departmentsSnapshot.docs.map((doc) => [doc.id, doc.data()?.name])
    );

    const positionsSnapshot = await db
      .collectionGroup('positions')
      .where('__name__', '>=', `companies/${companyId}/departments`)
      .where('__name__', '<', `companies/${companyId}/departments0`)
      .get();
    const positionsMap = new Map(positionsSnapshot.docs.map((doc) => [doc.id, doc.data()?.name]));

    const fullEmployees = employeesData.map((employee) => ({
      ...employee,
      departmentName: departmentsMap.get(employee.departmentId) || 'Não informado',
      positionName: positionsMap.get(employee.positionId) || 'Não informado',
    }));

    return NextResponse.json(fullEmployees);
  } catch (error) {
    console.error(`Erro ao buscar funcionários da empresa ${companyId}:`, error);
    return NextResponse.json({ error: 'Ocorreu um erro inesperado no servidor.' }, { status: 500 });
  }
}
