const CONTENT = {
  dashboard: {
    title: 'Relatório de frequência',
    description: 'Acompanhe presença, faltas e desempenho das turmas em um só lugar.',
  },
  arquivadas: {
    title: 'Planilhas arquivadas',
    description:
      'Escolha uma planilha da pasta para analisar com o mesmo scanner da importação.',
  },
  estrutura: {
    title: 'Estrutura da planilha',
    description:
      'Confira os cabeçalhos e colunas reconhecidas pelo scanner antes de importar.',
  },
};

export default function Topbar({ view, loading, sidebarOpen, onToggleMenu, onUpload }) {
  const content = CONTENT[view] ?? CONTENT.dashboard;

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) onUpload(file);
  }

  return (
    <header className="topbar">
      <div>
        <div className="eyebrow">GESTÃO ACADÊMICA</div>
        <h1>{content.title}</h1>
        <p>{content.description}</p>
      </div>

      <div className="top-actions">
        <button
          className="menu-toggle"
          id="menuToggle"
          type="button"
          aria-label="Abrir menu"
          aria-expanded={sidebarOpen}
          onClick={onToggleMenu}
        >
          ☰
        </button>
        <span className="status">
          <i /> {loading ? 'Lendo planilha...' : 'Sistema pronto'}
        </span>
        <label className="upload-btn" htmlFor="fileInput">
          ＋ Importar Excel
        </label>
        <input id="fileInput" type="file" accept=".xls,.xlsx" hidden onChange={handleFileChange} />
      </div>
    </header>
  );
}
