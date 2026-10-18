import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useSession } from '@/contexts/SessionContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({
  username: z.string().min(1, 'Informe seu usuário'),
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
      await login(values.username, values.password)
    } catch {
      toast.error('Usuário ou senha incorretos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Entrar</h1>
        <p className="mt-1 text-sm text-muted-foreground">Acesse a plataforma Bárbara.</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="username">Usuário ou identificador</Label>
          <Input
            id="username"
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            {...register('username')}
          />
          {errors.username && (
            <p className="text-xs text-destructive">{errors.username.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register('password')}
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Entrando...
          </>
        ) : (
          'Iniciar sessão'
        )}
      </Button>
    </form>
  )
}
