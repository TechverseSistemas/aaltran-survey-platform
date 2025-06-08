import { db } from '@/lib/firebase';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const jobTitleUpdateSchema = z
  .object({
    name: z.string().min(1, 'O nome do cargo é obrigatório.').optional(),
  })
  .partial();

interface RouteContext {
  params: {
    companyId: string;
    jobTitleId: string;
  };
}

/**
 * @method PUT
 * @description Atualiza os dados de um cargo específico.
 */
export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const { companyId, jobTitleId } = params;
    const rawData = await request.json();

    const validatedData = jobTitleUpdateSchema.parse(rawData);

    if (Object.keys(validatedData).length === 0) {
      return NextResponse.json(
        { error: 'Nenhum dado fornecido para atualização.' },
        { status: 400 }
      );
    }

    const docRef = db
      .collection('companies')
      .doc(companyId)
      .collection('jobTitles')
      .doc(jobTitleId);

    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Cargo não encontrado.' }, { status: 404 });
    }

    await docRef.update(validatedData);

    return NextResponse.json({ message: `Cargo ${jobTitleId} atualizado com sucesso.` });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos.', details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    console.error(`Erro ao atualizar cargo ${params.jobTitleId}:`, error);
    return NextResponse.json({ error: 'Ocorreu um erro inesperado no servidor.' }, { status: 500 });
  }
}

/**
 * @method DELETE
 * @description Deleta um cargo específico.
 */
export async function DELETE({ params }: RouteContext) {
  try {
    const { companyId, jobTitleId } = params;

    const jobTitleRef = db
      .collection('companies')
      .doc(companyId)
      .collection('jobTitles')
      .doc(jobTitleId);
    const jobTitleSnap = await jobTitleRef.get();

    if (!jobTitleSnap.exists) {
      return NextResponse.json({ error: 'Cargo não encontrado.' }, { status: 404 });
    }

    // --- Boa Prática: Verificação de Dependências ---
    // Antes de excluir um cargo, verifica se algum funcionário está vinculado a ele.
    const employeesRef = db.collection('companies').doc(companyId).collection('employees');
    const querySnapshot = await employeesRef.where('jobTitleId', '==', jobTitleId).limit(1).get();

    if (!querySnapshot.empty) {
      return NextResponse.json(
        { error: 'Não é possível excluir o cargo, pois existem funcionários vinculados a ele.' },
        { status: 409 } // 409 Conflict
      );
    }

    await jobTitleRef.delete();

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Erro ao deletar cargo ${params.jobTitleId}:`, error);
    return NextResponse.json({ error: 'Ocorreu um erro inesperado no servidor.' }, { status: 500 });
  }
}
