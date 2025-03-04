import { DateTime } from 'luxon'
import { BaseModel, column,hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import ReceiptService from './receipt_service.js'

export default class Receipt extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string
  @column()
  declare location: string

  @column()
  declare receiptNumber: string

  @column()
  declare totalAmount: number

  @column()
  declare status: 'PENDING' | 'PAID'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime



  @hasMany(() => ReceiptService)
  declare receiptServices: HasMany<typeof ReceiptService>
}