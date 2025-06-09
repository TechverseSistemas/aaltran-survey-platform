import { isValidCPF } from '@/utils/is-valid-cpf';
import z from 'zod';

const employeeBaseSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome não pode exceder 100 caracteres')
    .refine(
      (name) => {
        const nameParts = name.trim().split(' ');

        return nameParts.length >= 2;
      },
      {
        message: 'Por favor, insira o nome completo (nome e sobrenome).',
      }
    ),
  cpf: z.string().min(1, 'O CPF é obrigatório').refine(isValidCPF, 'CPF inválido'),
  departmentId: z.string().min(1, 'O departamento é obrigatório.'),
  positionId: z.string().min(1, 'O cargo é obrigatório.'),
  birth_date: z.coerce.date({
    required_error: 'Data de nascimento é obrigatória',
    invalid_type_error: 'Data de nascimento deve ser uma data válida',
  }),
  admission_date: z.coerce.date({
    required_error: 'Data de admissão é obrigatória',
    invalid_type_error: 'Data de admissão deve ser uma data válida',
  }),
  gender: z.enum(['Masculino', 'Feminino'], {
    required_error: 'Gênero é obrigatório',
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
    { required_error: 'Escolaridade é obrigatória' }
  ),
  isLeader: z.boolean({
    required_error: 'O status de líder é obrigatório',
  }),
});

export const employeeCreateSchema = employeeBaseSchema;

export const employeeUpdateSchema = employeeBaseSchema.partial();
