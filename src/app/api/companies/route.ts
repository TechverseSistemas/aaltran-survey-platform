import { db } from '@/lib/firebase';
import { companyCreateSchema } from '@/schemas/companies';
import { FieldValue } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const rawData = await request.json();
    const validatedData = companyCreateSchema.parse(rawData);

    const companyToSave = {
      ...validatedData,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('companies').add(companyToSave);

    return NextResponse.json({ id: docRef.id, ...companyToSave }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos.', details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    console.error('Erro ao criar empresa:', error);
    return NextResponse.json({ error: 'Ocorreu um erro inesperado no servidor.' }, { status: 500 });
  }
}

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

    return NextResponse.json(companies);
  } catch (error) {
    console.error('Erro ao buscar empresas:', error);
    return NextResponse.json({ error: 'Ocorreu um erro inesperado no servidor.' }, { status: 500 });
  }
}
