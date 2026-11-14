import { useMemo, useRef } from 'react';
import { fmt, pct } from '../lib/format.js';
import Charts from './Charts.jsx';
import DataTable from './DataTable.jsx';
import Filters from './Filters.jsx';
import UploadPanel from './UploadPanel.jsx';

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

export default function Dashboard({
  rawRows,
  fileInfo,
  error,
  filters,
  onFilterChange,
  onClearFilters,
  onUpload,
  onError,
  onShowGuide,
}) {
  const printDateRef = useRef(null);

  const filteredRows = useMemo(() => {
    const query = filters.search.toLocaleLowerCase('pt-BR');

    return rawRows.filter(
      (row) =>
        (!filters.course || row.course === filters.course) &&
        (!filters.shift || row.shift === filters.shift) &&
        (!filters.section || row.section === filters.section) &&
        (!query ||
          [row.course, row.class, row.discipline, row.teacher, row.day, row.shift]
            .join(' ')
            .toLocaleLowerCase('pt-BR')
            .includes(query)),
    );
  }, [rawRows, filters]);

  const courses = useMemo(() => uniqueSorted(rawRows.map((row) => row.course)), [rawRows]);
  const shifts = useMemo(() => uniqueSorted(rawRows.map((row) => row.shift)), [rawRows]);
  const sections = useMemo(() => uniqueSorted(rawRows.map((row) => row.section)), [rawRows]);

  const totals = useMemo(() => {
    const enrolled = filteredRows.reduce((sum, row) => sum + row.enrolled, 0);
    const present = filteredRows.reduce((sum, row) => sum + row.present, 0);
    const absent = filteredRows.reduce((sum, row) => sum + row.absent, 0);
    return {
      enrolled,
      present,
      absent,
      rate: enrolled ? (present / enrolled) * 100 : 0,
    };
  }, [filteredRows]);

  const courseRates = useMemo(() => {
    const groups = {};
    filteredRows.forEach((row) => {
      groups[row.course] ??= { enrolled: 0, present: 0 };
      groups[row.course].enrolled += row.enrolled;
      groups[row.course].present += row.present;
    });

    return Object.entries(groups)
      .map(([name, values]) => ({
        name,
        rate: values.enrolled ? (values.present / values.enrolled) * 100 : 0,
      }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 12);
  }, [filteredRows]);

  function exportCsv() {
    const headers = [
      'Curso',
      'Turma/Módulo',
      'Turno',
      'Disciplina/Dia',
      'Instrutor',
      'Matriculados',
      'Frequentes',
      'Faltosos',
      'Frequência (%)',
    ];

    const csv = [
      headers,
      ...filteredRows.map((row) => [
        row.course,
        row.class,
        row.shift,
        row.discipline || row.day,
        row.teacher,
        row.enrolled,
        row.present,
        row.absent,
        row.attendance.toFixed(2).replace('.', ','),
      ]),
    ]
      .map((row) =>
        row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(';'),
      )
      .join('\r\n');

    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }));
    link.download = 'relatorio-frequencia.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  }

  function generatePdf() {
    if (!rawRows.length) {
      onError('Importe uma planilha antes de gerar o relatório.');
      return;
    }
    if (printDateRef.current) {
      printDateRef.current.textContent = 'Emitido em ' + new Date().toLocaleString('pt-BR');
    }
    window.print();
  }

  return (
    <>
      <UploadPanel onUpload={onUpload} onShowGuide={onShowGuide} />
      {fileInfo && (
        <div className="file-info" id="fileInfo">
          {fileInfo}
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

      {rawRows.length > 0 && (
        <section id="dashboard">
          <div className="print-heading">
            <strong>RELATÓRIO DE FREQUÊNCIA ESCOLAR</strong>
            <span ref={printDateRef} />
          </div>

          <div className="section-heading">
            <div>
              <h2>Resumo executivo</h2>
              <p>Indicadores consolidados dos registros importados</p>
            </div>
            <span className="updated" id="recordCount">
              {filteredRows.length} registros exibidos
            </span>
          </div>

          <div className="kpi-grid">
            <article className="kpi">
              <div className="kpi-top">
                <span>Alunos matriculados</span>
                <span className="kpi-icon blue">♙</span>
              </div>
              <strong id="kpiEnrolled">{fmt(totals.enrolled)}</strong>
              <small>Total de matrículas nas turmas</small>
            </article>
            <article className="kpi">
              <div className="kpi-top">
                <span>Alunos frequentes</span>
                <span className="kpi-icon green">✓</span>
              </div>
              <strong id="kpiPresent">{fmt(totals.present)}</strong>
              <small>Presenças registradas</small>
            </article>
            <article className="kpi">
              <div className="kpi-top">
                <span>Alunos faltosos</span>
                <span className="kpi-icon orange">!</span>
              </div>
              <strong id="kpiAbsent">{fmt(totals.absent)}</strong>
              <small>Ausências registradas</small>
            </article>
            <article className="kpi">
              <div className="kpi-top">
                <span>Índice de frequência</span>
                <span className="kpi-icon purple">％</span>
              </div>
              <strong id="kpiRate">{pct(totals.rate)}</strong>
              <small>Frequentes ÷ matriculados</small>
            </article>
          </div>

          <Filters
            filters={filters}
            courses={courses}
            shifts={shifts}
            sections={sections}
            onChange={onFilterChange}
            onClear={onClearFilters}
          />

          <Charts
            present={totals.present}
            absent={totals.absent}
            rate={totals.rate}
            courseRates={courseRates}
          />

          <DataTable
            rows={filteredRows}
            totalRows={rawRows.length}
            search={filters.search}
            onSearchChange={(value) => onFilterChange('search', value)}
            onExport={exportCsv}
            onPdf={generatePdf}
          />

          <footer>
            Dashboard de Frequência Escolar <span>•</span> Indicadores calculados a partir da
            planilha importada.
          </footer>
        </section>
      )}
    </>
  );
}
