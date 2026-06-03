import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { parseMatrix, ParsedImport } from '@/src/lib/importParser';
import { Upload, AlertCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

const INPUT: React.CSSProperties = {
  width: '100%', padding: '9px 12px', fontSize: 12, fontFamily: 'inherit',
  background: 'var(--input-bg)', border: '1px solid var(--border-subtle)',
  borderRadius: 10, color: 'var(--text-primary)', outline: 'none',
  boxSizing: 'border-box',
};

export const SpreadsheetImporter: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<ParsedImport | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const bulkImport = useMutation(api.import.bulkImport);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    const text = await selectedFile.text();
    const parsedData = parseMatrix(text);
    setParsed(parsedData);
    setResult(null);
  };

  const handleImport = async () => {
    if (!parsed || !file) return;
    setImporting(true);
    try {
      const res = await bulkImport({
        fileName: file.name,
        importedBy: 'user@prism.local',
        stores: parsed.stores,
        initiatives: parsed.initiatives,
        rollouts: parsed.rollouts.map(({ plannedStart, plannedEnd, ...r }) => r),
      });
      setResult(res);
    } catch (err) {
      setResult({ error: String(err) });
    } finally {
      setImporting(false);
    }
  };

  const SectionToggle: React.FC<{ title: string; id: string; count: number; children: React.ReactNode }> = ({ title, id, count, children }) => {
    const isOpen = expandedSection === id;
    return (
      <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}>
        <button
          type="button"
          onClick={() => setExpandedSection(isOpen ? null : id)}
          style={{
            width: '100%', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--card-bg)', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            color: 'var(--text-secondary)', fontSize: 12, fontWeight: 700,
          }}
        >
          <span>{title} <span style={{ color: 'var(--signal-500)', fontVariantNumeric: 'tabular-nums' }}>({count})</span></span>
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {isOpen && (
          <div style={{ padding: 14, background: 'rgba(12,12,15,0.6)', maxHeight: 240, overflowY: 'auto', fontSize: 11 }}>
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg,#1D4ED8,#3B82F6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Upload size={16} color="#fff" />
        </div>
        <div>
          <p className="text-overline" style={{ margin: 0 }}>Data · Import</p>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--obsidian-50)', margin: 0 }}>Import tracker CSV</h2>
        </div>
      </div>

      {/* File upload */}
      <label style={{ display: 'block', marginBottom: 20 }}>
        <span className="text-overline-muted" style={{ display: 'block', marginBottom: 8 }}>Select CSV file</span>
        <div style={{
          border: '2px dashed var(--border-subtle)', borderRadius: 12, padding: '28px 20px',
          textAlign: 'center', cursor: 'pointer', transition: 'border-color 150ms',
          background: 'var(--card-bg)',
        }}
          onDragOver={(e) => e.preventDefault()}
        >
          <Upload size={24} color="var(--text-muted)" style={{ margin: '0 auto 10px' }} />
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 6px' }}>
            {file ? <span style={{ color: 'var(--signal-400)' }}>{file.name}</span> : 'Click to select or drag & drop'}
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>CSV format · stores × initiatives matrix</p>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            id="csv-upload"
          />
        </div>
        <label
          htmlFor="csv-upload"
          style={{
            display: 'block', textAlign: 'center', marginTop: 10,
            padding: '8px 0', fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
            background: 'var(--card-bg)', border: '1px solid var(--border-subtle)',
            borderRadius: 8, color: 'var(--text-secondary)', cursor: 'pointer',
          }}
        >
          Browse file
        </label>
      </label>

      {/* Preview */}
      {parsed && (
        <div style={{ marginBottom: 20 }}>
          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'Stores', value: parsed.stores.length, color: '#22C55E' },
              { label: 'Initiatives', value: parsed.initiatives.length, color: '#3B82F6' },
              { label: 'Rollout cells', value: parsed.rollouts.length, color: '#A855F7' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                padding: '14px 16px', borderRadius: 12,
                background: `${color}0D`, border: `1px solid ${color}26`,
              }}>
                <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.10em', color: `${color}BB` }}>{label}</p>
                <p style={{ margin: 0, fontSize: 26, fontWeight: 800, color, fontVariantNumeric: 'tabular-nums' }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Warnings */}
          {parsed.warnings.length > 0 && (
            <div style={{
              display: 'flex', gap: 10, padding: '12px 14px',
              background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.20)',
              borderRadius: 10, marginBottom: 12,
            }}>
              <AlertCircle size={16} color="#EAB308" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, color: '#FDE68A' }}>
                  {parsed.warnings.length} warning{parsed.warnings.length > 1 ? 's' : ''}
                </p>
                <ul style={{ margin: 0, padding: '0 0 0 14px', fontSize: 11, color: '#FCD34D' }}>
                  {parsed.warnings.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            </div>
          )}

          {/* Expandable previews */}
          <SectionToggle title="Stores preview" id="stores" count={parsed.stores.length}>
            {parsed.stores.slice(0, 8).map((s, i) => (
              <div key={i} style={{ padding: '6px 10px', marginBottom: 4, borderRadius: 6, background: 'var(--card-bg)', display: 'flex', gap: 12 }}>
                <span style={{ color: 'var(--signal-500)', fontWeight: 700, minWidth: 60 }}>{s.storeCode}</span>
                <span style={{ color: 'var(--text-primary)' }}>{s.storeName}</span>
                <span style={{ color: 'var(--text-muted)', marginLeft: 'auto' }}>{s.region}</span>
              </div>
            ))}
            {parsed.stores.length > 8 && (
              <p style={{ margin: '8px 0 0', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                + {parsed.stores.length - 8} more stores
              </p>
            )}
          </SectionToggle>

          <SectionToggle title="Initiatives preview" id="initiatives" count={parsed.initiatives.length}>
            {parsed.initiatives.slice(0, 8).map((ini, idx) => (
              <div key={idx} style={{ padding: '6px 10px', marginBottom: 4, borderRadius: 6, background: 'var(--card-bg)', display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{
                  padding: '2px 8px', borderRadius: 20, fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                  background: 'rgba(59,130,246,0.14)', color: '#60A5FA',
                }}>{ini.type}</span>
                <span style={{ color: 'var(--text-primary)' }}>{ini.name}</span>
              </div>
            ))}
            {parsed.initiatives.length > 8 && (
              <p style={{ margin: '8px 0 0', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                + {parsed.initiatives.length - 8} more
              </p>
            )}
          </SectionToggle>
        </div>
      )}

      {/* Import button */}
      {parsed && !result && (
        <button
          onClick={handleImport}
          disabled={importing}
          style={{
            width: '100%', padding: '12px 0', fontSize: 13, fontWeight: 700,
            fontFamily: 'inherit', cursor: importing ? 'not-allowed' : 'pointer',
            background: importing ? 'rgba(59,130,246,0.10)' : 'linear-gradient(135deg,#1D4ED8,#3B82F6)',
            border: '1px solid rgba(59,130,246,0.40)', borderRadius: 12, color: '#fff',
            transition: 'opacity 150ms', opacity: importing ? 0.6 : 1,
          }}
        >
          {importing ? 'Importing…' : `Import ${parsed.stores.length} stores · ${parsed.initiatives.length} initiatives · ${parsed.rollouts.length} rollouts`}
        </button>
      )}

      {/* Results */}
      {result && (
        <div style={{
          padding: 18, borderRadius: 12,
          background: result.error ? 'rgba(239,68,68,0.06)' : 'rgba(34,197,94,0.06)',
          border: `1px solid ${result.error ? 'rgba(239,68,68,0.25)' : 'rgba(34,197,94,0.25)'}`,
        }}>
          {result.error ? (
            <div style={{ display: 'flex', gap: 12 }}>
              <AlertCircle size={20} color="#EF4444" style={{ flexShrink: 0 }} />
              <div>
                <p style={{ margin: '0 0 6px', fontWeight: 700, color: '#FCA5A5', fontSize: 13 }}>Import failed</p>
                <p style={{ margin: 0, fontSize: 12, color: '#FCA5A5', opacity: 0.8 }}>{result.error}</p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 12 }}>
              <CheckCircle size={20} color="#22C55E" style={{ flexShrink: 0 }} />
              <div>
                <p style={{ margin: '0 0 8px', fontWeight: 700, color: '#4ADE80', fontSize: 13 }}>Import successful</p>
                <ul style={{ margin: 0, padding: '0 0 0 14px', fontSize: 12, color: '#86EFAC', lineHeight: 1.8 }}>
                  <li>Stores upserted: {result.storesUpserted}</li>
                  <li>Initiatives upserted: {result.initiativesUpserted}</li>
                  <li>Rollouts upserted: {result.rolloutsUpserted}</li>
                </ul>
                {result.warnings?.length > 0 && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(34,197,94,0.20)' }}>
                    <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: '#FDE68A' }}>Warnings:</p>
                    <ul style={{ margin: 0, padding: '0 0 0 14px', fontSize: 11, color: '#FCD34D' }}>
                      {result.warnings.map((w: string, i: number) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
          <button
            onClick={() => { setResult(null); setFile(null); setParsed(null); }}
            style={{
              width: '100%', marginTop: 16, padding: '9px 0', fontSize: 12, fontWeight: 700,
              fontFamily: 'inherit', background: 'var(--card-bg)', border: '1px solid var(--border-subtle)',
              borderRadius: 10, color: 'var(--text-secondary)', cursor: 'pointer',
            }}
          >
            Import another file
          </button>
        </div>
      )}
    </div>
  );
};

