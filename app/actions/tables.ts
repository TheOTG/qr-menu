'use server'

import { db } from '@/db'
import { tables } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { getCurrentAdmin } from '@/lib/dal'
import { z } from 'zod'
import { mockDelay } from '@/lib/utils'
import { revalidateTag } from 'next/cache'

// Define Zod schema for table validation
const TableSchema = z.object({
  tableNumber: z.number(),
})

export type TableData = z.infer<typeof TableSchema>

export type ActionResponse = {
  success: boolean
  message: string
  errors?: Record<string, string[]>
  error?: string
}

export const createTable = async () => {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) {
      return {
        success: false,
        message: 'Unauthorized access',
        error: 'Unauthorized',
      }
    }

    // // Validate with Zod
    // const validationResult = TableSchema.safeParse(data)
    // if (!validationResult.success) {
    //   return {
    //     success: false,
    //     message: 'Validation failed',
    //     errors: validationResult.error.flatten().fieldErrors,
    //   }
    // }

    // // Create table with validated data
    // const validatedData = validationResult.data
    await db.insert(tables).values({
      adminId: admin.id,
    })

    revalidateTag('tables')
    return { success: true, message: 'Product created successfully' }
  } catch (error) {
    console.error('Error creating table:', error)
    return {
      success: false,
      message: 'An error occurred while creating the table',
      error: 'Failed to create table',
    }
  }
}

export const updateTable = async (id: number, data: Partial<TableData>) => {
  try {
    const admin = await getCurrentAdmin()

    if (!admin) {
      return {
        success: false,
        message: 'Unauthorized access',
        error: 'Authorized',
      }
    }

    const UpdateSchema = TableSchema.required()
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

    // Update table
    await db.update(tables).set(updateData).where(eq(tables.id, id))

    return { success: true, message: 'Table updated successfully' }
  } catch (e) {
    console.error('Error updating table:', e)
    return {
      success: false,
      message: 'An error occurred while updating the table',
      error: 'Failed to update table',
    }
  }
}

export async function deleteTable(id: number) {
  try {
    await mockDelay(700)
    const admin = await getCurrentAdmin()
    if (!admin) {
      throw new Error('Unauthorized')
    }

    // Delete table
    await db.update(tables).set({ isDeleted: true }).where(eq(tables.id, id))

    return { success: true, message: 'Table deleted successfully' }
  } catch (error) {
    console.error('Error deleting table:', error)
    return {
      success: false,
      message: 'An error occurred while deleting the table',
      error: 'Failed to delete table',
    }
  }
}
