import type { Person } from './types'
import { PEOPLE_CLASSICAL } from './classical'
import { PEOPLE_EM } from './em'
import { PEOPLE_THERMO } from './thermo'
import { PEOPLE_RELATIVITY } from './relativity'
import { PEOPLE_QUANTUM } from './quantum'
import { PEOPLE_PARTICLE } from './particle'
import { PEOPLE_PARTICLE2 } from './particle2'
import { PEOPLE_COSMO } from './cosmo'

export type { Person, Portrait } from './types'

/** 科学者図鑑の全員（生まれた年の順） */
export const PEOPLE: Person[] = [...PEOPLE_CLASSICAL, ...PEOPLE_EM, ...PEOPLE_THERMO, ...PEOPLE_RELATIVITY, ...PEOPLE_QUANTUM, ...PEOPLE_PARTICLE, ...PEOPLE_PARTICLE2, ...PEOPLE_COSMO].sort(
  (a, b) => a.born - b.born || a.id.localeCompare(b.id),
)

export const personById = new Map(PEOPLE.map((p) => [p.id, p]))

/** 「1643〜1727年」 */
export const lifeLabel = (p: Pick<Person, 'born' | 'died'>) => `${p.born}〜${p.died}年`

/** 肖像の画像の URL（BASE_PATH を付ける） */
export const portraitUrl = (file: string) => `${import.meta.env.BASE_URL}portraits/${file}`
