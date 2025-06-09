import { db } from '@/lib/firebase';
import { employeeCreateSchema } from '@/schemas/employees';
import { Employee } from '@/types/employees';
import { FieldValue, QuerySnapshot } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcrypt';

interface RouteContext {
  params: {
    companyId: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { companyId } = params;

  try {
    const rawData = await request.json();
    const validatedData = employeeCreateSchema.parse(rawData);

    const nameParts = validatedData.name.trim().split(' ');
    const newLogin = `${nameParts[0].toLowerCase()}.${nameParts.length > 1 ? nameParts[nameParts.length - 1].toLowerCase() : ''}`;

    const rawPassword = validatedData.cpf.replace(/\D/g, '');
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    let existingEmployee: QuerySnapshot;
    try {
      const employeeQuery = db.collectionGroup('employees').where('login', '==', newLogin).limit(1);
      existingEmployee = await employeeQuery.get();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (queryError: any) {
      console.warn(
        'Query de verificação de login falhou (pode ser a primeira execução):',
        queryError.message
      );
      existingEmployee = { empty: true } as QuerySnapshot;
    }

    if (!existingEmployee.empty) {
      return NextResponse.json({ error: 'Este nome de usuário já está em uso.' }, { status: 409 });
    }

    const employeeToSave = {
      ...validatedData,
      login: newLogin,
      password: hashedPassword,
      role: 'employee',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await db.collection('companies').doc(companyId).collection('employees').add(employeeToSave);

    return NextResponse.json(
      {
        message: 'Funcionário criado com sucesso!',
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

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { companyId } = params;
  try {
    const employeesRef = db.collection('companies').doc(companyId).collection('employees');
    const employeesSnapshot = await employeesRef.orderBy('name').get();
    if (employeesSnapshot.empty) {
      return NextResponse.json([], { status: 200 });
    }
    const employeesData = employeesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        birth_date: data.birth_date?.toDate(),
        admission_date: data.admission_date?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Employee;
    });

    const departmentsRef = db.collection('companies').doc(companyId).collection('departments');
    const departmentsSnapshot = await departmentsRef.get();
    const departmentsMap = new Map(
      departmentsSnapshot.docs.map((doc) => [doc.id, doc.data()?.name])
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const positionPromises = new Map<string, Promise<any>>();

    employeesData.forEach((employee) => {
      if (
        employee.positionId &&
        employee.departmentId &&
        !positionPromises.has(employee.positionId)
      ) {
        const promise = db
          .collection('companies')
          .doc(companyId)
          .collection('departments')
          .doc(employee.departmentId)
          .collection('positions')
          .doc(employee.positionId)
          .get();
        positionPromises.set(employee.positionId, promise);
      }
    });

    const positionDocs = await Promise.all(positionPromises.values());
    const positionsMap = new Map(
      positionDocs.filter((doc) => doc.exists).map((doc) => [doc.id, doc.data()?.name])
    );

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