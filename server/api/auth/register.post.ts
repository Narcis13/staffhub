// server/api/auth/register.post.ts
import { H3Event } from 'h3'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

// Password hashing function using Node's crypto
function hashPassword(password: string): string {
  // Generate a random salt
  const salt = crypto.randomBytes(16).toString('hex')
  
  // Hash the password with the salt using SHA-256
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex')
  
  // Return the combined salt and hash
  return `${salt}:${hash}`
}

// Validate email format


export default defineEventHandler(async (event: H3Event) => {
  try {
    // Get request body
    const body = await readBody(event)
    
    // Validate required fields
    if (!body.name || !body.password || !body.first_name || !body.last_name) {
      throw createError({
        statusCode: 400,
        message: 'Missing required fields'
      })
    }



    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: {
        name: body.name
      }
    })

    if (existingUser) {
      throw createError({
        statusCode: 409,
        message: 'User already exists'
      })
    }

    // Hash the password
    const hashedPassword = hashPassword(body.password)

    // Create new user
    const user = await prisma.users.create({
      data: {
        name: body.name,
        password: hashedPassword,
        first_name: body.first_name,
        last_name: body.last_name,
        avatar: body.avatar || null,
        permissions: body.permissions || null,
        role: body.role || 'GENERAL'
      },
      select: {
        id: true,
        name: true,
        first_name: true,
        last_name: true,
        role: true,
        created_at: true
      }
    })

    return {
      statusCode: 201,
      body: user
    }

  } catch (error: any) {
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      throw createError({
        statusCode: 409,
        message: 'User already exists'
      })
    }

    // Re-throw other errors
    throw error
  }
})