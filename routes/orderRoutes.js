const express = require("express");
const pool = require("../utils/mysql");
const router = express.Router();

router.post("/cart", (req, res) => {
  const { productId, quantity } = req.body;
  if (!req.session.cart) req.session.cart = [];
  req.session.cart.push({ productId, quantity });
  res.json({ cart: req.session.cart });
});

router.post("/checkout", async (req, res) => {
  const { customerId } = req.body;
  const cart = req.session.cart || [];
  if (cart.length === 0) return res.status(400).json({ message: "Cart is empty" });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [orderResult] = await conn.query("INSERT INTO orders (customer_id) VALUES (?)", [customerId]);
    const orderId = orderResult.insertId;

    for (let item of cart) {
      await conn.query("INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)", [orderId, item.productId, item.quantity]);
    }
    await conn.commit();
    req.session.cart = [];
    res.json({ message: "Order placed", orderId });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: "Checkout failed", error: err });
  } finally {
    conn.release();
  }
});

module.exports = router;
