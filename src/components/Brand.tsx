/** サイトの印（原子の軌道）。装飾なので読み上げない */
export function BrandMark({ size = 34 }: { size?: number }) {
  return (
    <svg className="brand-mark" width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6">
      <ellipse cx="20" cy="20" rx="17" ry="6.5" />
      <ellipse cx="20" cy="20" rx="17" ry="6.5" transform="rotate(60 20 20)" />
      <ellipse cx="20" cy="20" rx="17" ry="6.5" transform="rotate(120 20 20)" />
      <circle cx="20" cy="20" r="3" fill="currentColor" />
      <circle cx="36.5" cy="20" r="1.6" fill="currentColor" />
    </svg>
  )
}
