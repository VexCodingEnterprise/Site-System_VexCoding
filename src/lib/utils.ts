export const cloneDeep = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export const createId = (prefix: string) => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Math.random().toString(36).slice(2, 11)}`;
};

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value || 0);

export const formatDate = (value: string | null | undefined) => {
  if (!value) {
    return 'Sem data';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
};

export const formatDateTime = (value: string | null | undefined) => {
  if (!value) {
    return 'Sem data';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
};

export const sumBy = <T>(items: T[], selector: (item: T) => number) =>
  items.reduce((total, item) => total + Number(selector(item) || 0), 0);

export const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() || '')
    .join('');

export const groupBy = <T, K extends string>(items: T[], selector: (item: T) => K) =>
  items.reduce<Record<K, T[]>>((groups, item) => {
    const key = selector(item);
    groups[key] = groups[key] ?? [];
    groups[key].push(item);
    return groups;
  }, {} as Record<K, T[]>);

export const monthKey = (value: string) => value.slice(0, 7);

export const percentageChange = (current: number, previous: number) => {
  if (!previous) {
    return current ? 100 : 0;
  }

  return ((current - previous) / previous) * 100;
};

export const cn = (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(' ');

export const sanitizeFileName = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9.-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
