import { z } from 'zod'
import { isValidEmail, isAllowedEmailDomain, ALLOWED_EMAIL_DOMAIN } from '@/app/lib/validate-email'

const EMAIL_ERROR = `O email deve ser um endereço válido do domínio @${ALLOWED_EMAIL_DOMAIN}`

const userEmailSchema = z
  .string()
  .refine(isValidEmail, EMAIL_ERROR)
  .refine(isAllowedEmailDomain, EMAIL_ERROR)

export const createTicketSchema = z.object({
  title: z.string().trim().min(1, 'Preencha todos os campos.'),
  description: z.string().trim().min(1, 'Preencha todos os campos.'),
  subjectId: z.string().min(1, 'Preencha todos os campos.'),
  employeeId: z.string().min(1, 'Preencha todos os campos.'),
})

export const createEmployeeSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  project: z.string().nullable().optional(),
  unit: z.array(z.string()).optional(),
  department: z.string().nullable().optional(),
  position: z.string().nullable().optional(),
})

export const updateEmployeeSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  active: z.boolean().optional(),
  project: z.string().nullable().optional(),
  unit: z.array(z.string()).optional(),
  department: z.string().nullable().optional(),
  position: z.string().nullable().optional(),
})

export const createUserSchema = z.object({
  name: z.string().min(1, 'Campos obrigatórios faltando'),
  email: userEmailSchema,
  password: z
    .string()
    .min(6, 'A senha deve ter no mínimo 6 caracteres.')
    .max(72, 'A senha deve ter no máximo 72 caracteres.'),
  role: z.enum(['ADMIN', 'SUPPORT'], { message: 'Papel inválido' }),
})

export const updateUserSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  email: userEmailSchema.optional(),
  role: z.enum(['ADMIN', 'SUPPORT'], { message: 'Papel inválido' }).optional(),
  password: z
    .string()
    .min(6, 'A senha deve ter no mínimo 6 caracteres.')
    .max(72, 'A senha deve ter no máximo 72 caracteres.')
    .optional(),
})

export const changeSelfPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, 'A senha deve ter no mínimo 6 caracteres.')
      .max(72, 'A senha deve ter no máximo 72 caracteres.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não conferem.',
    path: ['confirmPassword'],
  })

export const createSubjectSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
})

export const updateSubjectSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  active: z.boolean().optional(),
})

export const updateCommentSchema = z.object({
  content: z.string(),
})
