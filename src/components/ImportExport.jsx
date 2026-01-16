import { useState, useRef } from 'react';
import { Download, Upload, FileJson, FileSpreadsheet, X, AlertCircle, CheckCircle } from 'lucide-react';
import { exportToCSV, importFromCSV } from '../utils/csv';
import { exportToJSON, importFromJSON } from '../utils/storage';

export default function ImportExport({ servers, onImport }) {
  const [showModal, setShowModal] = useState(false);
  const [importMode, setImportMode] = useState('merge'); // 'merge' or 'replace'
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const handleExportCSV = () => {
    exportToCSV(servers);
  };

  const handleExportJSON = () => {
    exportToJSON(servers);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setImportResult(null);

    try {
      let result;
      if (file.name.endsWith('.json')) {
        const importedServers = await importFromJSON(file);
        result = { servers: importedServers, errors: [] };
      } else if (file.name.endsWith('.csv')) {
        result = await importFromCSV(file);
      } else {
        throw new Error('Unsupported file format. Please use CSV or JSON files.');
      }

      setImportResult(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const confirmImport = () => {
    if (importResult?.servers) {
      onImport(importResult.servers, importMode === 'replace');
      setShowModal(false);
      setImportResult(null);
      setError(null);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Export Dropdown */}
        <div className="relative group">
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download size={16} />
            Export
          </button>
          <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
            <button
              onClick={handleExportCSV}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 rounded-t-lg"
            >
              <FileSpreadsheet size={16} className="text-green-600" />
              Export as CSV
            </button>
            <button
              onClick={handleExportJSON}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 rounded-b-lg"
            >
              <FileJson size={16} className="text-blue-600" />
              Export as JSON
            </button>
          </div>
        </div>

        {/* Import Button */}
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Upload size={16} />
          Import
        </button>
      </div>

      {/* Import Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Import Servers</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setImportResult(null);
                  setError(null);
                }}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Import Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Import Mode
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      value="merge"
                      checked={importMode === 'merge'}
                      onChange={(e) => setImportMode(e.target.value)}
                      className="text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Merge with existing</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      value="replace"
                      checked={importMode === 'replace'}
                      onChange={(e) => setImportMode(e.target.value)}
                      className="text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Replace all</span>
                  </label>
                </div>
              </div>

              {/* File Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select File (CSV or JSON)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json"
                  onChange={handleFileSelect}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>

              {/* Processing indicator */}
              {isProcessing && (
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
                  <span className="text-sm">Processing file...</span>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              {/* Import Result */}
              {importResult && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle size={18} />
                    <span className="text-sm font-medium">
                      Found {importResult.servers.length} servers to import
                    </span>
                  </div>
                  {importResult.errors?.length > 0 && (
                    <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm font-medium text-yellow-800 mb-1">
                        Warnings ({importResult.errors.length}):
                      </p>
                      <ul className="text-xs text-yellow-700 list-disc list-inside max-h-24 overflow-y-auto">
                        {importResult.errors.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowModal(false);
                  setImportResult(null);
                  setError(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmImport}
                disabled={!importResult?.servers}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Import {importResult?.servers?.length || 0} Servers
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
