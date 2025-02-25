import { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import crypto from 'node:crypto'
import db from '@adonisjs/lucid/services/db'

export default class AuthController {
  /**
   * Hash password using Node's crypto
   */
  private hashPassword(password: string): string {
    // Generate a random salt
    const salt = crypto.randomBytes(16).toString('hex')
    
    // Hash the password with the salt using SHA-256
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex')
    
    // Return the combined salt and hash
    return `${salt}:${hash}`
  }

  /**
   * Verify password
   */
  private verifyPassword(providedPassword: string, storedPassword: string): boolean {
    const [salt, storedHash] = storedPassword.split(':')
    const hash = crypto.pbkdf2Sync(providedPassword, salt, 1000, 64, 'sha256').toString('hex')
    return hash === storedHash
  }

  /**
   * Register a new user
   */
  async register({ request, response }: HttpContext) {
    try {
      // Get request body
      const body = request.body()
      
      // Validate required fields
      if (!body.name || !body.password || !body.first_name || !body.last_name) {
        return response.status(400).json({
          message: 'Missing required fields'
        })
      }

      // Check if user already exists
      const existingUser = await db.query().from('users').where('name', body.name).first()

      if (existingUser) {
        return response.status(409).json({
          message: 'User already exists'
        })
      }

      // Hash the password
      const hashedPassword = this.hashPassword(body.password)

      // Create new user
      const user = await db.table('users').insert({
        name: body.name,
        password: hashedPassword,
        first_name: body.first_name,
        last_name: body.last_name,
        avatar: body.avatar || null,
        permissions: body.permissions || null,
        role: body.role || 'GENERAL',
        created_at: DateTime.now().toSQL(),
        is_active: true
      }).returning(['id', 'name', 'first_name', 'last_name', 'role', 'created_at'])

      return response.status(201).json(user[0])
    } catch (error: any) {
      // Handle specific database errors (unique constraint violation)
      if (error.code === 'ER_DUP_ENTRY') {
        return response.status(409).json({
          message: 'User already exists'
        })
      }

      // Re-throw other errors
      return response.status(500).json({
        message: 'Internal server error',
        error: error.message
      })
    }
  }

  /**
   * Login a user
   */
  async login({ request, response }: HttpContext) {
    try {
      // Get request body
      const body = request.body()
      
      // Validate required fields
      if (!body.name || !body.password) {
        return response.status(400).json({
          message: 'Username and password are required'
        })
      }

      // Find user by username
      const user = await db.query().from('users')
        .where('name', body.name)
        .where('is_active', true)
        .first()

      // Check if user exists
      if (!user) {
        return response.status(401).json({
          message: 'Invalid credentials'
        })
      }

      // Verify password
      if (!this.verifyPassword(body.password, user.password)) {
        return response.status(401).json({
          message: 'Invalid credentials'
        })
      }

      // Update last login timestamp
      await db.query().from('users')
        .where('id', user.id)
        .update({ 
          last_login: DateTime.now().toSQL(),
          updated_at: DateTime.now().toSQL()
        })

      // Return user data (excluding sensitive information)
      console.log(user)
      return response.status(200).json({
        id: user.id,
        name: user.name,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        permissions: user.permissions,
        avatar: user.avatar
      })
    } catch (error: any) {
      return response.status(500).json({
        message: 'Internal server error',
        error: error.message
      })
    }
  }
}