'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, DollarSign, Zap, TrendingUp } from 'lucide-react';
import MetricCard from './components/MetricCard';
import DashboardLayout from './components/DashboardLayout';
import PageContainer from './components/PageContainer';
import PageHeader from './components/PageHeader';
import Card from './components/Card';
import { getMetrics, getCallsPerDay, getRecentCalls, getEndpoints, getEndpointRevenue, type Metrics, type DayData, type RecentCall } from './lib/api';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function Skeleton({ width, height }: { width?: string; height?: number }) {
  return (
    <div style={{
      background: '#0d0d0d',
      border: '1px solid var(--border)',
      borderRadius: 8,
      width: width ?? '100%',
      height: height ?? 40,
      animation: 'pulse 1.5s ease-in-out infinite',
    }} />
  );
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#111', border: '1px solid #333', borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: 12 }}>
      <div style={{ color: '#888', marginBottom: 6 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color }}>
          {p.name}: {p.name === 'usdc' ? `$${p.value.toFixed(4)}` : p.value}
        </div>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [chartData, setChartData] = useState<DayData[]>([]);
  const [recentCalls, setRecentCalls] = useState<RecentCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [endpoints, setEndpoints] = useState<string[]>([]);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('all');
  const [projection, setProjection] = useState<number>(0);
  const [endpointRevenue, setEndpointRevenue] = useState<{ name: string; value: number; calls: number }[]>([]);

  async function fetchAll() {
    const [m, c, r, endpointList, rev] = await Promise.all([
      getMetrics(),
      getCallsPerDay(7, selectedEndpoint),
      getRecentCalls(),
      getEndpoints(),
      getEndpointRevenue(),
    ]);
    setMetrics(m);
    setChartData(c);
    setRecentCalls(r);
    setEndpointRevenue(Array.isArray(rev) ? rev : []);
    const paths = Array.isArray(endpointList)
      ? endpointList.map((e: { path: string }) => e.path)
      : [];
    setEndpoints(['all', ...paths]);
    const totalLast7Days = Array.isArray(c)
      ? c.reduce((sum: number, d: DayData) => sum + d.usdc, 0)
      : 0;
    setProjection((totalLast7Days / 7) * 30);
    setLoading(false);
  }

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    getCallsPerDay(7, selectedEndpoint).then(setChartData);
  }, [selectedEndpoint]);

  function exportCSV() {
    const headers = ['endpoint', 'amount_usdc', 'payer_wallet', 'tx_hash', 'status', 'created_at'];
    const rows = recentCalls.map(call => [
      call.endpoint?.path ?? '-',
      call.amountUsdc.toFixed(4),
      call.payerWallet,
      call.txHash,
      call.status,
      new Date(call.createdAt).toISOString(),
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gate402-calls-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <DashboardLayout>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
      <PageContainer>
        <PageHeader eyebrow="OVERVIEW" title="Dashboard" subtitle="Real-time billing analytics for your APIs" />

        {/* Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={i === 4 ? { gridColumn: '1 / -1' } : undefined}>
                <Skeleton height={110} />
              </div>
            ))
          ) : (
            <>
              <MetricCard title="Total Calls" value={metrics?.totalCalls ?? 0} icon={<Activity size={18} />} subtitle="All time API calls" />
              <MetricCard title="Total USDC" value={`$${(metrics?.totalUsdc ?? 0).toFixed(4)}`} icon={<DollarSign size={18} />} subtitle="All time revenue" positive />
              <MetricCard title="Calls Today" value={metrics?.todayCalls ?? 0} icon={<Zap size={18} />} subtitle="Since 00:00 UTC" />
              <MetricCard title="USDC Today" value={`$${(metrics?.todayUsdc ?? 0).toFixed(4)}`} icon={<TrendingUp size={18} />} subtitle={metrics?.topEndpoint ? `Top: ${metrics.topEndpoint}` : 'No calls yet'} positive />
              <div style={{ gridColumn: '1 / -1' }}>
                <Card accent style={{ padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-code)', letterSpacing: '0.08em', marginBottom: 6 }}>
                      MONTHLY PROJECTION
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      Based on last 7 days average
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 36, fontWeight: 300, color: 'var(--green)', letterSpacing: '-0.03em' }}>
                      ${projection.toFixed(2)}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-code)', marginTop: 4 }}>
                      USDC / MONTH
                    </div>
                  </div>
                </Card>
              </div>
            </>
          )}
        </div>

        {/* Chart */}
        <Card style={{ padding: '24px 28px', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-code)', letterSpacing: '0.08em' }}>
                LAST 7 DAYS
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {endpoints.map((ep) => (
                <button
                  key={ep}
                  onClick={() => setSelectedEndpoint(ep)}
                  style={{
                    padding: '6px 16px',
                    borderRadius: 6,
                    border: '1px solid',
                    borderColor: selectedEndpoint === ep ? 'var(--green)' : 'var(--border)',
                    background: selectedEndpoint === ep ? 'rgba(0,255,136,0.08)' : 'transparent',
                    color: selectedEndpoint === ep ? 'var(--green)' : 'var(--text-secondary)',
                    fontSize: 12,
                    fontFamily: 'var(--font-code)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    fontWeight: selectedEndpoint === ep ? 500 : 400,
                  }}
                  onMouseOver={e => {
                    if (selectedEndpoint !== ep) {
                      e.currentTarget.style.borderColor = 'var(--border-hover)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseOut={e => {
                    if (selectedEndpoint !== ep) {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  {ep === 'all' ? 'All endpoints' : ep}
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <Skeleton height={200} />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="date" stroke="#444" tick={{ fill: '#666', fontSize: 11, fontFamily: 'monospace' }} />
                <YAxis stroke="#444" tick={{ fill: '#666', fontSize: 11, fontFamily: 'monospace' }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="calls" stroke="#00ff88" strokeWidth={2} dot={false} name="calls" />
                <Line type="monotone" dataKey="usdc" stroke="#3b82f6" strokeWidth={2} dot={false} name="usdc" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Pie Chart */}
        {!loading && (
          <Card style={{ padding: '24px 28px', marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-code)', letterSpacing: '0.08em', marginBottom: 24 }}>
              REVENUE BY ENDPOINT
            </div>
            {endpointRevenue.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px 0', fontSize: 13 }}>
                No revenue data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={endpointRevenue}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    labelLine={{ stroke: '#444' }}
                  >
                    {endpointRevenue.map((_, index) => (
                      <Cell key={index} fill={['#00ff88', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`$${Number(value).toFixed(4)} USDC`, 'Revenue']}
                    contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: 8, fontFamily: 'monospace', fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        )}

        {/* Recent Calls Table */}
        <Card style={{ overflow: 'hidden', padding: 0 }}>
          <div style={{ padding: '16px 28px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-code)', letterSpacing: '0.08em' }}>
              RECENT CALLS
            </div>
            <button
              onClick={exportCSV}
              style={{
                padding: '6px 14px',
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 6,
                color: 'var(--text-secondary)',
                fontSize: 12,
                fontFamily: 'var(--font-code)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.color = 'var(--green)'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              Export CSV ↓
            </button>
          </div>
          {loading ? (
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={36} />)}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Endpoint', 'Amount (USDC)', 'Payer', 'Time'].map((h) => (
                    <th key={h} style={{ padding: '10px 28px', textAlign: 'left', fontWeight: 400, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-code)', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentCalls.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '32px 28px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No calls yet</td>
                  </tr>
                ) : recentCalls.map((call) => (
                  <tr
                    key={call.id}
                    style={{ borderBottom: '1px solid var(--border)', transition: 'background 150ms' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '14px 28px', color: 'var(--green)', fontFamily: 'var(--font-code)', fontSize: 13 }}>{call.endpoint?.path ?? '-'}</td>
                    <td style={{ padding: '14px 28px', color: 'var(--blue)', fontFamily: 'var(--font-code)', fontSize: 13 }}>${call.amountUsdc.toFixed(4)}</td>
                    <td style={{ padding: '14px 28px', color: 'var(--text-muted)', fontFamily: 'var(--font-code)', fontSize: 13 }}>{call.payerWallet.slice(0, 8)}...</td>
                    <td style={{ padding: '14px 28px', color: 'var(--text-muted)', fontSize: 13 }}>{timeAgo(call.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </PageContainer>
    </DashboardLayout>
  );
}
