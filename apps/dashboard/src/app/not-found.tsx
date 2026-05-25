"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0A0A0A",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        fontFamily: "var(--font-display, system-ui, sans-serif)",
        textAlign: "center",
        padding: "0 24px",
      }}
    >
      {/* Big 404 */}
      <div
        style={{
          fontSize: "clamp(80px, 18vw, 160px)",
          fontWeight: 700,
          color: "#ffffff",
          lineHeight: 1,
          letterSpacing: "-4px",
          marginBottom: 0,
        }}
      >
        404
      </div>

      {/* GIF animation */}
      <img
        src="https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif"
        alt="404 animation"
        style={{
          width: "100%",
          maxWidth: 360,
          height: "auto",
          borderRadius: 12,
          margin: "16px 0",
          display: "block",
        }}
      />

      {/* Heading */}
      <h2
        style={{
          fontSize: 22,
          fontWeight: 600,
          color: "#ffffff",
          marginBottom: 8,
          marginTop: 0,
        }}
      >
        Looks like you&apos;re lost
      </h2>

      {/* Subtext */}
      <p
        style={{
          fontSize: 14,
          color: "#888888",
          marginBottom: 28,
          marginTop: 0,
        }}
      >
        The page you are looking for is not available.
      </p>

      {/* Button matching app style */}
      <Link
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "10px 28px",
          background: "#00bc7d",
          color: "#000000",
          borderRadius: 6,
          fontSize: 14,
          fontWeight: 600,
          textDecoration: "none",
          letterSpacing: "0.01em",
          transition: "background 150ms",
        }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "#00a36d")}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "#00bc7d")}
      >
        Go to Home
      </Link>
    </div>
  );
}
