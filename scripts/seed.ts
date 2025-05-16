import { hash } from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../db'
import { tables, admins, catalogs, products } from '../db/schema'

async function main() {
  console.log('Starting database seeding...')

  // Clean up existing data
  await db.delete(tables)
  await db.delete(admins)
  await db.delete(catalogs)
  await db.delete(products)

  // Create demo users
  const demoPassword = await hash('password123', 10)

  const adminUserId = uuidv4()

  const adminUser = await db
    .insert(admins)
    .values({
      id: adminUserId,
      username: 'admin',
      password: demoPassword,
    })
    .returning()
    .then((rows) => rows[0])

  console.log('Created demo admins:')
  console.log(`- Admin: ${adminUser.username} (password: password123)`)

  const table = await db
    .insert(tables)
    .values({
      adminId: adminUser.id,
    })
    .returning()
    .then((rows) => rows[0])

  console.log('Created demo tables:')
  console.log(`- Table Number: ${table.tableNumber}`)

  const product1 = await db
    .insert(products)
    .values({
      name: 'Product 1',
      sku: 'P1',
      description: 'test description',
      price: 10000,
      useStock: false,
      stock: 0,
      addons: [],
      adminId: adminUser.id,
    })
    .returning()
    .then((rows) => rows[0])
  const product2 = await db
    .insert(products)
    .values({
      name: 'Product 2',
      sku: 'P2',
      description: 'test description 2',
      price: 15000,
      useStock: false,
      stock: 0,
      addons: [],
      adminId: adminUser.id,
    })
    .returning()
    .then((rows) => rows[0])

  console.log('Created demo products:')
  console.log(`- Product: ${product1.name}`)
  console.log(`- Product: ${product2.name}`)

  const catalog = await db
    .insert(catalogs)
    .values({
      name: 'Beverage',
      categoryList: [
        {
          name: 'COFFEE ESSENTIALS 1',
          productList: [product1.id, product2.id],
        },
      ],
      adminId: adminUser.id,
    })
    .returning()
    .then((rows) => rows[0])

  console.log('Created demo catalog:')
  console.log(`- Catalog: ${catalog.name}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    console.log('Seed script finished')
  })
