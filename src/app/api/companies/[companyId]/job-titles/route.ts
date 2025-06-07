import { db } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const jobTitleCreateSchema = z.object({
  name: z.string().min(1, 'O nome do cargo é obrigatório.'),
});

interface RouteContext {
  params: {
    companyId: string;
  };
}

/**
 * @method POST
 * @description Cria um novo cargo dentro de uma empresa específica.
 */
export async function POST(request: Request, { params }: RouteContext) {
  try {
    const { companyId } = params;
    const rawData = await request.json();

    const validatedData = jobTitleCreateSchema.parse(rawData);

    const jobTitlesRef = db.collection('companies').doc(companyId).collection('jobTitles');

    const jobTitleToSave = {
      ...validatedData,
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await jobTitlesRef.add(jobTitleToSave);

    return NextResponse.json(
      {
        id: docRef.id,
        ...jobTitleToSave,
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

    console.error(`Erro ao criar cargo para a empresa ${params.companyId}:`, error);
    return NextResponse.json({ error: 'Ocorreu um erro inesperado no servidor.' }, { status: 500 });
  }
}

/**
 * @method GET
 * @description Retorna uma lista de todos os cargos de uma empresa específica.
 */
export async function GET(request: Request, { params }: RouteContext) {
  try {
    const { companyId } = params;
    const jobTitlesRef = db.collection('companies').doc(companyId).collection('jobTitles');
    const snapshot = await jobTitlesRef.orderBy('name').get();

    if (snapshot.empty) {
      return NextResponse.json([], { status: 200 });
    }

    const jobTitles = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(jobTitles, { status: 200 });
  } catch (error) {
    console.error(`Erro ao buscar cargos da empresa ${params.companyId}:`, error);
    return NextResponse.json({ error: 'Ocorreu um erro inesperado no servidor.' }, { status: 500 });
  }
}
