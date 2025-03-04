import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'receipts'

  async up() {
  
      this.schema.createTable(this.tableName, (table) => {
        table.increments('id').primary()
  
        table.string('name').notNullable()
        table.string('location').notNullable()
        table.string('receipt_number').unique().notNullable()
        table.decimal('total_amount', 10, 2).notNullable()
        table.enum('status', ['PENDING', 'PAID']).defaultTo('PENDING')
        table.timestamps(true, true)
      })
 
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}