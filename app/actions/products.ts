'use server'

import { db } from '@/db'
import { products } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { getCurrentAdmin } from '@/lib/dal'
import { z } from 'zod'
import { mockDelay } from '@/lib/utils'
import { revalidateTag } from 'next/cache'

// Define Zod schema for product validation
const addonItemSchema = z.object({
  name: z
    .string()
    .min(1, 'Addon item name must be at least 1 character')
    .max(50, 'Addon item name must be less than 50 characters'),
  price: z.number().min(0),
})
const addonsSchema = z.object({
  name: z
    .string()
    .min(1, 'Addon name must be at least 3 characters')
    .max(50, 'Addon name must be less than 50 characters'),
  type: z.enum(['one', 'multiple']),
  items: z.array(addonItemSchema),
})
const ProductSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be less than 100 characters'),
  sku: z.string().min(1, 'SKU is required'),
  // image: z.string().optional().nullable(),
  // thumbnail: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  price: z.number().min(500, 'Minimum price is 500'),
  useStock: z.boolean(),
  stock: z.number().min(0, 'Minimum stock is 0'),
  addons: z.array(addonsSchema),
})

export type ProductData = z.infer<typeof ProductSchema>

export type ActionResponse = {
  success: boolean
  message: string
  errors?: Record<string, string[]>
  error?: any
}

export const createProduct = async (
  data: ProductData
): Promise<ActionResponse> => {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) {
      return {
        success: false,
        message: 'Unauthorized access',
        error: 'Unauthorized',
      }
    }

    // Validate with Zod
    const validationResult = ProductSchema.safeParse(data)
    if (!validationResult.success) {
      return {
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.flatten().fieldErrors,
      }
    }

    // Create product with validated data
    const validatedData = validationResult.data
    await db.insert(products).values({
      name: validatedData.name,
      sku: validatedData.sku,
      // image: validatedData.image,
      // thumbnail: validatedData.thumbnail,
      description: validatedData.description,
      price: validatedData.price,
      useStock: validatedData.useStock,
      stock: validatedData.stock,
      addons: validatedData.addons,
      adminId: admin.id,
      isDeleted: false,
    } as typeof products.$inferInsert)

    revalidateTag('products')
    return { success: true, message: 'Product created successfully' }
  } catch (error) {
    console.error('Error creating product:', error)
    return {
      success: false,
      message: 'An error occurred while creating the product',
      error: 'Failed to create product',
    }
  }
}

export const updateProduct = async (id: number, data: Partial<ProductData>) => {
  try {
    const admin = await getCurrentAdmin()

    if (!admin) {
      return {
        success: false,
        message: 'Unauthorized access',
        error: 'Authorized',
      }
    }

    const UpdateSchema = ProductSchema.partial()
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

    if (validatedData.name !== undefined) updateData.name = validatedData.name
    if (validatedData.sku !== undefined) updateData.sku = validatedData.sku
    if (validatedData.price !== undefined)
      updateData.price = validatedData.price
    if (validatedData.description !== undefined)
      updateData.description = validatedData.description
    if (validatedData.addons !== undefined)
      updateData.addons = validatedData.addons

    // Update product
    await db.update(products).set(updateData).where(eq(products.id, id))

    revalidateTag('products')
    return { success: true, message: 'Product updated successfully' }
  } catch (e) {
    console.error('Error updating product:', e)
    return {
      success: false,
      message: 'An error occurred while updating the product',
      error: 'Failed to update product',
    }
  }
}

export async function deleteProduct(id: number) {
  try {
    await mockDelay(700)
    const admin = await getCurrentAdmin()
    if (!admin) {
      throw new Error('Unauthorized')
    }

    // Delete product
    await db
      .update(products)
      .set({ isDeleted: true })
      .where(and(eq(products.id, id), eq(products.isDeleted, false)))

    return { success: true, message: 'Product deleted successfully' }
  } catch (error) {
    console.error('Error deleting product:', error)
    return {
      success: false,
      message: 'An error occurred while deleting the product',
      error: 'Failed to delete product',
    }
  }
}
