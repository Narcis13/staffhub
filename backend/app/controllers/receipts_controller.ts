import { inject } from '@adonisjs/core'
import Receipt from '#models/receipt'
import Service from '#models/service'
import ReceiptService from '#models/receipt_service'
import { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

@inject()
export default class ReceiptsController {
  /**
   * Get all receipts with pagination
   */
  async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 15)
    const status = request.input('status')
    
    const query = Receipt.query()
      .preload('receiptServices', (query) => {
        query.preload('service')
      })
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
  async show({ params, response }: HttpContext) {
    const receipt = await Receipt.query()
      .where('id', params.id)
      .preload('receiptServices', (query) => {
        query.preload('service')
      })
      .first()
    
    if (!receipt) {
      return response.notFound({ message: 'Receipt not found' })
    }

    return response.ok(receipt)
  }

  /**
   * Create a new receipt with services
   */
  async store({ request, response }: HttpContext) {
    const { name, location, services } = request.only(['name', 'location', 'services'])
    
    // Generate a unique receipt number (YYMMDD-XXXX format)
    const date = new Date()
    const year = date.getFullYear().toString().substr(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    
    // Get latest receipt number for today
    const latestReceipt = await Receipt.query()
      .whereRaw('DATE(created_at) = CURRENT_DATE')
      .orderBy('id', 'desc')
      .first()
    
    let counter = 1
    if (latestReceipt) {
      const parts = latestReceipt.receiptNumber.split('-')
      counter = parseInt(parts[parts.length - 1]) + 1
    }
    
    const receiptNumber = `${year}${month}${day}-${counter.toString().padStart(4, '0')}`
    
    // Calculate total amount and create receipt with services
    let totalAmount = 0
    
    const trx = await db.transaction()
    
    try {
      // Create the receipt
      const receipt = await Receipt.create({
        name,
        location,
        receiptNumber,
        totalAmount: 0, // Will update after calculating from services
        status: 'PENDING'
      })
      
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
            receiptId: receipt.id,
            serviceId: service.id,
            quantity,
            priceAtTimeOfService: service.price
          })
        }
        
        // Update the receipt with the total amount
        receipt.totalAmount = totalAmount
        await receipt.save()
      }
      
      await trx.commit()
      
      // Reload receipt with services
      await receipt.load('receiptServices', (query) => {
        query.preload('service')
      })
      
      return response.created(receipt)
    } catch (error) {
      await trx.rollback()
      return response.badRequest({ 
        message: 'Could not create receipt', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
    }
  }

  /**
   * Update a receipt's status
   */
  async update({ params, request, response }: HttpContext) {
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
   * Get receipt statistics for reporting
   */
  async statistics({ request, response }: HttpContext) {
    const { startDate, endDate, status } = request.all()
    
    // Default to current month if no dates provided
    const today = new Date()
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    
    const start = startDate ? new Date(startDate) : firstDayOfMonth
    const end = endDate ? new Date(endDate) : lastDayOfMonth
    
    // Build base query
    const query = Receipt.query()
      .whereBetween('created_at', [start, end])
    
    if (status) {
      query.where('status', status)
    }
    
    // Get total receipts and amount
    const totalStats = await query.clone()
      .count('* as total_count')
      .sum('total_amount as total_amount')
      .first()
    
    // Get daily breakdown using raw SQL for date formatting
    const dailyBreakdownSql = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count,
        SUM(total_amount) as total
      FROM receipts
      WHERE created_at BETWEEN ? AND ?
      ${status ? 'AND status = ?' : ''}
      GROUP BY DATE(created_at)
      ORDER BY date
    `
    
    const dailyStats = await db.rawQuery(
      dailyBreakdownSql,
      status ? [start, end, status] : [start, end]
    )
    
    // Get service category breakdown using raw SQL
    const categoryBreakdownSql = `
      SELECT 
        c.name as category,
        SUM(rs.quantity * rs.price_at_time_of_service) as total
      FROM receipts r
      JOIN receipt_services rs ON r.id = rs.receipt_id
      JOIN services s ON rs.service_id = s.id
      JOIN categories c ON s.category_id = c.id
      WHERE r.created_at BETWEEN ? AND ?
      ${status ? 'AND r.status = ?' : ''}
      GROUP BY c.id, c.name
      ORDER BY total DESC
    `
    
    const categoryStats = await db.rawQuery(
      categoryBreakdownSql,
      status ? [start, end, status] : [start, end]
    )
    
    return response.ok({
      totalReceipts: Number(totalStats?.$extras.total_count) || 0,
      totalAmount: Number(totalStats?.$extras.total_amount) || 0,
      dailyBreakdown: dailyStats.rows || [],
      categoryBreakdown: categoryStats.rows || []
    })
  }
} 