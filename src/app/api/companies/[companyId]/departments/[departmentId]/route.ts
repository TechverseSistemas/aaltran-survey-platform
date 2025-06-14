import { db } from '@/lib/firebase';
import { departmentSchema } from '@/schemas/organizational';
import { NextResponse } from 'next/server';
import { z } from 'zod';

interface RouteContext {
  params: Promise<{
    companyId: string;
    departmentId: string;
  }>;
}

/**
 * @method PUT
 * @description Atualiza os dados de um departamento específico.
 */
export async function PUT(request: Request, { params }: RouteContext) {
  const { companyId, departmentId } = await params;

  try {
    const rawData = await request.json();

    const validatedData = departmentSchema.parse(rawData);

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
      .doc(departmentId);

    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Departamento não encontrado.' }, { status: 404 });
    }

    await docRef.update(validatedData);

    return NextResponse.json({ message: `Departamento ${departmentId} atualizado com sucesso.` });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos.', details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    console.error(`Erro ao atualizar departamento ${departmentId}:`, error);
    return NextResponse.json({ error: 'Ocorreu um erro inesperado no servidor.' }, { status: 500 });
  }
}

/**
 * @method DELETE
 * @description Deleta um departamento específico.
 */
export async function DELETE(request: Request, { params }: RouteContext) {
  const { companyId, departmentId } = await params;

  try {
    const departmentRef = db
      .collection('companies')
      .doc(companyId)
      .collection('departments')
      .doc(departmentId);
    const departmentSnap = await departmentRef.get();

    if (!departmentSnap.exists) {
      return NextResponse.json({ error: 'Departamento não encontrado.' }, { status: 404 });
    }

    const employeesRef = db.collection('companies').doc(companyId).collection('employees');
    const querySnapshot = await employeesRef
      .where('departmentId', '==', departmentId)
      .limit(1)
      .get();

    if (!querySnapshot.empty) {
      return NextResponse.json(
        {
          error:
            'Não é possível excluir o departamento, pois existem funcionários vinculados a ele.',
        },
        { status: 409 }
      );
    }

    await departmentRef.delete();

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Erro ao deletar departamento ${departmentId}:`, error);
    return NextResponse.json({ error: 'Ocorreu um erro inesperado no servidor.' }, { status: 500 });
  }
}
