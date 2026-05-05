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

export async function toggleEndpoint(id: string, active: boolean) {
  const userId = await getUserId();
  const headers = userId ? { 'x-user-id': userId } : {};
  const { data } = await axios.patch(`${SERVER_URL}/api/endpoints/${id}`, { active }, { headers });
  return data;
}
