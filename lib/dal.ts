import { db } from '@/db'
import { getSession } from './auth'
import { and, eq, ilike, sql } from 'drizzle-orm'
import { cache } from 'react'
import {
  products,
  admins,
  orders,
  tables,
  catalogs,
  Catalog,
  Product,
} from '@/db/schema'
import { mockDelay } from './utils'
import {
  unstable_cacheTag as cacheTag,
  unstable_cacheLife as cacheLife,
} from 'next/cache'

type AddonCategory = {
  name: string
  type: 'one' | 'multiple'
  items: {
    name: string
    price: number
  }[]
}

type ProductList = {
  id: number
  name: string
  image: string
  thumbnail: string
  description: string
  price: number
  useStock: boolean
  stock: number
  addons: AddonCategory[]
}

type CategoryListWithProduct = {
  name: string
  product_list: ProductList[]
}
export type CustomerCatalog = {
  id: number
  name: string
  sort_order: number
  is_selected: boolean
  category_list_with_products: CategoryListWithProduct[]
}

export const getCurrentAdmin = cache(async () => {
  const session = await getSession()
  if (!session) {
    return null
  }

  try {
    const admin = await db.query.admins.findFirst({
      where: eq(admins.id, session.adminId),
      columns: {
        id: true,
        username: true,
      },
    })

    return admin || null
  } catch (e) {
    console.error(e)
    return null
  }
})

export const getAdminByUsername = async (username: string) => {
  try {
    const user = await db.query.admins.findFirst({
      where: eq(admins.username, username),
    })

    return user
  } catch (e) {
    console.error(e)
    return null
  }
}

export async function getProducts() {
  'use cache'
  cacheTag('products')
  try {
    const result = await db.query.products.findMany({
      where: eq(products.isDeleted, false),
      orderBy: (products, { desc }) => [desc(products.createdAt)],
    })

    return result
  } catch (error) {
    console.error('Error fetching products:', error)
    return null
  }
}

export async function searchProducts(query: string = '') {
  try {
    const result = await db.query.products.findMany({
      where: and(
        eq(products.isDeleted, false),
        ilike(products.name, `%${query}%`)
      ),
      orderBy: (products, { desc }) => [desc(products.createdAt)],
    })

    return result
  } catch (error) {
    console.error('Error fetching products:', error)
    return null
  }
}

export const getProduct = async (id: number) => {
  try {
    const product = await db.query.products.findFirst({
      where: and(eq(products.id, id), eq(products.isDeleted, false)),
      with: {
        admin: {
          columns: { username: true },
        },
      },
    })

    return product
  } catch (e) {
    console.error(e)
    return null
  }
}

export const getTables = async () => {
  'use cache'
  cacheTag('tables')
  try {
    const result = await db.query.tables.findMany({
      where: eq(tables.isDeleted, false),
    })

    return result
  } catch (e) {
    console.error(e)
    return null
  }
}

export const getTable = async (id: number) => {
  'use cache'
  cacheTag(`table-${id}`)
  try {
    const table = await db.query.tables.findFirst({
      where: and(eq(tables.id, id), eq(tables.isDeleted, false)),
    })

    if (!table) return null

    return {
      id: table.id,
      tableNumber: table.tableNumber,
    }
  } catch (e) {
    console.error(e)
    return null
  }
}

export const getCatalogs = async () => {
  'use cache'
  cacheTag('catalogs')
  try {
    const result = await db.query.catalogs.findMany({
      where: eq(catalogs.isDeleted, false),
      orderBy: (catalogs, { desc }) => [desc(catalogs.createdAt)],
    })

    return result
  } catch (e) {
    console.error(e)
    return null
  }
}

export const getCatalog = async (id: number) => {
  try {
    const result = await db.execute(
      sql`SELECT
        c.id,
        c.name,
        (
          SELECT jsonb_agg(
            jsonb_build_object(
              'name', cl.value->>'name',
              'product_list', (
                SELECT jsonb_agg(
            jsonb_build_object(
              'id', p.id,
              'name', p.name
            )
            )
                FROM products p
                WHERE p.id = ANY (SELECT jsonb_array_elements_text(cl.value->'productList')::int)
              )
            )
          )
          FROM jsonb_array_elements(c.category_list) AS cl(value)
        ) AS category_list_with_products
      FROM catalog c
      WHERE c.id = ${id} AND c.is_deleted = false`
    )

    return {
      id: result.rows[0]?.id,
      name: result.rows[0]?.name,
      categoryList: result.rows[0]?.category_list_with_products,
    }
  } catch (e) {
    console.error(e)
    return null
  }
}

export const getCustomerCatalog = async () => {
  'use cache'
  cacheTag('customer_catalog')
  try {
    await mockDelay(700)

    const result = await db.execute(
      sql`SELECT
        c.id,
        c.name,
        c.sort_order,
        (
          SELECT jsonb_agg(
            jsonb_build_object(
              'name', cl.value->>'name',
              'product_list', (
                SELECT jsonb_agg(
            jsonb_build_object(
              'id', p.id,
              'name', p.name,
              'image', p.image,
              'thumbnail', p.thumbnail,
              'description', p.description,
              'price', p.price,
              'useStock', p.use_stock,
              'stock', p.stock,
              'addons', p.addons
            )
            )
                FROM products p
                WHERE p.id = ANY (SELECT jsonb_array_elements_text(cl.value->'productList')::int)
              )
            )
          )
          FROM jsonb_array_elements(c.category_list) AS cl(value)
        ) AS category_list_with_products
      FROM catalog c
      ORDER BY sort_order;`
    )

    const finalResult: CustomerCatalog[] = [
      {
        id: 0,
        name: 'All Menu',
        sort_order: 0,
        category_list_with_products: [],
        is_selected: true,
      },
    ]

    if (result.rows.length) {
      ;(result.rows as CustomerCatalog[]).forEach((row) => {
        row.category_list_with_products.forEach((list) => {
          finalResult[0].category_list_with_products.push(list)
        })
        finalResult.push(row)
      })
    }

    return finalResult as CustomerCatalog[]
  } catch (e) {
    console.error(e)
    return null
  }
}
