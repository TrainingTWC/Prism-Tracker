import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { parseMatrix, ParsedImport } from '@/src/lib/importParser';
import { Upload, AlertCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

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
    const parsed = parseMatrix(text);
    setParsed(parsed);
    setResult(null);
  };

  const handleImport = async () => {
    if (!parsed || !file) return;

    setImporting(true);
    try {
      const res = await bulkImport({
        fileName: file.name,
        importedBy: 'user@prism.local', // TODO: get from auth context
        stores: parsed.stores,
        initiatives: parsed.initiatives,
        rollouts: parsed.rollouts,
      });
      setResult(res);
    } catch (err) {
      console.error('Import failed:', err);
      setResult({ error: String(err) });
    } finally {
      setImporting(false);
    }
  };

  const SectionToggle: React.FC<{
    title: string;
    id: string;
    count: number;
    children: React.ReactNode;
  }> = ({ title, id, count, children }) => {
    const isOpen = expandedSection === id;
    return (
      <div className="border border-blue-200 rounded-lg overflow-hidden">
        <button
          onClick={() => setExpandedSection(isOpen ? null : id)}
          className="w-full px-4 py-3 bg-blue-50 hover:bg-blue-100 flex items-center justify-between"
        >
          <span className="font-semibold text-blue-900">
            {title} ({count})
          </span>
          {isOpen ? (
            <ChevronUp size={20} className="text-blue-600" />
          ) : (
            <ChevronDown size={20} className="text-blue-600" />
          )}
        </button>
        {isOpen && <div className="p-4 bg-blue-50 max-h-96 overflow-auto">{children}</div>}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white border border-gray-200 rounded-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Upload className="text-blue-600" size={28} />
        Import Tracker Data
      </h2>

      {/* File Upload */}
      <div className="mb-6">
        <label className="block mb-2 text-sm font-semibold text-gray-700">
          Upload CSV
        </label>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer hover:file:bg-blue-700"
        />
        {file && <p className="text-sm text-gray-600 mt-2">Selected: {file.name}</p>}
      </div>

      {/* Preview */}
      {parsed && (
        <div className="mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded">
              <p className="text-sm text-gray-600">Stores to Upsert</p>
              <p className="text-3xl font-bold text-emerald-700">{parsed.stores.length}</p>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-gray-600">Initiatives</p>
              <p className="text-3xl font-bold text-blue-700">{parsed.initiatives.length}</p>
            </div>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded">
              <p className="text-sm text-gray-600">Rollout Cells</p>
              <p className="text-3xl font-bold text-purple-700">{parsed.rollouts.length}</p>
            </div>
          </div>

          {/* Warnings */}
          {parsed.warnings.length > 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded flex gap-3">
              <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-900">Warnings:</p>
                <ul className="text-sm text-yellow-800 mt-1">
                  {parsed.warnings.map((w, i) => (
                    <li key={i}>• {w}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Expandable sections */}
          <SectionToggle title="Stores Preview" id="stores" count={parsed.stores.length}>
            <div className="space-y-2">
              {parsed.stores.slice(0, 5).map((s, i) => (
                <div key={i} className="p-2 bg-white rounded border border-gray-200 text-sm">
                  <strong>{s.storeCode}</strong> - {s.storeName} ({s.region})
                </div>
              ))}
              {parsed.stores.length > 5 && (
                <p className="text-xs text-gray-600 italic">
                  ... and {parsed.stores.length - 5} more
                </p>
              )}
            </div>
          </SectionToggle>

          <SectionToggle
            title="Initiatives Preview"
            id="initiatives"
            count={parsed.initiatives.length}
          >
            <div className="space-y-2">
              {parsed.initiatives.slice(0, 5).map((i, idx) => (
                <div key={idx} className="p-2 bg-white rounded border border-gray-200 text-sm">
                  <strong>{i.name}</strong> <span className="text-xs text-gray-600">({i.type})</span>
                </div>
              ))}
              {parsed.initiatives.length > 5 && (
                <p className="text-xs text-gray-600 italic">
                  ... and {parsed.initiatives.length - 5} more
                </p>
              )}
            </div>
          </SectionToggle>
        </div>
      )}

      {/* Import Button */}
      {parsed && !result && (
        <button
          onClick={handleImport}
          disabled={importing}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg transition"
        >
          {importing ? 'Importing...' : 'Commit Import'}
        </button>
      )}

      {/* Results */}
      {result && (
        <div className={`p-4 rounded-lg border-2 ${result.error ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-300'}`}>
          {result.error ? (
            <div className="flex gap-3">
              <AlertCircle size={24} className="text-red-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-900">Import Failed</p>
                <p className="text-sm text-red-700 mt-1">{result.error}</p>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <CheckCircle size={24} className="text-green-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-900">Import Successful</p>
                <ul className="text-sm text-green-700 mt-2 space-y-1">
                  <li>✓ Stores upserted: {result.storesUpserted}</li>
                  <li>✓ Initiatives upserted: {result.initiativesUpserted}</li>
                  <li>✓ Rollouts upserted: {result.rolloutsUpserted}</li>
                </ul>
                {result.warnings.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-green-300">
                    <p className="text-sm font-semibold text-yellow-800">Warnings:</p>
                    <ul className="text-xs text-yellow-700 mt-1">
                      {result.warnings.map((w: string, i: number) => (
                        <li key={i}>• {w}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
          <button
            onClick={() => {
              setResult(null);
              setFile(null);
              setParsed(null);
            }}
            className="mt-4 w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-sm"
          >
            Import Another File
          </button>
        </div>
      )}
    </div>
  );
};
