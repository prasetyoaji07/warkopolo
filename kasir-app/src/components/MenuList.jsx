import { useState, useEffect } from "react";
import MenuForm from "./MenuForm";

const API = "http://localhost:5000";

function MenuList() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);

  async function loadProducts() {
    try {
      const res = await fetch(`${API}/products`);
      if (!res.ok) throw new Error(`Server membalas ${res.status}`);
      setProducts(await res.json());
      setError("");
    } catch (err) {
      setError("Gagal mengambil menu: " + err.message);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleDelete(p) {
    if (!window.confirm(`Hapus "${p.nama}"?`)) return;
    try {
      const res = await fetch(`${API}/products/${p.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Server membalas ${res.status}`);
      loadProducts();
    } catch (err) {
      setError("Gagal menghapus: " + err.message);
    }
  }

  return (
    <div>
      <MenuForm
        editing={editing}
        onSaved={() => {
          setEditing(null);
          loadProducts();
        }}
        onCancel={() => setEditing(null)}
      />

      <h2>Daftar Menu</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama</th>
            <th>Harga</th>
            <th>Kategori</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.nama}</td>
              <td>Rp{p.harga.toLocaleString("id-ID")}</td>
              <td>{p.kategori}</td>
              <td>
                <button onClick={() => setEditing(p)}>Edit</button>{" "}
                <button onClick={() => handleDelete(p)}>Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MenuList;