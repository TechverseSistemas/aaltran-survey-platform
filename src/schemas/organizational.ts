import { z } from 'zod';

export const departmentSchema = z.object({
  name: z.string().min(1, 'O nome do departamento é obrigatório.'),
});

export const positionSchema = z.object({
  name: z.string().min(1, 'O nome do cargo é obrigatório.'),
});
