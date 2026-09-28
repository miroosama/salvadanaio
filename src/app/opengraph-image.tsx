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
          backgroundColor: "#faf8f4",
        }}
      >
        <svg width="200" height="200" viewBox="0 0 64 64">
          <ellipse cx="28" cy="36" rx="18" ry="13" fill="#ed7624" />
          <ellipse cx="45" cy="37" rx="7" ry="8" fill="#ed7624" />
          <polygon points="36,20 44,20 40,29" fill="#ed7624" />
          <rect x="22" y="46" width="5" height="7" rx="2.5" fill="#ed7624" />
          <rect x="34" y="46" width="5" height="7" rx="2.5" fill="#ed7624" />
          <rect x="20" y="21" width="14" height="3.5" rx="1.75" fill="#c9500f" />
          <circle cx="24" cy="31" r="2" fill="#faf8f4" />
          <circle cx="43" cy="37" r="1.5" fill="#c9500f" />
          <circle cx="47" cy="37" r="1.5" fill="#c9500f" />
        </svg>

        <div
          style={{
            display: "flex",
            fontSize: 84,
            fontWeight: 800,
            color: "#2b2622",
            marginTop: 16,
          }}
        >
          Salvadanaio
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 34,
            color: "#8a8178",
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
              color: "#4d7c2f",
              backgroundColor: "#eaf1e2",
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
              color: "#ed7624",
              backgroundColor: "#fbe6d6",
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
