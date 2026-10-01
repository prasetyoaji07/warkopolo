const express = require("express");
const cors = require("cors");
require("dotenv").config();

const productsRouter = require("./routes/products");
const ordersRouter = require("./routes/orders");
const tablesRouter = require("./routes/tables");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server Warkopolo jalan!");
});

app.get("/cek-db", async (req, res) => {
  const db = require("./db");
  const [[a]] = await db.query("SELECT DATABASE() AS dipakai");
  const [b] = await db.query("SHOW COLUMNS FROM orders LIKE 'status'");
  res.json({ database: a.dipakai, kolom: b[0].Type });
});

app.use("/products", productsRouter);
app.use("/orders", ordersRouter);
app.use("/tables", tablesRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});