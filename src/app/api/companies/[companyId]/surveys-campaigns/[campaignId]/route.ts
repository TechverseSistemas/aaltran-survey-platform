import { db } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const campaignUpdateSchema = z
  .object({
    title: z.string().min(1).optional(),
    status: z.enum(['draft', 'active', 'closed']).optional(),
  })
  .partial();

interface RouteContext {
  params: Promise<{
    companyId: string;
    campaignId: string;
  }>;
}

/**
 * @method GET
 * @description Busca os dados de uma campanha de pesquisa específica.
 */
export async function GET(request: Request, { params }: RouteContext) {
  const { companyId, campaignId } = await params;

  try {
    const docRef = db
      .collection('companies')
      .doc(companyId)
      .collection('survey-campaigns')
      .doc(campaignId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Campanha não encontrada.' }, { status: 404 });
    }

    return NextResponse.json({ id: docSnap.id, ...docSnap.data() }, { status: 200 });
  } catch (error) {
    console.error(`Erro ao buscar campanha ${campaignId}:`, error);
    return NextResponse.json({ error: 'Ocorreu um erro inesperado no servidor.' }, { status: 500 });
  }
}

/**
 * @method PUT
 * @description Atualiza os dados de uma campanha específica.
 */
export async function PUT(request: NextRequest, { params }: RouteContext) {
  const { companyId, campaignId } = await params;

  try {
    const rawData = await request.json();

    const validatedData = campaignUpdateSchema.parse(rawData);

    if (Object.keys(validatedData).length === 0) {
      return NextResponse.json(
        { error: 'Nenhum dado fornecido para atualização.' },
        { status: 400 }
      );
    }

    const docRef = db
      .collection('companies')
      .doc(companyId)
      .collection('survey-campaigns')
      .doc(campaignId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Campanha não encontrada.' }, { status: 404 });
    }

    await docRef.update({
      ...validatedData,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ message: `Campanha ${campaignId} atualizada com sucesso.` });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos.', details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    console.error(`Erro ao atualizar campanha ${campaignId}:`, error);
    return NextResponse.json({ error: 'Ocorreu um erro inesperado no servidor.' }, { status: 500 });
  }
}

/**
 * @method DELETE
 * @description Deleta uma campanha específica.
 */
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const { companyId, campaignId } = await params;

  try {
    const campaignRef = db
      .collection('companies')
      .doc(companyId)
      .collection('survey-campaigns')
      .doc(campaignId);
    const campaignSnap = await campaignRef.get();

    if (!campaignSnap.exists) {
      return NextResponse.json({ error: 'Campanha não encontrada.' }, { status: 404 });
    }

    const responsesRef = campaignRef.collection('responses');
    const querySnapshot = await responsesRef.limit(1).get();

    if (!querySnapshot.empty) {
      return NextResponse.json(
        { error: 'Não é possível excluir a campanha, pois ela já possui respostas.' },
        { status: 409 }
      );
    }

    await campaignRef.delete();

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Erro ao deletar campanha ${campaignId}:`, error);
    return NextResponse.json({ error: 'Ocorreu um erro inesperado no servidor.' }, { status: 500 });
  }
}
