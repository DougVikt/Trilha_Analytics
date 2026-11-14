export const fmt = (value) =>
  new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(value);

export const pct = (value) =>
  `${(value || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB';
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} KB`;
  }
  return `${(bytes / (1024 * 1024)).toLocaleString('pt-BR', {
    maximumFractionDigits: 1,
  })} MB`;
}

export function formatDateTime(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}
