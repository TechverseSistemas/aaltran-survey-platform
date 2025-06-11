import { z } from 'zod';

const focalPointSchema = z.object({
  name: z.string().min(1, 'O nome do ponto focal é obrigatório.'),
  email: z.string().email('O e-mail do ponto focal é inválido.'),
  phone: z.string().min(1, 'O telefone do ponto focal é obrigatório.'),
});

export const companyCreateSchema = z.object({
  cnpj: z.string().min(1, 'O CNPJ é obrigatório.'),
  fantasy_name: z.string().min(1, 'O nome fantasia é obrigatório.'),
  full_address: z.string().min(1, 'O endereço é obrigatório.'),
  owner: z.string().min(1, 'O nome do proprietário é obrigatório.'),
  focal_point: focalPointSchema,
});

export const companyUpdateSchema = companyCreateSchema.partial();
