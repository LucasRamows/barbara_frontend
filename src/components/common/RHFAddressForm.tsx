import { useRef, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface AddressLookupResponse {
  cep?: string
  logradouro?: string
  complemento?: string
  bairro?: string
  localidade?: string
  uf?: string
  ibge?: string
  erro?: boolean
}

export interface RHFAddressFormProps {
  namePrefix?: string
  disabled?: boolean
  className?: string
  onLookupError?: (error: Error) => void
}

function fieldName(prefix: string, name: string) {
  return prefix ? `${prefix}.${name}` : name
}

function formatCep(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits
}

function Field({
  label,
  name,
  error,
  disabled,
  register,
  maxLength,
  className,
}: {
  label: string
  name: string
  error?: string
  disabled?: boolean
  register: ReturnType<typeof useFormContext>['register']
  maxLength?: number
  className?: string
}) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        aria-invalid={Boolean(error)}
        disabled={disabled}
        maxLength={maxLength}
        {...register(name)}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

export function RHFAddressForm({
  namePrefix = '',
  disabled = false,
  className,
  onLookupError,
}: RHFAddressFormProps) {
  const {
    register,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext()
  const [lookingUp, setLookingUp] = useState(false)
  const [lookupMessage, setLookupMessage] = useState<string>()
  const requestRef = useRef<AbortController | undefined>(undefined)

  const name = (field: string) => fieldName(namePrefix, field)
  const errorFor = (field: string) => {
    const value = errors[name(field) as keyof typeof errors]
    return value && typeof value === 'object' && 'message' in value && typeof value.message === 'string'
      ? value.message
      : undefined
  }

  async function lookupCep(value: string) {
    const cep = value.replace(/\D/g, '')
    if (cep.length !== 8) {
      setLookupMessage(undefined)
      return
    }

    requestRef.current?.abort()
    const controller = new AbortController()
    requestRef.current = controller
    setLookingUp(true)
    setLookupMessage(undefined)

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      })
      if (!response.ok) throw new Error(`CEP lookup failed with status ${response.status}`)

      const data = (await response.json()) as AddressLookupResponse
      if (data.erro) {
        setLookupMessage('CEP não encontrado')
        return
      }

      const values: Record<string, string | undefined> = {
        street: data.logradouro,
        complement: data.complemento,
        neighborhood: data.bairro,
        city: data.localidade,
        state: data.uf,
        ibgeCode: data.ibge,
      }

      Object.entries(values).forEach(([field, nextValue]) => {
        if (nextValue && !getValues(name(field))) {
          setValue(name(field), nextValue, { shouldDirty: true, shouldValidate: true })
        }
      })
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      const lookupError = error instanceof Error ? error : new Error('CEP lookup failed')
      setLookupMessage('Não foi possível consultar o CEP')
      onLookupError?.(lookupError)
    } finally {
      if (!controller.signal.aborted) setLookingUp(false)
    }
  }

  return (
    <div className={cn('grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-6', className)}>
      <div className="flex min-w-0 flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor={name('zipCode')}>CEP</Label>
        <div className="relative">
          <Input
            id={name('zipCode')}
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={9}
            disabled={disabled}
            aria-invalid={Boolean(errorFor('zipCode'))}
            {...register(name('zipCode'), {
              onChange: (event) => {
                event.target.value = formatCep(event.target.value)
              },
              onBlur: (event) => {
                void lookupCep(event.target.value)
              },
            })}
          />
          {lookingUp && <Loader2 aria-label="Consultando CEP" className="absolute right-3 top-2.5 size-4 animate-spin text-muted-foreground" />}
        </div>
        {errorFor('zipCode') && <p className="text-xs text-destructive">{errorFor('zipCode')}</p>}
        {lookupMessage && <p role="status" className="text-xs text-muted-foreground">{lookupMessage}</p>}
      </div>

      <Field label="Rua" name={name('street')} error={errorFor('street')} disabled={disabled} register={register} className="sm:col-span-4" />
      <Field label="Número" name={name('number')} error={errorFor('number')} disabled={disabled} register={register} maxLength={20} className="sm:col-span-2" />
      <Field label="Complemento" name={name('complement')} error={errorFor('complement')} disabled={disabled} register={register} maxLength={100} className="sm:col-span-4" />
      <Field label="Bairro" name={name('neighborhood')} error={errorFor('neighborhood')} disabled={disabled} register={register} className="sm:col-span-3" />
      <Field label="Cidade" name={name('city')} error={errorFor('city')} disabled={disabled} register={register} className="sm:col-span-2" />
      <Field label="UF" name={name('state')} error={errorFor('state')} disabled={disabled} register={register} maxLength={2} className="sm:col-span-1" />
      <Field label="País" name={name('country')} error={errorFor('country')} disabled={disabled} register={register} className="sm:col-span-3" />
      <Field label="Código IBGE" name={name('ibgeCode')} error={errorFor('ibgeCode')} disabled={disabled} register={register} maxLength={7} className="sm:col-span-3" />
    </div>
  )
}
