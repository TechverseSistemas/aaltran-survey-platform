/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from '@/lib/firebase';
import { employeeCreateSchema } from '@/schemas/employees';
import bcrypt from 'bcrypt';
import { FieldValue } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';
import * as xlsx from 'xlsx';

async function getOrCreateDepartment(
  companyId: string,
  name: string,
  cache: Map<string, string>
): Promise<string> {
  const cacheKey = `dep-${name.trim().toLowerCase()}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }

  const departmentsRef = db.collection('companies').doc(companyId).collection('departments');
  const q = departmentsRef.where('name', '==', name.trim()).limit(1);
  const snapshot = await q.get();

  if (!snapshot.empty) {
    const docId = snapshot.docs[0].id;
    cache.set(cacheKey, docId);
    return docId;
  }

  const newDocRef = await departmentsRef.add({
    name: name.trim(),
    createdAt: FieldValue.serverTimestamp(),
  });
  cache.set(cacheKey, newDocRef.id);
  return newDocRef.id;
}

async function getOrCreatePosition(
  companyId: string,
  departmentId: string,
  name: string,
  cache: Map<string, string>
): Promise<string> {
  const cacheKey = `pos-${departmentId}-${name.trim().toLowerCase()}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }

  const positionsRef = db
    .collection('companies')
    .doc(companyId)
    .collection('departments')
    .doc(departmentId)
    .collection('positions');
  const q = positionsRef.where('name', '==', name.trim()).limit(1);
  const snapshot = await q.get();

  if (!snapshot.empty) {
    const docId = snapshot.docs[0].id;
    cache.set(cacheKey, docId);
    return docId;
  }

  const newDocRef = await positionsRef.add({
    name: name.trim(),
    createdAt: FieldValue.serverTimestamp(),
  });
  cache.set(cacheKey, newDocRef.id);
  return newDocRef.id;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const companyId = formData.get('companyId') as string | null;

    if (!file || !companyId) {
      return NextResponse.json(
        { error: 'Arquivo e ID da empresa são obrigatórios.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const workbook = xlsx.read(buffer, { type: 'buffer', cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    let successCount = 0;
    const errors: { row: number; message: string; data: any }[] = [];

    const departmentCache = new Map<string, string>();
    const positionCache = new Map<string, string>();

    for (let i = 0; i < data.length; i++) {
      const row = data[i] as any;
      const rowIndex = i + 2;

      try {
        const employeePayload = {
          name: row['Nome'],
          cpf: String(row['CPF']),
          birth_date: new Date(row['Data Nascimento']),
          admission_date: new Date(row['Data Admissão']),
          gender: row['Sexo'],
          scholarity: row['Escolaridade'],
          leader: row['Líder'] === 'Sim' || row['Líder'] === true,
          id_departament: row['Departamento'],
          id_position: row['Cargo'],
        };

        const validatedData = employeeCreateSchema.parse(employeePayload);

        const cleanCPF = validatedData.cpf.replace(/\D/g, '');

        const { departmentId, positionId, isLeader, ...restOfData } = validatedData;

        const department = await getOrCreateDepartment(companyId, departmentId, departmentCache);
        const position = await getOrCreatePosition(
          companyId,
          departmentId,
          positionId,
          positionCache
        );

        const nameParts = validatedData.name.trim().split(' ');
        const newLogin = `${nameParts[0].toLowerCase()}.${nameParts.length > 1 ? nameParts[nameParts.length - 1].toLowerCase() : ''}`;

        const cpfQuery = db.collectionGroup('employees').where('cpf', '==', cleanCPF).limit(1);
        const loginQuery = db.collectionGroup('employees').where('login', '==', newLogin).limit(1);

        const [existingCpf, existingLogin] = await Promise.all([cpfQuery.get(), loginQuery.get()]);

        if (!existingCpf.empty) throw new Error(`CPF '${validatedData.cpf}' já está cadastrado.`);
        if (!existingLogin.empty) throw new Error(`Login '${newLogin}' já existe no sistema.`);

        const hashedPassword = await bcrypt.hash(cleanCPF, 10);

        const employeeToSave = {
          ...restOfData,
          login: newLogin,
          password: hashedPassword,
          department,
          position,
          isLeader,
          role: 'employee',
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        };

        await db.collection('companies').doc(companyId).collection('employees').add(employeeToSave);
        successCount++;
      } catch (error: any) {
        errors.push({ row: rowIndex, message: error.message || 'Erro desconhecido', data: row });
      }
    }

    return NextResponse.json({
      message: 'Importação concluída.',
      successCount,
      failedCount: errors.length,
      errors,
    });
  } catch (error: any) {
    console.error('Erro fatal na importação:', error);
    return NextResponse.json(
      { error: 'Falha ao processar o arquivo.', details: error.message },
      { status: 500 }
    );
  }
}
