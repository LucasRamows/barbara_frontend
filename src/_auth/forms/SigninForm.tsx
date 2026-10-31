import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useSession } from '@/contexts/SessionContext'
import { BarbaraLogo } from '@/components/brand/BarbaraLogo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { PasswordInput } from '@/components/shared/PasswordInput'

const schema = z.object({
  identifier: z.string().min(1, 'Informe seu usuário ou e-mail'),
  password: z.string().min(1, 'Informe sua senha'),
})

type FormValues = z.infer<typeof schema>

export default function SigninForm() {
  const { login } = useSession()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    try {
      await login(values.identifier, values.password)
    } catch {
      toast.error('Usuário ou senha incorretos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex size-20 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <BarbaraLogo className="size-12" title="Bárbara" />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="identifier">Usuário ou e-mail</Label>
            <Input
              id="identifier"
              type="text"
              autoComplete="username"
              autoCapitalize="none"
              inputMode="text"
              {...register('identifier')}
              aria-invalid={Boolean(errors.identifier)}
            />
            {errors.identifier && (
              <p className="text-xs text-destructive">{errors.identifier.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Senha</Label>
            <PasswordInput
              id="password"
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              {...register('password')}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" disabled={loading} className="mt-1 w-full">
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
