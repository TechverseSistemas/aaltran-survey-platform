import { db } from '@/lib/firebase';
import { Company } from '@/types/companies';
import {
  DocumentReference,
  FieldValue,
  QueryDocumentSnapshot,
  QuerySnapshot,
} from 'firebase-admin/firestore';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const companyData: Omit<Company, 'id' | 'created_at' | 'updated_at'> = await request.json();

    const companyToSave: Company = {
      ...companyData,
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
    };

    const docRef: DocumentReference = await db.collection('companies').add(companyToSave);

    const responsePayload: Company = {
      ...companyData,
      id: docRef.id,
    };

    return NextResponse.json(responsePayload, { status: 201 });
  } catch (error) {
    console.error('Error creating company:', error);
    return NextResponse.json({ error: 'Failed to create company' } as { error: string }, {
      status: 500,
    });
  }
}

export async function GET() {
  try {
    const snapshot: QuerySnapshot = await db.collection('companies').orderBy('fantasy_name').get();

    if (snapshot.empty) {
      return NextResponse.json([] as Company[], { status: 200 });
    }

    const companies = snapshot.docs.map((doc: QueryDocumentSnapshot) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
      };
    }) as Company[];

    return NextResponse.json(companies, { status: 200 });
  } catch (error) {
    console.error('Error fetching company:', error);

    return NextResponse.json({ error: 'Failed to fetch company' } as { error: string }, {
      status: 500,
    });
  }
}
