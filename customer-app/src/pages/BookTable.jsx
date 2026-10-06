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
const GREEN = "#18864B";
const GREEN_BG = "#EAF7EF";

/* ===== Data ===== */
const DAY = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

const DAY_FULL = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

const MONTH = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

/* ===== Jam operasional ===== */
const OPEN_HOUR = 10;
const CLOSE_HOUR = 21;

const HOURS = Array.from(
  { length: CLOSE_HOUR - OPEN_HOUR + 1 },
  (_, i) =>
    `${String(OPEN_HOUR + i).padStart(2, "0")}:00`
);

/* ===== Denah meja ===== */
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
    const d = new Date(
      base.getFullYear(),
      base.getMonth(),
      base.getDate() + i
    );

    return {
      short:
        i === 0
          ? "Hari ini"
          : i === 1
          ? "Besok"
          : DAY[d.getDay()],
      num: d.getDate(),
      full: `${DAY_FULL[d.getDay()]}, ${d.getDate()} ${
        MONTH[d.getMonth()]
      }`,
      iso: `${d.getFullYear()}-${pad2(
        d.getMonth() + 1
      )}-${pad2(d.getDate())}`,
    };
  });
}

function getGeometry(t) {
  const { x, y, cap, shape } = t;

  if (shape === "round") {
    return {
      seats: [
        {
          x: x - 44,
          y: y - 13,
          w: 12,
          h: 26,
        },
        {
          x: x + 32,
          y: y - 13,
          w: 12,
          h: 26,
        },
      ],
      box: {
        x: x - 50,
        y: y - 34,
        w: 100,
        h: 68,
      },
    };
  }

  const tw = cap === 4 ? 84 : 132;
  const th = 52;
  const perSide = cap / 2;
  const gap = tw / perSide;
  const seats = [];

  for (let i = 0; i < perSide; i++) {
    const cx =
      x - tw / 2 + gap * (i + 0.5);

    seats.push({
      x: cx - 13,
      y: y - th / 2 - 16,
      w: 26,
      h: 12,
    });

    seats.push({
      x: cx - 13,
      y: y + th / 2 + 4,
      w: 26,
      h: 12,
    });
  }

  return {
    tw,
    th,
    seats,
    box: {
      x: x - tw / 2 - 6,
      y: y - th / 2 - 22,
      w: tw + 12,
      h: th + 44,
    },
  };
}

function useIsMobile(breakpoint = 720) {
  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth < breakpoint
  );

  useEffect(() => {
    const onResize = () =>
      setIsMobile(
        window.innerWidth < breakpoint
      );

    window.addEventListener(
      "resize",
      onResize
    );

    return () =>
      window.removeEventListener(
        "resize",
        onResize
      );
  }, [breakpoint]);

  return isMobile;
}

/* ===== Minimum spending ===== */
function getMinimumBooking(guests) {
  if (guests <= 2) return 200000;
  if (guests <= 4) return 300000;
  return 450000;
}

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

/* ===== Style helper ===== */
const chip = (active) => ({
  border: `1.5px solid ${
    active ? BLUE : LINE
  }`,
  background: active ? BLUE : "#fff",
  color: active ? "#fff" : INK,
  borderRadius: 12,
  cursor: "pointer",
  transition:
    "background 0.15s, border-color 0.15s",
});

const subhead = {
  fontSize: 14,
  margin: "0 0 10px",
  color: INK,
  fontWeight: 700,
};

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

/* =========================================================
   QR DUMMY
   Sama gayanya dengan QR di e-Order (EOrder.jsx), supaya
   kedua pengalaman pembayaran terasa satu produk yang sama.
   ========================================================= */

function QrFake({ size = 200 }) {
  const n = 25;
  let seed = 7;
  const rnd = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const inFinder = (x, y) =>
    (x < 8 && y < 8) || (x >= n - 8 && y < 8) || (x < 8 && y >= n - 8);
  const cells = [];
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (!inFinder(x, y) && rnd() > 0.5) {
        cells.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />);
      }
    }
  }
  const finder = (x, y) => (
    <g key={`f${x}-${y}`}>
      <rect x={x} y={y} width="7" height="7" />
      <rect x={x + 1} y={y + 1} width="5" height="5" fill="#fff" />
      <rect x={x + 2} y={y + 2} width="3" height="3" />
    </g>
  );
  return (
    <svg width={size} height={size} viewBox={`-1 -1 ${n + 2} ${n + 2}`} fill={INK} aria-hidden="true">
      <rect x="-1" y="-1" width={n + 2} height={n + 2} fill="#fff" />
      {cells}
      {finder(0, 0)}
      {finder(n - 7, 0)}
      {finder(0, n - 7)}
    </svg>
  );
}

/* ===== Komponen utama ===== */
function BookTable() {
  const isMobile = useIsMobile();
  const dates = useMemo(buildDates, []);

  const [dateIdx, setDateIdx] =
    useState(0);

  const [selectedTime, setSelectedTime] =
    useState(
      HOURS.includes("18:00")
        ? "18:00"
        : HOURS[0]
    );

  const [customMode, setCustomMode] =
    useState(false);

  const [customTime, setCustomTime] =
    useState("");

  const activeTime = customMode
    ? customTime
    : selectedTime;

  const timeValid =
    /^\d{2}:\d{2}$/.test(activeTime);

  const [guests, setGuests] = useState(2);

  const [selectedId, setSelectedId] =
    useState(null);

  const [nama, setNama] = useState("");

  const [noHp, setNoHp] = useState("");

  const [confirmed, setConfirmed] =
    useState(null);

  const [sending, setSending] =
    useState(false);

  const [error, setError] =
    useState("");

  const [focusId, setFocusId] =
    useState(null);

  const [bookedIds, setBookedIds] =
    useState([]);

  const [refresh, setRefresh] =
    useState(0);

  // step "qr": paid = sudah "discan" (tampil centang hijau),
  // countdown = hitung mundur detik yang TERLIHAT ke pengguna
  // sebelum otomatis dianggap terbayar.
  const [paid, setPaid] = useState(false);
  const [countdown, setCountdown] = useState(3);

  /*
   * form       = pilih meja + data
   * review     = review booking
   * qr         = QR dummy + simulasi scan -> otomatis booking
   * success    = booking berhasil
   */
  const [step, setStep] =
    useState("form");

  /* ===== Minimum booking ===== */

  const minimumBooking =
    getMinimumBooking(guests);

  /* ===== Cek ketersediaan meja ===== */

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

        if (!res.ok) {
          throw new Error(
            `Server membalas ${res.status}`
          );
        }

        const data = await res.json();

        if (!batal) {
          setBookedIds(data);
        }
      } catch (err) {
        console.error(
          "Gagal memuat ketersediaan meja:",
          err
        );
      }
    }

    loadKetersediaan();

    const interval = setInterval(
      loadKetersediaan,
      5000
    );

    return () => {
      batal = true;
      clearInterval(interval);
    };
  }, [
    dateIdx,
    activeTime,
    timeValid,
    dates,
    refresh,
  ]);

  /* =========================================================
     SIMULASI SCAN QR -> BOOKING OTOMATIS
     Angka hitung mundur BENAR-BENAR ditampilkan ke pengguna
     (bukan cuma teks "menunggu" tanpa angka), lalu berganti
     ke centang hijau "Pembayaran berhasil", baru booking
     dikirim ke backend. Pola waktunya mengikuti QRIS di
     EOrder.jsx.
     ========================================================= */

  useEffect(() => {
    if (step !== "qr") return;

    setPaid(false);
    setCountdown(3);

    const tick = setInterval(() => {
      setCountdown((n) => {
        if (n <= 1) {
          clearInterval(tick);
          return 0;
        }
        return n - 1;
      });
    }, 1000);

    const t1 = setTimeout(() => setPaid(true), 3000);
    const t2 = setTimeout(() => handleBook(), 4500);

    return () => {
      clearInterval(tick);
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  /* ===== Status meja ===== */

  const getStatus = (t) => {
    if (bookedIds.includes(t.id))
      return "booked";

    if (t.cap < guests)
      return "small";

    if (t.id === selectedId)
      return "selected";

    return "free";
  };

  const selected = TABLES.find(
    (t) =>
      t.id === selectedId &&
      getStatus(t) === "selected"
  );

  const freeCount = TABLES.filter(
    (t) =>
      ["free", "selected"].includes(
        getStatus(t)
      )
  ).length;

  /* ===== Reset perubahan ===== */

  const update = (setter) => (value) => {
    setter(value);
    setConfirmed(null);
    setStep("form");
    setError("");
  };

  function selectHour(tm) {
    setCustomMode(false);
    setSelectedTime(tm);
    setConfirmed(null);
    setStep("form");
    setError("");
  }

  function selectCustom() {
    setCustomMode(true);
    setConfirmed(null);
    setStep("form");
    setError("");
  }

  function handleCustomTimeChange(e) {
    setCustomTime(e.target.value);
    setConfirmed(null);
    setStep("form");
    setError("");
  }

  /* ===== Pilih meja ===== */

  const pickTable = (t) => {
    const status = getStatus(t);

    if (
      status === "booked" ||
      status === "small" ||
      confirmed
    ) {
      return;
    }

    setSelectedId(
      status === "selected"
        ? null
        : t.id
    );

    setStep("form");
    setError("");
  };

  /* ===== Validasi ===== */

  const canReview =
    timeValid &&
    selected &&
    nama.trim() &&
    noHp.trim() &&
    !sending;

  /* ===== Lanjut ke review ===== */

  function handleContinue() {
    if (!canReview) return;

    setError("");
    setStep("review");
  }

  /* =========================================================
     TAMPILKAN QR
     Dipanggil langsung dari step "review".
     ========================================================= */

  function handleShowQR() {
    if (!selected || sending) return;

    setError("");
    setPaid(false);
    setStep("qr");
  }

  /* =========================================================
     BOOKING SETELAH QR "DISCANNED"
     ========================================================= */

  async function handleBook() {
    if (!selected || sending) return;

    setSending(true);
    setError("");

    try {
      const res = await fetch(
        `${API}/bookings`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            meja_id: selected.id,
            nama: nama.trim(),
            no_hp: noHp.trim(),
            jumlah_orang: guests,
            tanggal:
              dates[dateIdx].iso,
            jam: activeTime,

            minimum_booking:
              minimumBooking,

            status_pembayaran:
              "paid_demo",
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            `Server membalas ${res.status}`
        );
      }

      setConfirmed({
        kode: data.kode,
        mejaId: selected.id,
        cap: selected.cap,
        nama: nama.trim(),
        noHp: noHp.trim(),
        tanggal:
          dates[dateIdx].full,
        jam: activeTime,
        guests,
        minimumBooking,
      });

      setRefresh(
        (n) => n + 1
      );

      setStep("success");
    } catch (err) {
      console.error(err);
      setError(err.message);
      setSending(false);

      /*
       * Kalau gagal, kembali ke review supaya
       * user bisa coba konfirmasi & bayar lagi.
       */
      setStep("review");
    } finally {
      setSending(false);
    }
  }

  /* ===== WhatsApp ===== */

  function sendWhatsApp() {
    if (!confirmed) return;

    const message = [
      "Halo Warkopolo 👋",
      "",
      "Saya ingin menyimpan bukti reservasi meja saya.",
      "",
      `Kode Booking: ${confirmed.kode}`,
      `Nama: ${confirmed.nama}`,
      `Tanggal: ${confirmed.tanggal}`,
      `Jam: ${confirmed.jam}`,
      `Jumlah Tamu: ${confirmed.guests} orang`,
      `Meja: Meja ${confirmed.mejaId}`,
      `DP / Minimum Spending: ${formatRupiah(
        confirmed.minimumBooking
      )}`,
      "",
      "DP dapat digunakan untuk pembelian makanan dan minuman saat kunjungan.",
      "",
      "Terima kasih.",
    ].join("\n");

    const phone = confirmed.noHp.replace(
      /\D/g,
      ""
    );

    const waNumber =
      phone.startsWith("0")
        ? `62${phone.slice(1)}`
        : phone;

    const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(
      message
    )}`;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  }

  /* ===== Booking baru ===== */

  function bookingBaru() {
    setConfirmed(null);
    setSelectedId(null);
    setNama("");
    setNoHp("");
    setError("");
    setStep("form");
  }

  /* ===== Kembali edit ===== */

  function backToForm() {
    setStep("form");
    setError("");
  }

  const cardPad = isMobile
    ? 16
    : 20;

  return (
    <section
      id="book-table"
      style={{
        width: "100%",
        maxWidth: 900,
        margin: "0 auto",
        padding: isMobile
          ? "24px 16px 40px"
          : "40px 24px 56px",
        boxSizing: "border-box",
      }}
    >
      <h2
        style={{
          fontSize: isMobile
            ? 26
            : 32,
          margin: 0,
          color: INK,
        }}
      >
        Pesan meja
      </h2>

      <p
        style={{
          margin:
            "8px 0 20px",
          color: MUTED,
          fontSize: isMobile
            ? 14
            : 15,
        }}
      >
        Reservasi meja dengan DP yang
        dapat digunakan untuk makanan
        dan minuman saat kunjungan.
      </p>

      {/* =====================================================
          SUCCESS / STRUK BOOKING
          ===================================================== */}

      {step === "success" &&
        confirmed && (
          <div
            style={{
              maxWidth: 620,
              margin: "30px auto",
            }}
          >
            <div
              style={{
                background: "#fff",
                border:
                  `1px solid ${LINE}`,
                borderRadius: 24,
                padding: isMobile
                  ? 20
                  : 28,
                boxShadow:
                  "0 10px 30px rgba(14,42,77,0.08)",
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  marginBottom: 24,
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background:
                      GREEN_BG,
                    color: GREEN,
                    display: "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    fontSize: 32,
                    fontWeight: 800,
                    margin:
                      "0 auto 14px",
                  }}
                >
                  ✓
                </div>

                <h3
                  style={{
                    margin: 0,
                    color: INK,
                    fontSize: 24,
                  }}
                >
                  Booking berhasil!
                </h3>

                <p
                  style={{
                    margin:
                      "8px 0 0",
                    color: MUTED,
                    fontSize: 14,
                  }}
                >
                  Pembayaran DP berhasil
                  dan meja kamu sudah
                  dicatat.
                </p>
              </div>

              {/* Kode booking */}

              <div
                style={{
                  background:
                    "#F4F8FD",
                  border:
                    `1px dashed ${BLUE}`,
                  borderRadius: 16,
                  padding: 18,
                  textAlign: "center",
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: MUTED,
                    marginBottom: 6,
                  }}
                >
                  KODE BOOKING
                </div>

                <div
                  style={{
                    color: BLUE,
                    fontSize: 25,
                    fontWeight: 900,
                    letterSpacing: 1,
                  }}
                >
                  {confirmed.kode}
                </div>
              </div>

              {/* Detail */}

              <div
                style={{
                  borderTop:
                    `1px solid ${LINE}`,
                  borderBottom:
                    `1px solid ${LINE}`,
                  padding:
                    "16px 0",
                  marginBottom: 18,
                }}
              >
                <Row
                  label="Nama"
                  value={
                    confirmed.nama
                  }
                />

                <Row
                  label="Tanggal"
                  value={
                    confirmed.tanggal
                  }
                />

                <Row
                  label="Jam"
                  value={
                    confirmed.jam
                  }
                />

                <Row
                  label="Tamu"
                  value={`${confirmed.guests} orang`}
                />

                <Row
                  label="Meja"
                  value={`Meja ${confirmed.mejaId}`}
                />

                <Row
                  label="DP"
                  value={formatRupiah(
                    confirmed.minimumBooking
                  )}
                />

                <Row
                  label="Status"
                  value="Lunas"
                />
              </div>

              {/* Penjelasan DP */}

              <div
                style={{
                  background:
                    GREEN_BG,
                  border:
                    `1px solid #B9E3CA`,
                  borderRadius: 14,
                  padding: 14,
                  marginBottom: 18,
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: "#25613D",
                }}
              >
                <strong>
                  DP menjadi saldo konsumsi.
                </strong>

                <br />

                Nominal{" "}
                {formatRupiah(
                  confirmed.minimumBooking
                )}{" "}
                dapat digunakan untuk
                pembelian makanan dan
                minuman saat kunjungan.
              </div>

              {/* Catatan */}

              <div
                style={{
                  background:
                    "#FFF8EA",
                  border:
                    "1px solid #F1D99D",
                  borderRadius: 14,
                  padding: 14,
                  marginBottom: 20,
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: "#6B531E",
                }}
              >
                <strong>
                  Catatan reservasi
                </strong>

                <br />

                Harap datang sekitar
                10 menit sebelum waktu
                reservasi. Tunjukkan kode
                booking kepada kasir.
              </div>

              <button
                type="button"
                onClick={
                  sendWhatsApp
                }
                style={{
                  width: "100%",
                  padding: 14,
                  border: "none",
                  borderRadius: 14,
                  background: "#25D366",
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: "pointer",
                  marginBottom: 10,
                }}
              >
                📱 Kirim Bukti ke WhatsApp
              </button>

              <button
                type="button"
                onClick={
                  bookingBaru
                }
                style={{
                  width: "100%",
                  padding: 13,
                  border:
                    `1.5px solid ${LINE}`,
                  borderRadius: 14,
                  background: "#fff",
                  color: INK,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Booking Meja Lain
              </button>
            </div>
          </div>
        )}

      {/* =====================================================
          QR PAYMENT - kartu berdiri sendiri, DI LUAR grid
          booking/denah, supaya tampilannya bersih seperti saat
          bayar menu di EOrder, bukan menumpuk dengan ringkasan
          tanggal/jam/meja.
          ===================================================== */}

      {step === "qr" && (
        <div
          style={{
            maxWidth: 420,
            margin: "30px auto",
          }}
        >
          <div
            style={{
              background: "#fff",
              border: `1px solid ${LINE}`,
              borderRadius: 24,
              padding: isMobile ? 20 : 28,
              boxShadow: "0 10px 30px rgba(14,42,77,0.08)",
              textAlign: "center",
            }}
          >
            <h4
              style={{
                margin: "0 0 4px",
                fontSize: 18,
                fontWeight: 800,
                color: INK,
              }}
            >
              Pembayaran QRIS
            </h4>

            <p
              style={{
                margin: "0 0 20px",
                color: MUTED,
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              Scan QR berikut untuk menyelesaikan pembayaran DP.
            </p>

            {paid ? (
              <>
                <div
                  style={{
                    width: 104,
                    height: 104,
                    margin: "8px auto 0",
                    borderRadius: "50%",
                    background: GREEN_BG,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: "50%",
                      background: GREEN,
                      color: "#fff",
                      fontSize: 36,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    ✓
                  </div>
                </div>

                <h2
                  style={{
                    margin: "16px 0 4px",
                    fontSize: 22,
                    fontWeight: 800,
                    color: INK,
                  }}
                >
                  Pembayaran berhasil
                </h2>

                <p style={{ margin: 0, color: MUTED, fontSize: 13 }}>
                  Mengirim konfirmasi booking...
                </p>
              </>
            ) : (
              <>
                <p style={{ margin: "0 0 4px", color: MUTED, fontSize: 12 }}>
                  Total pembayaran
                </p>

                <h2
                  style={{
                    margin: "0 0 18px",
                    fontSize: 26,
                    fontWeight: 900,
                    color: BLUE,
                  }}
                >
                  {formatRupiah(minimumBooking)}
                </h2>

                <div
                  style={{
                    display: "inline-block",
                    padding: 12,
                    border: `1px solid ${LINE}`,
                    borderRadius: 18,
                  }}
                >
                  <QrFake size={200} />
                </div>

                <p
                  style={{
                    margin: "18px 0 4px",
                    fontWeight: 700,
                    color: INK,
                    fontSize: 13,
                  }}
                >
                  Scan dengan aplikasi e-wallet
                </p>

                {/* Hitung mundur yang benar-benar terlihat */}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 4,
                    padding: "7px 16px",
                    borderRadius: 999,
                    background: "#F4F8FD",
                    border: `1px solid ${LINE}`,
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: GREEN,
                      display: "inline-block",
                    }}
                  />
                  <span style={{ color: INK, fontSize: 13, fontWeight: 700 }}>
                    Menunggu pembayaran... {countdown}s
                  </span>
                </div>
              </>
            )}

            <p
              style={{
                margin: "22px 0 0",
                fontSize: 11,
                color: MUTED,
                lineHeight: 1.5,
              }}
            >
              Simulasi pembayaran (demo), tidak ada uang yang diproses.
            </p>
          </div>
        </div>
      )}

      {/* =====================================================
          FORM / REVIEW
          ===================================================== */}

      {(step === "form" || step === "review") && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              isMobile
                ? "minmax(0, 1fr)"
                : "minmax(0, 1fr) 300px",
            gridTemplateRows:
              isMobile
                ? undefined
                : "auto 1fr",
            gap: isMobile
              ? 16
              : 24,
            alignItems: "start",
          }}
        >
          {/* =================================================
              TANGGAL / JAM / TAMU
              ================================================= */}

          <div
            style={{
              order: 1,
              gridColumn:
                isMobile ? 1 : 2,
              gridRow:
                isMobile
                  ? "auto"
                  : 1,
              background: "#fff",
              border:
                `1px solid ${LINE}`,
              borderRadius: 24,
              padding: cardPad,
              boxSizing: "border-box",
            }}
          >
            <h4 style={subhead}>
              Tanggal
            </h4>

            <div
              style={
                isMobile
                  ? {
                      display: "flex",
                      gap: 8,
                      overflowX:
                        "auto",
                      paddingBottom: 6,
                      marginBottom: 14,
                    }
                  : {
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(4, 1fr)",
                      gap: 8,
                      marginBottom: 20,
                    }
              }
            >
              {dates.map(
                (d, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-pressed={
                      dateIdx === i
                    }
                    disabled={
                      step !== "form"
                    }
                    onClick={() =>
                      update(
                        setDateIdx
                      )(i)
                    }
                    style={{
                      ...chip(
                        dateIdx ===
                          i
                      ),
                      padding:
                        "8px 0",
                      lineHeight: 1.2,
                      flex: isMobile
                        ? "0 0 64px"
                        : undefined,
                      opacity:
                        step !== "form"
                          ? 0.6
                          : 1,
                    }}
                  >
                    <span
                      style={{
                        display:
                          "block",
                        fontSize: 11,
                      }}
                    >
                      {d.short}
                    </span>

                    <span
                      style={{
                        display:
                          "block",
                        fontSize: 17,
                        fontWeight: 800,
                      }}
                    >
                      {d.num}
                    </span>
                  </button>
                )
              )}
            </div>

            <h4 style={subhead}>
              Jam
            </h4>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(4, 1fr)",
                gap: 8,
                marginBottom:
                  customMode
                    ? 10
                    : isMobile
                    ? 14
                    : 20,
              }}
            >
              {HOURS.map(
                (tm) => (
                  <button
                    key={tm}
                    type="button"
                    disabled={
                      step !== "form"
                    }
                    aria-pressed={
                      !customMode &&
                      selectedTime ===
                        tm
                    }
                    onClick={() =>
                      selectHour(tm)
                    }
                    style={{
                      ...chip(
                        !customMode &&
                          selectedTime ===
                            tm
                      ),
                      padding:
                        "10px 0",
                      fontSize: 14,
                      opacity:
                        step !== "form"
                          ? 0.6
                          : 1,
                    }}
                  >
                    {tm}
                  </button>
                )
              )}

              <button
                type="button"
                disabled={
                  step !== "form"
                }
                aria-pressed={
                  customMode
                }
                onClick={
                  selectCustom
                }
                style={{
                  ...chip(
                    customMode
                  ),
                  padding:
                    "10px 0",
                  fontSize: 14,
                  opacity:
                    step !== "form"
                      ? 0.6
                      : 1,
                }}
              >
                Custom
              </button>
            </div>

            {customMode && (
              <div
                style={{
                  marginBottom:
                    isMobile
                      ? 14
                      : 20,
                }}
              >
                <input
                  type="time"
                  value={
                    customTime
                  }
                  disabled={
                    step !== "form"
                  }
                  onChange={
                    handleCustomTimeChange
                  }
                  min={`${pad2(
                    OPEN_HOUR
                  )}:00`}
                  max={`${pad2(
                    CLOSE_HOUR
                  )}:00`}
                  style={{
                    ...input,
                    marginBottom: 6,
                  }}
                />

                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    color: MUTED,
                  }}
                >
                  Jam operasional{" "}
                  {pad2(
                    OPEN_HOUR
                  )}
                  .00–
                  {pad2(
                    CLOSE_HOUR
                  )}
                  .00
                </p>
              </div>
            )}

            <h4 style={subhead}>
              Jumlah tamu
            </h4>

            <div
              style={{
                display: "flex",
                alignItems:
                  "center",
                gap: 14,
                marginBottom: 16,
              }}
            >
              <button
                type="button"
                disabled={
                  guests <= 1 ||
                  step !== "form"
                }
                onClick={() =>
                  update(
                    setGuests
                  )(guests - 1)
                }
                style={{
                  ...chip(false),
                  width: 44,
                  height: 44,
                  fontSize: 22,
                  opacity:
                    guests <= 1 ||
                    step !== "form"
                      ? 0.4
                      : 1,
                }}
              >
                −
              </button>

              <span
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  minWidth: 28,
                  textAlign:
                    "center",
                  color: INK,
                }}
              >
                {guests}
              </span>

              <button
                type="button"
                disabled={
                  guests >= 6 ||
                  step !== "form"
                }
                onClick={() =>
                  update(
                    setGuests
                  )(guests + 1)
                }
                style={{
                  ...chip(false),
                  width: 44,
                  height: 44,
                  fontSize: 22,
                  opacity:
                    guests >= 6 ||
                    step !== "form"
                      ? 0.4
                      : 1,
                }}
              >
                +
              </button>
            </div>

            <div
              style={{
                background:
                  "#F4F8FD",
                border:
                  `1px solid ${LINE}`,
                borderRadius: 14,
                padding: 13,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: MUTED,
                  marginBottom: 4,
                }}
              >
                Minimum spending
              </div>

              <div
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  color: BLUE,
                }}
              >
                {formatRupiah(
                  minimumBooking
                )}
              </div>

              <div
                style={{
                  marginTop: 5,
                  fontSize: 12,
                  lineHeight: 1.4,
                  color: MUTED,
                }}
              >
                Nominal ini menjadi
                saldo makanan/minuman
                saat kamu datang.
              </div>
            </div>
          </div>

          {/* =================================================
              DENAH MEJA
              ================================================= */}

          <div
            style={{
              order: 2,
              gridColumn: 1,
              gridRow:
                isMobile
                  ? "auto"
                  : "1 / span 2",
              background: PAPER,
              borderRadius: 24,
              padding: isMobile
                ? 12
                : 20,
              minWidth: 0,
              boxSizing: "border-box",
            }}
          >
            <p
              style={{
                margin:
                  "0 0 8px",
                padding: isMobile
                  ? "4px 4px 0"
                  : 0,
                fontSize: 14,
                color: INK,
              }}
            >
              <strong
                style={{
                  color: BLUE,
                }}
              >
                {freeCount} dari{" "}
                {TABLES.length} meja
              </strong>{" "}
              masih tersedia
              untuk {guests} tamu
            </p>

            <svg
              viewBox="24 8 512 432"
              width="100%"
              role="group"
              aria-label="Denah meja"
              style={{
                display: "block",
                maxWidth: "100%",
                height: "auto",
              }}
            >
              <defs>
                <pattern
                  id="booked-hatch"
                  width="8"
                  height="8"
                  patternUnits="userSpaceOnUse"
                  patternTransform="rotate(45)"
                >
                  <rect
                    width="8"
                    height="8"
                    fill={BOOKED}
                  />

                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="8"
                    stroke="#B5B0AB"
                    strokeWidth="2"
                  />
                </pattern>
              </defs>

              <rect
                x="110"
                y="18"
                width="340"
                height="38"
                rx="19"
                fill={BLUE_DEEP}
              />

              <text
                x="280"
                y="43"
                textAnchor="middle"
                fill="#fff"
                fontSize="15"
                fontWeight="700"
              >
                Kasir & bar
              </text>

              <line
                x1="28"
                y1="420"
                x2="220"
                y2="420"
                stroke={INK}
                strokeWidth="3"
                strokeLinecap="round"
              />

              <line
                x1="340"
                y1="420"
                x2="532"
                y2="420"
                stroke={INK}
                strokeWidth="3"
                strokeLinecap="round"
              />

              <text
                x="280"
                y="425"
                textAnchor="middle"
                fill={INK}
                fontSize="14"
                fontWeight="600"
              >
                Pintu masuk
              </text>

              {TABLES.map(
                (t) => {
                  const status =
                    getStatus(t);

                  const geo =
                    getGeometry(t);

                  const disabled =
                    status ===
                      "booked" ||
                    status ===
                      "small" ||
                    !!confirmed;

                  const tableFill =
                    status ===
                    "selected"
                      ? BLUE
                      : status ===
                        "booked"
                      ? "url(#booked-hatch)"
                      : "#fff";

                  const tableStroke =
                    status ===
                    "booked"
                      ? "#B5B0AB"
                      : BLUE;

                  const seatFill =
                    status ===
                    "selected"
                      ? GOLD
                      : status ===
                        "booked"
                      ? BOOKED_SEAT
                      : SEAT_FREE;

                  const textFill =
                    status ===
                    "selected"
                      ? "#fff"
                      : status ===
                        "booked"
                      ? "#6B655F"
                      : INK;

                  const statusLabel =
                    {
                      free: "tersedia",
                      selected:
                        "dipilih",
                      booked:
                        "sudah dipesan",
                      small:
                        "terlalu kecil",
                    }[status];

                  return (
                    <g
                      key={t.id}
                      role="button"
                      tabIndex={
                        disabled
                          ? -1
                          : 0
                      }
                      aria-pressed={
                        status ===
                        "selected"
                      }
                      aria-disabled={
                        disabled
                      }
                      aria-label={`Meja ${t.id}, ${t.cap} kursi, ${statusLabel}`}
                      onClick={() =>
                        pickTable(t)
                      }
                      onKeyDown={(
                        e
                      ) => {
                        if (
                          e.key ===
                            "Enter" ||
                          e.key ===
                            " "
                        ) {
                          e.preventDefault();
                          pickTable(
                            t
                          );
                        }
                      }}
                      onFocus={() =>
                        setFocusId(
                          t.id
                        )
                      }
                      onBlur={() =>
                        setFocusId(
                          null
                        )
                      }
                      style={{
                        cursor:
                          disabled
                            ? "not-allowed"
                            : "pointer",
                        opacity:
                          status ===
                          "small"
                            ? 0.35
                            : 1,
                        outline:
                          "none",
                      }}
                    >
                      <rect
                        x={
                          geo.box
                            .x
                        }
                        y={
                          geo.box
                            .y
                        }
                        width={
                          geo.box
                            .w
                        }
                        height={
                          geo.box
                            .h
                        }
                        rx="14"
                        fill="transparent"
                        stroke={
                          focusId ===
                          t.id
                            ? BLUE
                            : "none"
                        }
                        strokeWidth="2"
                        strokeDasharray="5 4"
                      />

                      {geo.seats.map(
                        (s, i) => (
                          <rect
                            key={i}
                            x={s.x}
                            y={s.y}
                            width={s.w}
                            height={s.h}
                            rx="6"
                            fill={
                              seatFill
                            }
                          />
                        )
                      )}

                      {t.shape ===
                      "round" ? (
                        <circle
                          cx={t.x}
                          cy={t.y}
                          r="28"
                          fill={
                            tableFill
                          }
                          stroke={
                            tableStroke
                          }
                          strokeWidth="2"
                        />
                      ) : (
                        <rect
                          x={
                            t.x -
                            geo.tw /
                              2
                          }
                          y={
                            t.y -
                            geo.th /
                              2
                          }
                          width={
                            geo.tw
                          }
                          height={
                            geo.th
                          }
                          rx="12"
                          fill={
                            tableFill
                          }
                          stroke={
                            tableStroke
                          }
                          strokeWidth="2"
                        />
                      )}

                      <text
                        x={t.x}
                        y={t.y - 1}
                        textAnchor="middle"
                        fill={
                          textFill
                        }
                        fontSize="19"
                        fontWeight="800"
                      >
                        {t.id}
                      </text>

                      <text
                        x={t.x}
                        y={t.y + 15}
                        textAnchor="middle"
                        fill={
                          textFill
                        }
                        fontSize="12"
                        fontWeight="600"
                      >
                        {t.cap} kursi
                      </text>
                    </g>
                  );
                }
              )}
            </svg>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  isMobile
                    ? "1fr 1fr"
                    : "repeat(4, auto)",
                justifyContent:
                  "space-between",
                gap:
                  "8px 16px",
                marginTop: 10,
                padding:
                  isMobile
                    ? "0 4px 4px"
                    : 0,
                fontSize: 13,
                color: INK,
              }}
            >
              <Legend
                swatch={{
                  background:
                    "#fff",
                  border:
                    `2px solid ${BLUE}`,
                }}
                label="Tersedia"
              />

              <Legend
                swatch={{
                  background:
                    BLUE,
                  border:
                    `2px solid ${BLUE}`,
                }}
                label="Dipilih"
              />

              <Legend
                swatch={{
                  background:
                    BOOKED,
                  border:
                    "2px solid #B5B0AB",
                }}
                label="Sudah dipesan"
              />

              <Legend
                swatch={{
                  background:
                    "#fff",
                  border:
                    `2px solid ${BLUE}`,
                  opacity: 0.35,
                }}
                label={`Kurang dari ${guests} kursi`}
              />
            </div>
          </div>

          {/* =================================================
              DATA / REVIEW
              ================================================= */}

          <div
            style={{
              order: 3,
              gridColumn:
                isMobile ? 1 : 2,
              gridRow:
                isMobile
                  ? "auto"
                  : 2,
              background: "#fff",
              border:
                `1px solid ${LINE}`,
              borderRadius: 24,
              padding: cardPad,
              boxSizing: "border-box",
            }}
          >
            {/* SUMMARY */}

            <div
              style={{
                marginBottom: 16,
              }}
            >
              <Row
                label="Tanggal"
                value={
                  dates[dateIdx]
                    .full
                }
              />

              <Row
                label="Jam"
                value={
                  timeValid
                    ? activeTime
                    : "Belum dipilih"
                }
                muted={
                  !timeValid
                }
              />

              <Row
                label="Tamu"
                value={`${guests} orang`}
              />

              <Row
                label="Meja"
                value={
                  selected
                    ? `Meja ${selected.id}, ${selected.cap} kursi`
                    : "Belum dipilih"
                }
                muted={
                  !selected
                }
              />
            </div>

            {/* =================================================
                FORM
                ================================================= */}

            {step === "form" && (
              <>
                <h4
                  style={{
                    ...subhead,
                    marginTop: 8,
                  }}
                >
                  Data pemesan
                </h4>

                <input
                  style={input}
                  placeholder="Nama pemesan"
                  value={nama}
                  onChange={(e) =>
                    setNama(
                      e.target.value
                    )
                  }
                />

                <input
                  style={input}
                  placeholder="Nomor HP"
                  inputMode="tel"
                  value={noHp}
                  onChange={(e) =>
                    setNoHp(
                      e.target.value
                    )
                  }
                />

                <div
                  style={{
                    background:
                      "#F4F8FD",
                    border:
                      `1px solid ${LINE}`,
                    borderRadius: 14,
                    padding: 13,
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: MUTED,
                    }}
                  >
                    DP / minimum
                    konsumsi
                  </div>

                  <div
                    style={{
                      color: BLUE,
                      fontSize: 18,
                      fontWeight: 900,
                    }}
                  >
                    {formatRupiah(
                      minimumBooking
                    )}
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      lineHeight: 1.4,
                      color: MUTED,
                      marginTop: 4,
                    }}
                  >
                    DP nantinya
                    diperhitungkan sebagai
                    saldo makanan dan
                    minuman.
                  </div>
                </div>

                {error && (
                  <p
                    style={{
                      margin:
                        "0 0 10px",
                      color:
                        "#C0392B",
                      fontSize: 13,
                    }}
                    role="alert"
                  >
                    {error}
                  </p>
                )}

                <button
                  type="button"
                  disabled={!canReview}
                  onClick={
                    handleContinue
                  }
                  style={{
                    width: "100%",
                    padding:
                      "14px 0",
                    border: "none",
                    borderRadius: 14,
                    fontSize: 16,
                    fontWeight: 700,
                    background:
                      canReview
                        ? BLUE
                        : "#C9D3E0",
                    color: "#fff",
                    cursor:
                      canReview
                        ? "pointer"
                        : "not-allowed",
                  }}
                >
                  {!timeValid
                    ? "Pilih jam dulu"
                    : !selected
                    ? "Pilih meja dulu"
                    : !nama.trim() ||
                      !noHp.trim()
                    ? "Isi nama dan nomor HP"
                    : "Lanjutkan"}
                </button>
              </>
            )}

            {/* =================================================
                REVIEW
                Tombol di sini langsung membuka QR (step "qr"
                dirender terpisah di luar grid ini, lihat atas).
                ================================================= */}

            {step === "review" && (
              <>
                <h4
                  style={{
                    ...subhead,
                    marginTop: 8,
                  }}
                >
                  Konfirmasi booking
                </h4>

                <div
                  style={{
                    background:
                      "#F8FAFC",
                    border:
                      `1px solid ${LINE}`,
                    borderRadius: 16,
                    padding: 15,
                    marginBottom: 14,
                  }}
                >
                  <Row
                    label="Nama"
                    value={nama}
                  />

                  <Row
                    label="No. HP"
                    value={noHp}
                  />

                  <Row
                    label="Tanggal"
                    value={
                      dates[dateIdx]
                        .full
                    }
                  />

                  <Row
                    label="Jam"
                    value={
                      activeTime
                    }
                  />

                  <Row
                    label="Jumlah tamu"
                    value={`${guests} orang`}
                  />

                  <Row
                    label="Meja"
                    value={`Meja ${selected.id}`}
                  />

                  <Row
                    label="DP"
                    value={formatRupiah(
                      minimumBooking
                    )}
                  />
                </div>

                <div
                  style={{
                    background:
                      GREEN_BG,
                    border:
                      "1px solid #B9E3CA",
                    borderRadius: 14,
                    padding: 13,
                    fontSize: 12,
                    lineHeight: 1.5,
                    color: "#25613D",
                    marginBottom: 14,
                  }}
                >
                  DP sebesar{" "}
                  <strong>
                    {formatRupiah(
                      minimumBooking
                    )}
                  </strong>{" "}
                  dapat digunakan untuk
                  makanan dan minuman
                  saat kunjungan.
                </div>

                {error && (
                  <p
                    style={{
                      margin:
                        "0 0 10px",
                      color:
                        "#C0392B",
                      fontSize: 13,
                    }}
                    role="alert"
                  >
                    {error}
                  </p>
                )}

                <button
                  type="button"
                  disabled={sending}
                  onClick={
                    handleShowQR
                  }
                  style={{
                    width: "100%",
                    padding: 14,
                    border: "none",
                    borderRadius: 14,
                    background:
                      sending
                        ? "#C9D3E0"
                        : BLUE,
                    color: "#fff",
                    fontSize: 15,
                    fontWeight: 800,
                    cursor:
                      sending
                        ? "not-allowed"
                        : "pointer",
                    marginBottom: 10,
                  }}
                >
                  Konfirmasi Booking & Bayar
                </button>

                <button
                  type="button"
                  disabled={sending}
                  onClick={
                    backToForm
                  }
                  style={{
                    width: "100%",
                    padding: 12,
                    border:
                      `1.5px solid ${LINE}`,
                    borderRadius: 14,
                    background:
                      "#fff",
                    color: INK,
                    fontWeight: 700,
                    cursor:
                      sending
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  Kembali & Edit
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

/* ===== Legend ===== */

function Legend({
  swatch,
  label,
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems:
          "center",
        gap: 8,
      }}
    >
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: 6,
          display:
            "inline-block",
          flexShrink: 0,
          ...swatch,
        }}
      />

      {label}
    </span>
  );
}

/* ===== Row ===== */

function Row({
  label,
  value,
  muted,
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent:
          "space-between",
        gap: 12,
        fontSize: 14,
        margin:
          "0 0 8px",
      }}
    >
      <span
        style={{
          color: MUTED,
        }}
      >
        {label}
      </span>

      <span
        style={{
          color: muted
            ? "#8A97AB"
            : INK,
          fontWeight: 700,
          textAlign:
            "right",
          overflowWrap:
            "anywhere",
        }}
      >
        {value}
      </span>
    </div>
  );
}

export default BookTable;