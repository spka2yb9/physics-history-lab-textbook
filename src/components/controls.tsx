import './controls.css'
import { useId } from 'react'

/*
 * 操作できる図の部品。キーボード・タッチ・スクリーンリーダーで扱えるよう、標準の input 要素を使う。
 * 採点や正解の判定はしない。
 */

interface RangeProps {
  label: string
  min: number
  max: number
  step?: number
  value: number
  onChange: (v: number) => void
  /** 値の表示。単位を付けるときに使う */
  format?: (v: number) => string
}

/** スライダー。現在の値を右に表示する。 */
export function Range({ label, min, max, step = 1, value, onChange, format = String }: RangeProps) {
  const id = useId()
  return (
    <div className="ctl ctl-range">
      <label htmlFor={id}>{label}</label>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} aria-valuetext={format(value)} />
      <output htmlFor={id}>{format(value)}</output>
    </div>
  )
}

interface ChoiceProps<T extends string> {
  label: string
  options: readonly { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}

/** 切り替え（ラジオボタンを横に並べたもの）。矢印キーで選択を移せる。 */
export function Choice<T extends string>({ label, options, value, onChange }: ChoiceProps<T>) {
  const name = useId()
  return (
    <fieldset className="ctl ctl-choice">
      <legend>{label}</legend>
      <div className="seg">
        {options.map((o) => (
          <label key={o.value} className={o.value === value ? 'on' : undefined}>
            <input type="radio" name={name} value={o.value} checked={o.value === value} onChange={() => onChange(o.value)} />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

/** 表示の有無を切り替えるチェックボックス。 */
export function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="ctl ctl-check">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  )
}
