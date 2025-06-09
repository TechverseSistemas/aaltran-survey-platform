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
  // VERIFICAÇÃO FINAL DO PROJETO CONECTADO
  // console.log(`[DEBUG] Conectado ao Projeto Firebase ID: ${db.app.options.projectId}`);
  
  const { companyId } = await params;

  if (!companyId) {
    return NextResponse.json({ error: 'ID da empresa não fornecido.' }, { status: 400 });
  }

  try {
    const companyRef = db.collection('companies').doc(companyId);

    // A busca de funcionários funciona, então a referência à empresa está correta.
    const employeesSnapshot = await companyRef.collection('employees').orderBy('name').get();
    if (employeesSnapshot.empty) {
      return NextResponse.json([], { status: 200 });
    }
    const employeesData = employeesSnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Employee
    );
    
    // O problema está aqui. A referência à coleção "departaments" não encontra nada.
    // VERIFIQUE O NOME DA COLEÇÃO NO SEU BANCO DE DADOS.
    const departamentsRef = companyRef.collection('departments'); // <--- O NOME AQUI ESTÁ IGUAL AO DO FIREBASE?
    const departamentsSnapshot = await departamentsRef.get();
    
    // O resto do código está correto, mas depende do sucesso da linha acima.
    const departamentsMap = new Map<string, string>();
    const departamentIds: string[] = [];
    departamentsSnapshot.forEach((doc) => {
      departamentsMap.set(doc.id, doc.data()?.name);
      departamentIds.push(doc.id);
    });

    console.log(`[DEBUG] Departamentos encontrados: ${departamentIds.length}`);

    const positionPromises = departamentIds.map((deptId) =>
      departamentsRef.doc(deptId).collection('positions').get()
    );
    const positionSnapshots = await Promise.all(positionPromises);
    const positionsMap = new Map<string, string>();
    positionSnapshots.forEach((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        positionsMap.set(doc.id, doc.data()?.name);
      });
    });
    
    const fullEmployees = employeesData.map((employee) => ({
      ...employee,
      departmentName: departamentsMap.get(employee.departmentId) || 'Não informado',
      positionName: positionsMap.get(employee.positionId) || 'Não informado',
    }));

    return NextResponse.json(fullEmployees);
  } catch (error) {
    console.error(`Erro ao buscar funcionários da empresa ${companyId}:`, error);
    return NextResponse.json({ error: 'Ocorreu um erro inesperado no servidor.' }, { status: 500 });
  }
}

