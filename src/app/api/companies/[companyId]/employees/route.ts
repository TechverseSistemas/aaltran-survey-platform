import { db } from '@/lib/firebase';
import { employeeCreateSchema } from '@/schemas/employees';
import { Employee } from '@/types/employees';
import bcrypt from 'bcrypt';
import { FieldValue } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

interface RouteContext {
  params: Promise<{
    companyId: string;
  }>;
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { companyId } = await params;

  try {
    const rawData = await request.json();
    const validatedData = employeeCreateSchema.parse(rawData);
    const cleanCPF = validatedData.cpf.replace(/\D/g, '');
    const { departmentId, positionId, isLeader, ...restOfData } = validatedData;

    const departmentRef = db
      .collection('companies')
      .doc(companyId)
      .collection('departments')
      .doc(departmentId);
    const departmentSnap = await departmentRef.get();
    if (!departmentSnap.exists) {
      return NextResponse.json(
        { error: `O departamento especificado não existe.` },
        { status: 400 }
      );
    }
    const departmentName = departmentSnap.data()?.name;

    const positionRef = departmentRef.collection('positions').doc(positionId);
    const positionSnap = await positionRef.get();
    if (!positionSnap.exists) {
      return NextResponse.json(
        { error: `O cargo especificado não existe neste departamento.` },
        { status: 400 }
      );
    }
    const positionName = positionSnap.data()?.name;

    const newLogin = `${validatedData.name.trim().split(' ')[0].toLowerCase()}.${validatedData.name.trim().split(' ').pop()?.toLowerCase()}`;
    const cpfQuery = db.collectionGroup('employees').where('cpf', '==', cleanCPF).limit(1);
    const loginQuery = db.collectionGroup('employees').where('login', '==', newLogin).limit(1);

    const [existingCpf, existingLogin] = await Promise.all([cpfQuery.get(), loginQuery.get()]);

    if (!existingCpf.empty) {
      return NextResponse.json(
        { error: `O CPF '${validatedData.cpf}' já está cadastrado.` },
        { status: 409 }
      );
    }
    if (!existingLogin.empty) {
      return NextResponse.json({ error: `O login '${newLogin}' já está em uso.` }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(cleanCPF, 10);

    const employeeToSave = {
      ...restOfData,
      cpf: cleanCPF,
      login: newLogin,
      password: hashedPassword,
      departmentId,
      positionId,
      departmentName: departmentName,
      positionName: positionName,
      isLeader,
      role: 'employee',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await db.collection('companies').doc(companyId).collection('employees').add(employeeToSave);

    return NextResponse.json(
      { message: 'Funcionário criado com sucesso!', login: newLogin },
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
  const { companyId } = await params;

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

    return NextResponse.json(employeesData);
  } catch (error) {
    console.error(`Erro ao buscar funcionários da empresa ${companyId}:`, error);
    return NextResponse.json({ error: 'Ocorreu um erro inesperado no servidor.' }, { status: 500 });
  }
}
