import { db } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const focalPointSchema = z.object({
  name: z.string().min(1, 'O nome do ponto focal é obrigatório.'),
  email: z.string().email('O e-mail do ponto focal é inválido.'),
  phone: z.string().min(1, 'O telefone do ponto focal é obrigatório.'),
});

const companyCreateSchema = z.object({
  cnpj: z
    .string()
    .min(14, 'O CNPJ deve ter no mínimo 14 caracteres.')
    .max(18, 'O CNPJ deve ter no máximo 18 caracteres.'),
  fantasy_name: z.string().min(1, 'O nome fantasia é obrigatório.'),
  full_address: z.string().min(1, 'O endereço é obrigatório.'),
  owner: z.string().min(1, 'O nome do proprietário é obrigatório.'),
  focal_point: focalPointSchema,
});

/**
 * @method POST
 * @description Cria uma nova empresa no banco de dados.
 */
export async function POST(request: Request) {
  try {
    const rawData = await request.json();

    const validatedData = companyCreateSchema.parse(rawData);

    const companyToSave = {
      ...validatedData,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('companies').add(companyToSave);

    return NextResponse.json(
      {
        id: docRef.id,
        ...companyToSave,
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

    console.error('Erro ao criar empresa:', error);
    return NextResponse.json({ error: 'Ocorreu um erro inesperado no servidor.' }, { status: 500 });
  }
}

/**
 * @method GET
 * @description Retorna uma lista de todas as empresas cadastradas.
 */
export async function GET() {
  try {
    const snapshot = await db.collection('companies').orderBy('fantasy_name').get();

    if (snapshot.empty) {
      return NextResponse.json([], { status: 200 });
    }

    const companies = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(companies, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar empresas:', error);
    return NextResponse.json({ error: 'Ocorreu um erro inesperado no servidor.' }, { status: 500 });
  }
}
