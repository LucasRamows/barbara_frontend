import * as React from 'react'
import { format, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export interface DatePickerProps {
  value?: string | Date
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  id?: string
  invalid?: boolean
  align?: 'start' | 'center' | 'end'
  disableFutureDates?: boolean
  fromDate?: Date
  toDate?: Date
  fromYear?: number
  toYear?: number
}

function toCivilDate(value?: string | Date) {
  if (!value) return undefined
  if (value instanceof Date) return isValid(value) ? value : undefined

  const datePart = value.slice(0, 10)
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart)
  if (!match) return undefined

  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12)
  return isValid(date) && format(date, 'yyyy-MM-dd') === datePart ? date : undefined
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Selecione uma data',
  className,
  disabled,
  id,
  invalid = false,
  align = 'start',
  disableFutureDates = false,
  fromDate,
  toDate,
  fromYear = 1920,
  toYear = new Date().getFullYear(),
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  const date = React.useMemo(() => toCivilDate(value), [value])
  const latestDate = disableFutureDates ? new Date() : toDate

  function handleSelect(selected: Date | undefined) {
    onChange(selected ? format(selected, 'yyyy-MM-dd') : '')
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          id={id}
          disabled={disabled}
          aria-invalid={invalid}
          className={cn(
            'w-full justify-start gap-2 text-left font-normal',
            !date && 'text-muted-foreground',
            className,
          )}
        >
          <CalendarIcon size={16} className="shrink-0 opacity-70" />
          {date ? format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align}>
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          defaultMonth={date}
          captionLayout="dropdown"
          fromYear={fromYear}
          toYear={toYear}
          fromDate={fromDate}
          toDate={latestDate}
          disabled={latestDate ? { after: latestDate } : undefined}
          locale={ptBR}
        />
      </PopoverContent>
    </Popover>
  )
}
