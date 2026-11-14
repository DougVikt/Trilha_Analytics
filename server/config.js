import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

/**
 * PASTA DAS PLANILHAS ARQUIVADAS
 * ---------------------------------------------------------------------------
 * Por padrão o sistema lê a pasta "planilhas-arquivadas" deste projeto, que
 * contém apenas o arquivo de demonstração.
 *
 * Para apontar para outra pasta, defina a variável de ambiente PLANILHAS_DIR
 * antes de iniciar o servidor. Exemplos (Windows):
 *
 *   PLANILHAS_DIR=C:\Planilhas\Frequencia npm run dev
 *   PLANILHAS_DIR=\\servidor\compartilhamento\Frequencia npm start
 *
 * Também é possível usar um caminho relativo à raiz do projeto:
 *   PLANILHAS_DIR=minhas-planilhas npm run dev
 */
const PASTA_DEMO = 'planilhas-arquivadas';

export const PLANILHAS_DIR = process.env.PLANILHAS_DIR
  ? path.resolve(projectRoot, process.env.PLANILHAS_DIR)
  : path.resolve(projectRoot, PASTA_DEMO);

export const PROJECT_ROOT = projectRoot;
export const PORT = Number(process.env.PORT) || 3333;
export const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB
export const ALLOWED_EXTENSIONS = ['.xls', '.xlsx'];
