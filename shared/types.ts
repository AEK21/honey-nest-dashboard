import { z } from 'zod'

export const BusinessArea = {
  RETAIL: 'retail',
  PLAYROOM_CAFE: 'playroom_cafe',
  PARTIES: 'parties',
} as const

export type BusinessArea = (typeof BusinessArea)[keyof typeof BusinessArea]

export const CostBasis = {
  EXACT: 'exact',
  ESTIMATED: 'estimated',
} as const

export type CostBasis = (typeof CostBasis)[keyof typeof CostBasis]

export const DataSource = {
  MANUAL: 'manual',
  VIBER: 'viber',
} as const

export type DataSource = (typeof DataSource)[keyof typeof DataSource]
