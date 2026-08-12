import Link from 'next/link'

const MARK_PATH = 'M10,24 L16,9 L18,19 L24,12'

export function LysiMark({
  className,
  variant = 'solid',
}: {
  className?: string
  variant?: 'solid' | 'mono'
}) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
      {variant === 'solid' && <rect x="2" y="2" width="28" height="28" rx="8" fill="#4F46E5" />}
      <path
        d={MARK_PATH}
        stroke={variant === 'solid' ? '#ffffff' : 'currentColor'}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function LysiWordmark({
  className,
  markClassName = 'h-8 w-8',
  textClassName = 'text-xl',
  markVariant = 'solid',
  tagline = false,
  href = '/tickets',
}: {
  className?: string
  markClassName?: string
  textClassName?: string
  markVariant?: 'solid' | 'mono'
  tagline?: boolean
  href?: string | null
}) {
  const content = (
    <span className={`inline-flex items-center gap-2 ${className ?? ''}`}>
      <LysiMark className={markClassName} variant={markVariant} />
      <span className="flex flex-col leading-tight">
        <span className={`font-heading font-bold ${textClassName}`}>Lýsi</span>
        {tagline && (
          <span className="text-xs font-medium opacity-70 -mt-0.5">Support, solved.</span>
        )}
      </span>
    </span>
  )

  if (!href) return content

  return (
    <Link href={href} className="w-fit">
      {content}
    </Link>
  )
}
