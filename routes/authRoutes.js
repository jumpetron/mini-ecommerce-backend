const express = require('express')
const pool = require('../utils/mysql')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const router = express.Router()

const JWT_SECRET = 'your_jwt_secret'

router.post('/login', async (req, res) => {
  const { username, password } = req.body

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [
      username
    ])
    const user = rows[0]

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '1h' }
    )

    res.json({ token })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

module.exports = router
