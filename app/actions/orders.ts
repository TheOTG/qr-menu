// Order server action here, validate order -> create invoice link (xendit invoice) -> create order in db
'use server'

import { db } from '@/db'
import { products, orders } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { getCurrentAdmin } from '@/lib/dal'
import { z } from 'zod'
import { mockDelay } from '@/lib/utils'
import { revalidateTag } from 'next/cache'

// Define Zod schema for catalog validation
const AddonSchema = z.object({
  name: z.string(),
  price: z.number().min(0),
})
const CartSchema = z.object({
  productId: z.number(),
  addons: z.array(AddonSchema),
  notes: z.string(),
})
const OrderSchema = z.object({
  customerName: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be less than 50 characters'),
  phoneNumber: z
    .string()
    .min(6, 'Phone number must be at least 6 characters')
    .max(15, 'Name must be less than 20 characters'),
  cartItems: z.array(CartSchema),
  paymentLink: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be less than 100 characters'),
  tableId: z.number(),
})

export type OrderData = z.infer<typeof OrderSchema>

export type ActionResponse = {
  success: boolean
  message: string
  errors?: Record<string, string[]>
  error?: any
}

export const createOrder = async (data: OrderData) => {
  try {
    console.log(data, '====data')

    // Validate with Zod
    const validationResult = OrderSchema.safeParse(data)
    if (!validationResult.success) {
      return {
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.flatten().fieldErrors,
      }
    }

    // validate products in cart

    // validate table id

    // create payment link

    // Create product with validated data
    const validatedData = validationResult.data
    await db.insert(orders).values({
      customerName: validatedData.customerName,
      phoneNumber: validatedData.phoneNumber,
      cartItems: validatedData.cartItems,
    } as typeof orders.$inferInsert)

    revalidateTag('orders')
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
