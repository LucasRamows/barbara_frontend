import { z } from 'zod'
import { normalizeDocument, normalizeEmail } from '@/lib/formatDocument'
import { normalizePhone } from '@/lib/formatPhone'

function hasValidCheckDigits(value: string) {
  if (/^(\d)\1+$/.test(value)) return false
  const calculate = (length: number) => {
    const weights = value.length === 11
      ? Array.from({ length }, (_, index) => length + 1 - index)
      : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2].slice(13 - length)
    let sum = 0
    for (let index = 0; index < length; index += 1) sum += Number(value[index]) * weights[index]
    const remainder = sum % 11
    return remainder < 2 ? 0 : 11 - remainder
  }
  const first = calculate(value.length - 2)
  const second = calculate(value.length - 1)
  return first === Number(value[value.length - 2]) && second === Number(value[value.length - 1])
}

export const phoneSchema = z.string().transform(normalizePhone).refine(
  (value) => value.length === 0 || (value.length >= 10 && value.length <= 11),
  'Telefone inválido',
)

export const documentSchema = z.string().transform(normalizeDocument).refine(
  (value) => value.length === 0 || ([11, 14].includes(value.length) && hasValidCheckDigits(value)),
  'CPF ou CNPJ inválido',
)

export const emailSchema = z.string().transform(normalizeEmail).refine(
  (value) => value.length === 0 || z.string().email().safeParse(value).success,
  'E-mail inválido',
)

export const addressSchema = z.object({
  zipCode: z.string().transform((value) => value.replace(/\D/g, '')).refine((value) => value.length === 0 || value.length === 8, 'CEP inválido'),
  street: z.string().trim().max(120),
  number: z.string().trim().max(20),
  complement: z.string().trim().max(100).optional().default(''),
  neighborhood: z.string().trim().max(100),
  city: z.string().trim().max(100),
  state: z.string().trim().toUpperCase().length(2),
  country: z.string().trim().max(80).default('Brasil'),
  ibgeCode: z.string().trim().max(7).optional().default(''),
})
