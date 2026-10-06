import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { API } from "../config";

const BG = "#0B5AB4";
const ACCENT = "#E8A93A";
const MUTED = "#6B7280";

// =========================================================
// LOKASI WARKOPOLO
// =========================================================

const WARKOPOLO_LOCATION = [-6.2, 106.816666];

// =========================================================
// STATUS
// =========================================================

const ALUR_STATUS = {
  dine: [
    {
      key: "pending",
      label: "Pesanan diterima",
    },
    {
      key: "diproses",
      label: "Sedang disiapkan",
    },
    {
      key: "disajikan",
      label: "Sudah disajikan",
    },
    {
      key: "selesai",
      label: "Selesai",
    },
  ],

  pickup: [
    {
      key: "pending",
      label: "Pesanan diterima",
    },
    {
      key: "diproses",
      label: "Sedang disiapkan",
    },
    {
      key: "siap diambil",
      label: "Siap diambil",
    },
    {
      key: "diambil",
      label: "Sudah diambil",
    },
  ],

  delivery: [
    {
      key: "pending",
      label: "Pesanan diterima",
    },
    {
      key: "diproses",
      label: "Sedang disiapkan",
    },
    {
      key: "dikirim",
      label: "Sedang dikirim",
    },
    {
      key: "selesai",
      label: "Selesai",
    },
  ],
};

const rupiah = (n) =>
  "Rp " + Number(n || 0).toLocaleString("id-ID");

// =========================================================
// STYLE
// =========================================================

const styles = {
  wrap: {
    width: "100%",
    maxWidth: 560,
    margin: "0 auto",
    padding: "32px 20px",
    boxSizing: "border-box",
    overflow: "hidden",
  },

  card: {
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    boxSizing: "border-box",

    background: "#fff",
    border: "1px solid #E5E7EB",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,

    overflow: "hidden",
  },

  title: {
    margin: "0 0 4px",
    fontSize: 24,
    color: BG,
  },

  sub: {
    margin: 0,
    fontSize: 14,
    color: MUTED,
  },

  step: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "8px 0",
    minWidth: 0,
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    padding: "6px 0",
    fontSize: 15,
    minWidth: 0,
  },

  btn: {
    display: "inline-block",
    marginTop: 8,
    padding: "10px 18px",
    borderRadius: 12,
    background: BG,
    color: "#fff",
    textDecoration: "none",
    fontWeight: 700,
    boxSizing: "border-box",
  },
};

// =========================================================
// FIX LEAFLET
// =========================================================

const mapFixStyle = `
  .warkopolo-map-container {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    height: 100% !important;
    box-sizing: border-box !important;
  }

  .warkopolo-map-container .leaflet-container {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    height: 100% !important;
    box-sizing: border-box !important;
  }

  .leaflet-control-container {
    max-width: 100%;
  }

  .leaflet-control {
    max-width: calc(100% - 20px);
  }

  @media (max-width: 600px) {
    .warkopolo-map-wrapper {
      height: 300px !important;
    }
  }
`;

// =========================================================
// ICON
// =========================================================

const customerIcon = L.divIcon({
  className: "warkopolo-customer-marker",

  html: `
    <div
      style="
        font-size:30px;
        line-height:30px;
        filter:drop-shadow(0 2px 2px rgba(0,0,0,.3));
      "
    >
      📍
    </div>
  `,

  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

const shopIcon = L.divIcon({
  className: "warkopolo-shop-marker",

  html: `
    <div
      style="
        font-size:30px;
        line-height:30px;
        filter:drop-shadow(0 2px 2px rgba(0,0,0,.3));
      "
    >
      🏪
    </div>
  `,

  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

const motorIcon = L.divIcon({
  className: "warkopolo-motor-marker",

  html: `
    <div
      style="
        font-size:30px;
        line-height:30px;
        filter:drop-shadow(0 2px 2px rgba(0,0,0,.3));
      "
    >
      🛵
    </div>
  `,

  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

// =========================================================
// MAP VIEW
// =========================================================

function DeliveryMapView({ route }) {
  const map = useMap();

  useEffect(() => {
    if (!route || route.length < 2) {
      return;
    }

    const bounds = L.latLngBounds(route);

    map.fitBounds(bounds, {
      padding: [40, 40],
      maxZoom: 16,
    });
  }, [map, route]);

  return null;
}

// =========================================================
// INTERPOLASI POSISI MOTOR
// =========================================================

function interpolateRoute(route, progress) {
  if (!route || route.length === 0) {
    return WARKOPOLO_LOCATION;
  }

  if (route.length === 1) {
    return route[0];
  }

  const totalSegments = route.length - 1;

  const scaled = progress * totalSegments;

  const index = Math.min(
    Math.floor(scaled),
    totalSegments - 1
  );

  const segmentProgress = scaled - index;

  const start = route[index];
  const end = route[index + 1];

  const lat =
    start[0] +
    (end[0] - start[0]) *
      segmentProgress;

  const lng =
    start[1] +
    (end[1] - start[1]) *
      segmentProgress;

  return [lat, lng];
}

// =========================================================
// STATUS PESANAN
// =========================================================

function StatusPesanan() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const [route, setRoute] = useState(null);

  const [motorPosition, setMotorPosition] =
    useState(WARKOPOLO_LOCATION);

  const completedSent = useRef(false);

  // =======================================================
  // LOAD ORDER
  // =======================================================

  useEffect(() => {
    let alive = true;

    setLoaded(false);
    setError(false);

    async function load() {
      try {
        const res = await fetch(
          `${API}/orders/${id}`
        );

        if (!res.ok) {
          throw new Error(
            "Order tidak ditemukan"
          );
        }

        const data = await res.json();

        if (!alive) {
          return;
        }

        setOrder(data);
        setLoaded(true);
        setError(false);
      } catch {
        if (alive) {
          setError(true);
          setLoaded(true);
        }
      }
    }

    load();

    const timer = setInterval(load, 5000);

    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [id]);

  // =======================================================
  // TIPE PESANAN
  // =======================================================

  const tipe =
    order?.tipe_pesanan || "dine";

  const steps =
    ALUR_STATUS[tipe] ||
    ALUR_STATUS.dine;

  const currentIdx = order
    ? Math.max(
        0,
        steps.findIndex(
          (s) => s.key === order.status
        )
      )
    : -1;

  // =======================================================
  // CUSTOMER LOCATION
  // =======================================================

  const customerPosition =
    order &&
    tipe === "delivery" &&
    Number.isFinite(Number(order.lat)) &&
    Number.isFinite(Number(order.lng))
      ? [
          Number(order.lat),
          Number(order.lng),
        ]
      : null;

  // =======================================================
  // AMBIL ROUTE DARI OSRM
  // =======================================================

  useEffect(() => {
    if (
      !customerPosition ||
      tipe !== "delivery"
    ) {
      setRoute(null);
      return;
    }

    let cancelled = false;

    async function getRoute() {
      try {
        const start =
          `${WARKOPOLO_LOCATION[1]},${WARKOPOLO_LOCATION[0]}`;

        const end =
          `${customerPosition[1]},${customerPosition[0]}`;

        const url =
          `https://router.project-osrm.org/route/v1/driving/` +
          `${start};${end}` +
          `?overview=full&geometries=geojson`;

        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(
            "Routing gagal"
          );
        }

        const data = await res.json();

        if (
          data.code !== "Ok" ||
          !data.routes?.length
        ) {
          throw new Error(
            "Rute tidak ditemukan"
          );
        }

        const coordinates =
          data.routes[0]
            .geometry
            .coordinates
            .map(([lng, lat]) => [
              lat,
              lng,
            ]);

        if (!cancelled) {
          setRoute(coordinates);
        }
      } catch {
        if (!cancelled) {
          setRoute([
            WARKOPOLO_LOCATION,
            customerPosition,
          ]);
        }
      }
    }

    getRoute();

    return () => {
      cancelled = true;
    };
  }, [
    customerPosition?.[0],
    customerPosition?.[1],
    tipe,
  ]);

  // =======================================================
  // MOTOR BERGERAK MENGIKUTI JALAN
  // =======================================================

  useEffect(() => {
    if (
      !order ||
      tipe !== "delivery" ||
      order.status !== "dikirim" ||
      !route ||
      route.length < 2
    ) {
      return;
    }

    let animationFrame;

    const startTime = performance.now();

    // Durasi simulasi = 20 detik
    const duration = 20000;

    completedSent.current = false;

    function animate(now) {
      const elapsed =
        now - startTime;

      const progress = Math.min(
        elapsed / duration,
        1
      );

      const smooth =
        progress < 0.5
          ? 2 * progress * progress
          : 1 -
            Math.pow(
              -2 * progress + 2,
              2
            ) /
              2;

      const position =
        interpolateRoute(
          route,
          smooth
        );

      setMotorPosition(position);

      if (progress < 1) {
        animationFrame =
          requestAnimationFrame(
            animate
          );
      } else {
        setMotorPosition(
          route[route.length - 1]
        );

        completeDelivery();
      }
    }

    async function completeDelivery() {
      if (completedSent.current) {
        return;
      }

      completedSent.current = true;

      try {
        const res = await fetch(
          `${API}/orders/${id}`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              status: "selesai",
            }),
          }
        );

        if (!res.ok) {
          console.error(
            "Gagal mengubah status menjadi selesai"
          );

          completedSent.current = false;
        }
      } catch (err) {
        console.error(
          "Gagal menyelesaikan delivery:",
          err
        );

        completedSent.current = false;
      }
    }

    animationFrame =
      requestAnimationFrame(
        animate
      );

    return () => {
      cancelAnimationFrame(
        animationFrame
      );
    };
  }, [
    order?.status,
    route,
    tipe,
    id,
  ]);

  // =======================================================
  // TOTAL
  // =======================================================

  const total = order
    ? order.items.reduce(
        (sum, it) =>
          sum +
          Number(it.harga || 0) *
            Number(it.qty || 0),
        0
      )
    : 0;

  // =======================================================
  // INFORMASI ORDER
  // =======================================================

  function renderInfoOrder() {
    if (!order) {
      return null;
    }

    if (tipe === "dine") {
      return (
        <p style={styles.sub}>
          Meja {order.meja_id}
        </p>
      );
    }

    if (tipe === "pickup") {
      return (
        <p style={styles.sub}>
          Ambil{" "}
          {order.nomor_antrean || ""}{" "}
          {order.nama_pelanggan
            ? `- ${order.nama_pelanggan}`
            : ""}
        </p>
      );
    }

    if (tipe === "delivery") {
      return (
        <div>
          <p style={styles.sub}>
            Antar
            {order.nama_pelanggan
              ? ` - ${order.nama_pelanggan}`
              : ""}
          </p>

          {order.no_hp && (
            <p
              style={{
                ...styles.sub,
                marginTop: 4,
              }}
            >
              HP: {order.no_hp}
            </p>
          )}

          {order.alamat && (
            <p
              style={{
                ...styles.sub,
                marginTop: 4,
                overflowWrap: "anywhere",
              }}
            >
              Alamat: {order.alamat}
            </p>
          )}
        </div>
      );
    }

    return null;
  }

  // =======================================================
  // TRACKING DELIVERY
  // =======================================================

  function renderDeliveryTracking() {
    if (
      !order ||
      tipe !== "delivery"
    ) {
      return null;
    }

    if (!customerPosition) {
      return null;
    }

    const mapRoute =
      route || [
        WARKOPOLO_LOCATION,
        customerPosition,
      ];

    return (
      <div style={styles.card}>
        {/* HEADER TRACKING */}
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: 12,
            marginBottom: 12,
            minWidth: 0,
          }}
        >
          <div
            style={{
              minWidth: 0,
              flex: 1,
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 18,
                color: BG,
              }}
            >
              🛵 Pengantaran
            </h2>

            <p
              style={{
                ...styles.sub,
                marginTop: 4,
              }}
            >
              {order.status ===
              "dikirim"
                ? "Kurir sedang menuju lokasi kamu"
                : order.status ===
                  "selesai"
                ? "Pesanan sudah sampai"
                : "Pesanan sedang diproses"}
            </p>
          </div>

          {order.status ===
            "dikirim" && (
            <span
              style={{
                background: "#FEF3C7",
                color: "#92400E",
                padding: "6px 10px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              DIKIRIM
            </span>
          )}

          {order.status ===
            "selesai" && (
            <span
              style={{
                background: "#DCFCE7",
                color: "#166534",
                padding: "6px 10px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              SAMPAI
            </span>
          )}
        </div>

        {/* MAP */}
        <div
          className="warkopolo-map-wrapper"
          style={{
            width: "100%",
            maxWidth: "100%",
            minWidth: 0,
            height: 360,
            boxSizing: "border-box",
            borderRadius: 14,
            overflow: "hidden",
            border: "1px solid #E5E7EB",
            position: "relative",
          }}
        >
          <MapContainer
            className="warkopolo-map-container"
            center={customerPosition}
            zoom={14}
            style={{
              width: "100%",
              maxWidth: "100%",
              minWidth: 0,
              height: "100%",
              boxSizing: "border-box",
            }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <DeliveryMapView
              route={mapRoute}
            />

            {/* WARKOPOLO */}
            <Marker
              position={WARKOPOLO_LOCATION}
              icon={shopIcon}
            />

            {/* CUSTOMER */}
            <Marker
              position={customerPosition}
              icon={customerIcon}
            />

            {/* MOTOR */}
            {order.status ===
              "dikirim" && (
              <Marker
                position={motorPosition}
                icon={motorIcon}
              />
            )}

            {/* RUTE MENGIKUTI JALAN */}
            <Polyline
              positions={mapRoute}
              pathOptions={{
                color: BG,
                weight: 5,
                opacity: 0.75,
                dashArray: "10 8",
              }}
            />
          </MapContainer>
        </div>

        {/* LEGENDA */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            marginTop: 14,
            fontSize: 13,
            color: "#374151",
          }}
        >
          <span>
            🏪 Warkopolo
          </span>

          <span>
            🛵 Kurir
          </span>

          <span>
            📍 Lokasi kamu
          </span>
        </div>

        {/* SAAT DIKIRIM */}
        {order.status ===
          "dikirim" && (
          <div
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 10,
              background: "#EFF6FF",
              color: "#1E40AF",
              fontSize: 13,
              boxSizing: "border-box",
              width: "100%",
            }}
          >
            🛵 Kurir sedang dalam
            perjalanan menuju lokasi
            kamu.
          </div>
        )}

        {/* SAAT SELESAI */}
        {order.status ===
          "selesai" && (
          <div
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 10,
              background: "#DCFCE7",
              color: "#166534",
              fontSize: 13,
              boxSizing: "border-box",
              width: "100%",
            }}
          >
            ✅ Pesanan sudah sampai
            di lokasi kamu.
          </div>
        )}
      </div>
    );
  }

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <>
      <style>
        {mapFixStyle}
      </style>

      <div style={styles.wrap}>
        {/* HEADER */}
        <div style={styles.card}>
          <h1 style={styles.title}>
            Status Pesanan #{id}
          </h1>

          {order &&
            renderInfoOrder()}

          {!loaded &&
            !error && (
              <p style={styles.sub}>
                Memuat...
              </p>
            )}

          {error && (
            <p
              style={{
                ...styles.sub,
                color: "#B91C1C",
              }}
            >
              Tidak bisa terhubung
              ke server. Mencoba
              lagi...
            </p>
          )}
        </div>

        {/* STATUS */}
        {loaded && order && (
          <div style={styles.card}>
            {steps.map((s, i) => {
              const reached =
                i <= currentIdx;

              return (
                <div
                  key={s.key}
                  style={styles.step}
                >
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background:
                        reached
                          ? ACCENT
                          : "#E5E7EB",
                      flexShrink: 0,
                    }}
                  />

                  <span
                    style={{
                      fontWeight:
                        i === currentIdx
                          ? 700
                          : 400,
                      color:
                        reached
                          ? "#111827"
                          : MUTED,
                    }}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* TRACKING DELIVERY */}
        {renderDeliveryTracking()}

        {/* DETAIL */}
        {order && (
          <div style={styles.card}>
            {order.items.map((it) => (
              <div
                key={it.product_id}
                style={styles.row}
              >
                <span
                  style={{
                    minWidth: 0,
                    overflowWrap:
                      "anywhere",
                  }}
                >
                  {it.nama} x{it.qty}
                </span>

                <span
                  style={{
                    flexShrink: 0,
                  }}
                >
                  {rupiah(
                    Number(it.harga) *
                      Number(it.qty)
                  )}
                </span>
              </div>
            ))}

            <div
              style={{
                ...styles.row,
                borderTop:
                  "1px solid #E5E7EB",
                marginTop: 8,
                paddingTop: 12,
                fontWeight: 700,
              }}
            >
              <span>
                Total
              </span>

              <span>
                {rupiah(total)}
              </span>
            </div>
          </div>
        )}

        {/* SELESAI */}
        {order?.status ===
          "selesai" && (
          <div style={styles.card}>
            <p
              style={{
                margin: 0,
              }}
            >
              Pesanan anda sudah
              sampai. Terima kasih
              sudah membeli produk
              Warkopolo!
            </p>
          </div>
        )}

        {/* HOME */}
        <Link
          to="/"
          style={styles.btn}
        >
          Kembali ke Home
        </Link>
      </div>
    </>
  );
}

export default StatusPesanan;