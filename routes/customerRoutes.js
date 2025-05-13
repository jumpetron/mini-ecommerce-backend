const express = require('express')
const pool = require('../utils/mysql')
const authenticateToken = require('../middleware/authMiddleware')
const router = express.Router()

router.get('/', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM customers')
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to fetch customers.' })
  }
})

router.post('/', authenticateToken, async (req, res) => {
  const { name, email } = req.body

  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required.' })
  }

  try {
    await pool.query('INSERT INTO customers (name, email) VALUES (?, ?)', [
      name,
      email
    ])
    res.status(201).json({ message: 'Customer added successfully.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to add customer.' })
  }
})

module.exports = router
