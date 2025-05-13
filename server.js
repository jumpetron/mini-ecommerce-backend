require('dotenv').config()
const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

// routes and utils
const authRoutes = require('./routes/authRoutes')
const productRoutes = require('./routes/productRoutes')
const categoryRoutes = require('./routes/categoryRoutes')
const customerRoutes = require('./routes/customerRoutes')
const orderRoutes = require('./routes/orderRoutes')
const { createTables } = require('./utils/dbSetup')

const app = express()
const port = 3000

const JWT_SECRET = process.env.JWT_SECRET

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
