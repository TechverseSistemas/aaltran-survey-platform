import { db } from '@/lib/firebase';
import { SurveyTemplate } from '@/types/surveys';
import { FieldValue } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const questionSchema = z.object({
  id: z.string().uuid('O ID da questão deve ser um UUID válido.'),
  text: z.string().min(1, 'O texto da questão é obrigatório.'),
  type: z.enum(['likert_5', 'binary', 'open_text'], {
    errorMap: () => ({
      message: "Tipo de questão inválido. Use 'likert_5', 'binary' ou 'open_text'.",
    }),
  }),
  category: z.string().min(1, 'A categoria da questão é obrigatória.'),
  weight: z.number().optional(),
});

const templateCreateSchema = z.object({
  title: z.string().min(1, 'O título do modelo é obrigatório.'),
  description: z.string().optional(),
  type: z.enum(['climate', 'performance_90', 'performance_180', 'performance_360']),
  questions: z.array(questionSchema).min(1, 'O modelo deve ter pelo menos uma questão.'),
  companyId: z.string().optional(),
});

/**
 * @method POST
 * @description Cria um novo modelo de questionário (global ou específico da empresa).
 */
export async function POST(request: NextRequest) {
  try {
    const rawData = await request.json();
    const validatedData = templateCreateSchema.parse(rawData);

    const templateToSave = {
      ...validatedData,
      isGlobal: !validatedData.companyId,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('survey-templates').add(templateToSave);

    return NextResponse.json({ id: docRef.id, ...templateToSave }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos.', details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    console.error(`Erro ao criar modelo de questionário:`, error);
    return NextResponse.json({ error: 'Ocorreu um erro inesperado no servidor.' }, { status: 500 });
  }
}

/**
 * @method GET
 * @description Retorna uma lista de modelos: todos os globais + os da empresa especificada (via query param).
 */
export async function GET(request: NextRequest) {
  try {
    const companyId = request.nextUrl.searchParams.get('companyId');
    const templatesRef = db.collection('survey-templates');

    const globalTemplatesQuery = templatesRef.where('isGlobal', '==', true);
    const companyTemplatesQuery = companyId
      ? templatesRef.where('companyId', '==', companyId)
      : null;

    const queries = [globalTemplatesQuery.get()];
    if (companyTemplatesQuery) {
      queries.push(companyTemplatesQuery.get());
    }

    const snapshots = await Promise.all(queries);

    const templates = snapshots.flatMap((snapshot) =>
      snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as SurveyTemplate)
    );

    const uniqueTemplates = Array.from(new Map(templates.map((item) => [item.id, item])).values());
    uniqueTemplates.sort((a, b) => a.title.localeCompare(b.title));

    return NextResponse.json(uniqueTemplates, { status: 200 });
  } catch (error) {
    console.error(`Erro ao buscar modelos de questionário:`, error);
    return NextResponse.json({ error: 'Ocorreu um erro inesperado no servidor.' }, { status: 500 });
  }
}
