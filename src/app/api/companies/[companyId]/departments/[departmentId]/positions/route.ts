import { db } from '@/lib/firebase';
import { positionSchema } from '@/schemas/organizational';
import { FieldValue } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

interface RouteContext {
  params: Promise<{
    companyId: string;
    departmentId: string;
  }>;
}

/**
 * @method POST
 * @description Cria um novo cargo dentro de um departamento específico.
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  const { companyId, departmentId } = await params;

  try {
    const rawData = await request.json();

    const validatedData = positionSchema.parse(rawData);

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

    console.error(`Erro ao criar cargo para o departamento ${departmentId}:`, error);
    return NextResponse.json({ error: 'Ocorreu um erro inesperado no servidor.' }, { status: 500 });
  }
}

/**
 * @method GET
 * @description Retorna uma lista de todos os cargos de um departamento específico.
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { companyId, departmentId } = await params;

  try {
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
    console.error(`Erro ao buscar cargos do departamento ${departmentId}:`, error);
    return NextResponse.json({ error: 'Ocorreu um erro inesperado no servidor.' }, { status: 500 });
  }
}
