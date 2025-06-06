import { NextResponse } from 'next/server';
import { FieldValue, DocumentReference, DocumentSnapshot } from 'firebase-admin/firestore';
import { db } from '@/lib/firebase';
import { Employee } from '@/types/employees';
import z from 'zod';

const employeeUpdateBodySchema = z.object({
  id_company: z.string().min(1).optional(),
  id_section: z.string().min(1).optional(),
  id_departament: z.string().min(1).optional(),
  name: z.string().min(1).max(100).optional(),
  birth_date: z.coerce.date().optional(),
  gender: z.enum(['Masculino', 'Feminino']).optional(),
  scholarity: z
    .enum([
      'ensino_fundamental',
      'ensino_medio',
      'ensino_superior',
      'pos_graduacao',
      'mestrado',
      'doutorado',
    ])
    .optional(),
  admission_date: z.coerce.date().optional(),
  leader: z.boolean().optional(),
  password: z.string().min(6).max(100).optional(),
});

interface RouteParams {
  id: string;
}

export async function GET({ params }: { params: RouteParams }) {
  try {
    const { id } = params;
    const docRef: DocumentReference = db.collection('employees').doc(id);
    const doc: DocumentSnapshot = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Employee not found' } as { error: string }, {
        status: 404,
      });
    }

    const responsePayload = {
      id: doc.id,
      ...doc.data(),
    } as Employee;

    return NextResponse.json(responsePayload, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch employee:', error);
    return NextResponse.json({ error: 'Failed to fetch employee' } as { error: string }, {
      status: 500,
    });
  }
}

export async function PUT(request: Request, { params }: { params: RouteParams }) {
  try {
    const { id } = params;
    const rawData = await request.json();

    const validatedData = employeeUpdateBodySchema.parse(rawData);

    const docRef: DocumentReference = db.collection('employees').doc(id);

    const dataToUpdate = {
      ...validatedData,
      updated_at: FieldValue.serverTimestamp(),
    };

    await docRef.update(dataToUpdate);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...responseDataWithoutPassword } = validatedData;

    const responsePayload = {
      id,
      ...responseDataWithoutPassword,
    };

    return NextResponse.json(responsePayload, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    console.error('Failed to update employee:', error);
    if (error instanceof Error && error.message.includes('NOT_FOUND')) {
      return NextResponse.json({ error: 'Employee not found to update' } as { error: string }, {
        status: 404,
      });
    }

    return NextResponse.json({ error: 'Failed to update employee' } as { error: string }, {
      status: 500,
    });
  }
}

export async function DELETE({ params }: { params: RouteParams }) {
  try {
    const { id } = params;
    const docRef: DocumentReference = db.collection('employees').doc(id);

    await docRef.delete();

    return NextResponse.json({ message: 'Employee deleted successfully' } as { message: string }, {
      status: 200,
    });
  } catch (error) {
    console.error('Failed to delete employee:', error);
    return NextResponse.json({ error: 'Failed to delete employee' } as { error: string }, {
      status: 500,
    });
  }
}
