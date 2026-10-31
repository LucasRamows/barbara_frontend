import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info)
  }

  reset = () => this.setState({ error: null })

  render() {
    const { error } = this.state
    const { children, fallback } = this.props

    if (!error) return children

    if (fallback) return fallback

    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle size={28} className="text-destructive" />
        </div>
        <div>
          <p className="font-display text-lg font-bold text-foreground">Algo deu errado</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Ocorreu um erro inesperado nesta página.
          </p>
          {import.meta.env.DEV && (
            <p className="mt-2 rounded-lg bg-muted px-3 py-2 text-left font-mono text-xs text-muted-foreground">
              {error.message}
            </p>
          )}
        </div>
        <Button size="sm" onClick={this.reset}>
          Tentar novamente
        </Button>
      </div>
    )
  }
}
