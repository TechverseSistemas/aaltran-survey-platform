import { db } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const campaignCreateSchema = z.object({
  title: z.string().min(1, 'O título da campanha é obrigatório.'),
  templateId: z.string().min(1, 'O ID do modelo de questionário é obrigatório.'),
  participants: z.array(z.string()).min(1, 'A campanha deve ter pelo menos um participante.'),
  startDate: z.coerce.date({ required_error: 'A data de início é obrigatória.' }),
  endDate: z.coerce.date({ required_error: 'A data de término é obrigatória.' }),
});

interface RouteContext {
  params: {
    companyId: string;
  };
}

/**
 * @method POST
 * @description Cria uma nova campanha de pesquisa dentro de uma empresa.
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { companyId } = params;
    const rawData = await request.json();

    const validatedData = campaignCreateSchema.parse(rawData);

    if (validatedData.endDate <= validatedData.startDate) {
      return NextResponse.json(
        { error: 'A data de término deve ser posterior à data de início.' },
        { status: 400 }
      );
    }

    const campaignsRef = db.collection('companies').doc(companyId).collection('survey-campaigns');

    const campaignToSave = {
      ...validatedData,
      status: 'draft',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await campaignsRef.add(campaignToSave);

    return NextResponse.json({ id: docRef.id, ...campaignToSave }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos.', details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    console.error(`Erro ao criar campanha para a empresa ${params.companyId}:`, error);
    return NextResponse.json({ error: 'Ocorreu um erro inesperado no servidor.' }, { status: 500 });
  }
}

/**
 * @method GET
 * @description Retorna uma lista de todas as campanhas de uma empresa.
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { companyId } = params;
    const campaignsRef = db.collection('companies').doc(companyId).collection('survey-campaigns');
    const snapshot = await campaignsRef.orderBy('createdAt', 'desc').get();

    if (snapshot.empty) {
      return NextResponse.json([], { status: 200 });
    }

    const campaigns = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(campaigns, { status: 200 });
  } catch (error) {
    console.error(`Erro ao buscar campanhas da empresa ${params.companyId}:`, error);
    return NextResponse.json({ error: 'Ocorreu um erro inesperado no servidor.' }, { status: 500 });
  }
}
