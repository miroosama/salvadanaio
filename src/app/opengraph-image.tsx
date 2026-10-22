import { ImageResponse } from "next/og";

// App Router convention: this file is the site's og:image, rendered by next/og.
export const runtime = "edge";
export const alt = "Salvadanaio — Il tuo salvadanaio digitale";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F4DBCB",
        }}
      >
        <svg width="210" height="210" viewBox="0 0 64 64">
          <circle cx="27" cy="12" r="5" fill="#6FD9BE" stroke="#0E8E72" strokeWidth="1.6" />
          <ellipse cx="28" cy="38" rx="18" ry="13" fill="#E8622A" />
          <ellipse cx="45" cy="39" rx="7" ry="8" fill="#E8622A" />
          <polygon points="36,22 44,22 40,31" fill="#E8622A" />
          <rect x="22" y="48" width="5" height="7" rx="2.5" fill="#B8461A" />
          <rect x="34" y="48" width="5" height="7" rx="2.5" fill="#B8461A" />
          <rect x="20" y="23" width="14" height="3.5" rx="1.75" fill="#B8461A" />
          <circle cx="24" cy="33" r="2" fill="#FBF6EC" />
          <circle cx="43" cy="39" r="1.5" fill="#2B2420" />
          <circle cx="47" cy="39" r="1.5" fill="#2B2420" />
        </svg>

        <div
          style={{
            display: "flex",
            fontSize: 84,
            fontWeight: 800,
            color: "#2B2420",
            marginTop: 16,
          }}
        >
          Salvadanaio
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 34,
            color: "#7b6f61",
            marginTop: 8,
          }}
        >
          Il tuo salvadanaio digitale
        </div>

        <div style={{ display: "flex", gap: 16, marginTop: 30 }}>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              color: "#0E8E72",
              backgroundColor: "#E7F8F2",
              padding: "8px 22px",
              borderRadius: 999,
            }}
          >
            ~5% annuo
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              color: "#E8622A",
              backgroundColor: "#FDF1EA",
              padding: "8px 22px",
              borderRadius: 999,
            }}
          >
            Base · DeFi
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
