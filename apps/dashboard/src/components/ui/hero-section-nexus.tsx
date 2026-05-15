"use client";

import React, {
    useEffect,
    useRef,
    useState,
    useCallback,
    forwardRef,
    useImperativeHandle,
    useMemo,
    type ReactNode,
    type MouseEvent as ReactMouseEvent,
    type FormEvent,
    type SVGProps,
} from 'react';
import {
    motion,
    AnimatePresence,
    useScroll,
    useMotionValueEvent,
    type Transition,
    type VariantLabels,
    type Target,
    type AnimationControls,
    type TargetAndTransition,
    type Variants,
} from 'framer-motion';

function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(" ");
}

interface RotatingTextRef {
  next: () => void;
  previous: () => void;
  jumpTo: (index: number) => void;
  reset: () => void;
}

interface RotatingTextProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof motion.span>,
    "children" | "transition" | "initial" | "animate" | "exit"
  > {
  texts: string[];
  transition?: Transition;
  initial?: boolean | Target | VariantLabels;
  animate?: boolean | VariantLabels | AnimationControls | TargetAndTransition;
  exit?: Target | VariantLabels;
  animatePresenceMode?: "sync" | "wait";
  animatePresenceInitial?: boolean;
  rotationInterval?: number;
  staggerDuration?: number;
  staggerFrom?: "first" | "last" | "center" | "random" | number;
  loop?: boolean;
  auto?: boolean;
  splitBy?: "characters" | "words" | "lines" | string;
  onNext?: (index: number) => void;
  mainClassName?: string;
  splitLevelClassName?: string;
  elementLevelClassName?: string;
}

const RotatingText = forwardRef<RotatingTextRef, RotatingTextProps>(
  (
    {
      texts,
      transition = { type: "spring", damping: 25, stiffness: 300 },
      initial = { y: "100%", opacity: 0 },
      animate = { y: 0, opacity: 1 },
      exit = { y: "-120%", opacity: 0 },
      animatePresenceMode = "wait",
      animatePresenceInitial = false,
      rotationInterval = 2200,
      staggerDuration = 0.01,
      staggerFrom = "last",
      loop = true,
      auto = true,
      splitBy = "characters",
      onNext,
      mainClassName,
      splitLevelClassName,
      elementLevelClassName,
      ...rest
    },
    ref
  ) => {
    const [currentTextIndex, setCurrentTextIndex] = useState<number>(0);

    const splitIntoCharacters = (text: string): string[] => {
      if (typeof Intl !== "undefined" && Intl.Segmenter) {
        try {
           const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
           return Array.from(segmenter.segment(text), (segment) => segment.segment);
        } catch (error) {
           console.error("Intl.Segmenter failed, falling back to simple split:", error);
           return text.split('');
        }
      }
      return text.split('');
    };

    const elements = useMemo(() => {
        const currentText: string = texts[currentTextIndex] ?? '';
        if (splitBy === "characters") {
            const words = currentText.split(/(\s+)/);
            let charCount = 0;
            return words.filter(part => part.length > 0).map((part) => {
                const isSpace = /^\s+$/.test(part);
                const chars = isSpace ? [part] : splitIntoCharacters(part);
                const startIndex = charCount;
                charCount += chars.length;
                return { characters: chars, isSpace: isSpace, startIndex: startIndex };
            });
        }
        if (splitBy === "words") {
            return currentText.split(/(\s+)/).filter(word => word.length > 0).map((word, i) => ({
                characters: [word], isSpace: /^\s+$/.test(word), startIndex: i
            }));
        }
        if (splitBy === "lines") {
            return currentText.split('\n').map((line, i) => ({
                characters: [line], isSpace: false, startIndex: i
            }));
        }
        return currentText.split(splitBy).map((part, i) => ({
            characters: [part], isSpace: false, startIndex: i
        }));
    }, [texts, currentTextIndex, splitBy]);

    const totalElements = useMemo(() => elements.reduce((sum, el) => sum + el.characters.length, 0), [elements]);

    const getStaggerDelay = useCallback(
      (index: number, total: number): number => {
        if (total <= 1 || !staggerDuration) return 0;
        const stagger = staggerDuration;
        switch (staggerFrom) {
          case "first": return index * stagger;
          case "last": return (total - 1 - index) * stagger;
          case "center": {
            const center = (total - 1) / 2;
            return Math.abs(center - index) * stagger;
          }
          case "random": return Math.random() * (total - 1) * stagger;
          default:
            if (typeof staggerFrom === 'number') {
              const fromIndex = Math.max(0, Math.min(staggerFrom, total - 1));
              return Math.abs(fromIndex - index) * stagger;
            }
            return index * stagger;
        }
      },
      [staggerFrom, staggerDuration]
    );

    const handleIndexChange = useCallback(
      (newIndex: number) => {
        setCurrentTextIndex(newIndex);
        onNext?.(newIndex);
      },
      [onNext]
    );

    const next = useCallback(() => {
      const nextIndex = currentTextIndex === texts.length - 1 ? (loop ? 0 : currentTextIndex) : currentTextIndex + 1;
      if (nextIndex !== currentTextIndex) handleIndexChange(nextIndex);
    }, [currentTextIndex, texts.length, loop, handleIndexChange]);

    const previous = useCallback(() => {
      const prevIndex = currentTextIndex === 0 ? (loop ? texts.length - 1 : currentTextIndex) : currentTextIndex - 1;
      if (prevIndex !== currentTextIndex) handleIndexChange(prevIndex);
    }, [currentTextIndex, texts.length, loop, handleIndexChange]);

    const jumpTo = useCallback(
      (index: number) => {
        const validIndex = Math.max(0, Math.min(index, texts.length - 1));
        if (validIndex !== currentTextIndex) handleIndexChange(validIndex);
      },
      [texts.length, currentTextIndex, handleIndexChange]
    );

    const reset = useCallback(() => {
       if (currentTextIndex !== 0) handleIndexChange(0);
    }, [currentTextIndex, handleIndexChange]);

    useImperativeHandle(ref, () => ({ next, previous, jumpTo, reset }), [next, previous, jumpTo, reset]);

    useEffect(() => {
      if (!auto || texts.length <= 1) return;
      const intervalId = setInterval(next, rotationInterval);
      return () => clearInterval(intervalId);
    }, [next, rotationInterval, auto, texts.length]);

    return (
      <motion.span
        className={cn("inline-flex flex-wrap whitespace-pre-wrap relative align-bottom pb-[10px]", mainClassName)}
        {...rest}
        layout
      >
        <span className="sr-only">{texts[currentTextIndex]}</span>
        <AnimatePresence mode={animatePresenceMode} initial={animatePresenceInitial}>
          <motion.div
            key={currentTextIndex}
            className={cn(
               "inline-flex flex-wrap relative",
               splitBy === "lines" ? "flex-col items-start w-full" : "flex-row items-baseline"
            )}
            layout
            aria-hidden="true"
            initial="initial"
            animate="animate"
            exit="exit"
          >
             {elements.map((elementObj, elementIndex) => (
                <span
                    key={elementIndex}
                    className={cn("inline-flex", splitBy === 'lines' ? 'w-full' : '', splitLevelClassName)}
                    style={{ whiteSpace: 'pre' }}
                >
                    {elementObj.characters.map((char, charIndex) => {
                        const globalIndex = elementObj.startIndex + charIndex;
                        return (
                            <motion.span
                                key={`${char}-${charIndex}`}
                                initial={initial}
                                animate={animate}
                                exit={exit}
                                transition={{
                                    ...transition,
                                    delay: getStaggerDelay(globalIndex, totalElements),
                                }}
                                className={cn("inline-block leading-none tracking-tight", elementLevelClassName)}
                            >
                                {char === ' ' ? '\u00A0' : char}
                            </motion.span>
                        );
                     })}
                </span>
             ))}
          </motion.div>
        </AnimatePresence>
      </motion.span>
    );
  }
);
RotatingText.displayName = "RotatingText";

const ShinyText: React.FC<{ text: string }> = ({ text }) => (
    <span style={{
        position: 'relative',
        overflow: 'hidden',
        display: 'inline-block',
        backgroundColor: '#1a1a1a',
        border: '1px solid #374151',
        color: '#0CF2A0',
        padding: '4px 16px',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 500,
        cursor: 'pointer',
    }}>
        {text}
        <span style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            animation: 'shine 2s infinite linear',
            opacity: 0.5,
            pointerEvents: 'none'
        }} />
        <style>{`
            @keyframes shine {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }
        `}</style>
    </span>
);

const ChevronDownIcon: React.FC<SVGProps<SVGSVGElement> & { isOpen?: boolean }> = ({ isOpen, ...props }) => (
   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
     style={{ width: '12px', height: '12px', marginLeft: '4px', display: 'inline-block', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}
     {...props}>
     <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
   </svg>
);

const MenuIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);

const CloseIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);

const ExternalLinkIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-1 opacity-70 group-hover:opacity-100 transition-opacity" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
  </svg>
);

interface NavLinkProps {
    href?: string;
    children: ReactNode;
    hasDropdown?: boolean;
    isDropdownOpen?: boolean;
    className?: string;
    onClick?: (event: ReactMouseEvent<HTMLAnchorElement>) => void;
}

const NavLink: React.FC<NavLinkProps> = ({ href = "#", children, hasDropdown = false, isDropdownOpen = false, onClick }) => (
   <motion.a
     href={href}
     onClick={onClick}
     style={{ position: 'relative', fontSize: '0.875rem', fontWeight: 500, color: '#d1d5db', textDecoration: 'none', display: 'flex', alignItems: 'center', padding: '4px 0', cursor: 'pointer', transition: 'color 0.2s' }}
     whileHover={{ color: '#ffffff' }}
     whileTap={{ scale: 0.98 }}
   >
     {children}
     {hasDropdown && <ChevronDownIcon isOpen={isDropdownOpen} />}
     {!hasDropdown && (
         <motion.div
           style={{ position: 'absolute', bottom: '-2px', left: 0, right: 0, height: '1px', backgroundColor: '#0CF2A0', scaleX: 0 }}
           whileHover={{ scaleX: 1 }}
           transition={{ duration: 0.3, ease: "easeOut" }}
         />
     )}
   </motion.a>
 );

interface DropdownMenuProps {
    children: ReactNode;
    isOpen: boolean;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ children, isOpen }) => (
   <AnimatePresence>
     {isOpen && (
       <motion.div
         initial={{ opacity: 0, y: 10, scale: 0.95 }}
         animate={{ opacity: 1, y: 0, scale: 1 }}
         exit={{ opacity: 0, y: 10, scale: 0.95, transition: { duration: 0.15 } }}
         transition={{ duration: 0.2, ease: "easeOut" }}
         style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '8px', width: '224px', transformOrigin: 'top', zIndex: 40 }}
       >
           <div style={{ backgroundColor: '#111111', border: '1px solid rgba(55,65,81,0.5)', borderRadius: '6px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.4)', padding: '8px' }}>
               {children}
           </div>
       </motion.div>
     )}
   </AnimatePresence>
);

interface DropdownItemProps {
    href?: string;
    children: ReactNode;
    icon?: React.ReactElement<SVGProps<SVGSVGElement>>;
}

const DropdownItem: React.FC<DropdownItemProps> = ({ href = "#", children, icon }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', padding: '8px 12px', fontSize: '0.875rem',
        color: hovered ? '#ffffff' : '#d1d5db',
        backgroundColor: hovered ? 'rgba(55,65,81,0.3)' : 'transparent',
        borderRadius: '6px', transition: 'all 0.15s', textDecoration: 'none',
        cursor: 'pointer',
      }}
    >
      <span>{children}</span>
      {icon && React.cloneElement(icon, {
        style: { width: '16px', height: '16px', marginLeft: '4px', opacity: hovered ? 1 : 0.7, transition: 'opacity 0.15s', flexShrink: 0 }
      })}
    </a>
  );
};

interface Dot {
    x: number;
    y: number;
    baseColor: string;
    targetOpacity: number;
    currentOpacity: number;
    opacitySpeed: number;
    baseRadius: number;
    currentRadius: number;
}

const InteractiveHero: React.FC<{ children?: ReactNode }> = ({ children }) => {
   const canvasRef = useRef<HTMLCanvasElement>(null);
   const animationFrameId = useRef<number | null>(null);
   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
   const [openDropdown, setOpenDropdown] = useState<string | null>(null);
   const [isScrolled, setIsScrolled] = useState<boolean>(false);

   const { scrollY } = useScroll();
   useMotionValueEvent(scrollY, "change", (latest) => {
       setIsScrolled(latest > 10);
   });

   const dotsRef = useRef<Dot[]>([]);
   const gridRef = useRef<Record<string, number[]>>({});
   const canvasSizeRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });
   const mousePositionRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null });

   const DOT_SPACING = 25;
   const BASE_OPACITY_MIN = 0.40;
   const BASE_OPACITY_MAX = 0.50;
   const BASE_RADIUS = 1;
   const INTERACTION_RADIUS = 150;
   const INTERACTION_RADIUS_SQ = INTERACTION_RADIUS * INTERACTION_RADIUS;
   const OPACITY_BOOST = 0.6;
   const RADIUS_BOOST = 2.5;
   const GRID_CELL_SIZE = Math.max(50, Math.floor(INTERACTION_RADIUS / 1.5));

   const handleMouseMove = useCallback((event: globalThis.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) {
            mousePositionRef.current = { x: null, y: null };
            return;
        }
        const rect = canvas.getBoundingClientRect();
        const canvasX = event.clientX - rect.left;
        const canvasY = event.clientY - rect.top;
        mousePositionRef.current = { x: canvasX, y: canvasY };
   }, []);

   const createDots = useCallback(() => {
       const { width, height } = canvasSizeRef.current;
       if (width === 0 || height === 0) return;

       const newDots: Dot[] = [];
       const newGrid: Record<string, number[]> = {};
       const cols = Math.ceil(width / DOT_SPACING);
       const rows = Math.ceil(height / DOT_SPACING);

       for (let i = 0; i < cols; i++) {
           for (let j = 0; j < rows; j++) {
               const x = i * DOT_SPACING + DOT_SPACING / 2;
               const y = j * DOT_SPACING + DOT_SPACING / 2;
               const cellX = Math.floor(x / GRID_CELL_SIZE);
               const cellY = Math.floor(y / GRID_CELL_SIZE);
               const cellKey = `${cellX}_${cellY}`;

               if (!newGrid[cellKey]) {
                   newGrid[cellKey] = [];
               }

               const dotIndex = newDots.length;
               newGrid[cellKey].push(dotIndex);

               const baseOpacity = Math.random() * (BASE_OPACITY_MAX - BASE_OPACITY_MIN) + BASE_OPACITY_MIN;
               newDots.push({
                   x,
                   y,
                   baseColor: `rgba(87, 220, 205, ${BASE_OPACITY_MAX})`,
                   targetOpacity: baseOpacity,
                   currentOpacity: baseOpacity,
                   opacitySpeed: (Math.random() * 0.005) + 0.002,
                   baseRadius: BASE_RADIUS,
                   currentRadius: BASE_RADIUS,
               });
           }
       }
       dotsRef.current = newDots;
       gridRef.current = newGrid;
   }, [DOT_SPACING, GRID_CELL_SIZE, BASE_OPACITY_MIN, BASE_OPACITY_MAX, BASE_RADIUS]);

   const handleResize = useCallback(() => {
       const canvas = canvasRef.current;
       if (!canvas) return;
       const container = canvas.parentElement;
       const width = container ? container.clientWidth : window.innerWidth;
       const height = container ? container.clientHeight : window.innerHeight;

       if (canvas.width !== width || canvas.height !== height ||
           canvasSizeRef.current.width !== width || canvasSizeRef.current.height !== height)
       {
           canvas.width = width;
           canvas.height = height;
           canvasSizeRef.current = { width, height };
           createDots();
       }
   }, [createDots]);

   const animateDots = useCallback(() => {
       const canvas = canvasRef.current;
       const ctx = canvas?.getContext('2d');
       const dots = dotsRef.current;
       const grid = gridRef.current;
       const { width, height } = canvasSizeRef.current;
       const { x: mouseX, y: mouseY } = mousePositionRef.current;

       if (!ctx || !dots || !grid || width === 0 || height === 0) {
           animationFrameId.current = requestAnimationFrame(animateDots);
           return;
       }

       ctx.clearRect(0, 0, width, height);

       const activeDotIndices = new Set<number>();
       if (mouseX !== null && mouseY !== null) {
           const mouseCellX = Math.floor(mouseX / GRID_CELL_SIZE);
           const mouseCellY = Math.floor(mouseY / GRID_CELL_SIZE);
           const searchRadius = Math.ceil(INTERACTION_RADIUS / GRID_CELL_SIZE);
           for (let i = -searchRadius; i <= searchRadius; i++) {
               for (let j = -searchRadius; j <= searchRadius; j++) {
                   const checkCellX = mouseCellX + i;
                   const checkCellY = mouseCellY + j;
                   const cellKey = `${checkCellX}_${checkCellY}`;
                   if (grid[cellKey]) {
                       grid[cellKey].forEach(dotIndex => activeDotIndices.add(dotIndex));
                   }
               }
           }
       }

       dots.forEach((dot, index) => {
           dot.currentOpacity += dot.opacitySpeed;
           if (dot.currentOpacity >= dot.targetOpacity || dot.currentOpacity <= BASE_OPACITY_MIN) {
               dot.opacitySpeed = -dot.opacitySpeed;
               dot.currentOpacity = Math.max(BASE_OPACITY_MIN, Math.min(dot.currentOpacity, BASE_OPACITY_MAX));
               dot.targetOpacity = Math.random() * (BASE_OPACITY_MAX - BASE_OPACITY_MIN) + BASE_OPACITY_MIN;
           }

           let interactionFactor = 0;
           dot.currentRadius = dot.baseRadius;

           if (mouseX !== null && mouseY !== null && activeDotIndices.has(index)) {
               const dx = dot.x - mouseX;
               const dy = dot.y - mouseY;
               const distSq = dx * dx + dy * dy;

               if (distSq < INTERACTION_RADIUS_SQ) {
                   const distance = Math.sqrt(distSq);
                   interactionFactor = Math.max(0, 1 - distance / INTERACTION_RADIUS);
                   interactionFactor = interactionFactor * interactionFactor;
               }
           }

           const finalOpacity = Math.min(1, dot.currentOpacity + interactionFactor * OPACITY_BOOST);
           dot.currentRadius = dot.baseRadius + interactionFactor * RADIUS_BOOST;

           const colorMatch = dot.baseColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
           const r = colorMatch ? colorMatch[1] : '87';
           const g = colorMatch ? colorMatch[2] : '220';
           const b = colorMatch ? colorMatch[3] : '205';

           ctx.beginPath();
           ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${finalOpacity.toFixed(3)})`;
           ctx.arc(dot.x, dot.y, dot.currentRadius, 0, Math.PI * 2);
           ctx.fill();
       });

       animationFrameId.current = requestAnimationFrame(animateDots);
   }, [GRID_CELL_SIZE, INTERACTION_RADIUS, INTERACTION_RADIUS_SQ, OPACITY_BOOST, RADIUS_BOOST, BASE_OPACITY_MIN, BASE_OPACITY_MAX, BASE_RADIUS]);

   useEffect(() => {
       handleResize();
       const handleMouseLeave = () => {
           mousePositionRef.current = { x: null, y: null };
       };

       window.addEventListener('mousemove', handleMouseMove, { passive: true });
       window.addEventListener('resize', handleResize);
       document.documentElement.addEventListener('mouseleave', handleMouseLeave);

       animationFrameId.current = requestAnimationFrame(animateDots);

       return () => {
           window.removeEventListener('resize', handleResize);
           window.removeEventListener('mousemove', handleMouseMove);
           document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
           if (animationFrameId.current) {
               cancelAnimationFrame(animationFrameId.current);
           }
       };
   }, [handleResize, handleMouseMove, animateDots]);

   useEffect(() => {
       if (isMobileMenuOpen) {
           document.body.style.overflow = 'hidden';
       } else {
           document.body.style.overflow = 'unset';
       }
       return () => { document.body.style.overflow = 'unset'; };
   }, [isMobileMenuOpen]);

   const headerVariants: Variants = {
       top: {
           backgroundColor: "rgba(17, 17, 17, 0.8)",
           borderBottomColor: "rgba(55, 65, 81, 0.5)",
           boxShadow: 'none',
       },
       scrolled: {
           backgroundColor: "rgba(17, 17, 17, 0.95)",
           borderBottomColor: "rgba(75, 85, 99, 0.7)",
           boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
       }
   };

   const mobileMenuVariants: Variants = {
       hidden: { opacity: 0, y: -20 },
       visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
       exit: { opacity: 0, y: -20, transition: { duration: 0.15, ease: "easeIn" } }
   };

    const contentDelay = 0.3;
    const itemDelayIncrement = 0.1;

    const bannerVariants: Variants = {
        hidden: { opacity: 0, y: -10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: contentDelay } }
    };
    const headlineVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.5, delay: contentDelay + itemDelayIncrement } }
    };
    const subHeadlineVariants: Variants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: contentDelay + itemDelayIncrement * 2 } }
    };
    const formVariants: Variants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: contentDelay + itemDelayIncrement * 3 } }
    };
    const trialTextVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.5, delay: contentDelay + itemDelayIncrement * 4 } }
    };
    const worksWithVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.5, delay: contentDelay + itemDelayIncrement * 5 } }
    };
    const imageVariants: Variants = {
        hidden: { opacity: 0, scale: 0.95, y: 20 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.6, delay: contentDelay + itemDelayIncrement * 6, ease: [0.16, 1, 0.3, 1] } }
    };

  return (
    <div style={{ paddingTop: '70px', position: 'relative', backgroundColor: '#111111', color: '#d1d5db', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.8 }} />
        <div style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            pointerEvents: 'none',
            background: 'linear-gradient(to bottom, transparent 0%, #111111 90%), radial-gradient(ellipse at center, transparent 40%, #111111 95%)'
        }} />

        <motion.header
            variants={headerVariants}
            initial="top"
            animate={isScrolled ? "scrolled" : "top"}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 100,
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderBottom: '1px solid',
                paddingLeft: '24px',
                paddingRight: '24px',
            }}
        >
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1280px', margin: '0 auto', height: '70px' }}>
                <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    <img src="/logo-gate.png" alt="Gate402" style={{ height: 26, width: 'auto', display: 'block' }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexGrow: 1, gap: '32px', padding: '0 16px' }} className="nav-desktop-links">
                    <NavLink href="#">Product</NavLink>
                    <NavLink href="#">Customers</NavLink>

                    <div
                        style={{ position: 'relative' }}
                        onMouseEnter={() => setOpenDropdown('channels')}
                        onMouseLeave={() => setOpenDropdown(null)}
                    >
                        <NavLink href="#" hasDropdown isDropdownOpen={openDropdown === 'channels'}>Channels</NavLink>
                        <DropdownMenu isOpen={openDropdown === 'channels'}>
                            <DropdownItem href="#">Slack</DropdownItem>
                            <DropdownItem href="#">Microsoft Teams</DropdownItem>
                            <DropdownItem href="#">Discord</DropdownItem>
                            <DropdownItem href="#">Email</DropdownItem>
                            <DropdownItem href="#">Web Chat</DropdownItem>
                        </DropdownMenu>
                    </div>

                    <div
                        style={{ position: 'relative' }}
                        onMouseEnter={() => setOpenDropdown('resources')}
                        onMouseLeave={() => setOpenDropdown(null)}
                    >
                        <NavLink href="#" hasDropdown isDropdownOpen={openDropdown === 'resources'}>Resources</NavLink>
                        <DropdownMenu isOpen={openDropdown === 'resources'}>
                            <DropdownItem href="#" icon={<ExternalLinkIcon/>}>Blog</DropdownItem>
                            <DropdownItem href="#">Guides</DropdownItem>
                            <DropdownItem href="#">Help Center</DropdownItem>
                            <DropdownItem href="#">API Reference</DropdownItem>
                        </DropdownMenu>
                    </div>

                    <NavLink href="#">Docs</NavLink>
                    <NavLink href="/pricing">Pricing</NavLink>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, gap: '24px' }}>
                    <span className="nav-desktop-links">
                        <NavLink href="/login">Sign in</NavLink>
                    </span>

                    <motion.a
                        href="/login?intent=signup"
                        style={{ backgroundColor: '#0CF2A0', color: '#111111', padding: '6px 16px', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap', display: 'inline-block' }}
                        whileHover={{ scale: 1.03, y: -1 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >
                        Sign up
                    </motion.a>

                    <motion.button
                        style={{ background: 'none', border: 'none', color: '#d1d5db', cursor: 'pointer', zIndex: 50, padding: 0 }}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="nav-mobile-toggle"
                    >
                        {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
                    </motion.button>
                </div>
            </nav>

            <style>{`
                .nav-desktop-links { display: flex; }
                .nav-mobile-toggle { display: none; }
                @media (max-width: 768px) {
                    .nav-desktop-links { display: none !important; }
                    .nav-mobile-toggle { display: block !important; }
                }
            `}</style>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        key="mobile-menu"
                        variants={mobileMenuVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            backgroundColor: 'rgba(17,17,17,0.97)',
                            backdropFilter: 'blur(12px)',
                            padding: '16px 0',
                            borderTop: '1px solid rgba(55,65,81,0.3)',
                        }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '0 24px' }}>
                            <NavLink href="#" onClick={() => setIsMobileMenuOpen(false)}>Product</NavLink>
                            <NavLink href="#" onClick={() => setIsMobileMenuOpen(false)}>Customers</NavLink>
                            <NavLink href="#" onClick={() => setIsMobileMenuOpen(false)}>Channels</NavLink>
                            <NavLink href="#" onClick={() => setIsMobileMenuOpen(false)}>Resources</NavLink>
                            <NavLink href="#" onClick={() => setIsMobileMenuOpen(false)}>Docs</NavLink>
                            <NavLink href="/pricing" onClick={() => setIsMobileMenuOpen(false)}>Pricing</NavLink>
                            <hr style={{ width: '100%', border: 'none', borderTop: '1px solid rgba(55,65,81,0.3)', margin: '4px 0' }}/>
                            <NavLink href="/login" onClick={() => setIsMobileMenuOpen(false)}>Sign in</NavLink>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>

        <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '48px 16px 80px', position: 'relative', zIndex: 10 }}>

            <motion.div
                variants={bannerVariants}
                initial="hidden"
                animate="visible"
                style={{ marginBottom: '24px' }}
            >
                <ShinyText text="First payment settled in 400ms." />
            </motion.div>

            <motion.h1
                variants={headlineVariants}
                initial="hidden"
                animate="visible"
                className="text-4xl sm:text-5xl lg:text-[64px] font-semibold text-white leading-tight max-w-4xl"
                style={{ marginBottom: '16px' }}
            >
                Monetize your<br />
                <span style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom' }}>
                    <RotatingText
                        texts={['API.', 'MCP.', 'agent tool.']}
                        mainClassName="text-[#0CF2A0] mx-1"
                        staggerFrom={"last"}
                        initial={{ y: "-100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "110%", opacity: 0 }}
                        staggerDuration={0.01}
                        transition={{ type: "spring", damping: 18, stiffness: 250 }}
                        rotationInterval={2200}
                        splitBy="characters"
                        auto={true}
                        loop={true}
                    />
                </span>
            </motion.h1>

            <motion.p
                variants={subHeadlineVariants}
                initial="hidden"
                animate="visible"
                className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-2xl"
                style={{ margin: '0 auto 32px' }}
            >
                Drop-in billing for AI agents. Agents pay you in USDC on Solana, no banks, no credit cards, no humans.
            </motion.p>

            <motion.div
                variants={formVariants}
                initial="hidden"
                animate="visible"
                style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '40px', flexWrap: 'wrap' }}
            >
                <motion.a
                    href="/docs"
                    style={{ backgroundColor: 'transparent', color: '#fff', padding: '10px 24px', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 500, border: '1px solid #374151', cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                    View docs
                </motion.a>
                <motion.a
                    href="/post-login"
                    style={{ backgroundColor: '#0CF2A0', color: '#111111', padding: '10px 24px', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, border: 'none', cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                    Start free
                </motion.a>
            </motion.div>

            <motion.div
                variants={worksWithVariants}
                initial="hidden"
                animate="visible"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '40px' }}
            >
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.05em', fontWeight: 500 }}>Backed by</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '28px' }}>
                    <img src="/logos/google.png" alt="Google" style={{ height: 24, width: 'auto', opacity: 0.85, objectFit: 'contain' }} />
<img src="/logos/stripe.png" alt="Stripe" style={{ height: 24, width: 'auto', opacity: 0.85, objectFit: 'contain' }} />
                    <img src="/logos/coinbase.png" alt="Coinbase" style={{ height: 24, width: 'auto', opacity: 0.85, objectFit: 'contain' }} />
                    <img src="/logos/microsoft.webp" alt="Microsoft" style={{ height: 24, width: 'auto', opacity: 0.85, objectFit: 'contain' }} />
                </div>
            </motion.div>

            {children && (
                <motion.div
                    variants={imageVariants}
                    initial="hidden"
                    animate="visible"
                    style={{ width: '100%', maxWidth: '896px', margin: '0 auto', padding: '0 16px' }}
                >
                    {children}
                </motion.div>
            )}
        </main>
    </div>
  );
};

export default InteractiveHero;
