import * as XLSX from 'xlsx';

/**
 * Porte fiel da lógica de leitura do index.php original.
 *
 * Regras mantidas:
 * - Lê todas as abas da pasta de trabalho.
 * - Detecta blocos de cabeçalho que contenham "MT" e ("FREQU" ou "FALT").
 * - Mapeia colunas por nome (curso, turma/módulo, turno, dia, disciplina,
 *   instrutor, matriculados/MT, frequentes e faltosos/faltas).
 * - O primeiro bloco recebe a seção "Frequência semanal"; os demais,
 *   "Interativo".
 * - Ignora linhas com zero matriculados ou sem curso/disciplina/instrutor.
 * - Calcula frequência e índice de faltas sobre os matriculados.
 */

export class ScanError extends Error {
  constructor(message, status = 422) {
    super(message);
    this.name = 'ScanError';
    this.status = status;
  }
}

export function clean(value) {
  return String(value ?? '')
    .replace(/\s+/gu, ' ')
    .trim();
}

const TRANSLITERATION = {
  'º': 'o',
  'ª': 'a',
  '°': 'o',
  'ø': 'o',
  'æ': 'ae',
  'œ': 'oe',
  'ß': 'ss',
  'ð': 'd',
  'þ': 'th',
  'ł': 'l',
};

export function norm(value) {
  return clean(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .replace(/[ºª°øæœßðþł]/g, (char) => TRANSLITERATION[char] ?? char)
    .replace(/[^a-z0-9]+/g, ' ');
}

// Equivalente ao is_numeric() do PHP para os valores que aparecem nas planilhas.
function phpIsNumeric(value) {
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value !== 'string') return false;
  return /^\s*[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?\s*$/.test(value);
}

export function numberValue(value) {
  if (phpIsNumeric(value)) return Number(value);
  const normalized = clean(value).replace(/\./g, '').replace(/,/g, '.');
  return phpIsNumeric(normalized) ? Number(normalized) : 0;
}

export function findCol(headers, needles, fallback = null) {
  const normalizedNeedles = needles.map(norm);
  for (let i = 0; i < headers.length; i += 1) {
    const header = norm(headers[i]);
    for (const needle of normalizedNeedles) {
      if (header.includes(needle)) return i;
    }
  }
  return fallback;
}

function sheetToGrid(sheet) {
  return XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    raw: false, // usa o valor formatado, como o toArray(..., formatData: true) do PHP
    defval: null,
    blankrows: true,
  });
}

export function scanWorkbook(buffer) {
  const workbook = XLSX.read(buffer, {
    type: 'buffer',
    cellStyles: false,
    cellNF: false,
    cellDates: false,
  });

  const sheetNames = workbook.SheetNames;
  const allRows = [];

  for (const sheetName of sheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;

    const grid = sheetToGrid(sheet);
    const headerRows = [];

    grid.forEach((row, rowIndex) => {
      const joined = norm(row.map((cell) => String(cell ?? '')).join(' '));
      if (joined.includes('mt') && (joined.includes('frequ') || joined.includes('falt'))) {
        headerRows.push(rowIndex);
      }
    });

    headerRows.forEach((headerIndex, blockIndex) => {
      const headers = (grid[headerIndex] ?? []).map(clean);
      const nextHeader = headerRows[blockIndex + 1] ?? grid.length;

      const courseCol = findCol(headers, ['curso'], 0);
      const classCol = findCol(headers, ['turma', 'modulo']);
      const shiftCol = findCol(headers, ['turno']);
      const dayCol = findCol(headers, ['dias', 'dia']);
      const disciplineCol = findCol(headers, ['disciplina']);
      const teacherCol = findCol(headers, ['instrutor']);
      const enrolledCol = findCol(headers, ['matriculados', 'mt']);
      const presentCol = findCol(headers, [
        'frequentes',
        'freq na semana',
        'freq. na semana',
        'frequencia',
      ]);
      const absentCol = findCol(headers, ['faltosos', 'faltas']);

      if (enrolledCol === null || presentCol === null) return;

      for (let rowIndex = headerIndex + 1; rowIndex < nextHeader; rowIndex += 1) {
        const row = grid[rowIndex] ?? [];
        const enrolled = numberValue(row[enrolledCol] ?? 0);
        const present = numberValue(row[presentCol] ?? 0);
        const course = clean(row[courseCol] ?? '');
        const className = classCol !== null ? clean(row[classCol] ?? '') : '';
        const discipline = disciplineCol !== null ? clean(row[disciplineCol] ?? '') : '';
        const teacher = teacherCol !== null ? clean(row[teacherCol] ?? '') : '';
        const shift = shiftCol !== null ? clean(row[shiftCol] ?? '') : '';
        const day = dayCol !== null ? clean(row[dayCol] ?? '') : '';

        if (enrolled <= 0 || (course === '' && discipline === '' && teacher === '')) continue;

        const absent =
          absentCol !== null
            ? numberValue(row[absentCol] ?? enrolled - present)
            : Math.max(0, enrolled - present);

        allRows.push({
          section: blockIndex === 0 ? 'Frequência semanal' : 'Interativo',
          course: course || 'Não informado',
          class: className,
          shift,
          day,
          discipline,
          teacher,
          enrolled,
          present,
          absent,
          attendance: enrolled > 0 ? (present / enrolled) * 100 : 0,
          absenceRate: enrolled > 0 ? (absent / enrolled) * 100 : 0,
        });
      }
    });
  }

  if (allRows.length === 0) {
    throw new ScanError(
      'Não encontrei linhas de frequência. Verifique se a planilha possui cabeçalhos como MT, FREQUENTES e FALTOSOS.',
    );
  }

  return { sheets: sheetNames, rows: allRows };
}
