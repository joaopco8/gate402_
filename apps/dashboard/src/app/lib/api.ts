import axios from 'axios';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3001';

export interface Metrics {
  totalCalls: number;
  totalUsdc: number;
  todayCalls: number;
  todayUsdc: number;
  topEndpoint: string | null;
}

export interface DayData {
  date: string;
  calls: number;
  usdc: number;
}

export interface Endpoint {
  id: string;
  path: string;
  priceUsdc: number;
  description: string | null;
  active: boolean;
  createdAt: string;
  _count: { calls: number };
}

export interface RecentCall {
  id: string;
  txHash: string;
  amountUsdc: number;
  payerWallet: string;
  status: string;
  createdAt: string;
  endpoint: { path: string };
}

async function getUserId(): Promise<string | null> {
  const { createClient } = await import('../../../lib/supabase/client');
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function getMetrics(): Promise<Metrics> {
  try {
    const userId = await getUserId();
    const headers = userId ? { 'x-user-id': userId } : {};
    const { data } = await axios.get(`${SERVER_URL}/api/metrics`, { headers });
    return data;
  } catch {
    return { totalCalls: 0, totalUsdc: 0, todayCalls: 0, todayUsdc: 0, topEndpoint: null };
  }
}

export async function getCallsPerDay(days = 7, endpoint?: string): Promise<DayData[]> {
  try {
    const userId = await getUserId();
    const headers = userId ? { 'x-user-id': userId } : {};
    const params = new URLSearchParams({ days: days.toString() });
    if (endpoint && endpoint !== 'all') params.append('endpoint', endpoint);
    const { data } = await axios.get(`${SERVER_URL}/api/calls/per-day?${params}`, { headers });
    return data;
  } catch {
    return [];
  }
}

export async function getEndpoints(): Promise<Endpoint[]> {
  try {
    const userId = await getUserId();
    const headers = userId ? { 'x-user-id': userId } : {};
    const { data } = await axios.get(`${SERVER_URL}/api/endpoints`, { headers });
    return data;
  } catch {
    return [];
  }
}

export async function getRecentCalls(limit = 10): Promise<RecentCall[]> {
  try {
    const userId = await getUserId();
    const headers = userId ? { 'x-user-id': userId } : {};
    const { data } = await axios.get(`${SERVER_URL}/api/calls/recent?limit=${limit}`, { headers });
    return data;
  } catch {
    return [];
  }
}

export async function createEndpoint(body: { path: string; priceUsdc: number; description?: string }) {
  const userId = await getUserId();
  const headers = userId ? { 'x-user-id': userId } : {};
  const { data } = await axios.post(`${SERVER_URL}/api/endpoints`, body, { headers });
  return data;
}

export async function getEndpointRevenue(): Promise<{ name: string; value: number; calls: number }[]> {
  try {
    const userId = await getUserId();
    const headers = userId ? { 'x-user-id': userId } : {};
    const { data } = await axios.get(`${SERVER_URL}/api/endpoints/revenue`, { headers });
    return data;
  } catch {
    return [];
  }
}

export async function getAllCalls() {
  const userId = await getUserId();
  const headers = userId ? { 'x-user-id': userId } : {};
  const { data } = await axios.get(`${SERVER_URL}/api/calls/recent?limit=1000`, { headers });
  return data;
}

export interface Transaction {
  id: string;
  endpoint: string;
  totalAmount: number;
  providerAmount: number;
  platformFee: number;
  status: string;
  txHashProvider: string;
  network: string;
  createdAt: string;
}

export interface TransactionStats {
  totalGross: number;
  totalNet: number;
  totalFeesPaid: number;
  transactionCount: number;
}

export async function getTransactions(): Promise<{ transactions: Transaction[]; stats: TransactionStats }> {
  try {
    const userId = await getUserId();
    const headers = userId ? { 'x-user-id': userId } : {};
    const { data } = await axios.get(`${SERVER_URL}/api/transactions`, { headers });
    return data;
  } catch {
    return { transactions: [], stats: { totalGross: 0, totalNet: 0, totalFeesPaid: 0, transactionCount: 0 } };
  }
}

export async function toggleEndpoint(id: string, active: boolean) {
  const userId = await getUserId();
  const headers = userId ? { 'x-user-id': userId } : {};
  const { data } = await axios.patch(`${SERVER_URL}/api/endpoints/${id}`, { active }, { headers });
  return data;
}

export interface AnalyticsRevenueSummary {
  grossRevenue: number;
  netRevenue: number;
  platformFees: number;
  feeRate: number;
  transactionCount: number;
  period: string;
}

export interface SuccessRateData {
  successRate: number;
  failRate: number;
  totalCalls: number;
  confirmedCalls: number;
  failedCalls: number;
  mrrProjected: number;
  period: string;
}

export interface TopAgent {
  wallet: string | null;
  walletShort: string;
  totalPaid: number;
  netReceived: number;
  callCount: number;
}

export interface LatencyStatRow {
  endpoint: string;
  p50: number;
  p95: number;
  p99: number;
  avg: number;
  count: number;
}

export interface MeteringTypeStats {
  type: string;
  totalUsage: number;
  totalCost: number;
  count: number;
}

export interface MeteringStatsData {
  byType: MeteringTypeStats[];
  totalSettled: number;
  totalPending: number;
}

export async function getAnalyticsRevenue(period = '7d'): Promise<AnalyticsRevenueSummary | null> {
  try {
    const userId = await getUserId();
    if (!userId) return null;
    const { data } = await axios.get(`${SERVER_URL}/api/analytics/revenue?period=${period}`, {
      headers: { 'x-user-id': userId },
    });
    return data.summary ?? null;
  } catch {
    return null;
  }
}

export async function getSuccessRate(): Promise<SuccessRateData | null> {
  try {
    const userId = await getUserId();
    if (!userId) return null;
    const { data } = await axios.get(`${SERVER_URL}/api/analytics/success-rate`, {
      headers: { 'x-user-id': userId },
    });
    return data;
  } catch {
    return null;
  }
}

export async function getTopAgents(): Promise<TopAgent[]> {
  try {
    const userId = await getUserId();
    if (!userId) return [];
    const { data } = await axios.get(`${SERVER_URL}/api/analytics/top-agents`, {
      headers: { 'x-user-id': userId },
    });
    return data.agents ?? [];
  } catch {
    return [];
  }
}

export async function getLatencyStats(): Promise<LatencyStatRow[]> {
  try {
    const userId = await getUserId();
    if (!userId) return [];
    const { data } = await axios.get(`${SERVER_URL}/api/analytics/latency`, {
      headers: { 'x-user-id': userId },
    });
    return data.latency ?? [];
  } catch {
    return [];
  }
}

export async function getMeteringStats(): Promise<MeteringStatsData | null> {
  try {
    const userId = await getUserId();
    if (!userId) return null;
    const { data } = await axios.get(`${SERVER_URL}/api/metering/stats`, {
      headers: { 'x-user-id': userId },
    });
    return data;
  } catch {
    return null;
  }
}
