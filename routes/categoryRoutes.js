const express = require("express");
const pool = require("../utils/mysql");
const router = express.Router();

router.get("/", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM categories");
  res.json(rows);
});

module.exports = router;
