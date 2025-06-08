import { db } from '@/lib/firebase';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const positionUpdateSchema = z
  .object({
    name: z.string().min(1, 'O nome do cargo é obrigatório.').optional(),
  })
  .partial();

interface RouteContext {
  params: {
    companyId: string;
    departmentId: string;
    positionId: string;
  };
}

/**
 * @method PUT
 * @description Atualiza os dados de um cargo específico.
 */
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const { companyId, departmentId, positionId } = params;
    const rawData = await request.json();

    const validatedData = positionUpdateSchema.parse(rawData);

    if (Object.keys(validatedData).length === 0) {
      return NextResponse.json(
        { error: 'Nenhum dado fornecido para atualização.' },
        { status: 400 }
      );
    }

    const docRef = db
      .collection('companies')
      .doc(companyId)
      .collection('departments')
      .doc(departmentId)
      .collection('positions')
      .doc(positionId);

    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Cargo não encontrado.' }, { status: 404 });
    }

    await docRef.update(validatedData);

    return NextResponse.json({ message: `Cargo ${positionId} atualizado com sucesso.` });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos.', details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    console.error(`Erro ao atualizar cargo ${params.positionId}:`, error);
    return NextResponse.json({ error: 'Ocorreu um erro inesperado no servidor.' }, { status: 500 });
  }
}

/**
 * @method DELETE
 * @description Deleta um cargo específico.
 */
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const { companyId, departmentId, positionId } = params;

    const positionRef = db
      .collection('companies')
      .doc(companyId)
      .collection('departments')
      .doc(departmentId)
      .collection('positions')
      .doc(positionId);

    const positionSnap = await positionRef.get();
    if (!positionSnap.exists) {
      return NextResponse.json({ error: 'Cargo não encontrado.' }, { status: 404 });
    }

    const employeesRef = db.collection('companies').doc(companyId).collection('employees');
    const q = employeesRef
      .where('departmentId', '==', departmentId)
      .where('positionId', '==', positionId)
      .limit(1);

    const querySnapshot = await q.get();
    if (!querySnapshot.empty) {
      return NextResponse.json(
        { error: 'Não é possível excluir o cargo, pois existem funcionários vinculados a ele.' },
        { status: 409 }
      );
    }

    await positionRef.delete();

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Erro ao deletar cargo ${params.positionId}:`, error);
    return NextResponse.json({ error: 'Ocorreu um erro inesperado no servidor.' }, { status: 500 });
  }
}
