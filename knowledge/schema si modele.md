### Database Schema Design

Based on the project requirements and user flow, here’s a proposed database schema for the **StaffHUB** application:

---

#### **Tables**
1. **Users**  
   - Stores user information for authentication (casier and administrator).  
   - Fields:  
     - `id` (Primary Key, Auto Increment)  
     - `username` (String, Unique)  
     - `password` (String)  
     - `role` (Enum: 'CASIER', 'ADMIN')  
     - `created_at` (Timestamp)  
     - `updated_at` (Timestamp)  

2. **Categories**  
   - Stores categories for medical services.  
   - Fields:  
     - `id` (Primary Key, Auto Increment)  
     - `name` (String, Unique)  
     - `is_active` (Boolean, Default: true)  
     - `created_at` (Timestamp)  
     - `updated_at` (Timestamp)  

3. **Services**  
   - Stores individual medical services linked to categories.  
   - Fields:  
     - `id` (Primary Key, Auto Increment)  
     - `name` (String)  
     - `category_id` (Foreign Key to `Categories.id`)  
     - `price` (Decimal)  
     - `is_active` (Boolean, Default: true)  
     - `created_at` (Timestamp)  
     - `updated_at` (Timestamp)  



4. **Receipts**  
   - Stores receipts generated for patients.  
   - Fields:  
     - `id` (Primary Key, Auto Increment)  
     - `name` (String)  
     - `location` (String)  
     - `receipt_number` (String, Unique)  
     - `total_amount` (Decimal)  
     - `status` (Enum: 'PENDING', 'PAID')  
     - `created_at` (Timestamp)  
     - `updated_at` (Timestamp)  

5. **ReceiptServices**  
   - Stores the many-to-many relationship between receipts and services.  
   - Fields:  
     - `id` (Primary Key, Auto Increment)  
     - `receipt_id` (Foreign Key to `Receipts.id`)  
     - `service_id` (Foreign Key to `Services.id`)  
     - `quantity` (Integer, Default: 1)  
     - `price_at_time_of_service` (Decimal)  
     - `created_at` (Timestamp)  
     - `updated_at` (Timestamp)  

---

### AdonisJS Models and Migrations

Below are the AdonisJS model and migration files for the above schema.

---

#### **1. Users**
- **Migration**: `database/migrations/xxxx_users.ts`  
```typescript
import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Users extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('username').unique().notNullable()
      table.string('password').notNullable()
      table.enum('role', ['CASIER', 'ADMIN']).notNullable()
      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

- **Model**: `app/Models/User.ts`  
```typescript
import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public username: string

  @column()
  public password: string

  @column()
  public role: 'CASIER' | 'ADMIN'

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
```

---

#### **2. Categories**
- **Migration**: `database/migrations/xxxx_categories.ts`  
```typescript
import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Categories extends BaseSchema {
  protected tableName = 'categories'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('name').unique().notNullable()
      table.boolean('is_active').defaultTo(true)
      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

- **Model**: `app/Models/Category.ts`  
```typescript
import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Service from './Service'

export default class Category extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public isActive: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasMany(() => Service)
  public services: HasMany<typeof Service>
}
```

---

#### **3. Services**
- **Migration**: `database/migrations/xxxx_services.ts`  
```typescript
import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Services extends BaseSchema {
  protected tableName = 'services'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('name').notNullable()
      table.integer('category_id').unsigned().references('id').inTable('categories').onDelete('CASCADE')
      table.decimal('price', 10, 2).notNullable()
      table.boolean('is_active').defaultTo(true)
      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

- **Model**: `app/Models/Service.ts`  
```typescript
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Category from './Category'

export default class Service extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public categoryId: number

  @column()
  public price: number

  @column()
  public isActive: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Category)
  public category: BelongsTo<typeof Category>
}
```

---

#### **4. Patients**
- **Migration**: `database/migrations/xxxx_patients.ts`  
```typescript
import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Patients extends BaseSchema {
  protected tableName = 'patients'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('name').notNullable()
      table.string('location').notNullable()
      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

- **Model**: `app/Models/Patient.ts`  
```typescript
import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Receipt from './Receipt'

export default class Patient extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public location: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasMany(() => Receipt)
  public receipts: HasMany<typeof Receipt>
}
```

---

#### **5. Receipts**
- **Migration**: `database/migrations/xxxx_receipts.ts`  
```typescript
import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Receipts extends BaseSchema {
  protected tableName = 'receipts'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('patient_id').unsigned().references('id').inTable('patients').onDelete('CASCADE')
      table.string('receipt_number').unique().notNullable()
      table.decimal('total_amount', 10, 2).notNullable()
      table.enum('status', ['PENDING', 'PAID']).defaultTo('PENDING')
      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

- **Model**: `app/Models/Receipt.ts`  
```typescript
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Patient from './Patient'
import ReceiptService from './ReceiptService'

export default class Receipt extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public patientId: number

  @column()
  public receiptNumber: string

  @column()
  public totalAmount: number

  @column()
  public status: 'PENDING' | 'PAID'

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Patient)
  public patient: BelongsTo<typeof Patient>

  @hasMany(() => ReceiptService)
  public receiptServices: HasMany<typeof ReceiptService>
}
```

---

#### **6. ReceiptServices**
- **Migration**: `database/migrations/xxxx_receipt_services.ts`  
```typescript
import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ReceiptServices extends BaseSchema {
  protected tableName = 'receipt_services'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('receipt_id').unsigned().references('id').inTable('receipts').onDelete('CASCADE')
      table.integer('service_id').unsigned().references('id').inTable('services').onDelete('CASCADE')
      table.integer('quantity').defaultTo(1)
      table.decimal('price_at_time_of_service', 10, 2).notNullable()
      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

- **Model**: `app/Models/ReceiptService.ts`  
```typescript
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Receipt from './Receipt'
import Service from './Service'

export default class ReceiptService extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public receiptId: number

  @column()
  public serviceId: number

  @column()
  public quantity: number

  @column()
  public priceAtTimeOfService: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Receipt)
  public receipt: BelongsTo<typeof Receipt>

  @belongsTo(() => Service)
  public service: BelongsTo<typeof Service>
}
```

---

### Summary
This schema and AdonisJS implementation cover all the core features of the **StaffHUB** application. You can now proceed with implementing the controllers and routes to handle the business logic. Let me know if you need further assistance!