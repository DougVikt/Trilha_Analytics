export default function Sidebar({ view, open, fileCount, onNavigate }) {
  return (
    <aside className={`sidebar${open ? ' sidebar-open' : ''}`} id="sidebar">
      <div className="brand">
        <div className="brand-mark">TA</div>
        <div>
          <strong>Trilha Analytics</strong>
          <small>PAINEL DE GESTÃO</small>
        </div>
      </div>

      <div className="side-label">VISÃO GERAL</div>
      <button
        type="button"
        className={`nav${view === 'dashboard' ? ' active' : ''}`}
        onClick={() => onNavigate('dashboard')}
      >
        <span className="nav-icon">▦</span> Dashboard
      </button>

      <div className="side-label spaced">ARQUIVOS</div>
      <button
        type="button"
        className={`nav${view === 'arquivadas' ? ' active' : ''}`}
        onClick={() => onNavigate('arquivadas')}
      >
        <span className="nav-icon">▤</span> Planilhas arquivadas
        {fileCount > 0 && <em className="nav-badge">{fileCount}</em>}
      </button>

      <div className="side-label spaced">AJUDA</div>
      <button
        type="button"
        className={`nav${view === 'estrutura' ? ' active' : ''}`}
        onClick={() => onNavigate('estrutura')}
      >
        <span className="nav-icon">ⓘ</span> Estrutura da planilha
      </button>

      <div className="side-note">
        <span className="dot" /> Análise de frequência
      </div>

      <div className="sidebar-bottom">
        <div className="mini-icon">↗</div>
        <div>
          <b>Relatórios inteligentes</b>
          <small>Dados atualizados por planilha</small>
        </div>
      </div>
    </aside>
  );
}
