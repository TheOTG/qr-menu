'use server'

import { z } from 'zod'
import {
  verifyPassword,
  createSession,
  createUser,
  deleteSession,
  getSession,
} from '@/lib/auth'
import { getAdminByUsername } from '@/lib/dal'
import { mockDelay } from '@/lib/utils'
import { redirect } from 'next/navigation'

// Define Zod schema for signin validation
const SignInSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

// Define Zod schema for signup validation
const SignUpSchema = z
  .object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export type SignInData = z.infer<typeof SignInSchema>
export type SignUpData = z.infer<typeof SignUpSchema>

export type ActionResponse = {
  success: boolean
  message: string
  errors?: Record<string, string[]>
  error?: string
}

export const signIn = async (formData: FormData): Promise<ActionResponse> => {
  try {
    const data = {
      username: formData.get('username') as string,
      password: formData.get('password') as string,
    }

    const validationResult = SignInSchema.safeParse(data)

    if (!validationResult.success) {
      return {
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.flatten().fieldErrors,
      }
    }

    const user = await getAdminByUsername(data.username)

    if (!user) {
      return {
        success: false,
        message: 'Invalid username or password',
        errors: {
          username: ['Invalid username or password'],
        },
      }
    }

    const isPasswordValid = await verifyPassword(data.password, user.password)

    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Invalid username or password',
        errors: {
          password: ['Invalid username or password'],
        },
      }
    }

    await createSession(user.id)

    return {
      success: true,
      message: 'Signed in successfully',
    }
  } catch (e) {
    console.error(e)
    return {
      success: false,
      error: 'Something bad happened',
      message: 'Something bad happened',
    }
  }
}

export const signOut = async () => {
  try {
    await deleteSession()
  } catch (e) {
    console.error(e)
    throw e
  } finally {
    redirect('/login')
  }
}
