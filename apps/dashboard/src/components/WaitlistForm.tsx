"use client";

import { useState } from "react";
import { createClient } from "../../lib/supabase/client";

type Status = "idle" | "loading" | "success" | "duplicate" | "error";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setStatus("loading");

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("waitlist")
        .insert({ email: email.toLowerCase().trim(), source: "landing" });

      if (error) {
        if (error.code === "23505") {
          setStatus("duplicate");
        } else {
          setStatus("error");
        }
        return;
      }

      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 16px",
        background: "rgba(0,188,125,0.08)",
        border: "1px solid rgba(0,188,125,0.2)",
        borderRadius: 6,
        fontFamily: "monospace",
        fontSize: 13,
        color: "#00bc7d",
      }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 7l3.5 3.5L12 3.5" stroke="#00bc7d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        You&apos;re on the list. We&apos;ll reach out soon.
      </div>
    );
  }

  if (status === "duplicate") {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 16px",
        background: "rgba(245,158,11,0.08)",
        border: "1px solid rgba(245,158,11,0.2)",
        borderRadius: 6,
        fontFamily: "monospace",
        fontSize: 13,
        color: "#f59e0b",
      }}>
        Already on the list. We&apos;ll be in touch.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{
      display: "flex",
      gap: 8,
      alignItems: "center",
      flexWrap: "wrap",
      justifyContent: "center",
    }}>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        disabled={status === "loading"}
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 6,
          padding: "9px 14px",
          fontFamily: "monospace",
          fontSize: 13,
          color: "#fff",
          outline: "none",
          width: 220,
        }}
      />
      <button
        type="submit"
        disabled={status === "loading" || !email}
        style={{
          padding: "9px 18px",
          background: status === "loading" ? "rgba(0,188,125,0.5)" : "#00bc7d",
          color: "#000",
          border: "none",
          borderRadius: 6,
          fontFamily: "monospace",
          fontSize: 13,
          fontWeight: 600,
          cursor: status === "loading" ? "not-allowed" : "pointer",
          whiteSpace: "nowrap",
        }}
      >
        {status === "loading" ? "Joining..." : "Get early access →"}
      </button>
      {status === "error" && (
        <span style={{
          fontFamily: "monospace",
          fontSize: 12,
          color: "#ef4444",
          width: "100%",
          textAlign: "center",
        }}>
          Something went wrong. Try again.
        </span>
      )}
    </form>
  );
}
