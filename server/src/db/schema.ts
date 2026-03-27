import { sqliteTable, text, integer, real, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  displayName: text('display_name').notNull(),
  businessArea: text('business_area').notNull(),
  costMarginPct: real('cost_margin_pct'),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
})

export const dailyEntries = sqliteTable('daily_entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  entryDate: text('entry_date').notNull(),
  categoryId: integer('category_id').notNull().references(() => categories.id),
  revenue: real('revenue').notNull().default(0),
  costAmount: real('cost_amount'),
  costBasis: text('cost_basis').notNull().default('estimated'),
  notes: text('notes'),
  dataSource: text('data_source').notNull().default('manual'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
}, (table) => [
  uniqueIndex('daily_entries_date_category').on(table.entryDate, table.categoryId),
])

export const kidsEntries = sqliteTable('kids_entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  entryDate: text('entry_date').notNull().unique(),
  count: integer('count').notNull().default(0),
  notes: text('notes'),
  dataSource: text('data_source').notNull().default('manual'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
})

export const parties = sqliteTable('parties', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  partyDate: text('party_date').notNull(),
  packageName: text('package_name').notNull(),
  packagePrice: real('package_price').notNull(),
  notes: text('notes'),
  dataSource: text('data_source').notNull().default('manual'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
})

export const partyAddons = sqliteTable('party_addons', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  partyId: integer('party_id').notNull().references(() => parties.id, { onDelete: 'cascade' }),
  addonName: text('addon_name').notNull(),
  addonPrice: real('addon_price').notNull(),
  category: text('category'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
})

export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  categoryId: integer('category_id').references(() => categories.id),
  costPrice: real('cost_price'),
  stockQuantity: integer('stock_quantity').notNull().default(0),
  stockThreshold: integer('stock_threshold').notNull().default(5),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
})

export const suppliers = sqliteTable('suppliers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  contactInfo: text('contact_info'),
  notes: text('notes'),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
})
