import { useCallback, useEffect, useState } from 'react';
import { listArchived, scanArchived, uploadSpreadsheet } from './api.js';
import ArchivedPage from './components/ArchivedPage.jsx';
import Dashboard from './components/Dashboard.jsx';
import Sidebar from './components/Sidebar.jsx';
import StructureGuide from './components/StructureGuide.jsx';
import Topbar from './components/Topbar.jsx';

const EMPTY_FILTERS = { course: '', shift: '', section: '', search: '' };
const EMPTY_ARCHIVE = { folder: '', exists: true, files: [], warning: '' };

export default function App() {
  const [view, setView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [rawRows, setRawRows] = useState([]);
  const [fileInfo, setFileInfo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const [archive, setArchive] = useState(EMPTY_ARCHIVE);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [archiveError, setArchiveError] = useState('');
  const [scanningFile, setScanningFile] = useState('');

  const closeMenu = useCallback(() => setSidebarOpen(false), []);

  const refreshArchive = useCallback(async () => {
    setArchiveLoading(true);
    setArchiveError('');
    try {
      const data = await listArchived();
      setArchive({
        folder: data.folder || '',
        exists: data.exists !== false,
        files: Array.isArray(data.files) ? data.files : [],
        warning: data.warning || '',
      });
    } catch (requestError) {
      setArchiveError(requestError.message);
    } finally {
      setArchiveLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshArchive();
  }, [refreshArchive]);

  useEffect(() => {
    if (view === 'arquivadas') refreshArchive();
  }, [view, refreshArchive]);

  function applyData(data, origin) {
    const originLabel = origin === 'arquivada' ? ' • Origem: planilha arquivada' : '';
    setRawRows(data.rows);
    setFileInfo(
      `Arquivo carregado: ${data.filename} • Abas: ${data.sheets.join(', ')}${originLabel}`,
    );
    setFilters(EMPTY_FILTERS);
    setError('');
    setLoading(false);
  }

  async function handleUpload(file) {
    if (!file) return;

    const previousInfo = fileInfo;
    setError('');
    setLoading(true);
    setView('dashboard');
    closeMenu();
    setFileInfo(`Lendo ${file.name}...`);

    try {
      const data = await uploadSpreadsheet(file);
      applyData(data, 'upload');
    } catch (requestError) {
      setError(requestError.message);
      setFileInfo(previousInfo);
      setLoading(false);
    }
  }

  async function handleScanArchived(fileName) {
    setArchiveError('');
    setError('');
    setScanningFile(fileName);

    try {
      const data = await scanArchived(fileName);
      applyData(data, 'arquivada');
      setView('dashboard');
      closeMenu();
    } catch (requestError) {
      setArchiveError(requestError.message);
    } finally {
      setScanningFile('');
    }
  }

  function navigate(nextView) {
    setView(nextView);
    closeMenu();
  }

  function changeFilter(field, value) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  return (
    <div className="app-shell">
      <div
        className={`mobile-scrim${sidebarOpen ? ' scrim-visible' : ''}`}
        id="mobileScrim"
        onClick={closeMenu}
      />

      <Sidebar
        view={view}
        open={sidebarOpen}
        fileCount={archive.files.length}
        onNavigate={navigate}
      />

      <main className="main">
        <Topbar
          view={view}
          loading={loading || Boolean(scanningFile)}
          sidebarOpen={sidebarOpen}
          onToggleMenu={() => setSidebarOpen((open) => !open)}
          onUpload={handleUpload}
        />

        {view === 'dashboard' && (
          <Dashboard
            rawRows={rawRows}
            fileInfo={fileInfo}
            error={error}
            filters={filters}
            onFilterChange={changeFilter}
            onClearFilters={() => setFilters(EMPTY_FILTERS)}
            onUpload={handleUpload}
            onError={setError}
            onShowGuide={() => navigate('estrutura')}
          />
        )}

        {view === 'arquivadas' && (
          <ArchivedPage
            archive={archive}
            loading={archiveLoading}
            error={archiveError}
            scanningFile={scanningFile}
            onRefresh={refreshArchive}
            onScan={handleScanArchived}
            onShowGuide={() => navigate('estrutura')}
          />
        )}

        {view === 'estrutura' && (
          <StructureGuide
            folder={archive.folder}
            onGoArchived={() => navigate('arquivadas')}
          />
        )}
      </main>
    </div>
  );
}
