import React, { useState } from 'react';
import { useAction, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { PageHeader, Panel } from '../components/shell/PageHeader';
import { SpreadsheetImporter } from '../components/SpreadsheetImporter';
import { parseSimpleFormat } from '../lib/importParser';
import type { ParsedImport } from '../lib/importParser';
import { Link, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

const DEFAULT_SHEET = 'https://docs.google.com/spreadsheets/d/1UGBRm2F6Z_g_kXeByph-XtmoP2_tC-0zSH1Be_dp0P8/edit#gid=180261306';

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', fontSize: 13, fontFamily: 'inherit',
  background: 'var(--input-bg)', border: '1px solid var(--border-subtle)',
  borderRadius: 10, color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box',
};

export const ImportView: React.FC = () => {
  const fetchSheet = useAction(api.importSheets.fetchGoogleSheet);
  const bulkImport = useMutation(api.import.bulkImport);

  const [sheetUrl, setSheetUrl] = useState(DEFAULT_SHEET);
  const [fetching, setFetching] = useState(false);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState<ParsedImport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFetch = async () => {
    setError(null); setSuccess(false); setPreview(null);
    setFetching(true);
    try {
      const csv = await fetchSheet({ url: sheetUrl });
      const parsed = parseSimpleFormat(csv);
      setPreview(parsed);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch sheet');
    } finally {
      setFetching(false);
    }
  };

  const handleImport = async () => {
    if (!preview) return;
    setError(null); setSuccess(false);
    setImporting(true);
    try {
      await bulkImport({
        fileName: 'google-sheets-sync',
        importedBy: 'admin',
        stores: preview.stores,
        initiatives: preview.initiatives.map((i) => ({
          ...i,
          plannedStart: i.plannedStart ?? undefined,
          plannedEnd: i.plannedEnd ?? undefined,
        })),
        rollouts: preview.rollouts,
      });
      setSuccess(true);
      setPreview(null);
    } catch (e: any) {
      setError(e.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
      <PageHeader
        overline="Data · Import"
        title="Import data"
        subtitle="Sync from Google Sheets or upload a CSV / Excel file"
      />

      {/* ── Google Sheets Sync ── */}
      <Panel title="Sync from Google Sheets" style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 14 }}>
          Paste the Google Sheets URL below. The sheet must be publicly accessible (Anyone with link → Viewer).
          The sync reads all store rows and initiative columns directly from the sheet.
        </p>
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <input
            style={inputStyle}
            value={sheetUrl}
            onChange={(e) => setSheetUrl(e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/d/…"
          />
          <button
            className="btn-primary"
            disabled={fetching || !sheetUrl.trim()}
            onClick={handleFetch}
            style={{ whiteSpace: 'nowrap', minWidth: 100 }}
          >
            {fetching ? <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Link size={13} />}
            {fetching ? ' Fetching…' : ' Fetch sheet'}
          </button>
        </div>

        {error && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, marginBottom: 14 }}>
            <AlertTriangle size={14} color="#EF4444" />
            <span style={{ fontSize: 12, color: '#EF4444' }}>{error}</span>
          </div>
        )}

        {success && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '10px 14px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10, marginBottom: 14 }}>
            <CheckCircle size={14} color="#22C55E" />
            <span style={{ fontSize: 12, color: '#22C55E' }}>Import successful! Data synced from Google Sheets.</span>
          </div>
        )}

        {preview && (
          <div style={{ padding: '14px 16px', background: 'var(--card-bg)', border: '1px solid var(--border-subtle)', borderRadius: 12, marginBottom: 14 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>Preview</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
              {[
                { label: 'Stores', value: preview.stores.length, color: 'var(--signal-500)' },
                { label: 'Initiatives', value: preview.initiatives.length, color: '#A78BFA' },
                { label: 'Rollouts', value: preview.rollouts.filter((r) => r.participating).length, color: '#22C55E' },
              ].map((item) => (
                <div key={item.label} style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: item.color, fontFamily: 'JetBrains Mono, monospace' }}>{item.value}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{item.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-primary" disabled={importing} onClick={handleImport} style={{ minWidth: 120 }}>
                {importing ? 'Importing…' : 'Import all'}
              </button>
              <button className="btn-ghost" onClick={() => setPreview(null)}>Discard</button>
            </div>
          </div>
        )}
      </Panel>

      {/* ── File Upload (existing) ── */}
      <Panel title="Upload file">
        <SpreadsheetImporter />
      </Panel>
    </>
  );
};
