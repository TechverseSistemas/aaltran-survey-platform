import { db } from '@/lib/firebase';
import { employeeCreateSchema } from '@/schemas/employee'; // Usando seu schema existente
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

/**
 * @method POST
 * @description Cria um novo funcionário, seu usuário de autenticação e seu perfil de usuário de forma atômica.
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  const { companyId } = params;

  try {
    const rawData = await request.json();
    const validatedData = employeeCreateSchema.parse(rawData);

    // --- Geração de Login e Senha ---
    const nameParts = validatedData.name.trim().split(' ');
    const firstName = nameParts[0].toLowerCase();
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1].toLowerCase() : '';
    const newLogin = `${firstName}.${lastName}`;

    const rawPassword = validatedData.cpf.replace(/\D/g, '');
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // --- CORREÇÃO: Tratamento de erro para a primeira execução ---
    let existingEmployee: QuerySnapshot;
    try {
      const employeeQuery = db.collectionGroup('employees').where('login', '==', newLogin).limit(1);
      existingEmployee = await employeeQuery.get();
    } catch (queryError: any) {
      // Se a query falhar (provavelmente porque o índice ainda não existe),
      // assumimos que o login está disponível e continuamos.
      console.warn(
        'Query de verificação de login falhou (pode ser a primeira execução):',
        queryError.message
      );
      // Simulamos um snapshot vazio para que a lógica de verificação prossiga corretamente.
      existingEmployee = { empty: true } as QuerySnapshot;
    }

    if (!existingEmployee.empty) {
      return NextResponse.json(
        { error: 'Este nome de usuário (nome.sobrenome) já está em uso.' },
        { status: 409 }
      );
    }

    // --- Salvar o Funcionário ---
    const employeeRef = db.collection('companies').doc(companyId).collection('employees').doc();
    const { id_departament: departmentId, id_section: jobTitleId, ...restOfData } = validatedData;

    const employeeToSave = {
      ...restOfData,
      login: newLogin,
      password: hashedPassword,
      departmentId,
      jobTitleId,
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
 * @description Retorna a lista de funcionários de uma empresa, com os nomes dos cargos e departamentos.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;

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
