"use client";

import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";

export default function FeaturedSectionStats() {
  const data = [
    { name: "Jan", value: 20 },
    { name: "Feb", value: 40 },
    { name: "Mar", value: 60 },
    { name: "Apr", value: 80 },
    { name: "May", value: 100 },
    { name: "Jun", value: 130 },
    { name: "Jul", value: 160 },
  ];

  return (
    <section className="w-full max-w-6xl mx-auto text-left py-32">
      <div className="px-4">
        <h3 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 500, lineHeight: 1.15, marginBottom: 16 }}>
          The agentic economy is already here.{" "}
          <span className="text-gray-500 dark:text-gray-400 text-sm sm:text-base lg:text-4xl">
            Agents are calling millions of APIs every day.
            None of them are paying. Until now.
          </span>
        </h3>
        <p style={{ fontSize: 16, color: '#898989', lineHeight: 1.65, marginTop: 12 }}>Metera is the missing payment layer. Here&apos;s what that looks like in production.</p>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-8">
          <div>
            <p className="text-3xl font-medium text-white">11,000+</p>
            <p className="text-sm" style={{ color: '#888' }}>MCP Servers</p>
            <p className="text-sm" style={{ color: '#555' }}>Live</p>
          </div>
          <div>
            <p className="text-3xl font-medium text-white">97M</p>
            <p className="text-sm" style={{ color: '#888' }}>Downloads/month</p>
            <p className="text-sm" style={{ color: '#555' }}>in 2026</p>
          </div>
          <div>
            <p className="text-3xl font-medium text-white">400ms</p>
            <p className="text-sm" style={{ color: '#888' }}>Settlement</p>
            <p className="text-sm" style={{ color: '#555' }}>on Solana</p>
          </div>
          <div>
            <p className="text-3xl font-medium text-white">1%</p>
            <p className="text-sm" style={{ color: '#888' }}>Platform fee</p>
            <p className="text-sm" style={{ color: '#555' }}>per payment</p>
          </div>
        </div>
      </div>

      {/* Area Chart */}
      <div className="w-full h-48 mt-8">
        <p className="px-4 text-xs text-gray-600 mb-2">MCP ecosystem growth — Jan 2025 to May 2026</p>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00bc7d" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#00bc7d" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke="#00bc7d"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorBlue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
