'use server'

import { db } from '@/db'
import { catalogs, products } from '@/db/schema'
import { eq, inArray } from 'drizzle-orm'
import { getCurrentAdmin } from '@/lib/dal'
import { z } from 'zod'
import { mockDelay } from '@/lib/utils'
import { revalidateTag } from 'next/cache'

// Define Zod schema for catalog validation
const categoryListSchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  productList: z.number().array(),
})

const CatalogSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be less than 100 characters'),
  categoryList: z.array(categoryListSchema),
})

const CatalogOrderSchema = z.object({
  id: z.number(),
  sortOrder: z.number(),
})
const CatalogOrderListSchema = z.array(CatalogOrderSchema)

export type CatalogData = z.infer<typeof CatalogSchema>
export type CatalogOrderData = z.infer<typeof CatalogOrderListSchema>

export type ActionResponse = {
  success: boolean
  message: string
  errors?: Record<string, string[]>
  error?: any
}

export const createCatalog = async (data: CatalogData) => {
  try {
    // Security check - ensure user is authenticated
    const admin = await getCurrentAdmin()
    if (!admin) {
      return {
        success: false,
        message: 'Unauthorized access',
        error: 'Unauthorized',
      }
    }

    console.log(data, '====data')
    // Validate with Zod
    const validationResult = CatalogSchema.safeParse(data)
    if (!validationResult.success) {
      return {
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.flatten().fieldErrors,
      }
    }

    // Create product with validated data
    const validatedData = validationResult.data
    await db.insert(catalogs).values({
      name: validatedData.name,
      categoryList: validatedData.categoryList,
      adminId: admin.id,
    } as typeof catalogs.$inferInsert)

    revalidateTag('catalogs')
    revalidateTag('customer_catalog')
    return { success: true, message: 'Catalog created successfully' }
  } catch (error) {
    console.error('Error creating product:', error)
    return {
      success: false,
      message: 'An error occurred while creating the product',
      error: 'Failed to create product',
    }
  }
}

export const updateCatalog = async (id: number, data: Partial<CatalogData>) => {
  try {
    const admin = await getCurrentAdmin()

    if (!admin) {
      return {
        success: false,
        message: 'Unauthorized access',
        error: 'Authorized',
      }
    }

    const UpdateSchema = CatalogSchema.partial()
    const validationResult = UpdateSchema.safeParse(data)

    if (!validationResult.success) {
      return {
        success: false,
        message: 'Validation failed',
        error: validationResult.error.flatten().fieldErrors,
      }
    }

    // Type safe update object with validated data
    const validatedData = validationResult.data
    const updateData: Record<string, unknown> = {}
    const errorList: string[] = []

    if (validatedData.name !== undefined) updateData.name = validatedData.name
    if (validatedData.categoryList !== undefined) {
      updateData.categoryList = validatedData.categoryList
      // check if product still exist
      await Promise.all(
        validatedData.categoryList.map(async (cat) => {
          const result = await db.query.products.findMany({
            where: inArray(products.id, cat.productList),
          })
          if (result.length != cat.productList.length) {
            errorList.push(`Category ${cat.name} has missing products`)
          }
        })
      )
    }

    // Update catalog
    if (errorList.length == 0) {
      await db.update(catalogs).set(updateData).where(eq(catalogs.id, id))
    } else {
      return {
        success: false,
        message: errorList.join(','),
      }
    }

    revalidateTag(`catalogs-${id}`)
    revalidateTag('customer_catalog')
    return { success: true, message: 'Catalog updated successfully' }
  } catch (e) {
    console.error('Error updating product:', e)
    return {
      success: false,
      message: 'An error occurred while updating the product',
      error: 'Failed to update product',
    }
  }
}

export const updateCatalogOrder = async (data: CatalogOrderData) => {
  try {
    const admin = await getCurrentAdmin()

    if (!admin) {
      return {
        success: false,
        message: 'Unauthorized access',
        error: 'Authorized',
      }
    }

    // Validate with Zod
    const validationResult = CatalogOrderListSchema.safeParse(data)
    if (!validationResult.success) {
      return {
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.flatten().fieldErrors,
      }
    }

    // update catalog order
    await Promise.all(
      validationResult.data.map(async (catalog) => {
        await db
          .update(catalogs)
          .set({ sortOrder: catalog.sortOrder })
          .where(eq(catalogs.id, catalog.id))
      })
    )

    return { success: true, message: 'Catalog order updated successfully' }
  } catch (e) {
    console.error('Error updating product:', e)
    return {
      success: false,
      message: 'An error occurred while updating the product',
      error: 'Failed to update product',
    }
  }
}

export async function deleteCatalog(id: number) {
  try {
    await mockDelay(700)
    const admin = await getCurrentAdmin()
    if (!admin) {
      throw new Error('Unauthorized')
    }

    // Delete product
    await db.delete(catalogs).where(eq(catalogs.id, id))

    return { success: true, message: 'Catalog deleted successfully' }
  } catch (error) {
    console.error('Error deleting product:', error)
    return {
      success: false,
      message: 'An error occurred while deleting the product',
      error: 'Failed to delete product',
    }
  }
}
