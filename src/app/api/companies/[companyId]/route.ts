import { db } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const companyUpdateSchema = z
  .object({
    cnpj: z.string().min(14).max(18).optional(),
    fantasy_name: z.string().min(1).optional(),
    full_address: z.string().min(1).optional(),
    owner: z.string().min(1).optional(),
    focal_point: z
      .object({
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
        phone: z.string().min(1).optional(),
      })
      .partial()
      .optional(),
  })
  .partial();

interface RouteContext {
  params: Promise<{
    companyId: string;
  }>;
}

/**
 * @method GET
 * @description Busca os dados de uma empresa específica.
 */
export async function GET(request: Request, { params }: RouteContext) {
  const { companyId } = await params;

  try {
    const docRef = db.collection('companies').doc(companyId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Empresa não encontrada.' }, { status: 404 });
    }

    return NextResponse.json({ id: docSnap.id, ...docSnap.data() }, { status: 200 });
  } catch (error) {
    console.error(`Erro ao buscar empresa ${companyId}:`, error);
    return NextResponse.json({ error: 'Ocorreu um erro inesperado no servidor.' }, { status: 500 });
  }
}

/**
 * @method PUT
 * @description Atualiza os dados de uma empresa específica.
 */
export async function PUT(request: Request, { params }: RouteContext) {
  const { companyId } = await params;

  try {
    const rawData = await request.json();

    const validatedData = companyUpdateSchema.parse(rawData);

    if (Object.keys(validatedData).length === 0) {
      return NextResponse.json(
        { error: 'Nenhum dado fornecido para atualização.' },
        { status: 400 }
      );
    }

    const docRef = db.collection('companies').doc(companyId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Empresa não encontrada.' }, { status: 404 });
    }

    const dataToUpdate = {
      ...validatedData,
      updatedAt: FieldValue.serverTimestamp(),
    };

    await docRef.update(dataToUpdate);

    return NextResponse.json({ message: `Empresa ${companyId} atualizada com sucesso.` });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos.', details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    console.error(`Erro ao atualizar empresa ${companyId}:`, error);
    return NextResponse.json({ error: 'Ocorreu um erro inesperado no servidor.' }, { status: 500 });
  }
}

/**
 * @method DELETE
 * @description Deleta uma empresa específica.
 */
export async function DELETE(request: Request, { params }: RouteContext) {
  const { companyId } = await params;

  try {
    const docRef = db.collection('companies').doc(companyId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Empresa não encontrada.' }, { status: 404 });
    }

    // IMPORTANTE: Deletar um documento NÃO deleta suas subcoleções.
    // Para deletar funcionários, departamentos, etc., associados a esta empresa,
    // você DEVE usar uma Cloud Function ou a extensão "Delete User Data" do Firebase
    // que é acionada pelo evento de exclusão deste documento.
    // A lógica abaixo apaga APENAS o documento da empresa.

    await docRef.delete();

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Erro ao deletar empresa ${companyId}:`, error);
    return NextResponse.json({ error: 'Ocorreu um erro inesperado no servidor.' }, { status: 500 });
  }
}
