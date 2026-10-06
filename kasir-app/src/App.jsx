import { useState } from "react";
import MenuList from "./components/MenuList";
import OrderList from "./components/OrderList";
import BookingList from "./components/BookingList";
import TableStatus from "./components/TableStatus";

const TABS = [
  { key: "pesanan", label: "Pesanan" },
  { key: "booking", label: "Booking" },
  { key: "menu", label: "Kelola menu" },
];

function App() {
  const [tab, setTab] = useState("pesanan");

  return (
    <>
      <header className="topbar">
        <h1>Kasir Warkopolo</h1>
        <nav className="tabs">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`tab ${tab === t.key ? "on" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="page">
        {tab === "pesanan" && (
          <div className="layout">
            <OrderList />
            <aside>
              <TableStatus />
            </aside>
          </div>
        )}

        {tab === "booking" && (
          <div className="layout">
            <BookingList />
            <aside>
              <TableStatus />
            </aside>
          </div>
        )}

        {tab === "menu" && (
          <div className="menu-page">
            <MenuList />
          </div>
        )}
      </main>
    </>
  );
}

export default App;