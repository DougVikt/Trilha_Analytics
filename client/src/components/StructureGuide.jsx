const VARIATIONS = [
  'Ordem e quantidade de colunas',
  'Nome e quantidade de abas',
  'Posição da linha de cabeçalho',
  'Mais de um bloco de frequência na mesma aba',
  'Maiúsculas, minúsculas, acentos e pontuação nos cabeçalhos',
  'Planilha sem coluna de faltosos (o sistema calcula MT − FREQUENTES)',
];

const NOT_RECOGNIZED = [
  'Cabeçalhos como MATRÍCULAS, PRESENTES ou AUSENTES. Use MATRICULADOS/MT, FREQUENTES e FALTOSOS.',
  'PROFESSOR no lugar de INSTRUTOR.',
  'Linha de cabeçalho apenas com FREQUENTES e sem MT.',
  'Cabeçalhos mesclados ou divididos em duas linhas.',
  'Linhas de total ou rodapé dentro do bloco: podem entrar como registros.',
];

const TIPS = [
  'Use uma única linha de cabeçalho, sem células mescladas.',
  'Mantenha MT e FREQUENTES com valores numéricos (e FALTOSOS, se existir).',
  'Evite linhas de total dentro do intervalo de dados.',
  'Garanta que ao menos curso, disciplina ou instrutor esteja preenchido em cada linha.',
  'Para planilhas arquivadas, use exatamente as mesmas regras do upload.',
  'Prefira salvar o arquivo como .xlsx.',
];

const COLUMNS = [
  {
    field: 'Curso',
    search: 'curso',
    required: false,
    note: 'Se não encontrar, usa a primeira coluna.',
  },
  {
    field: 'Turma / módulo',
    search: 'turma ou modulo',
    required: false,
    note: 'Também aceita TURMA/MÓDULO.',
  },
  { field: 'Turno', search: 'turno', required: false, note: '' },
  {
    field: 'Dia',
    search: 'dia ou dias',
    required: false,
    note: 'Ex.: SEGUNDA-FEIRA.',
  },
  { field: 'Disciplina', search: 'disciplina', required: false, note: '' },
  {
    field: 'Instrutor',
    search: 'instrutor',
    required: false,
    note: 'INSTRUTOR(A) também funciona.',
  },
  {
    field: 'Matriculados',
    search: 'matriculados ou mt',
    required: true,
    note: 'Precisa ser numérico.',
  },
  {
    field: 'Frequentes',
    search: 'frequentes, frequencia ou freq na semana',
    required: true,
    note: 'Precisa ser numérico.',
  },
  {
    field: 'Faltosos',
    search: 'faltosos ou faltas',
    required: false,
    note: 'Se faltar, calcula MT − FREQUENTES.',
  },
];

function Badge({ required }) {
  return (
    <span className={`guide-badge ${required ? 'required' : 'optional'}`}>
      {required ? 'Sim' : 'Não'}
    </span>
  );
}

export default function StructureGuide({ folder, onGoArchived }) {
  return (
    <section className="guide-page">
      <div className="guide-hero">
        <div className="guide-hero-icon">ⓘ</div>
        <div>
          <h2>Como o scanner interpreta a planilha</h2>
          <p>
            Você não precisa copiar o layout visual do exemplo. O scanner encontra as
            colunas pelos cabeçalhos e só precisa que alguns nomes estejam presentes na
            mesma linha.
          </p>
        </div>
      </div>

      <article className="panel guide-card">
        <div className="guide-card-head">
          <span className="guide-step">1</span>
          <div>
            <h3>Regra principal para reconhecer um bloco</h3>
            <p>A linha de cabeçalho precisa conter os dois elementos abaixo:</p>
          </div>
        </div>
        <div className="guide-formula">
          <span className="guide-code">MT</span>
          <span className="guide-plus">+</span>
          <span className="guide-code">FREQU…</span>
          <span className="guide-ok">bloco lido</span>
        </div>
        <div className="guide-formula guide-formula-alt">
          <span className="guide-code">MT</span>
          <span className="guide-plus">+</span>
          <span className="guide-code">FALT…</span>
          <span className="guide-warn">detectado, mas sem dados</span>
        </div>
        <p className="guide-note">
          Exemplos que geram dados: <b>MT</b> + <b>FREQUENTES</b>, <b>MT</b> +{' '}
          <b>FREQUÊNCIA</b> e <b>MT</b> + <b>FREQ. NA SEMANA</b>. O <b>FALTOSOS</b>{' '}
          é opcional e pode ser usado no cálculo das faltas, mas o bloco precisa de
          uma coluna de frequentes para ser lido. Acentos, maiúsculas e pontuação não
          importam. Se a planilha não tiver nenhum <b>MT</b> na linha, o bloco não
          será detectado.
        </p>
      </article>

      <article className="panel guide-card">
        <div className="guide-card-head">
          <span className="guide-step">2</span>
          <div>
            <h3>Exemplo mínimo de cabeçalho</h3>
            <p>Esta linha já é suficiente para o scanner encontrar os dados.</p>
          </div>
        </div>
        <div className="guide-table-wrap guide-example">
          <table className="guide-table">
            <thead>
              <tr>
                <th>CURSO</th>
                <th>TURMA</th>
                <th>TURNO</th>
                <th>DISCIPLINA</th>
                <th>INSTRUTOR</th>
                <th className="guide-required-col">MT</th>
                <th className="guide-required-col">FREQUENTES</th>
                <th className="guide-optional-col">FALTOSOS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>INFORMÁTICA</td>
                <td>INF01-3M</td>
                <td>MANHÃ</td>
                <td>Introdução à Informática</td>
                <td>MARIA SILVA</td>
                <td className="num">20</td>
                <td className="num">18</td>
                <td className="num">2</td>
              </tr>
              <tr>
                <td>ADMINISTRAÇÃO</td>
                <td>ADM01-2T</td>
                <td>TARDE</td>
                <td>Rotinas Administrativas</td>
                <td>ANA COSTA</td>
                <td className="num">25</td>
                <td className="num">22</td>
                <td className="num">3</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="guide-note">
          As colunas destacadas em verde (<b>MT</b> e <b>FREQUENTES</b>) são
          obrigatórias e devem conter números. O <b>FALTOSOS</b> é opcional: se faltar,
          o sistema calcula <b>MT − FREQUENTES</b>. As demais colunas são usadas para
          filtros, gráficos e identificação das turmas.
        </p>
      </article>

      <div className="guide-grid">
        <article className="panel guide-card">
          <h3>O que pode variar</h3>
          <p className="guide-sub">O scanner se adapta a diferentes layouts.</p>
          <ul className="guide-checklist">
            {VARIATIONS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="panel guide-card">
          <h3>O que causa erro ou distorção</h3>
          <p className="guide-sub">Evite estes casos para ter uma leitura confiável.</p>
          <ul className="guide-checklist guide-cross-list">
            {NOT_RECOGNIZED.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </div>

      <article className="panel guide-card">
        <div className="guide-card-head">
          <span className="guide-step">3</span>
          <div>
            <h3>Colunas reconhecidas</h3>
            <p>A busca ignora acentos, maiúsculas e pontuação.</p>
          </div>
        </div>
        <div className="guide-table-wrap">
          <table className="guide-table guide-columns-table">
            <thead>
              <tr>
                <th>Informação</th>
                <th>O scanner procura</th>
                <th>Obrigatório?</th>
                <th>Observação</th>
              </tr>
            </thead>
            <tbody>
              {COLUMNS.map((column) => (
                <tr key={column.field}>
                  <td>{column.field}</td>
                  <td>
                    <code>{column.search}</code>
                  </td>
                  <td>
                    <Badge required={column.required} />
                  </td>
                  <td>{column.note || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      <div className="guide-grid">
        <article className="panel guide-card">
          <h3>Dicas para evitar erros</h3>
          <p className="guide-sub">Checklist rápido antes de importar.</p>
          <ul className="guide-checklist">
            {TIPS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="panel guide-card">
          <h3>Planilhas arquivadas</h3>
          <p className="guide-sub">
            Os arquivos da pasta usam exatamente o mesmo scanner e as mesmas regras do
            upload. A planilha de exemplo da pasta pode ser usada como modelo.
          </p>
          <span className="guide-folder-label">Pasta em uso:</span>
          <code className="guide-folder-path">{folder || 'Carregando pasta...'}</code>
        </article>
      </div>

      <div className="guide-actions">
        <button className="secondary-btn" type="button" onClick={onGoArchived}>
          Ver planilhas arquivadas
        </button>
        <label className="upload-btn" htmlFor="fileInput">
          Importar Excel
        </label>
      </div>
    </section>
  );
}
