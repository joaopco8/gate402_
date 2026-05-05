'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { getEndpoints, type Endpoint } from '../lib/api';
import DashboardLayout from '../components/DashboardLayout';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3001';

export default function EndpointsPage() {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ path: '', priceUsdc: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    const data = await getEndpoints();
    setEndpoints(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await axios.post(`${SERVER_URL}/api/endpoints`, {
        path: form.path,
        priceUsdc: parseFloat(form.priceUsdc),
        description: form.description || undefined,
      });
      setForm({ path: '', priceUsdc: '', description: '' });
      await load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed to add endpoint';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(id: string, current: boolean) {
    try {
      await axios.patch(`${SERVER_URL}/api/endpoints/${id}`, { active: !current });
      await load();
    } catch {
      // silent
    }
  }

  return (
    <DashboardLayout>
      <PageContainer>
        <PageHeader eyebrow="ENDPOINTS" title="Endpoints" subtitle="Manage paywalled API routes" />

        {/* Add Form */}
        <Card style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-code)', letterSpacing: '0.1em', marginBottom: 20 }}>ADD ENDPOINT</div>
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <input
                placeholder="/api/my-endpoint"
                value={form.path}
                onChange={(e) => setForm({ ...form, path: e.target.value })}
                required
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 14px', color: 'var(--text-primary)', fontFamily: 'var(--font-code)', fontSize: 13, outline: 'none', transition: 'border-color 150ms' }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--green)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              />
              <input
                type="number"
                placeholder="Price USDC (e.g. 0.001)"
                value={form.priceUsdc}
                onChange={(e) => setForm({ ...form, priceUsdc: e.target.value })}
                step="0.0001"
                min="0.0001"
                required
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 14px', color: 'var(--text-primary)', fontFamily: 'var(--font-code)', fontSize: 13, outline: 'none', transition: 'border-color 150ms' }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--green)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              />
            </div>
            <input
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 14px', color: 'var(--text-primary)', fontFamily: 'var(--font-code)', fontSize: 13, outline: 'none', transition: 'border-color 150ms' }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--green)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
            {error && <div style={{ color: '#ff4444', fontSize: 12, fontFamily: 'var(--font-code)' }}>{error}</div>}
            <button
              type="submit"
              disabled={submitting}
              style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', color: 'var(--green)', borderRadius: 6, padding: '10px 20px', fontFamily: 'var(--font-code)', fontSize: 13, cursor: submitting ? 'not-allowed' : 'pointer', alignSelf: 'flex-start', opacity: submitting ? 0.6 : 1, transition: 'all 150ms' }}
            >
              {submitting ? 'Adding...' : 'Add Endpoint →'}
            </button>
          </form>
        </Card>

        {/* Endpoints List */}
        <Card style={{ overflow: 'hidden', padding: 0 }}>
          <div style={{ padding: '14px 24px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-code)', letterSpacing: '0.1em' }}>REGISTERED ENDPOINTS</span>
          </div>
          {loading ? (
            <div style={{ padding: 24, color: 'var(--text-muted)', fontSize: 13, fontFamily: 'var(--font-code)' }}>Loading...</div>
          ) : endpoints.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No endpoints registered</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Path', 'Price USDC', 'Total Calls', 'Status', ''].map((h) => (
                    <th key={h} style={{ padding: '10px 24px', textAlign: 'left', fontWeight: 400, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-code)', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {endpoints.map((ep) => (
                  <tr
                    key={ep.id}
                    style={{ borderBottom: '1px solid var(--border)', transition: 'background 150ms' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '14px 24px', color: 'var(--green)', fontFamily: 'var(--font-code)' }}>{ep.path}</td>
                    <td style={{ padding: '14px 24px', color: 'var(--blue)', fontFamily: 'var(--font-code)' }}>${ep.priceUsdc}</td>
                    <td style={{ padding: '14px 24px', color: 'var(--text-secondary)', fontFamily: 'var(--font-code)' }}>{ep._count.calls}</td>
                    <td style={{ padding: '14px 24px' }}>
                      <span style={{
                        background: ep.active ? 'rgba(0,255,136,0.1)' : 'rgba(255,68,68,0.1)',
                        color: ep.active ? 'var(--green)' : '#ff4444',
                        border: `1px solid ${ep.active ? 'rgba(0,255,136,0.25)' : 'rgba(255,68,68,0.25)'}`,
                        borderRadius: 4,
                        padding: '2px 10px',
                        fontSize: 11,
                        fontFamily: 'var(--font-code)',
                        letterSpacing: '0.05em',
                      }}>
                        {ep.active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 24px' }}>
                      <button
                        onClick={() => toggleActive(ep.id, ep.active)}
                        style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: 6, padding: '4px 12px', fontFamily: 'var(--font-code)', fontSize: 11, cursor: 'pointer', transition: 'all 150ms' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
                      >
                        {ep.active ? 'Disable' : 'Enable'}
                      </button>
                    </td>
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
