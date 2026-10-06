import { useState, useEffect } from "react";
import { API } from "../config";

function TableStatus() {
  const [tables, setTables] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API}/tables`);
        if (res.ok) setTables(await res.json());
      } catch {
        // backend tidak terjangkau, coba lagi di putaran berikutnya
      }
    }
    load();
    const timer = setInterval(load, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section>
      <h2 className="section-title">Status meja</h2>
      <div className="tables">
        {tables.map((t) => (
          <div key={t.id} className={`table-box ${t.status}`} title={t.nama_meja}>
            {t.id}
          </div>
        ))}
      </div>
      <p className="muted" style={{ marginTop: 8 }}>
        Hijau kosong, merah terisi
      </p>
    </section>
  );
}

export default TableStatus;