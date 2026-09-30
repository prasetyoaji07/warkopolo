const express = require("express");
const cors = require("cors");
require("dotenv").config();
const productsRouter = require("./routes/products");
const tablesRouter = require("./routes/tables");
const ordersRouter = require("./routes/orders");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server Warkopolo jalan!");
});

app.use("/products", productsRouter);
app.use("/tables", tablesRouter);
app.use("/orders", ordersRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});