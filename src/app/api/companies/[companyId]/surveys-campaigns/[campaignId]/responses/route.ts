import { db } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const responseCreateSchema = z.object({
  assessorId: z.string().min(1, 'A ID de quem responde é obrigatória.'),
  assesseeId: z.string().optional(),
  answers: z.record(z.string(), z.any()).refine((val) => Object.keys(val).length > 0, {
    message: 'O objeto de respostas não pode estar vazio.',
  }),
});

interface RouteContext {
  params: {
    companyId: string;
    campaignId: string;
  };
}

/**
 * @method POST
 * @description Submete uma nova resposta para uma campanha de pesquisa.
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { companyId, campaignId } = params;
    const rawData = await request.json();

    const validatedData = responseCreateSchema.parse(rawData);

    const campaignRef = db
      .collection('companies')
      .doc(companyId)
      .collection('survey-campaigns')
      .doc(campaignId);
    const campaignSnap = await campaignRef.get();

    if (!campaignSnap.exists) {
      return NextResponse.json({ error: 'Campanha não encontrada.' }, { status: 404 });
    }
    const campaignData = campaignSnap.data();
    if (campaignData?.status !== 'active') {
      return NextResponse.json(
        { error: 'Esta campanha não está ativa para receber respostas.' },
        { status: 403 }
      );
    }

    const responsesRef = campaignRef.collection('responses');
    const existingResponseQuery = await responsesRef
      .where('assessorId', '==', validatedData.assessorId)
      .limit(1)
      .get();

    if (!existingResponseQuery.empty) {
      return NextResponse.json(
        { error: 'Você já enviou uma resposta para esta pesquisa.' },
        { status: 409 }
      );
    }

    const responseToSave = {
      ...validatedData,
      submittedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await responsesRef.add(responseToSave);

    return NextResponse.json(
      { id: docRef.id, message: 'Resposta enviada com sucesso!' },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos.', details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    console.error(`Erro ao submeter resposta para a campanha ${params.campaignId}:`, error);
    return NextResponse.json({ error: 'Ocorreu um erro inesperado no servidor.' }, { status: 500 });
  }
}

/**
 * @method GET
 * @description Retorna a lista de respostas de uma campanha para análise e dashboards.
 */
export async function GET({ params }: RouteContext) {
  try {
    const { companyId, campaignId } = params;

    const campaignRef = db
      .collection('companies')
      .doc(companyId)
      .collection('survey-campaigns')
      .doc(campaignId);
    const campaignSnap = await campaignRef.get();

    if (!campaignSnap.exists) {
      return NextResponse.json({ error: 'Campanha não encontrada.' }, { status: 404 });
    }

    const campaignData = campaignSnap.data();
    const isClimateSurvey = campaignData?.type === 'climate';
    const responsesRef = campaignRef.collection('responses');
    const snapshot = await responsesRef.get();

    if (snapshot.empty) {
      return NextResponse.json([], { status: 200 });
    }

    const responses = snapshot.docs.map((doc) => {
      const data = doc.data();

      if (isClimateSurvey) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { assessorId, ...anonymousData } = data;
        return {
          id: doc.id,
          ...anonymousData,
        };
      }

      return {
        id: doc.id,
        ...data,
      };
    });

    return NextResponse.json(responses, { status: 200 });
  } catch (error) {
    console.error(`Erro ao buscar respostas da campanha ${params.campaignId}:`, error);
    return NextResponse.json({ error: 'Ocorreu um erro inesperado no servidor.' }, { status: 500 });
  }
}
