const FLAG_BASE = 'https://flagcdn.com/w40';

const COUNTRY_CODES = {
  USD: 'us',
  JPY: 'jp',
  EUR: 'eu',
  GBP: 'gb',
  AUD: 'au',
  NZD: 'nz',
  CAD: 'ca',
  CHF: 'ch',
  TRY: 'tr',
  ZAR: 'za',
  MXN: 'mx',
  CNY: 'cn',
  KRW: 'kr',
  INR: 'in',
  BRL: 'br',
  SGD: 'sg',
  HKD: 'hk',
  THB: 'th',
  SEK: 'se',
  NOK: 'no',
  PLN: 'pl',
};

const SYMBOL_FLAGS = {
  '^N225': ['jp'],
  '^TOPX': ['jp'],
  'NKD=F': ['jp'],
  'NIY=F': ['jp'],
  '1570.T': ['jp'],
  '1357.T': ['jp'],

  '^DJI': ['us'],
  '^GSPC': ['us'],
  '^IXIC': ['us'],
  '^VIX': ['us'],
  '^SOX': ['us'],
  '^NYFANG': ['us'],
  '^RUT': ['us'],
  '^NYA': ['us'],
  '^W5000': ['us'],
  '^TNX': ['us'],
  '^FVX': ['us'],
  '^TYX': ['us'],
  '^IRX': ['us'],
  'DX-Y.NYB': ['us'],
  '^JGBS': ['jp'],

  '^FTSE': ['gb'],
  '^GDAXI': ['de'],
  '^FCHI': ['fr'],
  '^STOXX50E': ['eu'],
  '^IBEX': ['es'],
  '^SSMI': ['ch'],
  '^AEX': ['nl'],
  '^BFX': ['be'],
  '^OMXS30': ['se'],
  'FTSEMIB.MI': ['it'],
  '^HSI': ['hk'],
  '000001.SS': ['cn'],
  '399001.SZ': ['cn'],
  '^KS11': ['kr'],
  '^TWII': ['tw'],
  '^BSESN': ['in'],
  '^NSEI': ['in'],
  '^STI': ['sg'],
  '^JKSE': ['id'],
  '^SET.BK': ['th'],
  '^KLSE': ['my'],
  '^AXJO': ['au'],
  '^NZ50': ['nz'],
  '^BVSP': ['br'],
  '^MXX': ['mx'],
  '^MERV': ['ar'],
  '^GSPTSE': ['ca'],
  '^TA125.TA': ['il'],
  '^CASE30': ['eg'],
  'XU100.IS': ['tr'],
  '^MOEX': ['ru'],
  'IMOEX.ME': ['ru'],
  '^J203.JO': ['za'],

  'BTC-USD': ['btc'],
  'ETH-USD': ['eth'],
  'XRP-USD': ['xrp'],
  'SOL-USD': ['sol'],
  'ADA-USD': ['ada'],
  'DOGE-USD': ['doge'],
  'AVAX-USD': ['avax'],
  'DOT-USD': ['dot'],
};

const SUFFIX_FLAGS = {
  '.T': 'jp',
};

function flagUrl(countryCode) {
  if (!countryCode) return null;
  return `${FLAG_BASE}/${countryCode}.png`;
}

function getStockCountry(symbol) {
  if (SYMBOL_FLAGS[symbol]) {
    const cc = SYMBOL_FLAGS[symbol][0];
    if (cc.length === 2) return cc;
    return null;
  }

  for (const [suffix, cc] of Object.entries(SUFFIX_FLAGS)) {
    if (symbol.endsWith(suffix)) return cc;
  }

  const US_STOCK = /^[A-Z]{1,5}(-[A-Z])?$/;
  if (US_STOCK.test(symbol) && !symbol.includes('=') && !symbol.startsWith('^')) {
    return 'us';
  }

  return null;
}

export function getSymbolFlags(symbol) {
  if (!symbol) return null;

  if (symbol.includes('=X')) {
    const pair = symbol.replace('=X', '');
    const base = pair.substring(0, 3).toUpperCase();
    const quote = pair.substring(3, 6).toUpperCase();
    const baseCC = COUNTRY_CODES[base];
    const quoteCC = COUNTRY_CODES[quote];
    if (!baseCC && !quoteCC) return null;
    return {
      flags: [
        baseCC ? flagUrl(baseCC) : null,
        quoteCC ? flagUrl(quoteCC) : null,
      ].filter(Boolean),
    };
  }

  const cc = getStockCountry(symbol);
  if (cc) {
    return { flags: [flagUrl(cc)] };
  }

  return null;
}

export function getCurrencyFlags(symbol) {
  const result = getSymbolFlags(symbol);
  if (!result) return null;
  return {
    baseUrl: result.flags[0] || null,
    quoteUrl: result.flags[1] || null,
  };
}
