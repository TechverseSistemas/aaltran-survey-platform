/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from '@/lib/firebase';
import bcrypt from 'bcrypt';
import { FieldValue } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';
import * as xlsx from 'xlsx';

/**
 * Busca um departamento pelo nome dentro de uma empresa. Se não encontrar, cria um novo.
 * Usa um cache em memória para otimizar o processo de upload.
 * @param companyId ID da empresa.
 * @param name Nome do departamento.
 * @param cache Map para cache em memória.
 * @returns O ID do departamento existente ou recém-criado.
 */
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

/**
 * Busca um cargo (posição) pelo nome dentro de um departamento. Se não encontrar, cria um novo.
 * @param companyId ID da empresa.
 * @param departmentId ID do departamento onde o cargo será procurado/criado.
 * @param name Nome do cargo.
 * @param cache Map para cache em memória.
 * @returns O ID do cargo existente ou recém-criado.
 */
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

/**
 * @method POST
 * @description Processa uma planilha (.xlsx) para cadastrar múltiplos funcionários,
 * criando departamentos e cargos (positions) conforme necessário.
 */
export async function POST(request: NextRequest) {
  console.log('Iniciando importação de funcionários...');
  try {
    console.log('Recebendo arquivo e ID da empresa...');
    const formData = await request.formData();

    const companyId = formData.get('companyId') as string | null;
    const file = formData.get('file') as File | null;

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
        console.log(`Processando linha ${rowIndex}...`, row);
        const employeePayload = {
          name: row['Nome'],
          cpf: String(row['CPF']),
          birth_date: new Date(row['Data Nascimento']),
          gender: row['Sexo'],
          scholarity: row['Escolaridade'],
          admission_date: new Date(row['Data Admissão']),
          leader: row['Líder'] === 'Sim' || row['Líder'] === true,
          login: 'placeholder',
          password: 'placeholder',
          id_departament: 'placeholder',
          id_section: 'placeholder',
        };
        const departmentName = row['Departamento'];
        const positionName = row['Cargo'];

        if (!departmentName || !positionName) {
          throw new Error('As colunas "Departamento" e "Cargo" são obrigatórias.');
        }

        const departmentId = await getOrCreateDepartment(
          companyId,
          departmentName,
          departmentCache
        );
        const positionId = await getOrCreatePosition(
          companyId,
          departmentId,
          positionName,
          positionCache
        );

        const nameParts = employeePayload.name.trim().split(' ');
        const newLogin = `${nameParts[0].toLowerCase()}.${nameParts.length > 1 ? nameParts[nameParts.length - 1].toLowerCase() : ''}`;

        const rawPassword = employeePayload.cpf.replace(/\D/g, '');
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        const cpfQuery = db
          .collectionGroup('employees')
          .where('cpf', '==', employeePayload.cpf)
          .limit(1);
        const existingCpf = await cpfQuery.get();
        if (!existingCpf.empty) {
          return NextResponse.json(
            { error: `O CPF '${employeePayload.cpf}' já está cadastrado.` },
            { status: 409 }
          );
        }

        const loginQuery = db.collectionGroup('employees').where('login', '==', newLogin).limit(1);
        const existingLogin = await loginQuery.get();
        if (!existingLogin.empty) {
          return NextResponse.json(
            { error: `O login '${newLogin}' (gerado a partir do nome) já está em uso.` },
            { status: 409 }
          );
        }

        const employeeToSave = {
          name: employeePayload.name,
          cpf: employeePayload.cpf,
          birth_date: employeePayload.birth_date,
          admission_date: employeePayload.admission_date,
          gender: employeePayload.gender,
          scholarity: employeePayload.scholarity,
          isLeader: employeePayload.leader,
          login: newLogin,
          password: hashedPassword,
          departmentId: departmentId,
          positionId: positionId,
          role: 'employee',
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        };
        console.log(`Salvando funcionário:`, JSON.stringify(employeeToSave, null, 2));
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
