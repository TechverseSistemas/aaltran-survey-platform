export function formatCPF(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11); // Limita a 11 dígitos

  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}
