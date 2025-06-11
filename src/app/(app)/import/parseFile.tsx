/* eslint-disable @typescript-eslint/no-explicit-any */
import { Employee } from '@/types/employees';
import * as XLSX from 'xlsx';

export const expectedHeaders = [
  'Nome Completo',
  'CPF',
  'Email',
  'Telefone',
  'Departamento',
  'Cargo',
];

export const parseExcel = async (file: File): Promise<Employee[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData: any = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const [headersRaw, ...rows] = jsonData;
      const headers = headersRaw as string[];

      const headerMismatch = expectedHeaders.some((header, i) => header !== headers?.[i]);

      if (headerMismatch) {
        return reject(new Error('Cabeçalhos da planilha não estão corretos.'));
      }

      const funcionarios: any = rows.map((row: any) => ({
        id: '', // or generate a unique id if needed
        departmentId: '',
        positionId: '',
        name: row[0]?.toString().trim() || '',
        cpf: row[1]?.toString().trim() || '',
        email: row[2]?.toString().trim() || '',
        phone: row[3]?.toString().trim() || '',
        department: row[4]?.toString().trim() || '',
        position: row[5]?.toString().trim() || '',
        // add other required Employee fields with default values if necessary
      }));

      resolve(funcionarios);
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsArrayBuffer(file);
  });
};
