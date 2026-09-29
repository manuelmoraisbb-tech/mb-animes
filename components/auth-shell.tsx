export function AuthShell({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex justify-center px-4 py-16">
      <div className="flex w-full max-w-md flex-col gap-6 bg-card p-6 md:p-10">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-black">{title}</h1>
          {description && <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>}
        </div>
        {children}
      </div>
    </div>
  )
}

export function AuthField({
  id,
  label,
  ...props
}: { id: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-bold uppercase text-muted-foreground">
        {label}
      </label>
      <input
        id={id}
        {...props}
        className="h-11 border-b-2 border-input bg-background px-3 text-sm outline-none transition focus:border-primary"
      />
    </div>
  )
}

export const authButtonClass =
  'h-11 w-full bg-primary text-sm font-black uppercase text-primary-foreground transition hover:brightness-110 disabled:opacity-50'
