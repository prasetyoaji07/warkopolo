import { useState } from "react";
import MenuList from "./components/MenuList";
import OrderList from "./components/OrderList";
import BookingList from "./components/BookingList";

function App() {
  const [tab, setTab] = useState("pesanan");

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>Kasir Warkopolo</h1>

      <div style={{ marginBottom: 16 }}>
        <button
          onClick={() => setTab("pesanan")}
          style={{ fontWeight: tab === "pesanan" ? "bold" : "normal" }}
        >
          Pesanan
        </button>{" "}
        <button
          onClick={() => setTab("booking")}
          style={{ fontWeight: tab === "booking" ? "bold" : "normal" }}
        >
          Booking
        </button>{" "}
        <button
          onClick={() => setTab("menu")}
          style={{ fontWeight: tab === "menu" ? "bold" : "normal" }}
        >
          Kelola Menu
        </button>
      </div>

      {tab === "pesanan" && <OrderList />}
      {tab === "booking" && <BookingList />}
      {tab === "menu" && <MenuList />}
    </div>
  );
}

export default App;