import { rp } from "../data/menu";

// Bar keranjang di bawah layar (hanya tampil di HP, dan hanya jika ada isi)
export function CartBar({ count, total }) {
  if (count === 0) return null;

  return (
    <div className="mn-bar" role="status">
      <span>{count} item</span>
      <span>{rp(total)} ›</span>
    </div>
  );
}

// Panel "Pesanan kamu" di sisi kanan (hanya tampil di desktop)
function CartPanel({ items, total, onRemove }) {
  return (
    <aside className="mn-cart" aria-label="Pesanan kamu">
      <h2 className="mn-cart-title">Pesanan kamu</h2>

      {items.length === 0 ? (
        <p className="mn-cart-empty">
          Belum ada pesanan. Tekan tombol + pada menu untuk menambah.
        </p>
      ) : (
        items.map((it) => (
          <div className="mn-row" key={it.cartId}>
            <span className="mn-row-name">
              {it.name} x{it.qty}
            </span>
            <span>{(it.price * it.qty).toLocaleString("id-ID")}</span>
            <button
              type="button"
              aria-label={`Kurangi ${it.name}`}
              onClick={() => onRemove(it.cartId)}
            >
              −
            </button>
          </div>
        ))
      )}

      <div className="mn-total">
        <span>Total</span>
        <span>{rp(total)}</span>
      </div>

      {/* Belum ada aksinya. Nanti dihubungkan ke halaman checkout. */}
      <button type="button" className="mn-checkout">
        Lanjut pesan
      </button>
    </aside>
  );
}

export default CartPanel;