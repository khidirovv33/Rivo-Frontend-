// Сум без копеек, разделитель тысяч — пробел (FRONTEND_TZ.md §6): "4 280 000".
const moneyFormatter = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });

export function formatMoney(amount: number): string {
  return moneyFormatter.format(amount);
}

const dateFormatter = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

const dateTimeFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso));
}
