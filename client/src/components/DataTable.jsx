import { useRef } from 'react';
import { fmt, pct } from '../lib/format.js';

export default function DataTable({ rows, totalRows, search, onSearchChange, onExport, onPdf }) {
  const searchRef = useRef(null);

  function clearSearch() {
    onSearchChange('');
    searchRef.current?.focus();
  }

  return (
    <article className="panel table-panel">
      <div className="panel-head table-head">
        <div>
          <h3>Detalhamento das turmas</h3>
          <p>Consulte os dados importados e filtrados</p>
        </div>
        <span className="search-wrap">
          <input
            ref={searchRef}
            id="searchInput"
            className="search"
            placeholder="Buscar curso, turma, disciplina..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
          {search && (
            <button
              className="search-clear"
              type="button"
              onClick={clearSearch}
              aria-label="Limpar busca"
              title="Limpar busca"
            >
              ×
            </button>
          )}
        </span>
        <button id="exportBtn" className="secondary-btn" type="button" onClick={onExport}>
          Exportar CSV
        </button>
        <button id="pdfBtn" className="pdf-btn" type="button" onClick={onPdf}>
          Gerar PDF
        </button>
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Curso</th>
              <th>Turma / módulo</th>
              <th>Turno</th>
              <th>Disciplina / horário</th>
              <th>Instrutor</th>
              <th className="num">Matriculados</th>
              <th className="num">Frequentes</th>
              <th className="num">Faltosos</th>
              <th>Frequência</th>
            </tr>
          </thead>
          <tbody id="dataTable">
            {rows.length === 0 ? (
              <tr>
                <td colSpan="9">Nenhum registro encontrado para os filtros selecionados.</td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={`${index}-${row.course}-${row.class}-${row.discipline}`}>
                  <td>{row.course}</td>
                  <td>{row.class}</td>
                  <td>{row.shift}</td>
                  <td>{row.discipline || row.day}</td>
                  <td>{row.teacher}</td>
                  <td className="num">{fmt(row.enrolled)}</td>
                  <td className="num">{fmt(row.present)}</td>
                  <td className="num">{fmt(row.absent)}</td>
                  <td className={`rate${row.attendance < 70 ? ' low' : ''}`}>
                    {pct(row.attendance)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="table-foot" id="tableFoot">
        Exibindo {rows.length} de {totalRows} registros • Totais recalculados conforme os
        filtros
      </div>
    </article>
  );
}
