import { useState, useEffect } from "react";

const KATEGORI = ["cocktail", "mocktail", "snack", "food", "coffee", "dessert"];
const KOSONG = { nama: "", harga: "", kategori: "food", gambar: "" };

function MenuForm({ editing, onSaved, onCancel }) {
  const [form, setForm] = useState(KOSONG);
  const [error, setError] = useState("");

  // Saat tombol Edit ditekan, isi form dengan data menu itu
  useEffect(() => {
    setForm(editing ? { ...KOSONG, ...editing, gambar: editing.gambar || "" } : KOSONG);
    setError("");
  }, [editing]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const url = editing
      ? `http://localhost:5000/products/${editing.id}`
      : "http://localhost:5000/products";

    try {
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: form.nama,
          harga: Number(form.harga),
          kategori: form.kategori,
          gambar: form.gambar,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `Server membalas ${res.status}`);
      }
      setForm(KOSONG);
      setError("");
      onSaved();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
      <h2>{editing ? `Edit menu #${editing.id}` : "Tambah menu"}</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <input name="nama" placeholder="Nama menu" value={form.nama} onChange={handleChange} required />{" "}
      <input name="harga" type="number" placeholder="Harga" value={form.harga} onChange={handleChange} required />{" "}
      <select name="kategori" value={form.kategori} onChange={handleChange}>
        {KATEGORI.map((k) => (
          <option key={k} value={k}>{k}</option>
        ))}
      </select>{" "}
      <input name="gambar" placeholder="nama_file.jpg (opsional)" value={form.gambar} onChange={handleChange} />{" "}

      <button type="submit">{editing ? "Simpan perubahan" : "Tambah"}</button>
      {editing && <button type="button" onClick={onCancel}>Batal</button>}
    </form>
  );
}

export default MenuForm;