const jwt = require('jsonwebtoken')
const JWT_SECRET = 'your_jwt_secret'

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) return res.status(401).json({ message: 'Token is required' })

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err)
      return res.status(403).json({ message: 'Forbidden: Invalid token' })

    req.user = user
    next()
  })
}

module.exports = authenticateToken
