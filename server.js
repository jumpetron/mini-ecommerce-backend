const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const authRoutes = require('./routes/authRoutes')
const productRoutes = require('./routes/productRoutes')
const categoryRoutes = require('./routes/categoryRoutes')
const customerRoutes = require('./routes/customerRoutes')
const orderRoutes = require('./routes/orderRoutes')
const { createTables } = require('./utils/dbSetup')

const app = express()
const port = 3000
const JWT_SECRET =
  '5b33bfd07d55e0f85ad97ef996df59784676f9c265e7d3f2b9d45302e1c4176f4900740e1591130c2e3a3eafd28e0512e9213ecfe53a1dd8f68d34edd6448eb1c1d2a4113bf73d465f266a471d34963f00651c244d02787b825ebf0bf6a4a3a9cde8ccfa7486e68ce67d99c4f24d98dcf67d5259ba548a8402f4b4e4253a156fce6952ea748a68f34c5ed978af7ef9d07b3da745cb41c13116deff18b1041cbb28724609df7cc07037e63a7e8426d74a246a36b9ba382bb10083dcc723e8856696281147535161a0deeedcf683ab54d4c8562a6ca15b1fb37360810b8e53c39ad778850a02c51abc782007d77cb658f2a20ee82111b58923d2253aa3258466a6'

app.use(
  cors({
    origin: 'https://mini-ecommerce-frontend.netlify.app',
    credentials: true
  })
)

app.use(bodyParser.json())

app.use(
  session({ secret: 'secret-key', resave: false, saveUninitialized: true })
)

createTables()

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]
  if (!token) return res.status(403).send('Token is required')

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).send('Invalid token')
    req.user = user
    next()
  })
}

app.use('/', authRoutes)
app.use('/products', productRoutes)
app.use('/categories', categoryRoutes)
app.use('/customers', verifyToken, customerRoutes)
app.use('/', orderRoutes)

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
