import { formatBytes, formatDateTime } from '../lib/format.js';

export default function ArchivedPage({
  archive,
  loading,
  error,
  scanningFile,
  onRefresh,
  onScan,
  onShowGuide,
}) {
  const { folder, files = [], exists = true, warning } = archive;

  return (
    <section className="archive-page">
      <div className="archive-banner">
        <div className="archive-icon">▤</div>
        <div className="archive-copy">
          <b>Pasta de planilhas arquivadas</b>
          <code>{folder || 'Carregando pasta...'}</code>
          <small>
            Coloque os arquivos .xls ou .xlsx nessa pasta. Ao escolher uma planilha, o sistema
            faz a mesma leitura da importação por upload.
          </small>
        </div>
        <button
          className="secondary-btn"
          type="button"
          onClick={onRefresh}
          disabled={loading}
        >
          {loading ? 'Atualizando...' : 'Atualizar lista'}
        </button>
      </div>

      {(warning || !exists) && (
        <div className="alert">
          {warning ||
            `A pasta configurada não foi encontrada: ${folder}. Crie a pasta ou ajuste o caminho em server/config.js.`}
        </div>
      )}

      {error && (
        <div className="alert">
          {error}{' '}
          <button className="alert-link" type="button" onClick={onShowGuide}>
            Ver estrutura necessária
          </button>
        </div>
      )}

      <article className="panel archive-panel">
        <div className="panel-head archive-head">
          <div>
            <h3>Planilhas disponíveis</h3>
            <p>
              {files.length === 0
                ? 'Nenhum arquivo XLS ou XLSX encontrado na pasta'
                : `${files.length} arquivo${files.length === 1 ? '' : 's'} encontrado${
                    files.length === 1 ? '' : 's'
                  } na pasta`}
            </p>
          </div>
          <span className="archive-count">{files.length}</span>
        </div>

        {loading && files.length === 0 ? (
          <div className="archive-empty">
            <b>Lendo a pasta...</b>
            <span>Aguarde enquanto os arquivos são listados.</span>
          </div>
        ) : files.length === 0 ? (
          <div className="archive-empty">
            <b>Nenhuma planilha arquivada</b>
            <span>
              Adicione arquivos .xls ou .xlsx à pasta exibida acima e clique em “Atualizar
              lista”.
            </span>
          </div>
        ) : (
          <ul className="archive-list">
            {files.map((file) => {
              const isScanning = scanningFile === file.name;
              const extension = file.name.split('.').pop()?.toUpperCase() || 'XLSX';

              return (
                <li className="archive-item" key={file.name}>
                  <span className="archive-file-icon">{extension}</span>
                  <div className="archive-file-meta">
                    <b>{file.name}</b>
                    <small>
                      {formatBytes(file.size)} • Modificado em {formatDateTime(file.modifiedAt)}
                    </small>
                  </div>
                  <button
                    className="secondary-btn"
                    type="button"
                    onClick={() => onScan(file.name)}
                    disabled={Boolean(scanningFile)}
                  >
                    {isScanning ? 'Analisando...' : 'Analisar'}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </article>

      <div className="archive-hint">
        <b>Como usar outra pasta?</b>
        <span>
          Edite o caminho em <code>server/config.js</code> ou defina a variável de ambiente{' '}
          <code>PLANILHAS_DIR</code> com a pasta real. A pasta em uso está mostrada acima.
        </span>
      </div>
    </section>
  );
}
