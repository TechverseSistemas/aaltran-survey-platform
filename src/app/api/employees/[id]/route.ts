import { NextResponse } from 'next/server';
import { FieldValue, DocumentReference, DocumentSnapshot } from 'firebase-admin/firestore';
import { db } from '@/lib/firebase';
import { Employee } from '@/types/employees';

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

    const employeeData: Partial<Employee> = await request.json();
    const docRef: DocumentReference = db.collection('employees').doc(id);

    const dataToUpdate: Partial<Employee> & { updated_at: FieldValue } = {
      ...employeeData,
      updated_at: FieldValue.serverTimestamp(),
    };

    await docRef.update(dataToUpdate);

    const responsePayload = {
      id,
      ...employeeData,
    };

    return NextResponse.json(responsePayload, { status: 200 });
  } catch (error) {
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
