// In productRoutes.js
const express = require('express')
const pool = require('../utils/mysql')
const router = express.Router()

router.get('/', async (req, res) => {
  const { category, price_min, price_max, rating, search } = req.query

  let sql = `SELECT p.*, c.name AS category FROM products p JOIN categories c ON p.category_id = c.id WHERE 1=1`
  const params = []

  if (category) {
    sql += ' AND c.name = ?'
    params.push(category)
  }
  if (price_min) {
    sql += ' AND p.price >= ?'
    params.push(price_min)
  }
  if (price_max) {
    sql += ' AND p.price <= ?'
    params.push(price_max)
  }
  if (rating) {
    sql += ' AND p.rating >= ?'
    params.push(rating)
  }
  if (search) {
    sql += ' AND p.name LIKE ?'
    params.push(`%${search}%`)
  }

  try {
    const [rows] = await pool.query(sql, params)
    res.json(rows)
  } catch (error) {
    console.error('Error fetching products:', error)
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

router.get('/:id', async (req, res) => {
  const { id } = req.params
  console.log(id)
  try {
    const [rows] = await pool.query(
      'SELECT p.*, c.name AS category FROM products p JOIN categories c ON p.category_id = c.id WHERE p.id = ?',
      [id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' })
    }

    res.json(rows[0])
  } catch (error) {
    console.error('Error fetching product:', error)
    res.status(500).json({ error: 'Failed to fetch product' })
  }
})

module.exports = router
