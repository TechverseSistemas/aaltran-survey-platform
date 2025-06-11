import { db } from '@/lib/firebase';
import { companyUpdateSchema } from '@/schemas/companies';
import { FieldValue } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

interface RouteContext {
  params: Promise<{
    companyId: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { companyId } = await params;

  try {
    const docRef = db.collection('companies').doc(companyId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Empresa não encontrada.' }, { status: 404 });
    }

    return NextResponse.json({ id: docSnap.id, ...docSnap.data() });
  } catch (error) {
    console.error(`Erro ao buscar empresa ${companyId}:`, error);
    return NextResponse.json({ error: 'Ocorreu um erro inesperado no servidor.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
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
      return NextResponse.json(
        { error: 'Empresa não encontrada para atualizar.' },
        { status: 404 }
      );
    }

    const dataToUpdate = { ...validatedData, updatedAt: FieldValue.serverTimestamp() };
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

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const { companyId } = await params;

  try {
    const docRef = db.collection('companies').doc(companyId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Empresa não encontrada para deletar.' }, { status: 404 });
    }

    // ATENÇÃO: A exclusão de um documento NÃO exclui suas subcoleções (employees, departments, etc.).
    // Isso pode deixar dados órfãos no seu banco.
    // Para uma exclusão completa em cascata, é necessário usar uma Cloud Function ou a extensão
    // "Delete User Data" do Firebase, que pode ser adaptada para limpar subcoleções.

    await docRef.delete();

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Erro ao deletar empresa ${companyId}:`, error);
    return NextResponse.json({ error: 'Ocorreu um erro inesperado no servidor.' }, { status: 500 });
  }
}
