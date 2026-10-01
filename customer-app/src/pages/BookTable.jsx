import { useEffect, useMemo, useState } from "react";
import { API } from "../config";

/* ===== Palet ===== */
const BLUE = "#0B5AB4";
const BLUE_DEEP = "#004CA0";
const INK = "#0E2A4D";
const MUTED = "#5B6B82";
const PAPER = "#E8E5E3";
const GOLD = "#E8A93A";
const LINE = "#DCE5F1";
const SEAT_FREE = "#BCD3EE";
const BOOKED = "#CFCBC7";
const BOOKED_SEAT = "#BDB8B3";

/* ===== Data ===== */
const DAY = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const DAY_FULL = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const MONTH = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

// Jam operasional: diasumsikan 10:00–21:00 (sama dengan batas TIMES lama).
// Kalau beda, ubah dua angka ini saja.
const OPEN_HOUR = 10;
const CLOSE_HOUR = 21;
const HOURS = Array.from(
  { length: CLOSE_HOUR - OPEN_HOUR + 1 },
  (_, i) => `${String(OPEN_HOUR + i).padStart(2, "0")}:00`
);

const TABLES = [
  { id: 1, cap: 2, shape: "round", x: 80, y: 110 },
  { id: 2, cap: 4, shape: "rect", x: 230, y: 110 },
  { id: 3, cap: 6, shape: "rect", x: 420, y: 110 },
  { id: 4, cap: 4, shape: "rect", x: 100, y: 220 },
  { id: 5, cap: 6, shape: "rect", x: 280, y: 220 },
  { id: 6, cap: 2, shape: "round", x: 450, y: 220 },
  { id: 7, cap: 2, shape: "round", x: 80, y: 330 },
  { id: 8, cap: 4, shape: "rect", x: 220, y: 330 },
  { id: 9, cap: 4, shape: "rect", x: 360, y: 330 },
  { id: 10, cap: 2, shape: "round", x: 490, y: 330 },
];

const pad2 = (n) => String(n).padStart(2, "0");

function buildDates() {
  const base = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
    return {
      short: i === 0 ? "Hari ini" : i === 1 ? "Besok" : DAY[d.getDay()],
      num: d.getDate(),
      full: `${DAY_FULL[d.getDay()]}, ${d.getDate()} ${MONTH[d.getMonth()]}`,
      iso: `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`,
    };
  });
}

function getGeometry(t) {
  const { x, y, cap, shape } = t;

  if (shape === "round") {
    return {
      seats: [
        { x: x - 44, y: y - 13, w: 12, h: 26 },
        { x: x + 32, y: y - 13, w: 12, h: 26 },
      ],
      box: { x: x - 50, y: y - 34, w: 100, h: 68 },
    };
  }

  const tw = cap === 4 ? 84 : 132;
  const th = 52;
  const perSide = cap / 2;
  const gap = tw / perSide;
  const seats = [];
  for (let i = 0; i < perSide; i++) {
    const cx = x - tw / 2 + gap * (i + 0.5);
    seats.push({ x: cx - 13, y: y - th / 2 - 16, w: 26, h: 12 });
    seats.push({ x: cx - 13, y: y + th / 2 + 4, w: 26, h: 12 });
  }
  return {
    tw,
    th,
    seats,
    box: { x: x - tw / 2 - 6, y: y - th / 2 - 22, w: tw + 12, h: th + 44 },
  };
}

function useIsMobile(breakpoint = 720) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpoint);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);
  return isMobile;
}

/* ===== Style helper ===== */
const chip = (active) => ({
  border: `1.5px solid ${active ? BLUE : LINE}`,
  background: active ? BLUE : "#fff",
  color: active ? "#fff" : INK,
  borderRadius: 12,
  cursor: "pointer",
  transition: "background 0.15s, border-color 0.15s",
});

const subhead = { fontSize: 14, margin: "0 0 10px", color: INK, fontWeight: 700 };

const input = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 12px",
  border: `1.5px solid ${LINE}`,
  borderRadius: 12,
  fontSize: 14,
  color: INK,
  outline: "none",
  marginBottom: 10,
};

/* ===== Komponen ===== */
function BookTable() {
  const isMobile = useIsMobile();
  const dates = useMemo(buildDates, []);
  const [dateIdx, setDateIdx] = useState(0);

  // Jam: mode "jam genap" (chip HOURS) atau mode "custom" (input bebas)
  const [selectedTime, setSelectedTime] = useState(
    HOURS.includes("18:00") ? "18:00" : HOURS[0]
  );
  const [customMode, setCustomMode] = useState(false);
  const [customTime, setCustomTime] = useState("");

  const activeTime = customMode ? customTime : selectedTime;
  const timeValid = /^\d{2}:\d{2}$/.test(activeTime);

  const [guests, setGuests] = useState(2);
  const [selectedId, setSelectedId] = useState(null);
  const [nama, setNama] = useState("");
  const [noHp, setNoHp] = useState("");
  const [confirmed, setConfirmed] = useState(null); // { kode, mejaId, cap }
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [focusId, setFocusId] = useState(null);

  // Meja yang sudah dipesan pada tanggal + jam terpilih (dari backend)
  const [bookedIds, setBookedIds] = useState([]);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    if (!timeValid) {
      setBookedIds([]);
      return;
    }
    let batal = false;
    async function loadKetersediaan() {
      try {
        const res = await fetch(
          `${API}/bookings/ketersediaan?tanggal=${dates[dateIdx].iso}&jam=${activeTime}`
        );
        if (!res.ok) throw new Error(`Server membalas ${res.status}`);
        const data = await res.json();
        if (!batal) setBookedIds(data);
      } catch (err) {
        console.error("Gagal memuat ketersediaan meja:", err);
      }
    }
    loadKetersediaan();
    const interval = setInterval(loadKetersediaan, 5000);
    return () => {
      batal = true;
      clearInterval(interval);
    };
  }, [dateIdx, activeTime, timeValid, dates, refresh]);

  const getStatus = (t) => {
    if (bookedIds.includes(t.id)) return "booked";
    if (t.cap < guests) return "small";
    if (t.id === selectedId) return "selected";
    return "free";
  };

  const selected = TABLES.find((t) => t.id === selectedId && getStatus(t) === "selected");
  const freeCount = TABLES.filter((t) => ["free", "selected"].includes(getStatus(t))).length;

  const update = (setter) => (value) => {
    setter(value);
    setConfirmed(null);
    setError("");
  };

  function selectHour(tm) {
    setCustomMode(false);
    setSelectedTime(tm);
    setConfirmed(null);
    setError("");
  }

  function selectCustom() {
    setCustomMode(true);
    setConfirmed(null);
    setError("");
  }

  function handleCustomTimeChange(e) {
    setCustomTime(e.target.value);
    setConfirmed(null);
    setError("");
  }

  const pickTable = (t) => {
    const status = getStatus(t);
    if (status === "booked" || status === "small" || confirmed) return;
    setSelectedId(status === "selected" ? null : t.id);
  };

  const canSubmit = timeValid && selected && nama.trim() && noHp.trim() && !sending;

  async function handleBook() {
    if (!canSubmit) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch(`${API}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meja_id: selected.id,
          nama: nama.trim(),
          no_hp: noHp.trim(),
          jumlah_orang: guests,
          tanggal: dates[dateIdx].iso,
          jam: activeTime,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Server membalas ${res.status}`);
      setConfirmed({ kode: data.kode, mejaId: selected.id, cap: selected.cap });
      setRefresh((n) => n + 1);
    } catch (err) {
      setError(err.message);
      setRefresh((n) => n + 1);
    } finally {
      setSending(false);
    }
  }

  function bookingBaru() {
    setConfirmed(null);
    setSelectedId(null);
    setNama("");
    setNoHp("");
    setError("");
  }

  const cardPad = isMobile ? 16 : 20;

  return (
    <section
      id="book-table"
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: isMobile ? "24px 16px 40px" : "40px 24px 56px",
      }}
    >
      <h2 style={{ fontSize: isMobile ? 26 : 32, margin: 0, color: INK }}>Pesan meja</h2>
      <p style={{ margin: "8px 0 20px", color: MUTED, fontSize: isMobile ? 14 : 15 }}>
        Pilih tanggal, jam, dan jumlah tamu, lalu ketuk meja yang kamu mau.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "minmax(0, 1fr)" : "minmax(0, 1fr) 300px",
          gridTemplateRows: isMobile ? undefined : "auto 1fr",
          gap: isMobile ? 16 : 24,
          alignItems: "start",
        }}
      >
        {/* ===== 1. Tanggal, jam, tamu ===== */}
        <div
          style={{
            order: 1,
            gridColumn: isMobile ? 1 : 2,
            gridRow: isMobile ? "auto" : 1,
            background: "#fff",
            border: `1px solid ${LINE}`,
            borderRadius: 24,
            padding: cardPad,
          }}
        >
          <h4 style={subhead}>Tanggal</h4>
          <div
            style={
              isMobile
                ? { display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6, marginBottom: 14 }
                : { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 20 }
            }
          >
            {dates.map((d, i) => (
              <button
                key={i}
                type="button"
                aria-pressed={dateIdx === i}
                onClick={() => update(setDateIdx)(i)}
                style={{
                  ...chip(dateIdx === i),
                  padding: "8px 0",
                  lineHeight: 1.2,
                  flex: isMobile ? "0 0 64px" : undefined,
                }}
              >
                <span style={{ display: "block", fontSize: 11 }}>{d.short}</span>
                <span style={{ display: "block", fontSize: 17, fontWeight: 800 }}>{d.num}</span>
              </button>
            ))}
          </div>

          <h4 style={subhead}>Jam</h4>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 8,
              marginBottom: customMode ? 10 : isMobile ? 14 : 20,
            }}
          >
            {HOURS.map((tm) => (
              <button
                key={tm}
                type="button"
                aria-pressed={!customMode && selectedTime === tm}
                onClick={() => selectHour(tm)}
                style={{ ...chip(!customMode && selectedTime === tm), padding: "10px 0", fontSize: 14 }}
              >
                {tm}
              </button>
            ))}
            <button
              type="button"
              aria-pressed={customMode}
              onClick={selectCustom}
              style={{ ...chip(customMode), padding: "10px 0", fontSize: 14 }}
            >
              Custom
            </button>
          </div>

          {customMode && (
            <div style={{ marginBottom: isMobile ? 14 : 20 }}>
              <input
                type="time"
                value={customTime}
                onChange={handleCustomTimeChange}
                min={`${pad2(OPEN_HOUR)}:00`}
                max={`${pad2(CLOSE_HOUR)}:00`}
                style={{ ...input, marginBottom: 6 }}
              />
              <p style={{ margin: 0, fontSize: 12, color: MUTED }}>
                Jam operasional {pad2(OPEN_HOUR)}.00–{pad2(CLOSE_HOUR)}.00
              </p>
            </div>
          )}

          <h4 style={subhead}>Jumlah tamu</h4>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button
              type="button"
              aria-label="Kurangi tamu"
              disabled={guests <= 1}
              onClick={() => update(setGuests)(guests - 1)}
              style={{ ...chip(false), width: 44, height: 44, fontSize: 22, opacity: guests <= 1 ? 0.4 : 1 }}
            >
              −
            </button>
            <span style={{ fontSize: 20, fontWeight: 800, minWidth: 28, textAlign: "center", color: INK }}>
              {guests}
            </span>
            <button
              type="button"
              aria-label="Tambah tamu"
              disabled={guests >= 6}
              onClick={() => update(setGuests)(guests + 1)}
              style={{ ...chip(false), width: 44, height: 44, fontSize: 22, opacity: guests >= 6 ? 0.4 : 1 }}
            >
              +
            </button>
          </div>
        </div>

        {/* ===== 2. Denah meja ===== */}
        <div
          style={{
            order: 2,
            gridColumn: 1,
            gridRow: isMobile ? "auto" : "1 / span 2",
            background: PAPER,
            borderRadius: 24,
            padding: isMobile ? 12 : 20,
          }}
        >
          <p style={{ margin: "0 0 8px", padding: isMobile ? "4px 4px 0" : 0, fontSize: 14, color: INK }}>
            <strong style={{ color: BLUE }}>{freeCount} dari {TABLES.length} meja</strong> masih
            tersedia untuk {guests} tamu
          </p>

          <svg viewBox="24 8 512 432" width="100%" role="group" aria-label="Denah meja" style={{ display: "block" }}>
            <defs>
              <pattern id="booked-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <rect width="8" height="8" fill={BOOKED} />
                <line x1="0" y1="0" x2="0" y2="8" stroke="#B5B0AB" strokeWidth="2" />
              </pattern>
            </defs>

            <rect x="110" y="18" width="340" height="38" rx="19" fill={BLUE_DEEP} />
            <text x="280" y="43" textAnchor="middle" fill="#fff" fontSize="15" fontWeight="700">
              Kasir & bar
            </text>

            <line x1="28" y1="420" x2="220" y2="420" stroke={INK} strokeWidth="3" strokeLinecap="round" />
            <line x1="340" y1="420" x2="532" y2="420" stroke={INK} strokeWidth="3" strokeLinecap="round" />
            <text x="280" y="425" textAnchor="middle" fill={INK} fontSize="14" fontWeight="600">
              Pintu masuk
            </text>

            {TABLES.map((t) => {
              const status = getStatus(t);
              const geo = getGeometry(t);
              const disabled = status === "booked" || status === "small" || !!confirmed;

              const tableFill =
                status === "selected" ? BLUE : status === "booked" ? "url(#booked-hatch)" : "#fff";
              const tableStroke = status === "booked" ? "#B5B0AB" : BLUE;
              const seatFill =
                status === "selected" ? GOLD : status === "booked" ? BOOKED_SEAT : SEAT_FREE;
              const textFill = status === "selected" ? "#fff" : status === "booked" ? "#6B655F" : INK;
              const statusLabel = {
                free: "tersedia",
                selected: "dipilih",
                booked: "sudah dipesan",
                small: "terlalu kecil",
              }[status];

              return (
                <g
                  key={t.id}
                  role="button"
                  tabIndex={disabled ? -1 : 0}
                  aria-pressed={status === "selected"}
                  aria-disabled={disabled}
                  aria-label={`Meja ${t.id}, ${t.cap} kursi, ${statusLabel}`}
                  onClick={() => pickTable(t)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      pickTable(t);
                    }
                  }}
                  onFocus={() => setFocusId(t.id)}
                  onBlur={() => setFocusId(null)}
                  style={{
                    cursor: disabled ? "not-allowed" : "pointer",
                    opacity: status === "small" ? 0.35 : 1,
                    outline: "none",
                  }}
                >
                  <rect
                    x={geo.box.x}
                    y={geo.box.y}
                    width={geo.box.w}
                    height={geo.box.h}
                    rx="14"
                    fill="transparent"
                    stroke={focusId === t.id ? BLUE : "none"}
                    strokeWidth="2"
                    strokeDasharray="5 4"
                  />

                  {geo.seats.map((s, i) => (
                    <rect
                      key={i}
                      x={s.x}
                      y={s.y}
                      width={s.w}
                      height={s.h}
                      rx="6"
                      fill={seatFill}
                      style={{ transition: "fill 0.15s" }}
                    />
                  ))}

                  {t.shape === "round" ? (
                    <circle
                      cx={t.x}
                      cy={t.y}
                      r="28"
                      fill={tableFill}
                      stroke={tableStroke}
                      strokeWidth="2"
                      style={{ transition: "fill 0.15s" }}
                    />
                  ) : (
                    <rect
                      x={t.x - geo.tw / 2}
                      y={t.y - geo.th / 2}
                      width={geo.tw}
                      height={geo.th}
                      rx="12"
                      fill={tableFill}
                      stroke={tableStroke}
                      strokeWidth="2"
                      style={{ transition: "fill 0.15s" }}
                    />
                  )}

                  <text x={t.x} y={t.y - 1} textAnchor="middle" fill={textFill} fontSize="19" fontWeight="800">
                    {t.id}
                  </text>
                  <text x={t.x} y={t.y + 15} textAnchor="middle" fill={textFill} fontSize="12" fontWeight="600">
                    {t.cap} kursi
                  </text>
                </g>
              );
            })}
          </svg>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, auto)",
              justifyContent: "space-between",
              gap: "8px 16px",
              marginTop: 10,
              padding: isMobile ? "0 4px 4px" : 0,
              fontSize: 13,
              color: INK,
            }}
          >
            <Legend swatch={{ background: "#fff", border: `2px solid ${BLUE}` }} label="Tersedia" />
            <Legend swatch={{ background: BLUE, border: `2px solid ${BLUE}` }} label="Dipilih" />
            <Legend swatch={{ background: BOOKED, border: "2px solid #B5B0AB" }} label="Sudah dipesan" />
            <Legend
              swatch={{ background: "#fff", border: `2px solid ${BLUE}`, opacity: 0.35 }}
              label={`Kurang dari ${guests} kursi`}
            />
          </div>
        </div>

        {/* ===== 3. Data pemesan & tombol pesan ===== */}
        <div
          style={{
            order: 3,
            gridColumn: isMobile ? 1 : 2,
            gridRow: isMobile ? "auto" : 2,
            background: "#fff",
            border: `1px solid ${LINE}`,
            borderRadius: 24,
            padding: cardPad,
          }}
        >
          <div style={{ marginBottom: 12 }}>
            <Row label="Tanggal" value={dates[dateIdx].full} />
            <Row label="Jam" value={timeValid ? activeTime : "Belum dipilih"} muted={!timeValid} />
            <Row label="Tamu" value={`${guests} orang`} />
            <Row
              label="Meja"
              value={selected ? `Meja ${selected.id}, ${selected.cap} kursi` : "Belum dipilih"}
              muted={!selected}
            />
          </div>

          {confirmed ? (
            <div>
              <div
                style={{
                  background: "#EAF2FC",
                  border: `1.5px solid ${BLUE}`,
                  borderRadius: 14,
                  padding: "12px 14px",
                  color: INK,
                  fontSize: 14,
                }}
                role="status"
              >
                <strong style={{ color: BLUE }}>Meja {confirmed.mejaId} sudah dipesan.</strong>
                <br />
                Kode booking: <strong>{confirmed.kode}</strong>
              </div>
              <button
                type="button"
                onClick={bookingBaru}
                style={{ ...chip(false), width: "100%", marginTop: 10, padding: "12px 0", fontSize: 15 }}
              >
                Pesan meja lain
              </button>
            </div>
          ) : (
            <>
              <input
                style={input}
                placeholder="Nama pemesan"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
              />
              <input
                style={input}
                placeholder="Nomor HP"
                inputMode="tel"
                value={noHp}
                onChange={(e) => setNoHp(e.target.value)}
              />
              {error && (
                <p style={{ margin: "0 0 10px", color: "#C0392B", fontSize: 13 }} role="alert">
                  {error}
                </p>
              )}
              <button
                type="button"
                disabled={!canSubmit}
                onClick={handleBook}
                style={{
                  width: "100%",
                  padding: "14px 0",
                  border: "none",
                  borderRadius: 14,
                  fontSize: 16,
                  fontWeight: 700,
                  background: canSubmit ? BLUE : "#C9D3E0",
                  color: "#fff",
                  cursor: canSubmit ? "pointer" : "not-allowed",
                  transition: "background 0.15s",
                }}
              >
                {sending
                  ? "Mengirim..."
                  : !timeValid
                  ? "Pilih jam dulu"
                  : !selected
                  ? "Pilih meja dulu"
                  : !nama.trim() || !noHp.trim()
                  ? "Isi nama dan nomor HP"
                  : "Pesan meja"}
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function Legend({ swatch, label }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <span style={{ width: 18, height: 18, borderRadius: 6, display: "inline-block", flexShrink: 0, ...swatch }} />
      {label}
    </span>
  );
}

function Row({ label, value, muted }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 14, margin: "0 0 8px" }}>
      <span style={{ color: MUTED }}>{label}</span>
      <span style={{ color: muted ? "#8A97AB" : INK, fontWeight: 700, textAlign: "right" }}>{value}</span>
    </div>
  );
}

export default BookTable;