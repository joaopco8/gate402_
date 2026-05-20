"use client"

import { cn } from "@/lib/utils"
import { CardContent } from "@/components/ui/card";
import { TbHeartPlus } from "react-icons/tb";
import { SiSolana } from "react-icons/si";
import { Link2Icon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const Highlight = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <span
      className={cn(
        "font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-700/[0.2] dark:text-emerald-500 px-1 py-0.5",
        className
      )}
    >
      {children}
    </span>
  );
};


const CARDS = [
  {
    id: 0,
    name: "Provider side — 3 lines. Done.",
    designation: "",
    content: (
      <div style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: 10.5, lineHeight: 1.6, color: '#a3e635', background: '#1a1a1a', borderRadius: 8, padding: '8px 10px', overflow: 'hidden' }}>
        <span style={{ color: '#6b7280' }}>{'// 3 lines to monetize your API'}</span>{'\n'}
        <span style={{ color: '#818cf8' }}>import</span>{' { gate402 } '}<span style={{ color: '#818cf8' }}>from</span>{' '}<span style={{ color: '#86efac' }}>&apos;gate402&apos;</span>{'\n\n'}
        <span style={{ color: '#f472b6' }}>app</span><span style={{ color: '#e5e7eb' }}>.use(gate402({'{'}</span>{'\n'}
        {'  '}<span style={{ color: '#e5e7eb' }}>endpoints: {'{'} </span><span style={{ color: '#86efac' }}>&apos;/api/analyze&apos;</span><span style={{ color: '#e5e7eb' }}>: </span><span style={{ color: '#fb923c' }}>0.005</span><span style={{ color: '#e5e7eb' }}> {'}'}</span>{'\n'}
        <span style={{ color: '#e5e7eb' }}>{'}))'}</span>{'\n\n'}
        <span style={{ color: '#f472b6' }}>app</span><span style={{ color: '#e5e7eb' }}>.post(</span><span style={{ color: '#86efac' }}>&apos;/api/analyze&apos;</span><span style={{ color: '#e5e7eb' }}>, (req, res) </span><span style={{ color: '#818cf8' }}>=&gt;</span><span style={{ color: '#e5e7eb' }}> {'{'}</span>{'\n'}
        {'  '}<span style={{ color: '#e5e7eb' }}>res.json(analyzeData(req.body))</span>{'\n'}
        <span style={{ color: '#e5e7eb' }}>{'})'}</span>
      </div>
    ),
  },
  {
    id: 1,
    name: "MCP side — per-tool pricing.",
    designation: "",
    content: (
      <div style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: 10.5, lineHeight: 1.6, color: '#a3e635', background: '#1a1a1a', borderRadius: 8, padding: '8px 10px', overflow: 'hidden' }}>
        <span style={{ color: '#6b7280' }}>{'// Charge per tool call on your MCP server'}</span>{'\n'}
        <span style={{ color: '#818cf8' }}>import</span>{' { gate402MCP } '}<span style={{ color: '#818cf8' }}>from</span>{' '}<span style={{ color: '#86efac' }}>&apos;gate402&apos;</span>{'\n\n'}
        <span style={{ color: '#f472b6' }}>app</span><span style={{ color: '#e5e7eb' }}>.use(gate402MCP({'{'}</span>{'\n'}
        {'  '}<span style={{ color: '#e5e7eb' }}>defaultToolPrice: </span><span style={{ color: '#fb923c' }}>0.001</span><span style={{ color: '#e5e7eb' }}>,</span>{'\n'}
        {'  '}<span style={{ color: '#e5e7eb' }}>toolPricing: {'{'}</span>{'\n'}
        {'    '}<span style={{ color: '#86efac' }}>&apos;search_legal&apos;</span><span style={{ color: '#e5e7eb' }}>:     </span><span style={{ color: '#fb923c' }}>0.005</span><span style={{ color: '#e5e7eb' }}>,</span>{'\n'}
        {'    '}<span style={{ color: '#86efac' }}>&apos;analyze_contract&apos;</span><span style={{ color: '#e5e7eb' }}>: </span><span style={{ color: '#fb923c' }}>0.020</span><span style={{ color: '#e5e7eb' }}>,</span>{'\n'}
        {'  '}<span style={{ color: '#e5e7eb' }}>{'}'}</span>{'\n'}
        <span style={{ color: '#e5e7eb' }}>{'}))'}</span>{'\n\n'}
        <span style={{ color: '#6b7280' }}>{'// tools/call → charged'}</span>{'\n'}
        <span style={{ color: '#6b7280' }}>{'// initialize → free'}</span>{'\n'}
        <span style={{ color: '#6b7280' }}>{'// tools/list → free'}</span>
      </div>
    ),
  },
  {
    id: 2,
    name: "Agent side — pays itself.",
    designation: "",
    content: (
      <div style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: 10.5, lineHeight: 1.6, color: '#a3e635', background: '#1a1a1a', borderRadius: 8, padding: '8px 10px', overflow: 'hidden' }}>
        <span style={{ color: '#6b7280' }}>{'// Agent pays automatically on HTTP 402'}</span>{'\n'}
        <span style={{ color: '#818cf8' }}>import</span>{' { Gate402Agent } '}<span style={{ color: '#818cf8' }}>from</span>{' '}<span style={{ color: '#86efac' }}>&apos;gate402-agent&apos;</span>{'\n\n'}
        <span style={{ color: '#818cf8' }}>const</span>{' agent = '}<span style={{ color: '#818cf8' }}>new</span>{' '}<span style={{ color: '#f472b6' }}>Gate402Agent</span><span style={{ color: '#e5e7eb' }}>({'{'}</span>{'\n'}
        {'  '}<span style={{ color: '#e5e7eb' }}>privateKey: process.env.</span><span style={{ color: '#fb923c' }}>AGENT_WALLET_KEY</span><span style={{ color: '#e5e7eb' }}>,</span>{'\n'}
        {'  '}<span style={{ color: '#e5e7eb' }}>limits: {'{ '}</span><span style={{ color: '#e5e7eb' }}>maxPerDay: </span><span style={{ color: '#fb923c' }}>10.00</span><span style={{ color: '#e5e7eb' }}>{' }'}</span>{'\n'}
        <span style={{ color: '#e5e7eb' }}>{'})' }</span>{'\n\n'}
        <span style={{ color: '#818cf8' }}>const</span>{' data = '}<span style={{ color: '#818cf8' }}>await</span>{' agent.'}<span style={{ color: '#f472b6' }}>fetch</span><span style={{ color: '#e5e7eb' }}>({'('}</span>{'\n'}
        {'  '}<span style={{ color: '#86efac' }}>&apos;https://api.meuservico.dev/analyze&apos;</span>{'\n'}
        <span style={{ color: '#e5e7eb' }}>{')' }</span>{'\n'}
        <span style={{ color: '#6b7280' }}>{'// Paid 0.00495 USDC. Received data.'}</span>
      </div>
    ),
  },
];


const integrations = [
  {
    name: "Solana + USDC",
    desc: "Settlement in 400ms. Fees under $0.001. The only chain where micropayments make sense.",
    icon: <SiSolana className="w-4 h-4 sm:w-5 sm:h-5 text-[#9945FF]" />,
  },
  {
    name: "x402 Protocol",
    desc: "The open standard backed by Google, Cloudflare, Stripe, and Coinbase. Gate402 is production-ready today.",
    icon: <Link2Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#00bc7d]" />,
  },
];


export default function RuixenSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 relative">
        {/* Left Block */}
        <div className="flex flex-col items-start justify-center border border-white/[0.06] p-4 sm:p-6 lg:p-8">
          {/* Card */}
          <div className="relative w-full mb-4 sm:mb-6">
<CardStack items={CARDS} />
          </div>

          {/* Content */}
          <h3 className="text-lg sm:text-xl lg:text-2xl font-normal text-white leading-relaxed">
            Real-time Payment Dashboard <span className="text-primary">gate402</span>{" "}
            <span className="text-sm sm:text-base lg:text-lg" style={{ color: '#888' }}> Every USDC that lands in your wallet appears here the moment it arrives. No refresh. No delay. No intermediary.</span>
          </h3>
        </div>

        {/* Right Block */}
        <div className="flex flex-col items-center justify-start border border-white/[0.06] p-4 sm:p-6 lg:p-8">
          {/* Content */}
          <h3 className="text-lg sm:text-xl lg:text-2xl font-normal text-white mb-4 sm:mb-6 leading-relaxed">
            The x402 ecosystem is already in production.{" "}
            <span className="text-sm sm:text-base lg:text-lg" style={{ color: '#888' }}> Gate402 connects your API to every agent, framework, and runtime that speaks the x402 protocol.</span>
          </h3>
          <div className="mt-auto w-full">
            {/* Integration List */}
            <CardContent className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 border border-white/[0.06] rounded-2xl sm:rounded-3xl z-10 w-full" style={{ background: '#1a1a1a' }}>
              {integrations.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 sm:p-3 border border-white/[0.06] rounded-xl sm:rounded-2xl hover:bg-muted/50 transition"
                >
                  <div className="flex items-center gap-2 sm:gap-3 flex-1">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-muted flex items-center justify-center text-sm sm:text-lg flex-shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1 sm:line-clamp-2">{item.desc}</p>
                    </div>
                  </div>
                  <button className="rounded-full border border-white/[0.06] p-1.5 sm:p-2 text-xs font-semibold flex-shrink-0 ml-2"><TbHeartPlus className="w-3 h-3 sm:w-4 sm:h-4" /></button>
                </div>
              ))}
            </CardContent>
          </div>
        </div>
      </div>

      {/* Stats and Testimonial Section */}
      <div className="mt-12 sm:mt-16 lg:mt-20 grid gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
        <div className="flex justify-center items-center p-4 sm:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 w-full sm:divide-x divide-gray-200 dark:divide-gray-700">
            {[
              { value: "3",     label: "lines",      sub: "of code"    },
              { value: "400ms", label: "settlement",  sub: "on Solana"  },
              { value: "1%",    label: "platform",    sub: "fee only"   },
              { value: "MIT",   label: "licensed",    sub: "open source"},
            ].map((item, i) => (
              <div
                key={item.value}
                className={[
                  "flex flex-col items-center px-4 py-4 sm:py-0 space-y-1 text-center",
                  i >= 2 ? "border-t border-gray-200 dark:border-gray-700 sm:border-t-0" : "",
                ].join(" ")}
              >
                <div className="text-2xl sm:text-3xl lg:text-4xl font-medium text-white">{item.value}</div>
                <p className="text-xs sm:text-sm font-medium" style={{ color: '#aaa' }}>{item.label}</p>
                <p className="text-xs" style={{ color: '#666' }}>{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <blockquote className="border-l-2 border-white/[0.06] pl-4 sm:pl-6 lg:pl-8" style={{ color: '#aaa' }}>
            <p className="text-sm sm:text-base lg:text-lg leading-relaxed">
              &ldquo;The agentic economy needs a payment layer.<br />
              HTTP 402 has existed since 1991.<br />
              Gate402 is what finally makes it real.&rdquo;
            </p>
            <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
              <cite className="block font-medium text-sm sm:text-base text-white not-italic">
                — The infrastructure the internet forgot to build,<br />
                <span className="font-normal" style={{ color: '#666' }}>until agents made it necessary.</span>
              </cite>
            </div>
          </blockquote>
        </div>
      </div>
    </section>
  )
}

let interval: ReturnType<typeof setInterval>;

type Card = {
  id: number;
  name: string;
  designation: string;
  content: React.ReactNode;
};

export const CardStack = ({
  items,
  offset,
  scaleFactor,
}: {
  items: Card[];
  offset?: number;
  scaleFactor?: number;
}) => {
  const CARD_OFFSET = offset || 10;
  const SCALE_FACTOR = scaleFactor || 0.06;
  const [cards, setCards] = useState<Card[]>(items);

  useEffect(() => {
    startFlipping();

    return () => clearInterval(interval);
  }, []);
  const startFlipping = () => {
    interval = setInterval(() => {
      setCards((prevCards: Card[]) => {
        const newArray = [...prevCards];
        newArray.unshift(newArray.pop()!);
        return newArray;
      });
    }, 5000);
  };

  return (
    <div className="relative mx-auto h-48 w-full md:h-48 md:w-96 my-4">

      {cards.map((card, index) => {
        return (
          <motion.div
            key={card.id}
            className="absolute h-48 w-full md:h-48 md:w-96 rounded-3xl p-4 shadow-xl border border-white/[0.08] flex flex-col justify-between"
            style={{
              transformOrigin: "top center",
              background: '#1a1a1a',
            }}
            animate={{
              top: index * -CARD_OFFSET,
              scale: 1 - index * SCALE_FACTOR,
              zIndex: cards.length - index,
            }}
          >
            <div className="font-normal text-neutral-700 dark:text-neutral-200">
              {card.content}
            </div>
            <div>
              <p className="text-neutral-500 font-medium dark:text-white">
                {card.name}
              </p>
              <p className="text-neutral-400 font-normal dark:text-neutral-200">
                {card.designation}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
