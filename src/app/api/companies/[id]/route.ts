import { NextResponse } from 'next/server';
import { FieldValue, DocumentReference, DocumentSnapshot } from 'firebase-admin/firestore';
import { db } from '@/lib/firebase';
import { Company } from '@/types/companies';

interface RouteParams {
  id: string;
}

export async function GET({ params }: { params: RouteParams }) {
  try {
    const { id } = params;
    const docRef: DocumentReference = db.collection('companies').doc(id);
    const doc: DocumentSnapshot = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Company not found' } as { error: string }, {
        status: 404,
      });
    }

    const responsePayload = {
      id: doc.id,
      ...doc.data(),
    } as Company;

    return NextResponse.json(responsePayload, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch company:', error);
    return NextResponse.json({ error: 'Failed to fetch company' } as { error: string }, {
      status: 500,
    });
  }
}

export async function PUT(request: Request, { params }: { params: RouteParams }) {
  try {
    const { id } = params;
    const companyData: Partial<Company> = await request.json();
    const docRef: DocumentReference = db.collection('companies').doc(id);

    const dataToUpdate: Partial<Company> & { updated_at: FieldValue } = {
      ...companyData,
      updated_at: FieldValue.serverTimestamp(),
    };

    await docRef.update(dataToUpdate);

    const responsePayload = {
      id,
      ...companyData,
    };

    return NextResponse.json(responsePayload, { status: 200 });
  } catch (error) {
    console.error('Failed to update company:', error);
    if (error instanceof Error && error.message.includes('NOT_FOUND')) {
      return NextResponse.json({ error: 'Company not found to update' } as { error: string }, {
        status: 404,
      });
    }
    return NextResponse.json({ error: 'Failed to update company' } as { error: string }, {
      status: 500,
    });
  }
}

export async function DELETE({ params }: { params: RouteParams }) {
  try {
    const { id } = params;
    const docRef: DocumentReference = db.collection('companies').doc(id);

    await docRef.delete();

    return NextResponse.json({ message: 'Company deleted successfully' } as { message: string }, {
      status: 200,
    });
  } catch (error) {
    console.error('Failed to delete company:', error);
    return NextResponse.json({ error: 'Failed to delete company' } as { error: string }, {
      status: 500,
    });
  }
}
