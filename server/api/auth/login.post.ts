import { H3Event } from 'h3'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

// Password verification function
function verifyPassword(providedPassword: string, storedPassword: string): boolean {
  const [salt, storedHash] = storedPassword.split(':')
  const hash = crypto.pbkdf2Sync(providedPassword, salt, 1000, 64, 'sha256').toString('hex')
  return hash === storedHash
}

export default defineEventHandler(async (event: H3Event) => {
  try {
    // Get request body
    const body = await readBody(event)

    // Validate required fields
    if (!body.name || !body.password) {
      throw createError({
        statusCode: 400,
        message: 'Username and password are required'
      })
    }

    // Find user by username
    const user = await prisma.users.findUnique({
      where: {
        name: body.name,
        is_active: true
      }
    })

    // Check if user exists
    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Invalid credentials'
      })
    }

    // Verify password
    if (!verifyPassword(body.password, user.password)) {
      throw createError({
        statusCode: 401,
        message: 'Invalid credentials'
      })
    }

    // Update last login timestamp
    await prisma.users.update({
      where: { id: user.id },
      data: { last_login: new Date() }
    })

    // Return user data (excluding sensitive information)
    return {
      statusCode: 200,
      body: {
        id: user.id,
        name: user.name,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        permissions: user.permissions,
        avatar: user.avatar
      }
    }

  } catch (error: any) {
    throw error
  }
})