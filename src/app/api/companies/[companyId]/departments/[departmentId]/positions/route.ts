import { db } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const positionCreateSchema = z.object({
  name: z.string().min(1, 'O nome do cargo é obrigatório.'),
});

interface RouteContext {
  params: {
    companyId: string;
    departmentId: string;
  };
}

/**
 * @method POST
 * @description Cria um novo cargo dentro de um departamento específico.
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { companyId, departmentId } = params;
    const rawData = await request.json();

    const validatedData = positionCreateSchema.parse(rawData);

    const positionsRef = db
      .collection('companies')
      .doc(companyId)
      .collection('departments')
      .doc(departmentId)
      .collection('positions');

    const positionToSave = {
      ...validatedData,
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await positionsRef.add(positionToSave);

    return NextResponse.json({ id: docRef.id, ...positionToSave }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos.', details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    console.error(`Erro ao criar cargo para o departamento ${params.departmentId}:`, error);
    return NextResponse.json({ error: 'Ocorreu um erro inesperado no servidor.' }, { status: 500 });
  }
}

/**
 * @method GET
 * @description Retorna uma lista de todos os cargos de um departamento específico.
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { companyId, departmentId } = params;
    const positionsRef = db
      .collection('companies')
      .doc(companyId)
      .collection('departments')
      .doc(departmentId)
      .collection('positions');

    const snapshot = await positionsRef.orderBy('name').get();

    if (snapshot.empty) {
      return NextResponse.json([], { status: 200 });
    }

    const positions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(positions, { status: 200 });
  } catch (error) {
    console.error(`Erro ao buscar cargos do departamento ${params.departmentId}:`, error);
    return NextResponse.json({ error: 'Ocorreu um erro inesperado no servidor.' }, { status: 500 });
  }
}
