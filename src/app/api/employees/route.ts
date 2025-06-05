import { db } from '@/lib/firebase';
import { Employee } from '@/types/employees';
import {
  DocumentReference,
  FieldValue,
  QueryDocumentSnapshot,
  QuerySnapshot,
} from 'firebase-admin/firestore';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const employeeData: Omit<Employee, 'id' | 'created_at' | 'updated_at'> = await request.json();

    const employeeToSave: Employee = {
      ...employeeData,
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
    };

    const docRef: DocumentReference = await db.collection('employees').add(employeeToSave);

    const responsePayload: Employee = {
      ...employeeData,
      id: docRef.id,
    };

    return NextResponse.json(responsePayload, { status: 201 });
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json({ error: 'Failed to create employee' } as { error: string }, {
      status: 500,
    });
  }
}

export async function GET() {
  try {
    const snapshot: QuerySnapshot = await db.collection('employees').orderBy('name').get();

    if (snapshot.empty) {
      return NextResponse.json([] as Employee[], { status: 200 });
    }

    const employees = snapshot.docs.map((doc: QueryDocumentSnapshot) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
      };
    }) as Employee[];

    return NextResponse.json(employees, { status: 200 });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ error: 'Failed to fetch employees' } as { error: string }, {
      status: 500,
    });
  }
}
