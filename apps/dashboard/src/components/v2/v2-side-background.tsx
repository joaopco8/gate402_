"use client"

import React from "react"
import { motion } from "motion/react"

const CELL_W = 52
const CELL_H = 34

function Cell({ r, c }: { r: number; c: number }) {
  const blinks = React.useRef(Math.random() < 0.12).current
  const delay  = React.useRef(Math.random() * 6).current
  const dur    = React.useRef(1.5 + Math.random() * 3).current

  return (
    <motion.div
      whileHover={{
        backgroundColor: "#BC86FF",
        boxShadow: "0 0 12px #BC86FF88",
        transition: { duration: 0 },
      }}
      animate={blinks ? {
        opacity: [1, 0.15, 1],
        backgroundColor: ["transparent", "#BC86FF22", "transparent"],
      } : undefined}
      transition={blinks ? {
        duration: dur,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      } : undefined}
      style={{
        width: CELL_W,
        height: CELL_H,
        border: "1px solid #222522",
        flexShrink: 0,
        position: "relative",
        cursor: "none",
      }}
    >
      {r % 2 === 0 && c % 2 === 0 && (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="#2A2E2A"
          strokeWidth="1"
          style={{
            position: "absolute",
            width: 10,
            height: 10,
            top: -5,
            left: -5,
            pointerEvents: "none",
          }}
        >
          <path strokeLinecap="round" d="M12 6v12M6 12h12" />
        </svg>
      )}
    </motion.div>
  )
}

function Strip({ side }: { side: "left" | "right" }) {
  const cols = new Array(8).fill(null)
  const rows = new Array(60).fill(null)

  return (
    <div style={{ display: "flex", flexDirection: "column", transformStyle: "preserve-3d" }}>
      {rows.map((_, r) => (
        <div key={r} style={{ display: "flex" }}>
          {cols.map((_, c) => (
            <Cell key={c} r={r} c={c} />
          ))}
        </div>
      ))}
    </div>
  )
}

export function V2SideBackground() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>

      {/* LEFT */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, bottom: 0,
        right: "calc(50% + 600px)",
        overflow: "hidden",
        perspective: "600px",
        maskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.7) 80%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.7) 80%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)",
        maskComposite: "intersect",
        WebkitMaskComposite: "destination-in",
        pointerEvents: "auto",
      }}>
        <div style={{
          transform: "rotateY(28deg)",
          transformOrigin: "right center",
          transformStyle: "preserve-3d",
          display: "flex",
          justifyContent: "flex-end",
        }}>
          <Strip side="left" />
        </div>
      </div>

      {/* RIGHT */}
      <div style={{
        position: "absolute",
        top: 0, bottom: 0,
        left: "calc(50% + 600px)",
        right: 0,
        overflow: "hidden",
        perspective: "600px",
        maskImage: "linear-gradient(to left, transparent 0%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.7) 80%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to left, transparent 0%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.7) 80%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)",
        maskComposite: "intersect",
        WebkitMaskComposite: "destination-in",
        pointerEvents: "auto",
      }}>
        <div style={{
          transform: "rotateY(-28deg)",
          transformOrigin: "left center",
          transformStyle: "preserve-3d",
        }}>
          <Strip side="right" />
        </div>
      </div>

    </div>
  )
}
