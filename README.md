# Trilha Analytics

Dashboard de frequência escolar em **React + Node.js**. Importa planilhas `.xls` e `.xlsx`, lê todas as abas, calcula índices de frequência e faltas, e entrega KPIs, filtros, busca, gráficos, exportação CSV e impressão em PDF.

---

## Recursos

- Importação de planilhas `.xls` e `.xlsx` por upload (até 15 MB).
- Leitura de **todas as abas** da pasta de trabalho.
- Detecção automática dos blocos de cabeçalho que contenham `MT` e `FREQU`/`FALT` (ex.: Frequência semanal e Interativo).
- Mapeamento das colunas: Curso, Turma/Módulo, Turno, Dias, Disciplina, Instrutor, Matriculados/MT, Frequentes e Faltosos/Faltas.
- Cálculo do índice de frequência (`frequentes ÷ matriculados`) e do índice de faltas (`faltosos ÷ matriculados`).
- KPIs: matriculados, frequentes, faltosos e índice de frequência.
- Filtros por curso, turno e origem dos dados.
- Busca por curso, turma, disciplina, instrutor, dia e turno, com botão **“×”** para limpar a busca sem perder os filtros.
- Gráfico de rosca (frequência x faltas) e gráfico de barras por curso.
- Tabela detalhada com destaque para frequência abaixo de 70%.
- Exportação CSV com os filtros aplicados.
- Geração de PDF pela janela de impressão do navegador, respeitando os filtros.
- **Aba “Planilhas arquivadas”**: o servidor lista os `.xls` e `.xlsx` de uma pasta e o usuário escolhe qual analisar, usando o mesmo scanner do upload.
- **Aba “Estrutura da planilha”**: guia com a regra de detecção dos blocos, exemplo de cabeçalho, colunas reconhecidas e o que causa erro. Também acessível pelo painel de upload e pelas mensagens de erro.
- Menu lateral deslizante no celular, com fundo de fechamento.
- Estados de erro e de carregamento.

---

## Requisitos

- Node.js **20.19+** ou **22.12+**
- npm

---

## Como instalar e rodar

```bash
cd Trilha_Analytics
npm install
npm run dev
```

O comando acima inicia:

- API Node em `http://localhost:3333`
- React (Vite) em `http://localhost:5173`

Abra **http://localhost:5173** no navegador.

### Produção

```bash
npm run build
npm start
```

Nesse modo o próprio Node serve o React compilado em `http://localhost:3333`.

> **Acesso interno da rede:** se outros computadores da empresa precisarem acessar, libere a porta **3333/TCP** no firewall do Windows (recomendado: apenas para a sub-rede local) e use o IP da máquina: `http://IP-DA-MAQUINA:3333`.

Se a porta 3333 estiver ocupada, defina outra:

```powershell
# PowerShell
$env:PORT="4444"
npm start
```

---

## Pasta das planilhas arquivadas

Por padrão o sistema lê:

```
Trilha_Analytics/planilhas-arquivadas/
```

Ela já contém:

- `EXEMPLO - TURMAS DEMONSTRATIVAS.xlsx` — exemplo com as duas seções;
- `LEIA-ME.txt` — instruções da pasta.

A lista é atualizada ao abrir a aba ou ao clicar em **Atualizar lista**. Só arquivos com extensão `.xls` ou `.xlsx` são exibidos. A planilha original nunca é alterada.

### Usar outra pasta

Defina a variável de ambiente `PLANILHAS_DIR` antes de iniciar:

```powershell
# PowerShell
$env:PLANILHAS_DIR="C:\Caminho\Para\Suas\Planilhas"
npm run dev
```

```bat
:: Prompt de Comando
set PLANILHAS_DIR=C:\Caminho\Para\Suas\Planilhas
npm run dev
```

Também é possível editar `server/config.js`.

---

## Estrutura do projeto

```
Trilha_Analytics/
├─ client/                      # React + Vite
│  ├─ index.html
│  ├─ vite.config.js
│  └─ src/
│     ├─ App.jsx                # estado geral, upload e navegação
│     ├─ api.js                 # chamadas à API
│     ├─ styles.css             # visual + estilos da guia de estrutura
│     ├─ lib/format.js
│     └─ components/
│        ├─ Sidebar.jsx         # menu lateral com as abas do sistema
│        ├─ Topbar.jsx
│        ├─ UploadPanel.jsx
│        ├─ Dashboard.jsx       # KPIs, filtros, CSV e PDF
│        ├─ Filters.jsx
│        ├─ Charts.jsx          # Chart.js (rosca e barras)
│        ├─ DataTable.jsx       # tabela detalhada + limpar busca
│        ├─ ArchivedPage.jsx    # lista de planilhas da pasta
│        └─ StructureGuide.jsx  # guia da estrutura aceita pelo scanner
├─ server/
│  ├─ index.js                  # Express, upload e rotas da pasta
│  ├─ scanner.js                # leitura das planilhas
│  └─ config.js                 # porta, caminho da pasta e limites
├─ planilhas-arquivadas/        # pasta de demonstração
├─ dist/                        # build de produção (gerado, não versionado)
├─ package.json
└─ README.md
```

---

## API

| Método | Rota                       | Descrição                                                                    |
| ------ | -------------------------- | ---------------------------------------------------------------------------- |
| `POST` | `/api/analisar`            | Recebe o campo multipart `arquivo` e devolve `{ ok, filename, sheets, rows }`. |
| `GET`  | `/api/arquivadas`          | Lista os arquivos da pasta configurada.                                      |
| `POST` | `/api/arquivadas/analisar` | Recebe `{ "arquivo": "nome.xlsx" }` e devolve o mesmo formato da importação. |

O scanner é compartilhado entre as duas formas de leitura, garantindo o mesmo resultado para upload e para planilhas arquivadas.

---

## Observações técnicas

- A leitura XLS/XLSX usa SheetJS (`xlsx` 0.20.3, distribuído pelo CDN oficial).
- Valores formatados das células são usados. Fórmulas usam o valor em cache gravado no arquivo.
- O limite de 15 MB vale para uploads. Arquivos da pasta local são lidos diretamente do disco.
- Nomes de arquivos com acentos são decodificados corretamente.
- O caminho informado pelo usuário é validado para impedir acesso a arquivos fora da pasta configurada.
- Planilhas com dados reais ficam fora do repositório: o `.gitignore` bloqueia todas as `.xls`/`.xlsx` da pasta, exceto o arquivo de demonstração.
