import z from "zod";

const companyFocalPointSchema = z.object({
  name: z.string().min(1, { message: 'O nome do ponto focal é obrigatório.' }),
  email: z
    .string()
    .email({ message: 'Formato de e-mail inválido.' })
    .min(1, { message: 'O e-mail é obrigatório.' }),
  phone: z
    .string()
    .regex(/^\(\d{2}\)\s\d{5}-\d{4}$/, {
      // Ajustado para o formato (XX) XXXXX-XXXX (com 9 dígitos)
      message: 'Formato de telefone inválido. Use (XX) XXXXX-XXXX.',
    })
    .min(1, { message: 'O telefone é obrigatório.' })
    .or(
      z.string().regex(/^\(\d{2}\)\s\d{4}-\d{4}$/, {
        message: 'Formato de telefone inválido. Use (XX) XXXX-XXXX.',
      })
    ),
});

export const companyFormSchema = z.object({
  cnpj: z
    .string()
    .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, {
      message: 'Formato de CNPJ inválido. Use XX.XXX.XXX/XXXX-XX.',
    })
    .min(1, { message: 'O CNPJ é obrigatório.' }),
  fantasy_name: z.string().min(1, { message: 'O nome fantasia é obrigatório.' }),
  full_address: z.string().min(1, { message: 'O endereço completo é obrigatório.' }),
  focal_point: companyFocalPointSchema,
  owner: z.string().min(1, { message: 'O nome do proprietário é obrigatório.' }),
});

export type CompanyFormData = z.infer<typeof companyFormSchema>;