import { hc } from 'hono/client'
import type { AppType } from '@honey-nest/server/src/index'

export const api = hc<AppType>('/')
