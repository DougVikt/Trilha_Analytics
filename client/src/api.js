async function readJson(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) {
    throw new Error(data.error || 'Não foi possível concluir a operação.');
  }
  return data;
}

export async function uploadSpreadsheet(file) {
  const formData = new FormData();
  formData.append('arquivo', file);

  const response = await fetch('/api/analisar', {
    method: 'POST',
    body: formData,
  });

  return readJson(response);
}

export async function listArchived() {
  const response = await fetch('/api/arquivadas');
  return readJson(response);
}

export async function scanArchived(fileName) {
  const response = await fetch('/api/arquivadas/analisar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ arquivo: fileName }),
  });

  return readJson(response);
}
