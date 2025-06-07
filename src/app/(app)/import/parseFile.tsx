import * as XLSX from 'xlsx';

export const expectedHeaders = [
  'Nome Completo',
  'CPF',
  'Email',
  'Telefone',
  'Departamento',
  'Cargo'
];

export type Funcionario = {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  departamento: string;
  cargo: string;
};

export const parseExcel = async (file: File): Promise<Funcionario[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const [headers, ...rows] = jsonData;

      const headerMismatch = expectedHeaders.some(
        (header, i) => header !== headers?.[i]
      );

      if (headerMismatch) {
        return reject(new Error('Cabeçalhos da planilha não estão corretos.'));
      }

      const funcionarios: Funcionario[] = rows
        .filter((row) => row.length > 0)
        .map((row) => ({
          nome: row[0]?.toString().trim() || '',
          cpf: row[1]?.toString().trim() || '',
          email: row[2]?.toString().trim() || '',
          telefone: row[3]?.toString().trim() || '',
          departamento: row[4]?.toString().trim() || '',
          cargo: row[5]?.toString().trim() || '',
        }));

      resolve(funcionarios);
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsArrayBuffer(file);
  });
};
