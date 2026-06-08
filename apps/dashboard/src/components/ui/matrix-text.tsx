"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { motion } from "motion/react";

interface LetterState {
  char: string;
  isMatrix: boolean;
  isSpace: boolean;
}

interface MatrixTextProps {
  text?: string;
  className?: string;
  style?: React.CSSProperties;
  letterAnimationDuration?: number;
  letterInterval?: number;
}

export const MatrixText = ({
  text = "HelloWorld!",
  className,
  style,
  letterAnimationDuration = 150,
  letterInterval = 25,
}: MatrixTextProps) => {
  const [letters, setLetters] = useState<LetterState[]>(() =>
    text.split("").map((char) => ({
      char,
      isMatrix: false,
      isSpace: char === " ",
    }))
  );
  const isAnimatingRef = useRef(false);

  // Precompute word groups (start/end indices) — never changes
  const wordGroups = useMemo(() => {
    const groups: { start: number; end: number; isSpace: boolean }[] = [];
    let i = 0;
    while (i < text.length) {
      const isSpace = text[i] === " ";
      let j = i;
      while (j < text.length && (text[j] === " ") === isSpace) j++;
      groups.push({ start: i, end: j, isSpace });
      i = j;
    }
    return groups;
  }, [text]);

  const getRandomChar = useCallback(
    () => (Math.random() > 0.5 ? "1" : "0"),
    []
  );

  const animateLetter = useCallback(
    (index: number) => {
      if (index >= text.length) return;
      requestAnimationFrame(() => {
        setLetters((prev) => {
          const next = [...prev];
          if (!next[index].isSpace) {
            next[index] = { ...next[index], char: getRandomChar(), isMatrix: true };
          }
          return next;
        });
        setTimeout(() => {
          setLetters((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], char: text[index], isMatrix: false };
            return next;
          });
        }, letterAnimationDuration);
      });
    },
    [getRandomChar, text, letterAnimationDuration]
  );

  const startAnimation = useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    let currentIndex = 0;
    const animate = () => {
      if (currentIndex >= text.length) {
        isAnimatingRef.current = false;
        return;
      }
      animateLetter(currentIndex);
      currentIndex++;
      setTimeout(animate, letterInterval);
    };
    animate();
  }, [animateLetter, text, letterInterval]);

  const motionVariants = useMemo(
    () => ({
      matrix: { color: "#FFFFFF", textShadow: "none" },
      normal: { color: "inherit", textShadow: "none" },
    }),
    []
  );

  return (
    <span
      className={className}
      style={{ display: "inline", cursor: "default", ...style }}
      onMouseEnter={startAnimation}
      aria-label={text}
    >
      {wordGroups.map((group, gi) =>
        group.isSpace ? (
          <span key={gi} style={{ display: "inline-block", minWidth: "0.25em" }}>
            {" "}
          </span>
        ) : (
          <span key={gi} style={{ display: "inline-flex", whiteSpace: "nowrap" }}>
            {letters.slice(group.start, group.end).map((letter, li) => (
              <motion.span
                key={group.start + li}
                style={{
                  display: "inline-block",
                  fontVariantNumeric: "tabular-nums",
                }}
                initial="normal"
                animate={letter.isMatrix ? "matrix" : "normal"}
                variants={motionVariants}
                transition={{ duration: 0.04, ease: "easeInOut" }}
              >
                {letter.char}
              </motion.span>
            ))}
          </span>
        )
      )}
    </span>
  );
};
