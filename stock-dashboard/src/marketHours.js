const MARKET_HOURS = {
  jp: { open: 0, close: 6, label: '東証' },       // 9:00-15:00 JST = 0:00-6:00 UTC
  us: { open: 13.5, close: 20, label: 'NYSE' },    // 9:30-16:00 ET = 13:30-20:00 UTC
  eu: { open: 7, close: 15.5, label: '欧州' },     // 8:00-16:30 CET = 7:00-15:30 UTC
  hk: { open: 1.5, close: 8, label: '香港' },      // 9:30-16:00 HKT = 1:30-8:00 UTC
  crypto: null,
  fx: null,
  commodity: { open: 22, close: 22, is24h: true },
};

function getMarketType(symbol) {
  if (!symbol) return null;
  if (symbol.endsWith('.T')) return 'jp';
  if (symbol.includes('-USD') || symbol.includes('-JPY')) return 'crypto';
  if (symbol.includes('=X') || symbol === 'DX-Y.NYB') return 'fx';
  if (symbol.endsWith('=F')) return 'commodity';
  if (symbol === '^N225' || symbol === '^TOPX' || symbol === 'NKD=F' || symbol === 'NIY=F') return 'jp';
  if (symbol === '^HSI') return 'hk';
  if (symbol === '000001.SS' || symbol === '399001.SZ') return 'hk';
  if (symbol === '^FTSE' || symbol === '^GDAXI' || symbol === '^FCHI' || symbol === '^STOXX50E') return 'eu';
  if (symbol === 'FTSEMIB.MI' || symbol === '^IBEX' || symbol === '^SSMI' || symbol === '^AEX') return 'eu';
  return 'us';
}

export function getMarketBands(symbol, data) {
  if (!data || data.length === 0) return [];

  const type = getMarketType(symbol);
  if (!type) return [];
  const hours = MARKET_HOURS[type];
  if (!hours || hours.is24h) return [];

  const days = new Set();
  data.forEach((d) => {
    const date = new Date(d.date);
    days.add(date.toISOString().split('T')[0]);
  });

  const bands = [];
  days.forEach((day) => {
    const openH = Math.floor(hours.open);
    const openM = (hours.open % 1) * 60;
    const closeH = Math.floor(hours.close);
    const closeM = (hours.close % 1) * 60;

    const start = new Date(`${day}T${String(openH).padStart(2, '0')}:${String(openM).padStart(2, '0')}:00.000Z`).getTime();
    const end = new Date(`${day}T${String(closeH).padStart(2, '0')}:${String(closeM).padStart(2, '0')}:00.000Z`).getTime();

    const dataStart = new Date(data[0].date).getTime();
    const dataEnd = new Date(data[data.length - 1].date).getTime();

    if (end >= dataStart && start <= dataEnd) {
      bands.push({ x1: Math.max(start, dataStart), x2: Math.min(end, dataEnd) });
    }
  });

  return bands;
}
