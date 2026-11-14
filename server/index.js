import express from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import { scanWorkbook, ScanError } from './scanner.js';
import {
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE,
  PLANILHAS_DIR,
  PORT,
  PROJECT_ROOT,
} from './config.js';

const app = express();

app.use(express.json({ limit: '1mb' }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
});

/**
 * O busboy/multer entrega o nome do arquivo em latin1. Esta função recupera
 * corretamente nomes com acentos (ex.: "FREQUÊNCIA.xlsx").
 */
function decodeOriginalName(name = '') {
  if (!/[^\x00-\x7F]/.test(name)) return name;
  const decoded = Buffer.from(name, 'latin1').toString('utf8');
  return decoded.includes('\uFFFD') ? name : decoded;
}

function scanErrorResponse(res, error, prefix = 'Erro ao ler a planilha: ') {
  if (error instanceof ScanError) {
    return res.status(error.status).json({ error: error.message });
  }
  return res.status(500).json({ error: prefix + error.message });
}

function isSpreadsheet(fileName) {
  return ALLOWED_EXTENSIONS.includes(path.extname(fileName).toLowerCase());
}

function sendFileError(res, error) {
  if (error?.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'O arquivo excede o limite de 15 MB.' });
  }
  return res.status(400).json({ error: 'Não foi possível receber o arquivo.' });
}

/** Lê e analisa um arquivo enviado pelo usuário (mesmo fluxo do PHP). */
app.post('/api/analisar', (req, res) => {
  upload.single('arquivo')(req, res, async (uploadError) => {
    if (uploadError) return sendFileError(res, uploadError);

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'Não foi possível receber o arquivo.' });
    }

    const fileName = decodeOriginalName(req.file.originalname);
    if (!isSpreadsheet(fileName)) {
      return res.status(400).json({ error: 'Envie um arquivo .xls ou .xlsx.' });
    }
    if (req.file.size > MAX_FILE_SIZE) {
      return res.status(400).json({ error: 'O arquivo excede o limite de 15 MB.' });
    }

    try {
      const { sheets, rows } = scanWorkbook(req.file.buffer);
      return res.json({
        ok: true,
        filename: path.basename(fileName),
        sheets,
        rows,
      });
    } catch (error) {
      return scanErrorResponse(res, error);
    }
  });
});

/** Lista as planilhas disponíveis na pasta configurada. */
app.get('/api/arquivadas', async (_req, res) => {
  try {
    const entries = await fsp.readdir(PLANILHAS_DIR, { withFileTypes: true });
    const files = await Promise.all(
      entries
        .filter((entry) => entry.isFile() && isSpreadsheet(entry.name))
        .map(async (entry) => {
          const stats = await fsp.stat(path.join(PLANILHAS_DIR, entry.name));
          return {
            name: entry.name,
            size: stats.size,
            modifiedAt: stats.mtime.toISOString(),
          };
        }),
    );

    files.sort((a, b) =>
      a.name.localeCompare(b.name, 'pt-BR', { numeric: true, sensitivity: 'base' }),
    );

    res.json({
      ok: true,
      folder: PLANILHAS_DIR,
      exists: true,
      files,
    });
  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'ENOTDIR') {
      return res.json({
        ok: true,
        folder: PLANILHAS_DIR,
        exists: false,
        files: [],
        warning: `A pasta configurada não foi encontrada: ${PLANILHAS_DIR}`,
      });
    }
    return res.status(500).json({
      error: 'Não foi possível ler a pasta de planilhas: ' + error.message,
    });
  }
});

/** Analisa uma planilha escolhida da pasta, com o mesmo scanner do upload. */
app.post('/api/arquivadas/analisar', async (req, res) => {
  const requestedName = typeof req.body?.arquivo === 'string' ? req.body.arquivo.trim() : '';

  if (!requestedName) {
    return res.status(400).json({ error: 'Selecione uma planilha arquivada.' });
  }
  if (!isSpreadsheet(requestedName) || path.basename(requestedName) !== requestedName) {
    return res.status(400).json({ error: 'Planilha inválida. Escolha um arquivo .xls ou .xlsx.' });
  }

  const fullPath = path.resolve(PLANILHAS_DIR, requestedName);
  if (path.dirname(fullPath) !== path.resolve(PLANILHAS_DIR)) {
    return res.status(400).json({ error: 'Planilha inválida. Escolha um arquivo da pasta configurada.' });
  }

  try {
    const stats = await fsp.stat(fullPath);
    if (!stats.isFile()) {
      return res.status(404).json({ error: 'Planilha não encontrada na pasta configurada.' });
    }

    const buffer = await fsp.readFile(fullPath);
    const { sheets, rows } = scanWorkbook(buffer);

    return res.json({
      ok: true,
      filename: requestedName,
      sheets,
      rows,
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({ error: 'Planilha não encontrada na pasta configurada.' });
    }
    return scanErrorResponse(res, error);
  }
});

// Rotas de API inexistentes retornam JSON em vez de HTML.
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Rota de API não encontrada.' });
});

// Em produção (após "npm run build"), o próprio Node serve o React compilado.
const distDir = path.join(PROJECT_ROOT, 'dist');
if (fs.existsSync(path.join(distDir, 'index.html'))) {
  app.use(express.static(distDir));
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api/')) return next();
    return res.sendFile(path.join(distDir, 'index.html'));
  });
}

// Fallback de erros não tratados nas rotas.
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'Erro inesperado: ' + error.message });
});

app.listen(PORT, () => {
  console.log(`API de frequência ouvindo em http://localhost:${PORT}`);
  console.log(`Pasta de planilhas arquivadas: ${PLANILHAS_DIR}`);
});
