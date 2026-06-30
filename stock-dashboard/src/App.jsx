import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ResponsiveGridLayout, useContainerWidth } from 'react-grid-layout';
import StockCard from './StockCard';
import StockDetail from './StockDetail';
import AddStockModal from './AddStockModal';
import { DEFAULT_STOCKS, DEFAULT_LAYOUT } from './stockConfig';
import AnalogClock from './AnalogClock';
import FlyingButterfly from './FlyingButterfly';
import FlyingBee, { BeeSVG } from './FlyingBee';
import FlyingSpider, { SpiderSVG, SpiderWeb } from './Spider';
import { STANDARD_PRESETS, buildStandardLayout } from './standardPresets';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

function DigitalClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const h = String(time.getHours()).padStart(2, '0');
  const m = String(time.getMinutes()).padStart(2, '0');
  const s = String(time.getSeconds()).padStart(2, '0');
  return (
    <span className="digital-clock">
      {[...`${h}:${m}:${s}`].map((c, i) => (
        <span key={i} className={c === ':' ? 'dc-colon' : 'dc-digit'}>{c}</span>
      ))}
    </span>
  );
}

const STORAGE_KEY_LAYOUT = 'stock-dashboard-layout';
const STORAGE_KEY_STOCKS = 'stock-dashboard-stocks';
const STORAGE_KEY_PRESETS = 'stock-dashboard-presets';
const STORAGE_KEY_ACTIVE = 'stock-dashboard-active-preset';
const REFRESH_INTERVAL = 60000;
const MAX_PRESETS = 3;

function loadFromStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

async function fetchStockData(symbols) {
  const res = await fetch('/api/stocks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symbols }),
  });
  if (!res.ok) throw new Error('API error');
  return res.json();
}

export default function App() {
  const { width, containerRef, mounted } = useContainerWidth();

  const [stocks, setStocks] = useState(() =>
    loadFromStorage(STORAGE_KEY_STOCKS, DEFAULT_STOCKS)
  );
  const [layouts, setLayouts] = useState(() => ({
    lg: loadFromStorage(STORAGE_KEY_LAYOUT, DEFAULT_LAYOUT),
  }));
  const [stockData, setStockData] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [detailStock, setDetailStock] = useState(null);
  const [viewMode, setViewMode] = useState('chart');
  const [presets, setPresets] = useState(() =>
    loadFromStorage(STORAGE_KEY_PRESETS, [])
  );
  const [activePreset, setActivePreset] = useState(() =>
    loadFromStorage(STORAGE_KEY_ACTIVE, null)
  );
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [butterflies, setButterflies] = useState([]);
  const [bees, setBees] = useState([]);
  const [spiders, setSpiders] = useState([]);
  const spiderPosRegistry = useRef({});
  const [flowers, setFlowers] = useState([]);
  const [draggingFlower, setDraggingFlower] = useState(null);
  const [webs, setWebs] = useState([]);
  const [caughtInsects, setCaughtInsects] = useState([]);

  const handleWebBuilt = React.useCallback((spiderId, data) => {
    setWebs(prev => [...prev, { ...data, id: spiderId }]);
  }, []);

  const handleCaught = React.useCallback((type, webId) => {
    const insect = {
      id: Date.now() + Math.random(),
      type, webId,
      offsetX: (Math.random() - 0.5) * 40,
      offsetY: (Math.random() - 0.5) * 40,
      opacity: 1,
    };
    setCaughtInsects(prev => [...prev, insect]);
    setTimeout(() => {
      setCaughtInsects(prev => prev.map(i => i.id === insect.id ? { ...i, opacity: 0 } : i));
    }, 240000);
    setTimeout(() => {
      setCaughtInsects(prev => prev.filter(i => i.id !== insect.id));
    }, 300000);
  }, []);

  const handleWebExpire = React.useCallback((webId) => {
    setWebs(prev => prev.filter(w => w.id !== webId));
    setCaughtInsects(prev => prev.filter(i => i.webId !== webId));
  }, []);

  const webTraps = webs.map(w => ({
    x: w.x, y: w.y, radius: w.radius,
    onCaught: (type) => handleCaught(type, w.id),
  }));

  const [sippingFlowers, setSippingFlowers] = useState(new Set());
  const flowerPositions = flowers.map(f => ({ id: f.id, x: f.x, y: f.y }));

  const handleSipStart = React.useCallback((flowerId) => {
    setSippingFlowers(prev => new Set([...prev, flowerId]));
  }, []);

  const handleSipEnd = React.useCallback((flowerId) => {
    setSippingFlowers(prev => { const next = new Set(prev); next.delete(flowerId); return next; });
  }, []);

  const handleFlowerDragStart = (color, e) => {
    e.preventDefault();
    const count = flowers.filter(f => f.color === color).length;
    if (count >= 6) return;
    setDraggingFlower({ color, mx: e.clientX, my: e.clientY });
  };

  useEffect(() => {
    if (!draggingFlower) return;
    const move = (e) => {
      setDraggingFlower(prev => prev ? { ...prev, mx: e.clientX, my: e.clientY } : null);
    };
    const up = (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setFlowers(prev => [...prev, { id: Date.now(), color: draggingFlower.color, x, y }]);
      setDraggingFlower(null);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mouseup', up); window.removeEventListener('mousemove', move); };
  }, [draggingFlower]);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const pendingAction = React.useRef(null);

  useEffect(() => {
    if (!hasUnsaved) return;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsaved]);

  const markUnsaved = () => setHasUnsaved(true);

  const confirmLeave = (action) => {
    if (hasUnsaved) {
      pendingAction.current = action;
      setShowLeaveModal(true);
    } else {
      action();
    }
  };

  const handleLeaveWithSave = () => {
    setShowPresetModal(true);
    setShowLeaveModal(false);
  };

  const handleLeaveWithout = () => {
    setHasUnsaved(false);
    setShowLeaveModal(false);
    if (pendingAction.current) {
      pendingAction.current();
      pendingAction.current = null;
    }
  };

  const handleLeaveCancel = () => {
    setShowLeaveModal(false);
    pendingAction.current = null;
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const symbols = stocks.map((s) => s.symbol);
      const data = await fetchStockData(symbols);
      if (!data.error) {
        for (const s of stocks) {
          if (data[s.symbol] && !data[s.symbol].error) {
            data[s.symbol].name = s.name;
          }
        }
        setStockData(data);
        setLastUpdate(new Date());
      }
    } catch (e) {
      console.error('データ取得エラー:', e);
    }
    setLoading(false);
  }, [stocks]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleLayoutChange = (currentLayout, allLayouts) => {
    const withConstraints = currentLayout.map((item) => ({
      ...item,
      minW: item.minW ?? 1,
      minH: item.minH ?? 1,
    }));
    setLayouts({ ...allLayouts, lg: withConstraints });
    localStorage.setItem(STORAGE_KEY_LAYOUT, JSON.stringify(withConstraints));
    markUnsaved();
  };

  const handleRemoveStock = (symbol) => {
    const newStocks = stocks.filter((s) => s.symbol !== symbol);
    setStocks(newStocks);
    localStorage.setItem(STORAGE_KEY_STOCKS, JSON.stringify(newStocks));

    const newLayout = layouts.lg.filter((l) => l.i !== symbol);
    setLayouts({ lg: newLayout });
    localStorage.setItem(STORAGE_KEY_LAYOUT, JSON.stringify(newLayout));
    markUnsaved();
  };

  const handleAddStock = async (symbol, name) => {
    if (stocks.find((s) => s.symbol === symbol)) return;

    const newStock = { symbol, name, region: 'その他' };
    const newStocks = [...stocks, newStock];
    setStocks(newStocks);
    localStorage.setItem(STORAGE_KEY_STOCKS, JSON.stringify(newStocks));

    const maxY = layouts.lg.reduce((max, l) => Math.max(max, l.y + l.h), 0);
    const newLayoutItem = {
      i: symbol,
      x: 0,
      y: maxY,
      w: 16,
      h: 16,
      minW: 1,
      minH: 1,
    };
    const newLayout = [...layouts.lg, newLayoutItem];
    setLayouts({ lg: newLayout });
    localStorage.setItem(STORAGE_KEY_LAYOUT, JSON.stringify(newLayout));
    markUnsaved();

    try {
      const data = await fetchStockData([symbol]);
      if (!data.error) {
        setStockData((prev) => ({ ...prev, ...data }));
      }
    } catch (e) {
      console.error('銘柄追加エラー:', e);
    }
  };

  const handleReset = () => {
    setStocks(DEFAULT_STOCKS);
    setLayouts({ lg: DEFAULT_LAYOUT });
    localStorage.setItem(STORAGE_KEY_STOCKS, JSON.stringify(DEFAULT_STOCKS));
    localStorage.setItem(STORAGE_KEY_LAYOUT, JSON.stringify(DEFAULT_LAYOUT));
    setActivePreset(null);
    localStorage.setItem(STORAGE_KEY_ACTIVE, JSON.stringify(null));
    setHasUnsaved(false);
  };

  const handleSavePreset = (name) => {
    const newPreset = {
      id: Date.now(),
      name,
      stocks: [...stocks],
      layout: [...layouts.lg],
    };
    let updated;
    const existingIndex = presets.findIndex((p) => p.name === name);
    if (existingIndex >= 0) {
      updated = [...presets];
      updated[existingIndex] = newPreset;
    } else {
      if (presets.length >= MAX_PRESETS) {
        updated = [...presets.slice(1), newPreset];
      } else {
        updated = [...presets, newPreset];
      }
    }
    setPresets(updated);
    setActivePreset(name);
    localStorage.setItem(STORAGE_KEY_PRESETS, JSON.stringify(updated));
    localStorage.setItem(STORAGE_KEY_ACTIVE, JSON.stringify(name));
    setHasUnsaved(false);
  };

  const handleLoadPreset = (preset) => {
    setStocks(preset.stocks);
    setLayouts({ lg: preset.layout });
    localStorage.setItem(STORAGE_KEY_STOCKS, JSON.stringify(preset.stocks));
    localStorage.setItem(STORAGE_KEY_LAYOUT, JSON.stringify(preset.layout));
    setActivePreset(preset.name);
    localStorage.setItem(STORAGE_KEY_ACTIVE, JSON.stringify(preset.name));
    setShowPresetModal(false);
  };

  const handleDeletePreset = (id) => {
    const updated = presets.filter((p) => p.id !== id);
    setPresets(updated);
    localStorage.setItem(STORAGE_KEY_PRESETS, JSON.stringify(updated));
  };

  const handleStandardPreset = (preset) => {
    const action = () => {
      setStocks(preset.stocks);
      const layout = buildStandardLayout(preset.stocks);
      setLayouts({ lg: layout });
      localStorage.setItem(STORAGE_KEY_STOCKS, JSON.stringify(preset.stocks));
      localStorage.setItem(STORAGE_KEY_LAYOUT, JSON.stringify(layout));
      setActivePreset(preset.name);
      localStorage.setItem(STORAGE_KEY_ACTIVE, JSON.stringify(preset.name));
      setHasUnsaved(false);
    };
    confirmLeave(action);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="title-area">
          <h1>世界の株価</h1>
          <AnalogClock size={44} />
          <svg className="title-butterfly" viewBox="0 0 120 130" width="32" height="35"
            onClick={() => { if (butterflies.length < 2) setButterflies(prev => [...prev, Date.now()]); }} style={{ cursor: 'pointer' }}>
            <defs>
              <linearGradient id="agWing" x1="0.3" y1="0" x2="0.7" y2="1">
                <stop offset="0%" stopColor="#eeffff" />
                <stop offset="25%" stopColor="#aaf0ff" />
                <stop offset="50%" stopColor="#66ddff" />
                <stop offset="80%" stopColor="#44ccee" />
                <stop offset="100%" stopColor="#33aabb" />
              </linearGradient>
              <radialGradient id="agHL" cx="0.4" cy="0.35" r="0.55">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>
            {/* 左上翅 - 大きく横に広がり先端が丸い */}
            <path d="M56,50 C50,38 38,18 24,8 C16,2 6,2 2,10 C-2,20 2,34 12,44 C22,52 40,56 56,50Z"
              fill="url(#agWing)" stroke="rgba(100,220,255,0.4)" strokeWidth="0.3" />
            <path d="M56,50 C50,38 38,18 24,8 C16,2 6,2 2,10 C-2,20 2,34 12,44 C22,52 40,56 56,50Z"
              fill="url(#agHL)" />
            {/* 右上翅 */}
            <path d="M64,50 C70,38 82,18 96,8 C104,2 114,2 118,10 C122,20 118,34 108,44 C98,52 80,56 64,50Z"
              fill="url(#agWing)" stroke="rgba(100,220,255,0.4)" strokeWidth="0.3" />
            <path d="M64,50 C70,38 82,18 96,8 C104,2 114,2 118,10 C122,20 118,34 108,44 C98,52 80,56 64,50Z"
              fill="url(#agHL)" />
            {/* 左下翅 - 大きく丸みを帯びて波打つ */}
            <path d="M56,54 C44,58 28,66 18,78 C12,86 10,94 16,96 C22,96 30,90 36,82 C42,74 50,62 56,54Z"
              fill="url(#agWing)" stroke="rgba(100,220,255,0.4)" strokeWidth="0.3" />
            <path d="M56,54 C44,58 28,66 18,78 C12,86 10,94 16,96 C22,96 30,90 36,82 C42,74 50,62 56,54Z"
              fill="url(#agHL)" opacity="0.4" />
            {/* 左尾状突起 */}
            <path d="M18,78 C14,88 12,102 16,110 C18,114 20,112 20,106 C20,98 18,88 18,78"
              fill="url(#agWing)" stroke="rgba(100,220,255,0.4)" strokeWidth="0.3" />
            {/* 右下翅 */}
            <path d="M64,54 C76,58 92,66 102,78 C108,86 110,94 104,96 C98,96 90,90 84,82 C78,74 70,62 64,54Z"
              fill="url(#agWing)" stroke="rgba(100,220,255,0.4)" strokeWidth="0.3" />
            <path d="M64,54 C76,58 92,66 102,78 C108,86 110,94 104,96 C98,96 90,90 84,82 C78,74 70,62 64,54Z"
              fill="url(#agHL)" opacity="0.4" />
            {/* 右尾状突起 */}
            <path d="M102,78 C106,88 108,102 104,110 C102,114 100,112 100,106 C100,98 102,88 102,78"
              fill="url(#agWing)" stroke="rgba(100,220,255,0.4)" strokeWidth="0.3" />
            {/* 翅脈 */}
            <path d="M56,50 C42,36 26,18 14,8" fill="none" stroke="#0a2030" strokeWidth="0.5" opacity="0.35" />
            <path d="M56,50 C40,42 20,32 6,24" fill="none" stroke="#0a2030" strokeWidth="0.4" opacity="0.25" />
            <path d="M56,50 C44,48 22,44 6,38" fill="none" stroke="#0a2030" strokeWidth="0.3" opacity="0.2" />
            <path d="M64,50 C78,36 94,18 106,8" fill="none" stroke="#0a2030" strokeWidth="0.5" opacity="0.35" />
            <path d="M64,50 C80,42 100,32 114,24" fill="none" stroke="#0a2030" strokeWidth="0.4" opacity="0.25" />
            <path d="M64,50 C76,48 98,44 114,38" fill="none" stroke="#0a2030" strokeWidth="0.3" opacity="0.2" />
            <path d="M56,54 C42,62 28,74 20,84" fill="none" stroke="#0a2030" strokeWidth="0.3" opacity="0.2" />
            <path d="M64,54 C78,62 92,74 100,84" fill="none" stroke="#0a2030" strokeWidth="0.3" opacity="0.2" />
            {/* キラキラ */}
            <circle cx="28" cy="22" r="2" fill="#ffffff" opacity="0.6" />
            <circle cx="92" cy="22" r="2" fill="#ffffff" opacity="0.6" />
            <circle cx="16" cy="38" r="1.2" fill="#ffffff" opacity="0.4" />
            <circle cx="104" cy="38" r="1.2" fill="#ffffff" opacity="0.4" />
            <circle cx="36" cy="70" r="1" fill="#ffffff" opacity="0.35" />
            <circle cx="84" cy="70" r="1" fill="#ffffff" opacity="0.35" />
            {/* 胴体 */}
            <ellipse cx="60" cy="54" rx="2.5" ry="12" fill="#0a2030" />
            {/* 触角 */}
            <path d="M58,43 C54,34 48,26 44,20" fill="none" stroke="#0a2030" strokeWidth="0.5" />
            <path d="M62,43 C66,34 72,26 76,20" fill="none" stroke="#0a2030" strokeWidth="0.5" />
            <circle cx="44" cy="20" r="1.2" fill="#0a2030" />
            <circle cx="76" cy="20" r="1.2" fill="#0a2030" />
          </svg>
          <div className="title-bee" onClick={() => { if (bees.length < 8) setBees(prev => [...prev, Date.now()]); }} style={{ cursor: 'pointer' }}>
            <BeeSVG wingOpen={1} size={30} />
          </div>
          <div className="title-spider" onClick={() => { if (spiders.length < 5) setSpiders(prev => [...prev, Date.now()]); }} style={{ cursor: 'pointer' }}>
            <SpiderSVG size={28} />
          </div>
          {/* 赤い花 */}
          <svg className="title-flower red-flower" viewBox="0 0 60 60" width="32" height="32"
            style={{ cursor: 'grab' }} onMouseDown={(e) => handleFlowerDragStart('red', e)}>
            <defs>
              <radialGradient id="rfCenter" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stopColor="#ffee44" />
                <stop offset="100%" stopColor="#ddaa00" />
              </radialGradient>
            </defs>
            {[0,1,2,3,4,5].map(i => (
              <ellipse key={i} cx="30" cy="14" rx="8" ry="13"
                fill="#ee2233" stroke="rgba(255,100,100,0.4)" strokeWidth="0.3"
                transform={`rotate(${i * 60}, 30, 30)`} />
            ))}
            {[0,1,2,3,4,5].map(i => (
              <ellipse key={`h${i}`} cx="30" cy="16" rx="5" ry="9"
                fill="#ff5566" opacity="0.5"
                transform={`rotate(${i * 60}, 30, 30)`} />
            ))}
            <circle cx="30" cy="30" r="7" fill="url(#rfCenter)" />
            <circle cx="28" cy="28" r="1" fill="#fff" opacity="0.4" />
            <circle cx="32" cy="29" r="0.8" fill="#fff" opacity="0.3" />
          </svg>
          {/* 黄色い花 */}
          <svg className="title-flower yellow-flower" viewBox="0 0 60 60" width="32" height="32"
            style={{ cursor: 'grab' }} onMouseDown={(e) => handleFlowerDragStart('yellow', e)}>
            <defs>
              <radialGradient id="yfCenter" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stopColor="#aa6600" />
                <stop offset="100%" stopColor="#774400" />
              </radialGradient>
            </defs>
            {[0,1,2,3,4,5,6,7].map(i => (
              <ellipse key={i} cx="30" cy="12" rx="7" ry="14"
                fill="#ffdd00" stroke="rgba(255,220,0,0.4)" strokeWidth="0.3"
                transform={`rotate(${i * 45}, 30, 30)`} />
            ))}
            {[0,1,2,3,4,5,6,7].map(i => (
              <ellipse key={`h${i}`} cx="30" cy="15" rx="4" ry="9"
                fill="#ffee66" opacity="0.45"
                transform={`rotate(${i * 45}, 30, 30)`} />
            ))}
            <circle cx="30" cy="30" r="6.5" fill="url(#yfCenter)" />
            <circle cx="28" cy="28" r="0.8" fill="#ffee88" opacity="0.4" />
            <circle cx="32" cy="29" r="0.6" fill="#ffee88" opacity="0.3" />
          </svg>
        </div>
        <div className="header-actions">
          <div className="clock-area">
            <DigitalClock />
            {lastUpdate && (
              <span className="last-update">
                最終更新: {lastUpdate.toLocaleTimeString('ja-JP')}
              </span>
            )}
          </div>
          <button className={`btn btn-update ${loading ? 'btn-loading' : ''}`} onClick={fetchData} disabled={loading}>
            {loading ? '更新中' : '更新'}
          </button>
          <button
            className={`btn btn-view ${viewMode === 'board' ? 'btn-active' : ''}`}
            onClick={() => setViewMode(viewMode === 'board' ? 'chart' : 'board')}
          >
            {viewMode === 'board' ? '一覧' : 'チャート'}
          </button>
          {viewMode === 'chart' && (
            <button
              className={`btn ${editMode ? 'btn-active' : ''}`}
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? '完了' : '編集'}
            </button>
          )}
          <button className="btn btn-add" onClick={() => setShowAddModal(true)}>
            + 追加
          </button>
          <button className="btn btn-preset" onClick={() => setShowPresetModal(true)}>
            保存/呼出
          </button>
          <button className="btn btn-reset" onClick={() => confirmLeave(handleReset)}>
            リセット
          </button>
        </div>
      </header>

      <div className="standard-preset-bar">
        {STANDARD_PRESETS.map((sp) => (
          <button
            key={sp.name}
            className={`std-preset-btn ${activePreset === sp.name ? 'active' : ''}`}
            onClick={() => handleStandardPreset(sp)}
          >
            {sp.name}
          </button>
        ))}
      </div>

      {viewMode === 'board' ? (
        <main className="board-view">
          {stocks.map((stock) => {
            const d = stockData[stock.symbol];
            if (!d || !d.price) {
              return (
                <div key={stock.symbol} className="board-tile loading" onClick={() => d && setDetailStock(d)}>
                  <span className="board-name">{stock.name}</span>
                  <span className="board-loading-text">--</span>
                </div>
              );
            }
            const isUp = d.change >= 0;
            return (
              <div
                key={stock.symbol}
                className={`board-tile ${isUp ? 'board-up' : 'board-down'}`}
                onClick={() => setDetailStock(d)}
              >
                <div className="board-top-row">
                  <span className="board-name">{d.name}</span>
                  <button className="board-remove" onClick={(e) => { e.stopPropagation(); handleRemoveStock(stock.symbol); }}>×</button>
                </div>
                <div className="board-price">{d.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="board-bottom-row">
                  <span className="board-change">{isUp ? '+' : ''}{d.change?.toFixed(2)}</span>
                  <span className="board-percent">({isUp ? '+' : ''}{d.changePercent?.toFixed(2)}%)</span>
                </div>
              </div>
            );
          })}
        </main>
      ) : (
        <main className="dashboard" ref={containerRef}>
          {mounted && (
            <ResponsiveGridLayout
              className="layout"
              width={width}
              layouts={layouts}
              breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
              cols={{ lg: 80, md: 60, sm: 40, xs: 20 }}
              rowHeight={10}
              maxRows={200}
              margin={[4, 4]}
              containerPadding={[8, 8]}
              autoSize={true}
              dragConfig={{
                enabled: editMode,
                handle: '.stock-header',
              }}
              resizeConfig={{
                enabled: editMode,
                handles: ['se'],
              }}
              onLayoutChange={handleLayoutChange}
            >
              {stocks.map((stock) => (
                <div key={stock.symbol} className={editMode ? 'grid-item editing' : 'grid-item'}>
                  <StockCard
                    stock={stockData[stock.symbol] || { ...stock, price: null }}
                    onRemove={handleRemoveStock}
                    onExpand={(s) => setDetailStock(s)}
                  />
                </div>
              ))}
            </ResponsiveGridLayout>
          )}
        </main>
      )}

      {detailStock && (
        <StockDetail
          stock={detailStock}
          onClose={() => setDetailStock(null)}
        />
      )}

      {showAddModal && (
        <AddStockModal
          onAdd={handleAddStock}
          onClose={() => setShowAddModal(false)}
          existingSymbols={stocks.map((s) => s.symbol)}
        />
      )}

      {showPresetModal && (
        <PresetModal
          presets={presets}
          activePreset={activePreset}
          onSave={handleSavePreset}
          onLoad={handleLoadPreset}
          onDelete={handleDeletePreset}
          onClose={() => setShowPresetModal(false)}
          maxPresets={MAX_PRESETS}
        />
      )}

      {flowers.map(f => (
        <div key={f.id} className={`placed-flower ${f.color}-flower-placed ${sippingFlowers.has(f.id) ? 'flower-sipping' : ''}`}
          style={{ position: 'fixed', left: `${f.x}vw`, top: `${f.y}vh`, transform: 'translate(-50%,-50%)', zIndex: 9988, cursor: 'grab' }}
          onDoubleClick={() => setFlowers(prev => prev.filter(fl => fl.id !== f.id))}
          onMouseDown={(e) => {
            e.preventDefault();
            const move = (ev) => {
              const nx = (ev.clientX / window.innerWidth) * 100;
              const ny = (ev.clientY / window.innerHeight) * 100;
              setFlowers(prev => prev.map(fl => fl.id === f.id ? { ...fl, x: nx, y: ny } : fl));
            };
            const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
            window.addEventListener('mousemove', move);
            window.addEventListener('mouseup', up);
          }}>
          <svg viewBox="0 0 60 60" width="50" height="50">
            {f.color === 'red' ? (
              <>
                {[0,1,2,3,4,5].map(i => <ellipse key={i} cx="30" cy="14" rx="8" ry="13" fill="#ee2233" transform={`rotate(${i*60},30,30)`} />)}
                {[0,1,2,3,4,5].map(i => <ellipse key={`h${i}`} cx="30" cy="16" rx="5" ry="9" fill="#ff5566" opacity="0.5" transform={`rotate(${i*60},30,30)`} />)}
                <circle cx="30" cy="30" r="7" fill="#ddaa00" />
              </>
            ) : (
              <>
                {[0,1,2,3,4,5,6,7].map(i => <ellipse key={i} cx="30" cy="12" rx="7" ry="14" fill="#ffdd00" transform={`rotate(${i*45},30,30)`} />)}
                {[0,1,2,3,4,5,6,7].map(i => <ellipse key={`h${i}`} cx="30" cy="15" rx="4" ry="9" fill="#ffee66" opacity="0.45" transform={`rotate(${i*45},30,30)`} />)}
                <circle cx="30" cy="30" r="6.5" fill="#774400" />
              </>
            )}
          </svg>
        </div>
      ))}

      {draggingFlower && (
        <>
          <div className="drag-overlay" style={{ position: 'fixed', inset: 0, zIndex: 99998, cursor: 'grabbing' }} />
          <div className="dragging-flower" style={{
            position: 'fixed', left: draggingFlower.mx, top: draggingFlower.my,
            transform: 'translate(-50%,-50%)', zIndex: 99999, pointerEvents: 'none',
          }}>
            <svg viewBox="0 0 60 60" width="50" height="50" style={{ opacity: 0.8 }}>
              {draggingFlower.color === 'red' ? (
                <>
                  {[0,1,2,3,4,5].map(i => <ellipse key={i} cx="30" cy="14" rx="8" ry="13" fill="#ee2233" transform={`rotate(${i*60},30,30)`} />)}
                  <circle cx="30" cy="30" r="7" fill="#ddaa00" />
                </>
              ) : (
                <>
                  {[0,1,2,3,4,5,6,7].map(i => <ellipse key={i} cx="30" cy="12" rx="7" ry="14" fill="#ffdd00" transform={`rotate(${i*45},30,30)`} />)}
                  <circle cx="30" cy="30" r="6.5" fill="#774400" />
                </>
              )}
            </svg>
          </div>
        </>
      )}

      {butterflies.map(id => (
        <FlyingButterfly key={id} onDone={() => setButterflies(prev => prev.filter(b => b !== id))} webTraps={webTraps} flowers={flowerPositions} onSipStart={handleSipStart} onSipEnd={handleSipEnd} />
      ))}

      {bees.map(id => (
        <FlyingBee key={id} onDone={() => setBees(prev => prev.filter(b => b !== id))} webTraps={webTraps} flowers={flowerPositions} onSipStart={handleSipStart} onSipEnd={handleSipEnd} />
      ))}

      {spiders.map(id => (
        <FlyingSpider key={id}
          spiderId={id}
          posRegistry={spiderPosRegistry.current}
          onWebBuilt={(data) => handleWebBuilt(id, data)}
          onDone={() => { setSpiders(prev => prev.filter(s => s !== id)); setWebs(prev => prev.filter(w => w.id !== id)); setCaughtInsects(prev => prev.filter(i => i.webId !== id)); }} />
      ))}

      {webs.map(w => (
        <SpiderWeb key={w.id} x={w.x} y={w.y} radius={w.radius} growDuration={w.growDuration}
          caughtInsects={caughtInsects.filter(i => i.webId === w.id)}
          onExpire={() => handleWebExpire(w.id)} />
      ))}

      {showLeaveModal && (
        <div className="modal-overlay" onClick={handleLeaveCancel}>
          <div className="modal leave-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>未保存の変更があります</h2>
            </div>
            <p className="leave-message">現在のレイアウトをプリセットに保存しますか？</p>
            <div className="leave-actions">
              <button className="leave-btn leave-save" onClick={handleLeaveWithSave}>保存する</button>
              <button className="leave-btn leave-discard" onClick={handleLeaveWithout}>保存しない</button>
              <button className="leave-btn leave-cancel" onClick={handleLeaveCancel}>キャンセル</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PresetModal({ presets, activePreset, onSave, onLoad, onDelete, onClose, maxPresets }) {
  const [saveName, setSaveName] = useState('');

  const handleSave = () => {
    const name = saveName.trim();
    if (!name) return;
    onSave(name);
    setSaveName('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal preset-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>プリセット管理</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-section">
          <h3>現在のレイアウトを保存（最大{maxPresets}件）</h3>
          <div className="preset-save-row">
            <input
              type="text"
              placeholder="プリセット名（例: FX用、株式用）"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              className="preset-input"
            />
            <button onClick={handleSave} className="preset-save-btn">保存</button>
          </div>
        </div>

        <div className="modal-section">
          <h3>保存済みプリセット</h3>
          {presets.length === 0 ? (
            <div className="preset-empty">保存済みプリセットはありません</div>
          ) : (
            <div className="preset-list">
              {presets.map((preset) => (
                <div key={preset.id} className={`preset-item ${activePreset === preset.name ? 'active' : ''}`}>
                  <div className="preset-info">
                    <span className="preset-name">{preset.name}</span>
                    <span className="preset-detail">{preset.stocks.length}銘柄</span>
                  </div>
                  <div className="preset-actions">
                    <button className="preset-load-btn" onClick={() => onLoad(preset)}>呼出</button>
                    <button className="preset-overwrite-btn" onClick={() => onSave(preset.name)}>上書き</button>
                    <button className="preset-delete-btn" onClick={() => onDelete(preset.id)}>削除</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
