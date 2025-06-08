export function isValidCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/[^\d]/g, '');

  if (cleanCPF.length !== 11 || /^(\d)\1{10}$/.test(cleanCPF)) {
    return false;
  }

  let sum = 0;
  let remainder: number;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) {
    return false;
  }

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) {
    return false;
  }

  return true;
}
