import { DateTime } from 'luxon'
import { BaseModel, column,belongsTo } from '@adonisjs/lucid/orm'
import Receipt from './receipt.js'
import Service from './service.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
export default class ReceiptService extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare receiptId: number

  @column()
  declare serviceId: number

  @column()
  declare quantity: number

  @column()
  declare priceAtTimeOfService: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Receipt)
  declare receipt: BelongsTo<typeof Receipt>

  @belongsTo(() => Service)
  declare service: BelongsTo<typeof Service>
}