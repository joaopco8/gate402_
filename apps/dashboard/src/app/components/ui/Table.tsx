'use client'

import {
  useRef, useEffect, useState, useCallback,
  createContext, useContext, forwardRef,
  type ReactNode, type HTMLAttributes,
  type TdHTMLAttributes, type ThHTMLAttributes,
  type RefObject,
} from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Proximity hover ──────────────────────────────────────────────────────────

interface ItemRect { top: number; height: number; left: number; width: number }

function useProximityHover<T extends HTMLElement>(containerRef: RefObject<T | null>) {
  const itemsRef = useRef(new Map<number, HTMLElement>())
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [itemRects, setItemRects] = useState<ItemRect[]>([])
  const itemRectsRef = useRef<ItemRect[]>([])
  const sessionRef = useRef(0)
  const rafIdRef = useRef<number | null>(null)

  const registerItem = useCallback((index: number, element: HTMLElement | null) => {
    if (element) itemsRef.current.set(index, element)
    else itemsRef.current.delete(index)
  }, [])

  const measureItems = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    const cr = container.getBoundingClientRect()
    const rects: ItemRect[] = []
    itemsRef.current.forEach((el, index) => {
      const r = el.getBoundingClientRect()
      rects[index] = {
        top: r.top - cr.top + container.scrollTop - container.clientTop,
        height: r.height,
        left: r.left - cr.left + container.scrollLeft - container.clientLeft,
        width: r.width,
      }
    })
    itemRectsRef.current = rects
    setItemRects(rects)
  }, [containerRef])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const mouseY = e.clientY
    if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current)
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null
      const container = containerRef.current
      if (!container) return
      const cr = container.getBoundingClientRect()
      let closestIndex: number | null = null
      let closestDistance = Infinity
      const rects = itemRectsRef.current
      for (let i = 0; i < rects.length; i++) {
        const r = rects[i]
        if (!r) continue
        const start = cr.top + container.clientTop + r.top - container.scrollTop
        const dist = Math.abs(mouseY - (start + r.height / 2))
        if (dist < closestDistance) { closestDistance = dist; closestIndex = i }
      }
      setActiveIndex(closestIndex)
    })
  }, [containerRef])

  const handleMouseEnter = useCallback(() => { sessionRef.current += 1 }, [])
  const handleMouseLeave = useCallback(() => {
    if (rafIdRef.current !== null) { cancelAnimationFrame(rafIdRef.current); rafIdRef.current = null }
    setActiveIndex(null)
  }, [])

  useEffect(() => () => { if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current) }, [])

  return {
    activeIndex, itemRects, sessionRef,
    handlers: { onMouseMove: handleMouseMove, onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave },
    registerItem, measureItems,
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface TableContextValue {
  registerItem: (index: number, element: HTMLElement | null) => void
  activeIndex: number | null
}
const TableContext = createContext<TableContextValue | null>(null)

// ─── Table ────────────────────────────────────────────────────────────────────

interface TableProps extends HTMLAttributes<HTMLTableElement> {
  children: ReactNode
}

export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ children, style, ...props }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const { activeIndex, itemRects, sessionRef, handlers, registerItem, measureItems } =
      useProximityHover(containerRef)

    useEffect(() => { measureItems() }, [measureItems, children])

    const activeRect = activeIndex !== null ? itemRects[activeIndex] : null

    return (
      <TableContext.Provider value={{ registerItem, activeIndex }}>
        <div
          ref={containerRef}
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 6,
            border: '1px solid var(--border-default)',
            background: 'var(--bg-surface)',
          }}
          {...handlers}
        >
          <AnimatePresence>
            {activeRect && (
              <motion.div
                key={sessionRef.current}
                style={{
                  position: 'absolute',
                  background: 'rgba(255,255,255,0.035)',
                  pointerEvents: 'none',
                  zIndex: 0,
                  top: activeRect.top,
                  left: activeRect.left,
                  width: activeRect.width,
                  height: activeRect.height,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.08 } }}
                transition={{ type: 'spring', duration: 0.08, bounce: 0, opacity: { duration: 0.08 } }}
              />
            )}
          </AnimatePresence>
          <table
            ref={ref}
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              position: 'relative',
              fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-mono)',
              ...style,
            }}
            {...props}
          >
            {children}
          </table>
        </div>
      </TableContext.Provider>
    )
  }
)
Table.displayName = 'Table'

// ─── TableHeader ──────────────────────────────────────────────────────────────

export const TableHeader = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ style, ...props }, ref) => (
    <thead
      ref={ref}
      style={{
        background: 'var(--bg-base)',
        borderBottom: '1px solid var(--border-default)',
        ...style,
      }}
      {...props}
    />
  )
)
TableHeader.displayName = 'TableHeader'

// ─── TableBody ────────────────────────────────────────────────────────────────

export const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  (props, ref) => <tbody ref={ref} {...props} />
)
TableBody.displayName = 'TableBody'

// ─── TableRow ─────────────────────────────────────────────────────────────────

interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  index?: number
}

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ index, style, ...props }, ref) => {
    const internalRef = useRef<HTMLTableRowElement>(null)
    const ctx = useContext(TableContext)

    useEffect(() => {
      if (index === undefined || !ctx) return
      ctx.registerItem(index, internalRef.current)
      return () => ctx.registerItem(index, null)
    }, [index, ctx])

    const isBodyRow = index !== undefined
    const activeIdx = ctx?.activeIndex ?? null
    const hideBorder =
      activeIdx !== null &&
      isBodyRow &&
      (index === activeIdx || index === activeIdx - 1)

    return (
      <tr
        ref={(node) => {
          (internalRef as React.MutableRefObject<HTMLTableRowElement | null>).current = node
          if (typeof ref === 'function') ref(node)
          else if (ref) (ref as React.MutableRefObject<HTMLTableRowElement | null>).current = node
        }}
        data-proximity-index={index}
        style={{
          position: 'relative',
          zIndex: 10,
          borderBottom: hideBorder
            ? '1px solid transparent'
            : '1px solid var(--border-default)',
          transition: 'border-color 80ms',
          ...style,
        }}
        {...props}
      />
    )
  }
)
TableRow.displayName = 'TableRow'

// ─── TableHead ────────────────────────────────────────────────────────────────

export const TableHead = forwardRef<HTMLTableCellElement, ThHTMLAttributes<HTMLTableCellElement>>(
  ({ style, ...props }, ref) => (
    <th
      ref={ref}
      style={{
        padding: '9px 16px',
        textAlign: 'left',
        fontSize: 'var(--text-xs)',
        fontFamily: 'var(--font-mono)',
        fontWeight: 500,
        color: 'var(--text-muted)',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...props}
    />
  )
)
TableHead.displayName = 'TableHead'

// ─── TableCell ────────────────────────────────────────────────────────────────

export const TableCell = forwardRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement>>(
  ({ style, ...props }, ref) => (
    <td
      ref={ref}
      style={{
        padding: '10px 16px',
        fontSize: 'var(--text-sm)',
        color: 'var(--text-secondary)',
        fontFamily: 'var(--font-mono)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        transition: 'color 80ms',
        ...style,
      }}
      {...props}
    />
  )
)
TableCell.displayName = 'TableCell'
