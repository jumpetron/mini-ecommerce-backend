const pool = require('./mysql')
const data = require('../data')

const createTables = async () => {
  const conn = await pool.getConnection()

  try {
    // Create tables if they do not exist
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE,
        password VARCHAR(255)
      )
    `)

    await conn.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE,
        street VARCHAR(255),
        city VARCHAR(255),
        state VARCHAR(255),
        zip VARCHAR(20)
      )
    `)

    await conn.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255)
      )
    `)

    await conn.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        price DECIMAL(10,2),
        rating FLOAT,
        category_id INT,
        image VARCHAR(255),  -- Add the image field here
        FOREIGN KEY (category_id) REFERENCES categories(id)
      )
    `)

    await conn.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id)
      )
    `)

    await conn.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT,
        product_id INT,
        quantity INT,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `)

    // Insert categories from data.js
    for (let category of data.categories) {
      await conn.query(`INSERT IGNORE INTO categories (name) VALUES (?)`, [
        category
      ])
    }

    // Insert customers from data.js with shipping address
    for (let customer of data.customers) {
      await conn.query(
        `
        INSERT IGNORE INTO customers (name, email, street, city, state, zip) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          customer.name,
          customer.email,
          customer.shippingAddress.street,
          customer.shippingAddress.city,
          customer.shippingAddress.state,
          customer.shippingAddress.zip
        ]
      )
    }

    // Insert products from data.js with image field
    for (let product of data.products) {
      const [categoryRow] = await conn.query(
        `SELECT id FROM categories WHERE name = ?`,
        [product.category]
      )
      const categoryId = categoryRow.length > 0 ? categoryRow[0].id : null

      if (categoryId) {
        await conn.query(
          `
          INSERT IGNORE INTO products (name, price, rating, category_id, image) 
          VALUES (?, ?, ?, ?, ?)`,
          [
            product.name,
            product.price,
            product.rating,
            categoryId,
            product.image
          ]
        )
      }
    }

    console.log('✅ Database tables and dummy data created successfully.')
  } catch (err) {
    console.error('❌ Error creating tables:', err)
  } finally {
    conn.release()
  }
}

module.exports = { createTables }
