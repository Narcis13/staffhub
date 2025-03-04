# AdonisJS v6 Controllers for StaffHUB Application

Below are the controllers needed for your StaffHUB application based on the database schema. I've created CRUD operations for each of your main models.

## 1. CategoriesController.js

```javascript
import { inject } from '@adonisjs/core'
import Category from '#models/category'
import { HttpContext } from '@adonisjs/core/http'

@inject()
export default class CategoriesController {
  /**
   * Get all categories
   */
  async index({ response }) {
    const categories = await Category.query().where('is_active', true)
    return response.ok(categories)
  }

  /**
   * Get all categories including inactive ones (for admin use)
   */
  async listAll({ response }) {
    const categories = await Category.all()
    return response.ok(categories)
  }

  /**
   * Get a specific category by ID
   */
  async show({ params, response }) {
    const category = await Category.find(params.id)
    
    if (!category) {
      return response.notFound({ message: 'Category not found' })
    }

    return response.ok(category)
  }

  /**
   * Create a new category
   */
  async store({ request, response }) {
    const data = request.only(['name'])
    
    try {
      const category = await Category.create(data)
      return response.created(category)
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return response.conflict({ message: 'A category with this name already exists' })
      }
      return response.badRequest({ message: 'Could not create category', error: error.message })
    }
  }

  /**
   * Update a category
   */
  async update({ params, request, response }) {
    const category = await Category.find(params.id)
    
    if (!category) {
      return response.notFound({ message: 'Category not found' })
    }

    const data = request.only(['name', 'is_active'])
    
    try {
      category.merge(data)
      await category.save()
      return response.ok(category)
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return response.conflict({ message: 'A category with this name already exists' })
      }
      return response.badRequest({ message: 'Could not update category', error: error.message })
    }
  }

  /**
   * Soft delete a category by setting is_active to false
   */
  async destroy({ params, response }) {
    const category = await Category.find(params.id)
    
    if (!category) {
      return response.notFound({ message: 'Category not found' })
    }
    
    category.is_active = false
    await category.save()
    
    return response.ok({ message: 'Category deactivated successfully' })
  }
}
```

## 2. ServicesController.js

```javascript
import { inject } from '@adonisjs/core'
import Service from '#models/service'
import Category from '#models/category'
import { HttpContext } from '@adonisjs/core/http'

@inject()
export default class ServicesController {
  /**
   * Get all active services
   */
  async index({ response }) {
    const services = await Service.query()
      .where('is_active', true)
      .preload('category')
    
    return response.ok(services)
  }

  /**
   * Get all services including inactive ones (for admin use)
   */
  async listAll({ response }) {
    const services = await Service.query().preload('category')
    return response.ok(services)
  }

  /**
   * Get services by category
   */
  async byCategory({ params, response }) {
    const services = await Service.query()
      .where('category_id', params.categoryId)
      .where('is_active', true)
    
    return response.ok(services)
  }

  /**
   * Get a specific service by ID
   */
  async show({ params, response }) {
    const service = await Service.query()
      .where('id', params.id)
      .preload('category')
      .first()
    
    if (!service) {
      return response.notFound({ message: 'Service not found' })
    }

    return response.ok(service)
  }

  /**
   * Create a new service
   */
  async store({ request, response }) {
    const data = request.only(['name', 'category_id', 'price'])
    
    // Verify the category exists
    const category = await Category.find(data.category_id)
    if (!category) {
      return response.badRequest({ message: 'Category not found' })
    }
    
    try {
      const service = await Service.create(data)
      await service.load('category')
      return response.created(service)
    } catch (error) {
      return response.badRequest({ message: 'Could not create service', error: error.message })
    }
  }

  /**
   * Update a service
   */
  async update({ params, request, response }) {
    const service = await Service.find(params.id)
    
    if (!service) {
      return response.notFound({ message: 'Service not found' })
    }

    const data = request.only(['name', 'category_id', 'price', 'is_active'])
    
    // If category is being updated, verify it exists
    if (data.category_id) {
      const category = await Category.find(data.category_id)
      if (!category) {
        return response.badRequest({ message: 'Category not found' })
      }
    }
    
    try {
      service.merge(data)
      await service.save()
      await service.load('category')
      return response.ok(service)
    } catch (error) {
      return response.badRequest({ message: 'Could not update service', error: error.message })
    }
  }

  /**
   * Soft delete a service by setting is_active to false
   */
  async destroy({ params, response }) {
    const service = await Service.find(params.id)
    
    if (!service) {
      return response.notFound({ message: 'Service not found' })
    }
    
    service.is_active = false
    await service.save()
    
    return response.ok({ message: 'Service deactivated successfully' })
  }
}
```

## 3. ReceiptsController.js

```javascript
import { inject } from '@adonisjs/core'
import Receipt from '#models/receipt'
import Service from '#models/service'
import ReceiptService from '#models/receipt_service'
import { HttpContext } from '@adonisjs/core/http'
import Database from '@adonisjs/lucid/database'

@inject()
export default class ReceiptsController {
  /**
   * Get all receipts
   */
  async index({ request, response }) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 15)
    const status = request.input('status')
    
    const query = Receipt.query()
      .orderBy('created_at', 'desc')
    
    if (status) {
      query.where('status', status)
    }
    
    const receipts = await query.paginate(page, limit)
    
    return response.ok(receipts)
  }

  /**
   * Get a specific receipt by ID with its services
   */
  async show({ params, response }) {
    const receipt = await Receipt.query()
      .where('id', params.id)
      .preload('services', (query) => {
        query.pivotColumns(['quantity', 'price_at_time_of_service'])
      })
      .first()
    
    if (!receipt) {
      return response.notFound({ message: 'Receipt not found' })
    }

    return response.ok(receipt)
  }

  /**
   * Create a new receipt
   */
  async store({ request, response }) {
    const { name, location, services } = request.only(['name', 'location', 'services'])
    
    // Generate a unique receipt number
    const date = new Date()
    const year = date.getFullYear().toString().substr(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    
    // Get latest receipt number for today
    const latestReceipt = await Receipt.query()
      .whereRaw("DATE(created_at) = CURDATE()")
      .orderBy('id', 'desc')
      .first()
    
    let counter = 1
    if (latestReceipt) {
      const parts = latestReceipt.receipt_number.split('-')
      counter = parseInt(parts[parts.length - 1]) + 1
    }
    
    const receiptNumber = `${year}${month}${day}-${counter.toString().padStart(4, '0')}`
    
    // Calculate total amount
    let totalAmount = 0
    
    const trx = await Database.transaction()
    
    try {
      // Create the receipt
      const receipt = await Receipt.create({
        name,
        location,
        receipt_number: receiptNumber,
        total_amount: 0,  // Will update after calculating from services
        status: 'PENDING'
      }, { client: trx })
      
      // Add services to the receipt
      if (services && services.length > 0) {
        for (const serviceItem of services) {
          const service = await Service.find(serviceItem.id)
          
          if (!service) {
            await trx.rollback()
            return response.badRequest({ message: `Service with ID ${serviceItem.id} not found` })
          }
          
          const quantity = serviceItem.quantity || 1
          const itemTotal = service.price * quantity
          totalAmount += itemTotal
          
          await ReceiptService.create({
            receipt_id: receipt.id,
            service_id: service.id,
            quantity: quantity,
            price_at_time_of_service: service.price
          }, { client: trx })
        }
        
        // Update the receipt with the total amount
        receipt.total_amount = totalAmount
        await receipt.save({ client: trx })
      }
      
      await trx.commit()
      
      // Reload receipt with services
      await receipt.load('services', (query) => {
        query.pivotColumns(['quantity', 'price_at_time_of_service'])
      })
      
      return response.created(receipt)
    } catch (error) {
      await trx.rollback()
      return response.badRequest({ message: 'Could not create receipt', error: error.message })
    }
  }

  /**
   * Update a receipt's status (mark as PAID)
   */
  async update({ params, request, response }) {
    const receipt = await Receipt.find(params.id)
    
    if (!receipt) {
      return response.notFound({ message: 'Receipt not found' })
    }

    const { status } = request.only(['status'])
    
    if (status && !['PENDING', 'PAID'].includes(status)) {
      return response.badRequest({ message: 'Invalid status. Must be PENDING or PAID' })
    }
    
    receipt.status = status
    await receipt.save()
    
    return response.ok(receipt)
  }

  /**
   * Generate report of receipts
   */
  async report({ request, response }) {
    const { 
      startDate, 
      endDate, 
      category_id, 
      status 
    } = request.all()
    
    let query = Receipt.query()
    
    // Apply date range filter
    if (startDate && endDate) {
      query = query.whereBetween('created_at', [startDate, endDate])
    } else if (startDate) {
      query = query.where('created_at', '>=', startDate)
    } else if (endDate) {
      query = query.where('created_at', '<=', endDate)
    }
    
    // Apply status filter
    if (status) {
      query = query.where('status', status)
    }
    
    // Load receipt services
    query = query.preload('services', (serviceQuery) => {
      serviceQuery.pivotColumns(['quantity', 'price_at_time_of_service'])
      
      // Filter by category
      if (category_id) {
        serviceQuery.where('category_id', category_id)
      }
    })
    
    const receipts = await query.orderBy('created_at', 'desc').exec()
    
    // If filtering by category, we need to further filter receipts that have no services in that category
    if (category_id) {
      const filteredReceipts = receipts.filter(receipt => receipt.services.length > 0)
      return response.ok(filteredReceipts)
    }
    
    return response.ok(receipts)
  }

  /**
   * Get summary statistics for dashboard
   */
  async statistics({ request, response }) {
    const { startDate, endDate } = request.all()
    
    // Default to current month if no dates provided
    const today = new Date()
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    
    const start = startDate ? new Date(startDate) : firstDayOfMonth
    const end = endDate ? new Date(endDate) : lastDayOfMonth
    
    // Total receipts and amount
    const totalStats = await Receipt.query()
      .whereBetween('created_at', [start, end])
      .where('status', 'PAID')
      .count('* as total_count')
      .sum('total_amount as total_amount')
      .first()
    
    // Daily breakdown
    const dailyStats = await Database.rawQuery(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count,
        SUM(total_amount) as total
      FROM receipts
      WHERE created_at BETWEEN ? AND ?
      AND status = 'PAID'
      GROUP BY DATE(created_at)
      ORDER BY date
    `, [start, end])
    
    // Category breakdown
    const categoryStats = await Database.rawQuery(`
      SELECT 
        c.name as category,
        SUM(rs.quantity * rs.price_at_time_of_service) as total
      FROM receipts r
      JOIN receipt_services rs ON r.id = rs.receipt_id
      JOIN services s ON rs.service_id = s.id
      JOIN categories c ON s.category_id = c.id
      WHERE r.created_at BETWEEN ? AND ?
      AND r.status = 'PAID'
      GROUP BY c.id, c.name
      ORDER BY total DESC
    `, [start, end])
    
    return response.ok({
      total_receipts: totalStats.total_count || 0,
      total_amount: totalStats.total_amount || 0,
      daily_breakdown: dailyStats.rows || [],
      category_breakdown: categoryStats.rows || []
    })
  }
}
```

## 4. Additional Models (If Not Already Created)

Make sure you have your models created to match the controllers. Here's a quick reference:

### Category.js
```javascript
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class Category extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare is_active: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => import('#models/service'))
  declare services: ReturnType<typeof import('#models/service')['default']['prototype']['related']>
}
```

### Service.js
```javascript
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class Service extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare category_id: number

  @column()
  declare price: number

  @column()
  declare is_active: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => import('#models/category'))
  declare category: ReturnType<typeof import('#models/category')['default']['prototype']['related']>
}
```

### Receipt.js
```javascript
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class Receipt extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare location: string

  @column()
  declare receipt_number: string

  @column()
  declare total_amount: number

  @column()
  declare status: 'PENDING' | 'PAID'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @manyToMany(() => import('#models/service'), {
    pivotTable: 'receipt_services',
    pivotForeignKey: 'receipt_id',
    pivotRelatedForeignKey: 'service_id',
    pivotColumns: ['quantity', 'price_at_time_of_service'],
  })
  declare services: ReturnType<typeof import('#models/service')['default']['prototype']['related']>
}
```

### ReceiptService.js
```javascript
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class ReceiptService extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare receipt_id: number

  @column()
  declare service_id: number

  @column()
  declare quantity: number

  @column()
  declare price_at_time_of_service: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
```

These controllers provide complete CRUD functionality for your StaffHUB application based on the database schema. You'll need to define your routes to point to these controllers and methods as needed.