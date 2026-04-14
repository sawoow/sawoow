import { useState } from "react";

const BASE = import.meta.env.BASE_URL;

export default function PlaceholderImage({
  src,
  alt,
  label,
  monogram,
  orientation = "bottom",
  style,
  children,
}) {
  const [failed, setFailed] = useState(false);
  const resolved = src.startsWith("http") ? src : `${BASE.replace(/\/$/, "")}${src}`;

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(135deg, #5a7a8a 0%, #3d5565 100%)",
        ...style,
      }}
    >
      {!failed && (
        <img
          src={resolved}
          alt={alt}
          onError={() => setFailed(true)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "50%",
          background:
            orientation === "bottom"
              ? "linear-gradient(transparent, rgba(74,92,106,0.8))"
              : "none",
          pointerEvents: "none",
        }}
      />
      {monogram && (
        <div
          style={{
            color: "rgba(255,255,255,0.2)",
            fontSize: 120,
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic",
            position: "absolute",
            bottom: 20,
            right: 20,
            pointerEvents: "none",
          }}
        >
          {monogram}
        </div>
      )}
      {failed && label && !children && (
        <div
          style={{
            padding: 24,
            color: "rgba(255,255,255,0.5)",
            fontSize: 13,
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: 2,
            position: "absolute",
            bottom: 0,
            left: 0,
          }}
        >
          {label}
        </div>
      )}
      {children}
    </div>
  );
}
