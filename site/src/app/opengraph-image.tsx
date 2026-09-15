import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/content/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "80px",
          background: "linear-gradient(155deg, #0a1730, #122448)",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 22,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#cdab6c",
          }}
        >
          Communication Beyond Language
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 88,
            fontWeight: 600,
            color: "#fbf9f4",
            letterSpacing: 2,
          }}
        >
          {siteConfig.name.toUpperCase()}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 28,
            color: "rgba(251,249,244,0.7)",
            maxWidth: 900,
          }}
        >
          Interpretation, conference technology &amp; multilingual event solutions
        </div>
      </div>
    ),
    { ...size }
  );
}
