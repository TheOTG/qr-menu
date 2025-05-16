import { InferSelectModel, relations, sql } from 'drizzle-orm'
import {
  pgTable,
  serial,
  text,
  timestamp,
  pgEnum,
  uuid,
  integer,
  jsonb,
  boolean,
} from 'drizzle-orm/pg-core'

type Addon = {
  name: string
  type: 'one' | 'multiple'
  items: {
    name: string
    price: number
    isSelected?: boolean
  }[]
}

type Category = { name: string; productList: number[] }

// Enums for order status
export const statusEnum = pgEnum('status', [
  'unpaid',
  'expired',
  'paid',
  'in_progress',
  'done',
])

// Orders table
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  customerName: text('customer_name').notNull(),
  phoneNumber: text('phone_number').notNull(),
  cartItems: jsonb('cart_items'),
  status: statusEnum('status').default('unpaid').notNull(),
  paymentMethod: text('payment_method'),
  paymentLink: text('payment_link'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  tableId: integer('table_id').notNull(),
  tableNumber: integer('table_number').notNull(),
})

// Products table
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  sku: text('sku').notNull(),
  image: text('image'),
  thumbnail: text('thumbnail'),
  description: text('description').notNull(),
  price: integer('price').notNull(),
  useStock: boolean('use_stock').default(false).notNull(),
  stock: integer('stock').default(0).notNull(),
  addons: jsonb('addons').$type<Addon[]>(),
  adminId: uuid('admin_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
})

// Catalog table
export const catalogs = pgTable('catalog', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(), // All Menu / Beverage / Food / etc
  categoryList: jsonb('category_list').$type<Category[]>(),
  adminId: uuid('admin_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  showAll: boolean('show_all').default(false).notNull(),
  isActive: boolean('is_active').default(false).notNull(),
  sortOrder: serial('sort_order'),
})

// Tables table (Tables in the cafe)
export const tables = pgTable('tables', {
  id: serial('id').primaryKey(),
  tableNumber: serial('table_number').notNull(),
  adminId: uuid('admin_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
})

// Admins table
export const admins = pgTable('admins', {
  id: uuid('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Relations between tables
export const ordersRelations = relations(orders, ({ one }) => ({
  table: one(tables, {
    fields: [orders.tableId],
    references: [tables.id],
  }),
}))

export const tablesRelations = relations(tables, ({ many }) => ({
  orders: many(orders),
}))

export const productsRelations = relations(products, ({ one }) => ({
  admin: one(admins, {
    fields: [products.adminId],
    references: [admins.id],
  }),
}))

export const catalogsRelations = relations(catalogs, ({ one }) => ({
  admin: one(admins, {
    fields: [catalogs.adminId],
    references: [admins.id],
  }),
}))

export const adminsRelations = relations(admins, ({ one, many }) => ({
  catalogs: many(catalogs),
  products: many(products),
  table: one(tables, {
    fields: [admins.id],
    references: [tables.id],
  }),
}))

// Types
export type Order = InferSelectModel<typeof orders>
export type Product = InferSelectModel<typeof products>
export type Table = InferSelectModel<typeof tables>
export type Admin = InferSelectModel<typeof admins>
export type Catalog = InferSelectModel<typeof catalogs>

// Order status labels for display
export const ORDER_STATUS = {
  unpaid: { label: 'Unpaid', value: 'unpaid' },
  expired: { label: 'Expired', value: 'expired' },
  paid: { label: 'Paid', value: 'paid' },
  in_progress: { label: 'In Progress', value: 'in_progress' },
  done: { label: 'Done', value: 'done' },
}
