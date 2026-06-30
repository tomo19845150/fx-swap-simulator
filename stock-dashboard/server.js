const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance();

app.post('/api/stocks', async (req, res) => {
  try {
    const { symbols } = req.body;
    const results = {};

    for (const symbol of symbols) {
      try {
        const quote = await yahooFinance.quote(symbol);
        results[symbol] = {
          symbol: quote.symbol,
          name: quote.shortName || quote.longName || symbol,
          price: quote.regularMarketPrice,
          change: quote.regularMarketChange,
          changePercent: quote.regularMarketChangePercent,
          previousClose: quote.regularMarketPreviousClose,
          currency: quote.currency,
          marketState: quote.marketState,
        };
      } catch (e) {
        results[symbol] = { symbol, error: e.message };
      }
    }

    res.json(results);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/history', async (req, res) => {
  try {
    const { symbol, period, mode } = req.body;
    const now = new Date();

    let from, interval;

    if (mode === 'bar') {
      const barConfig = {
        '5m':  { days: 7,     interval: '5m' },
        '15m': { days: 60,    interval: '15m' },
        '1h':  { days: 730,   interval: '60m' },
        '4h':  { days: 730,   interval: '60m' },
        '1D':  { days: 1825,  interval: '1d' },
        '1W':  { days: 3650,  interval: '1wk' },
      };
      const cfg = barConfig[period] || barConfig['1h'];
      from = new Date(now.getTime() - cfg.days * 24 * 60 * 60 * 1000);
      interval = cfg.interval;
    } else {
      const periodDays = { '5m': 0, '60m': 0, '1D': 1, '3D': 3, '1W': 7, '1M': 30, '3M': 90, '6M': 180, '1Y': 365, '3Y': 1095, '5Y': 1825, '10Y': 3650 };
      const days = periodDays[period] ?? 30;

      if (period === '5m') {
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        interval = '5m';
      } else if (period === '60m') {
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        interval = '15m';
      } else if (period === '1D' || period === '3D') {
        from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        interval = '15m';
      } else {
        from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        interval = days <= 7 ? '1h' : days <= 90 ? '1d' : '1wk';
      }
    }

    const useIso = ['5m', '60m', '15m', '1h', '4h'].includes(period) || (mode === 'bar' && ['5m', '15m', '1h', '4h'].includes(period));

    const result = await yahooFinance.chart(symbol, {
      period1: useIso ? from.toISOString() : from.toISOString().split('T')[0],
      period2: now.toISOString(),
      interval,
    });

    let data = result.quotes.map((q) => ({
      date: q.date,
      close: q.close,
      high: q.high,
      low: q.low,
      open: q.open,
      volume: q.volume,
    })).filter((q) => q.close != null);

    const MAX_POINTS = 300;
    if (data.length > MAX_POINTS) {
      const step = data.length / MAX_POINTS;
      const sampled = [];
      for (let i = 0; i < MAX_POINTS - 1; i++) {
        const idx = Math.round(i * step);
        sampled.push(data[idx]);
      }
      sampled.push(data[data.length - 1]);
      data = sampled;
    }

    res.json({ symbol, data });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Stock API server running at http://localhost:${PORT}`);
});
