import { isValidCPF } from '@/utils/is-valid-cpf';
import z from 'zod';

const employeeBaseSchema = z.object({
  id_company: z.string().min(1, 'ID da empresa é obrigatório'),
  id_section: z.string().min(1, 'ID do setor é obrigatório'),
  id_departament: z.string().min(1, 'ID do departamento é obrigatório'),
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome não pode exceder 100 caracteres'),
  cpf: z.string().min(1, 'O CPF é obrigatório').refine(isValidCPF, 'CPF inválido'),
  birth_date: z.coerce.date({
    required_error: 'Data de nascimento é obrigatória',
    invalid_type_error: 'Data de nascimento deve ser uma data válida',
  }),
  gender: z.enum(['Masculino', 'Feminino'], {
    required_error: 'Gênero é obrigatório',
    invalid_type_error: 'Gênero deve ser "Masculino" ou "Feminino"',
  }),
  scholarity: z.enum(
    [
      'ensino_fundamental',
      'ensino_medio',
      'ensino_superior',
      'pos_graduacao',
      'mestrado',
      'doutorado',
    ],
    {
      required_error: 'Escolaridade é obrigatória',
      invalid_type_error: 'Escolaridade deve ser um dos valores pré-definidos',
    }
  ),
  admission_date: z.coerce.date({
    required_error: 'Data de admissão é obrigatória',
    invalid_type_error: 'Data de admissão deve ser uma data válida',
  }),
  leader: z.boolean({
    required_error: 'O status de líder é obrigatório',
    invalid_type_error: 'Status de líder deve ser um valor booleano',
  }),
  login: z.string().min(1, 'Login é obrigatório').max(50, 'Login não pode exceder 50 caracteres'),
  password: z
    .string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(100, 'Senha não pode exceder 100 caracteres'),
});

export const employeeCreateSchema = employeeBaseSchema.extend({
  id: z.string().optional(),
});

export const employeeUpdateSchema = employeeBaseSchema.partial().extend({
  id: z.string(),
});
