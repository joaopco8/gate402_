'use client';

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, DollarSign, Zap, TrendingUp } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import DashboardLayout from '../components/DashboardLayout';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import { getMetrics, getCallsPerDay, getRecentCalls, getEndpoints, getEndpointRevenue, getTransactions, type Metrics, type DayData, type RecentCall, type Transaction, type TransactionStats } from '../lib/api';

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
  const [animated, setAnimated] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txStats, setTxStats] = useState<TransactionStats>({ totalGross: 0, totalNet: 0, totalFeesPaid: 0, transactionCount: 0 });

  async function fetchAll() {
    const [m, c, r, endpointList, rev, txData] = await Promise.all([
      getMetrics(),
      getCallsPerDay(7, selectedEndpoint),
      getRecentCalls(),
      getEndpoints(),
      getEndpointRevenue(),
      getTransactions(),
    ]);
    setMetrics(m);
    setChartData(c);
    setRecentCalls(r);
    setEndpointRevenue(Array.isArray(rev) ? rev : []);
    setTransactions(txData.transactions ?? []);
    setTxStats(txData.stats ?? { totalGross: 0, totalNet: 0, totalFeesPaid: 0, transactionCount: 0 });
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

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

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

        {/* Revenue by Endpoint */}
        {!loading && (
          <Card style={{ padding: '24px 28px', marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: '#333', fontFamily: 'var(--font-code)', letterSpacing: '0.1em' }}>
                REVENUE BY ENDPOINT
              </div>
              <div style={{ fontSize: 12, color: '#333', fontFamily: 'var(--font-code)' }}>
                {endpointRevenue.length} endpoint{endpointRevenue.length !== 1 ? 's' : ''}
              </div>
            </div>
            {endpointRevenue.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '32px 0',
                fontFamily: 'var(--font-code)',
                fontSize: 13,
                color: '#333',
              }}>
                No endpoints with revenue yet
              </div>
            ) : (() => {
              const barColors = ['#00ff88', '#9945FF', '#3b82f6', '#f59e0b', '#666'];
              const total = endpointRevenue.reduce((sum, e) => sum + e.value, 0);
              return endpointRevenue.map((ep, i) => {
                const percentage = total > 0 ? Math.round((ep.value / total) * 100) : 0;
                const color = barColors[Math.min(i, barColors.length - 1)];
                return (
                  <div
                    key={ep.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: '12px 0',
                      borderBottom: '1px solid #0d0d0d',
                    }}
                  >
                    <div style={{
                      fontFamily: 'var(--font-code)',
                      fontSize: 13,
                      color: '#666',
                      width: 160,
                      flexShrink: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {ep.name}
                    </div>
                    <div style={{
                      flex: 1,
                      height: 4,
                      background: '#0d0d0d',
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: animated ? `${percentage}%` : '0%',
                        background: color,
                        borderRadius: 2,
                        transition: 'width 600ms ease',
                      }} />
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      flexShrink: 0,
                    }}>
                      <span style={{
                        fontFamily: 'var(--font-code)',
                        fontSize: 12,
                        color: color,
                      }}>
                        ${ep.value.toFixed(4)}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-code)',
                        fontSize: 11,
                        color: '#333',
                        width: 36,
                        textAlign: 'right',
                      }}>
                        {percentage}%
                      </span>
                    </div>
                  </div>
                );
              });
            })()}
          </Card>
        )}

        {/* Revenue Breakdown */}
        {!loading && (
          <Card style={{ padding: '24px 28px', marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: '#333', fontFamily: 'var(--font-code)', letterSpacing: '0.1em' }}>REVENUE BREAKDOWN</div>
              <div style={{ fontSize: 10, color: '#333', fontFamily: 'var(--font-code)' }}>1% platform fee on each transaction</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {[
                { label: 'Gross Revenue', value: txStats.totalGross, color: '#fff' },
                { label: 'Net Revenue', value: txStats.totalNet, color: '#00ff88' },
                { label: 'Platform Fees', value: txStats.totalFeesPaid, color: '#666' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 6, padding: '16px 20px' }}>
                  <div style={{ fontSize: 10, color: '#333', fontFamily: 'var(--font-code)', letterSpacing: '0.08em', marginBottom: 10 }}>{label.toUpperCase()}</div>
                  <div style={{ fontSize: 24, fontWeight: 300, color, fontFamily: 'var(--font-code)', letterSpacing: '-0.02em' }}>
                    ${value.toFixed(4)}
                  </div>
                  <div style={{ fontSize: 10, color: '#333', fontFamily: 'var(--font-code)', marginTop: 4 }}>USDC</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Recent Transactions */}
        {!loading && transactions.length > 0 && (
          <Card style={{ overflow: 'hidden', padding: 0, marginBottom: 24 }}>
            <div style={{ padding: '16px 28px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-code)', letterSpacing: '0.08em' }}>RECENT TRANSACTIONS</div>
              <div style={{ fontSize: 11, color: '#333', fontFamily: 'var(--font-code)' }}>{txStats.transactionCount} total</div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Endpoint', 'Gross', 'Net (yours)', 'Fee (1%)', 'Status', 'Time'].map(h => (
                    <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontWeight: 400, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-code)', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 10).map(tx => (
                  <tr
                    key={tx.id}
                    style={{ borderBottom: '1px solid var(--border)', transition: 'background 150ms' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '12px 20px', color: '#fff', fontFamily: 'var(--font-code)', fontSize: 12 }}>{tx.endpoint}</td>
                    <td style={{ padding: '12px 20px', color: '#666', fontFamily: 'var(--font-code)', fontSize: 12 }}>${tx.totalAmount.toFixed(4)}</td>
                    <td style={{ padding: '12px 20px', color: '#00ff88', fontFamily: 'var(--font-code)', fontSize: 12 }}>${tx.providerAmount.toFixed(4)}</td>
                    <td style={{ padding: '12px 20px', color: '#444', fontFamily: 'var(--font-code)', fontSize: 12 }}>${tx.platformFee.toFixed(6)}</td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontFamily: 'var(--font-code)',
                        background: tx.status === 'verified' ? 'rgba(0,255,136,0.08)' : tx.status === 'demo' ? 'rgba(153,69,255,0.08)' : 'rgba(255,255,255,0.04)',
                        color: tx.status === 'verified' ? '#00ff88' : tx.status === 'demo' ? '#9945FF' : '#666',
                        border: `1px solid ${tx.status === 'verified' ? 'rgba(0,255,136,0.2)' : tx.status === 'demo' ? 'rgba(153,69,255,0.2)' : '#1a1a1a'}`,
                      }}>
                        {tx.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 20px', color: 'var(--text-muted)', fontSize: 12 }}>{timeAgo(tx.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
