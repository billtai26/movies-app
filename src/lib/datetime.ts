export const toLocalInput = (value?: string | number | Date | null) => {
  if (!value) return '';
  const d = new Date(value);
  const pad = (n: number) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const mm   = pad(d.getMonth() + 1);
  const dd   = pad(d.getDate());
  const hh   = pad(d.getHours());
  const mi   = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`; // format cho <input type="datetime-local">
};

export const fromLocalInput = (s?: string) => {
  // s dạng "YYYY-MM-DDTHH:mm" -> Date (local) (KHÔNG dùng toISOString ở đây)
  if (!s) return null;
  return new Date(s);
};

export const formatVN = (value?: string | number | Date | null) => {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('vi-VN', {
    hour: '2-digit', minute: '2-digit',
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
};
