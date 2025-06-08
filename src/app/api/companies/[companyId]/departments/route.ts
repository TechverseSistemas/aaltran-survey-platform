import { db } from '@/lib/firebase';
import { departmentSchema } from '@/schemas/organizational';
import { FieldValue } from 'firebase-admin/firestore';
import { NextResponse } from 'next/server';
import { z } from 'zod';

interface RouteContext {
  params: Promise<{
    companyId: string;
  }>;
}

/**
 * @method POST
 * @description Cria um novo departamento dentro de uma empresa específica.
 */
export async function POST(request: Request, { params }: RouteContext) {
  const { companyId } = await params;

  try {
    const rawData = await request.json();

    const validatedData = departmentSchema.parse(rawData);

    const departmentsRef = db.collection('companies').doc(companyId).collection('departments');

    const departmentToSave = {
      ...validatedData,
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await departmentsRef.add(departmentToSave);

    return NextResponse.json(
      {
        id: docRef.id,
        ...departmentToSave,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Dados inválidos.',
          details: error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    console.error(`Erro ao criar departamento para a empresa ${companyId}:`, error);
    return NextResponse.json({ error: 'Ocorreu um erro inesperado no servidor.' }, { status: 500 });
  }
}

/**
 * @method GET
 * @description Retorna uma lista de todos os departamentos de uma empresa específica.
 */
export async function GET(request: Request, { params }: RouteContext) {
  const { companyId } = await params;

  try {
    const departmentsRef = db.collection('companies').doc(companyId).collection('departments');
    const snapshot = await departmentsRef.orderBy('name').get();

    if (snapshot.empty) {
      return NextResponse.json([], { status: 200 });
    }

    const departments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(departments, { status: 200 });
  } catch (error) {
    console.error(`Erro ao buscar departamentos da empresa ${companyId}:`, error);
    return NextResponse.json({ error: 'Ocorreu um erro inesperado no servidor.' }, { status: 500 });
  }
}
