import React, { useState } from 'react';

const STOCK_CATEGORIES = [
  {
    category: '米国株（テック）',
    stocks: [
      { symbol: 'AAPL', name: 'アップル' },
      { symbol: 'MSFT', name: 'マイクロソフト' },
      { symbol: 'GOOGL', name: 'グーグル' },
      { symbol: 'AMZN', name: 'アマゾン' },
      { symbol: 'META', name: 'メタ' },
      { symbol: 'TSLA', name: 'テスラ' },
      { symbol: 'NVDA', name: 'エヌビディア' },
      { symbol: 'NFLX', name: 'ネットフリックス' },
      { symbol: 'AMD', name: 'AMD' },
      { symbol: 'INTC', name: 'インテル' },
      { symbol: 'MU', name: 'マイクロン' },
      { symbol: 'AVGO', name: 'ブロードコム' },
      { symbol: 'PLTR', name: 'パランティア' },
      { symbol: 'CRM', name: 'セールスフォース' },
      { symbol: 'ORCL', name: 'オラクル' },
      { symbol: 'ADBE', name: 'アドビ' },
      { symbol: 'CSCO', name: 'シスコ' },
      { symbol: 'QCOM', name: 'クアルコム' },
      { symbol: 'TXN', name: 'テキサスインスツルメンツ' },
      { symbol: 'AMAT', name: 'アプライドマテリアルズ' },
      { symbol: 'LRCX', name: 'ラムリサーチ' },
      { symbol: 'KLAC', name: 'KLA' },
      { symbol: 'MRVL', name: 'マーベル' },
      { symbol: 'SNPS', name: 'シノプシス' },
      { symbol: 'CDNS', name: 'ケイデンス' },
      { symbol: 'NOW', name: 'サービスナウ' },
      { symbol: 'PANW', name: 'パロアルトネットワークス' },
      { symbol: 'CRWD', name: 'クラウドストライク' },
      { symbol: 'SNOW', name: 'スノーフレイク' },
      { symbol: 'DDOG', name: 'データドッグ' },
      { symbol: 'NET', name: 'クラウドフレア' },
      { symbol: 'ZS', name: 'ジースケイラー' },
      { symbol: 'SHOP', name: 'ショッピファイ' },
      { symbol: 'SQ', name: 'ブロック(Square)' },
      { symbol: 'COIN', name: 'コインベース' },
      { symbol: 'UBER', name: 'ウーバー' },
      { symbol: 'ABNB', name: 'エアビーアンドビー' },
      { symbol: 'RBLX', name: 'ロブロックス' },
      { symbol: 'U', name: 'ユニティ' },
      { symbol: 'HOOD', name: 'ロビンフッド' },
      { symbol: 'SOFI', name: 'ソーファイ' },
      { symbol: 'RIVN', name: 'リビアン' },
      { symbol: 'LCID', name: 'ルーシッド' },
      { symbol: 'ARM', name: 'ARM' },
      { symbol: 'SMCI', name: 'スーパーマイクロ' },
      { symbol: 'DELL', name: 'デル' },
      { symbol: 'HPE', name: 'HPエンタープライズ' },
      { symbol: 'IBM', name: 'IBM' },
    ],
  },
  {
    category: '米国株（金融・ヘルスケア）',
    stocks: [
      { symbol: 'JPM', name: 'JPモルガン' },
      { symbol: 'BAC', name: 'バンクオブアメリカ' },
      { symbol: 'GS', name: 'ゴールドマンサックス' },
      { symbol: 'MS', name: 'モルガンスタンレー' },
      { symbol: 'C', name: 'シティグループ' },
      { symbol: 'WFC', name: 'ウェルズファーゴ' },
      { symbol: 'BLK', name: 'ブラックロック' },
      { symbol: 'SCHW', name: 'チャールズシュワブ' },
      { symbol: 'AXP', name: 'アメックス' },
      { symbol: 'V', name: 'ビザ' },
      { symbol: 'MA', name: 'マスターカード' },
      { symbol: 'PYPL', name: 'ペイパル' },
      { symbol: 'BRK-B', name: 'バークシャー・ハサウェイ' },
      { symbol: 'UNH', name: 'ユナイテッドヘルス' },
      { symbol: 'JNJ', name: 'ジョンソン&ジョンソン' },
      { symbol: 'PFE', name: 'ファイザー' },
      { symbol: 'LLY', name: 'イーライリリー' },
      { symbol: 'ABBV', name: 'アッヴィ' },
      { symbol: 'MRK', name: 'メルク' },
      { symbol: 'TMO', name: 'サーモフィッシャー' },
      { symbol: 'ABT', name: 'アボット' },
      { symbol: 'AMGN', name: 'アムジェン' },
      { symbol: 'GILD', name: 'ギリアド' },
      { symbol: 'MRNA', name: 'モデルナ' },
      { symbol: 'ISRG', name: 'インテュイティブ' },
    ],
  },
  {
    category: '米国株（消費・産業）',
    stocks: [
      { symbol: 'WMT', name: 'ウォルマート' },
      { symbol: 'COST', name: 'コストコ' },
      { symbol: 'HD', name: 'ホームデポ' },
      { symbol: 'TGT', name: 'ターゲット' },
      { symbol: 'KO', name: 'コカ・コーラ' },
      { symbol: 'PEP', name: 'ペプシコ' },
      { symbol: 'MCD', name: 'マクドナルド' },
      { symbol: 'SBUX', name: 'スターバックス' },
      { symbol: 'NKE', name: 'ナイキ' },
      { symbol: 'DIS', name: 'ディズニー' },
      { symbol: 'CMCSA', name: 'コムキャスト' },
      { symbol: 'T', name: 'AT&T' },
      { symbol: 'VZ', name: 'ベライゾン' },
      { symbol: 'PG', name: 'P&G' },
      { symbol: 'PM', name: 'フィリップモリス' },
      { symbol: 'XOM', name: 'エクソンモービル' },
      { symbol: 'CVX', name: 'シェブロン' },
      { symbol: 'COP', name: 'コノコフィリップス' },
      { symbol: 'BA', name: 'ボーイング' },
      { symbol: 'LMT', name: 'ロッキードマーチン' },
      { symbol: 'RTX', name: 'RTX(レイセオン)' },
      { symbol: 'NOC', name: 'ノースロップグラマン' },
      { symbol: 'GD', name: 'ジェネラルダイナミクス' },
      { symbol: 'CAT', name: 'キャタピラー' },
      { symbol: 'DE', name: 'ディアー' },
      { symbol: 'GE', name: 'GEエアロスペース' },
      { symbol: 'HON', name: 'ハネウェル' },
      { symbol: 'MMM', name: '3M' },
      { symbol: 'UPS', name: 'UPS' },
      { symbol: 'FDX', name: 'フェデックス' },
    ],
  },
  {
    category: '米国指数・ETF',
    stocks: [
      { symbol: '^RUT', name: 'ラッセル2000' },
      { symbol: '^VIX', name: 'VIX恐怖指数' },
      { symbol: '^SOX', name: 'フィラデルフィア半導体指数' },
      { symbol: '^NYFANG', name: 'FANG+指数' },
      { symbol: '^NYA', name: 'NYSE総合' },
      { symbol: '^W5000', name: 'ウィルシャー5000' },
      { symbol: 'ACWI', name: 'オールカントリー(ACWI)' },
      { symbol: 'SPY', name: 'S&P500 ETF(SPY)' },
      { symbol: 'QQQ', name: 'NASDAQ100 ETF(QQQ)' },
      { symbol: 'IWM', name: 'ラッセル2000 ETF' },
      { symbol: 'VTI', name: '米国株全体 ETF(VTI)' },
      { symbol: 'VOO', name: 'S&P500 ETF(VOO)' },
      { symbol: 'VT', name: '全世界株 ETF(VT)' },
      { symbol: 'EEM', name: '新興国 ETF' },
      { symbol: 'EFA', name: '先進国(米除く) ETF' },
    ],
  },
  {
    category: '世界の株価指数',
    stocks: [
      { symbol: '^N225', name: '日経平均(日本)' },
      { symbol: '^DJI', name: 'NYダウ(米国)' },
      { symbol: '^GSPC', name: 'S&P 500(米国)' },
      { symbol: '^IXIC', name: 'NASDAQ(米国)' },
      { symbol: '^FTSE', name: 'FTSE 100(イギリス)' },
      { symbol: '^GDAXI', name: 'DAX(ドイツ)' },
      { symbol: '^FCHI', name: 'CAC 40(フランス)' },
      { symbol: '^STOXX50E', name: 'ユーロSTOXX50(欧州)' },
      { symbol: '^IBEX', name: 'IBEX 35(スペイン)' },
      { symbol: '^SSMI', name: 'SMI(スイス)' },
      { symbol: '^AEX', name: 'AEX(オランダ)' },
      { symbol: '^BFX', name: 'BEL 20(ベルギー)' },
      { symbol: '^OMXS30', name: 'OMX30(スウェーデン)' },
      { symbol: 'FTSEMIB.MI', name: 'FTSE MIB(イタリア)' },
      { symbol: '^HSI', name: '香港ハンセン(香港)' },
      { symbol: '000001.SS', name: '上海総合(中国)' },
      { symbol: '399001.SZ', name: '深セン総合(中国)' },
      { symbol: '^KS11', name: 'KOSPI(韓国)' },
      { symbol: '^TWII', name: '加権指数(台湾)' },
      { symbol: '^BSESN', name: 'SENSEX(インド)' },
      { symbol: '^NSEI', name: 'NIFTY 50(インド)' },
      { symbol: '^STI', name: 'STI(シンガポール)' },
      { symbol: '^JKSE', name: 'ジャカルタ総合(インドネシア)' },
      { symbol: '^SET.BK', name: 'SET(タイ)' },
      { symbol: '^KLSE', name: 'KLCI(マレーシア)' },
      { symbol: '^AXJO', name: 'ASX 200(オーストラリア)' },
      { symbol: '^NZ50', name: 'NZX 50(ニュージーランド)' },
      { symbol: '^BVSP', name: 'ボベスパ(ブラジル)' },
      { symbol: '^MXX', name: 'IPC(メキシコ)' },
      { symbol: '^MERV', name: 'メルバル(アルゼンチン)' },
      { symbol: '^GSPTSE', name: 'TSX(カナダ)' },
      { symbol: '^TA125.TA', name: 'TA-125(イスラエル)' },
      { symbol: '^CASE30', name: 'EGX 30(エジプト)' },
      { symbol: 'XU100.IS', name: 'BIST 100(トルコ)' },
      { symbol: '^MOEX', name: 'MOEX(ロシア)' },
    ],
  },
  {
    category: '日本株（個別）',
    stocks: [
      { symbol: '7203.T', name: 'トヨタ自動車' },
      { symbol: '9984.T', name: 'ソフトバンクG' },
      { symbol: '6758.T', name: 'ソニーG' },
      { symbol: '6861.T', name: 'キーエンス' },
      { symbol: '9983.T', name: 'ファーストリテイリング' },
      { symbol: '8306.T', name: '三菱UFJ' },
      { symbol: '6501.T', name: '日立製作所' },
      { symbol: '7974.T', name: '任天堂' },
      { symbol: '6902.T', name: 'デンソー' },
      { symbol: '4063.T', name: '信越化学' },
      { symbol: '8035.T', name: '東京エレクトロン' },
      { symbol: '6723.T', name: 'ルネサスエレクトロニクス' },
      { symbol: '6857.T', name: 'アドバンテスト' },
      { symbol: '7751.T', name: 'キヤノン' },
      { symbol: '9432.T', name: 'NTT' },
      { symbol: '9433.T', name: 'KDDI' },
      { symbol: '4502.T', name: '武田薬品' },
      { symbol: '6098.T', name: 'リクルートHD' },
      { symbol: '6594.T', name: '日本電産' },
      { symbol: '3382.T', name: 'セブン&アイ' },
    ],
  },
  {
    category: '日本指数・先物',
    stocks: [
      { symbol: '^TOPX', name: 'TOPIX' },
      { symbol: 'NKD=F', name: '日経先物(CME)' },
      { symbol: 'NIY=F', name: '日経先物(円建CME)' },
      { symbol: '1570.T', name: '日経レバETF' },
      { symbol: '1357.T', name: '日経ダブルインバETF' },
    ],
  },
  {
    category: '為替（対円）',
    stocks: [
      { symbol: 'USDJPY=X', name: 'ドル/円' },
      { symbol: 'EURJPY=X', name: 'ユーロ/円' },
      { symbol: 'GBPJPY=X', name: 'ポンド/円' },
      { symbol: 'AUDJPY=X', name: '豪ドル/円' },
      { symbol: 'NZDJPY=X', name: 'NZドル/円' },
      { symbol: 'CADJPY=X', name: 'カナダドル/円' },
      { symbol: 'CHFJPY=X', name: 'スイスフラン/円' },
      { symbol: 'TRYJPY=X', name: 'トルコリラ/円' },
      { symbol: 'ZARJPY=X', name: '南アランド/円' },
      { symbol: 'MXNJPY=X', name: 'メキシコペソ/円' },
      { symbol: 'CNYJPY=X', name: '人民元/円' },
      { symbol: 'KRWJPY=X', name: '韓国ウォン/円' },
      { symbol: 'INRJPY=X', name: 'インドルピー/円' },
      { symbol: 'BRLJPY=X', name: 'ブラジルレアル/円' },
      { symbol: 'SGDJPY=X', name: 'シンガポールドル/円' },
      { symbol: 'HKDJPY=X', name: '香港ドル/円' },
      { symbol: 'THBJPY=X', name: 'タイバーツ/円' },
      { symbol: 'SEKJPY=X', name: 'スウェーデンクローナ/円' },
      { symbol: 'NOKJPY=X', name: 'ノルウェークローネ/円' },
      { symbol: 'PLNJPY=X', name: 'ポーランドズロチ/円' },
    ],
  },
  {
    category: '為替（対ドル）',
    stocks: [
      { symbol: 'EURUSD=X', name: 'ユーロ/ドル' },
      { symbol: 'GBPUSD=X', name: 'ポンド/ドル' },
      { symbol: 'AUDUSD=X', name: '豪ドル/ドル' },
      { symbol: 'NZDUSD=X', name: 'NZドル/ドル' },
      { symbol: 'USDCHF=X', name: 'ドル/スイスフラン' },
      { symbol: 'USDCAD=X', name: 'ドル/カナダドル' },
      { symbol: 'USDTRY=X', name: 'ドル/トルコリラ' },
      { symbol: 'USDZAR=X', name: 'ドル/南アランド' },
      { symbol: 'USDMXN=X', name: 'ドル/メキシコペソ' },
      { symbol: 'USDCNY=X', name: 'ドル/人民元' },
      { symbol: 'USDINR=X', name: 'ドル/インドルピー' },
      { symbol: 'USDBRL=X', name: 'ドル/ブラジルレアル' },
      { symbol: 'USDSGD=X', name: 'ドル/シンガポールドル' },
      { symbol: 'USDHKD=X', name: 'ドル/香港ドル' },
      { symbol: 'USDKRW=X', name: 'ドル/韓国ウォン' },
      { symbol: 'USDTHB=X', name: 'ドル/タイバーツ' },
      { symbol: 'USDPLN=X', name: 'ドル/ポーランドズロチ' },
      { symbol: 'USDSEK=X', name: 'ドル/スウェーデンクローナ' },
      { symbol: 'USDNOK=X', name: 'ドル/ノルウェークローネ' },
      { symbol: 'DX-Y.NYB', name: 'ドルインデックス' },
    ],
  },
  {
    category: '為替（クロス）',
    stocks: [
      { symbol: 'EURGBP=X', name: 'ユーロ/ポンド' },
      { symbol: 'EURAUD=X', name: 'ユーロ/豪ドル' },
      { symbol: 'EURCHF=X', name: 'ユーロ/スイスフラン' },
      { symbol: 'EURTRY=X', name: 'ユーロ/トルコリラ' },
      { symbol: 'GBPAUD=X', name: 'ポンド/豪ドル' },
      { symbol: 'GBPCHF=X', name: 'ポンド/スイスフラン' },
      { symbol: 'AUDNZD=X', name: '豪ドル/NZドル' },
      { symbol: 'AUDCHF=X', name: '豪ドル/スイスフラン' },
      { symbol: 'CADCHF=X', name: 'カナダドル/スイスフラン' },
      { symbol: 'NZDCHF=X', name: 'NZドル/スイスフラン' },
    ],
  },
  {
    category: '商品先物',
    stocks: [
      { symbol: 'GC=F', name: '金先物' },
      { symbol: 'SI=F', name: '銀先物' },
      { symbol: 'PL=F', name: 'プラチナ先物' },
      { symbol: 'PA=F', name: 'パラジウム先物' },
      { symbol: 'CL=F', name: '原油先物(WTI)' },
      { symbol: 'BZ=F', name: '原油先物(ブレント)' },
      { symbol: 'NG=F', name: '天然ガス先物' },
      { symbol: 'RB=F', name: 'ガソリン先物' },
      { symbol: 'HO=F', name: 'ヒーティングオイル先物' },
      { symbol: 'HG=F', name: '銅先物' },
      { symbol: 'ALI=F', name: 'アルミ先物' },
      { symbol: 'ZC=F', name: 'とうもろこし先物' },
      { symbol: 'ZW=F', name: '小麦先物' },
      { symbol: 'ZS=F', name: '大豆先物' },
      { symbol: 'KC=F', name: 'コーヒー先物' },
      { symbol: 'SB=F', name: '砂糖先物' },
      { symbol: 'CC=F', name: 'ココア先物' },
      { symbol: 'CT=F', name: '綿花先物' },
      { symbol: 'LBS=F', name: '木材先物' },
    ],
  },
  {
    category: '暗号資産',
    stocks: [
      { symbol: 'BTC-USD', name: 'ビットコイン' },
      { symbol: 'ETH-USD', name: 'イーサリアム' },
      { symbol: 'XRP-USD', name: 'リップル' },
      { symbol: 'SOL-USD', name: 'ソラナ' },
      { symbol: 'ADA-USD', name: 'カルダノ' },
      { symbol: 'DOGE-USD', name: 'ドージコイン' },
      { symbol: 'AVAX-USD', name: 'アバランチ' },
      { symbol: 'DOT-USD', name: 'ポルカドット' },
      { symbol: 'MATIC-USD', name: 'ポリゴン' },
      { symbol: 'LINK-USD', name: 'チェインリンク' },
      { symbol: 'UNI-USD', name: 'ユニスワップ' },
      { symbol: 'ATOM-USD', name: 'コスモス' },
      { symbol: 'LTC-USD', name: 'ライトコイン' },
      { symbol: 'BCH-USD', name: 'ビットコインキャッシュ' },
      { symbol: 'SHIB-USD', name: '柴犬コイン' },
    ],
  },
  {
    category: '債券・金利',
    stocks: [
      { symbol: '^TNX', name: '米10年国債利回り' },
      { symbol: '^FVX', name: '米5年国債利回り' },
      { symbol: '^TYX', name: '米30年国債利回り' },
      { symbol: '^IRX', name: '米13週国債利回り' },
      { symbol: '^JGBS', name: '日本10年国債利回り' },
    ],
  },
];

export default function AddStockModal({ onAdd, onClose, existingSymbols }) {
  const [customSymbol, setCustomSymbol] = useState('');
  const [customName, setCustomName] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);

  const handleCustomAdd = () => {
    if (customSymbol.trim()) {
      onAdd(customSymbol.trim().toUpperCase(), customName.trim() || customSymbol.trim().toUpperCase());
      setCustomSymbol('');
      setCustomName('');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>銘柄を追加</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-section">
          <h3>カテゴリから選ぶ</h3>
          <div className="category-tabs">
            {STOCK_CATEGORIES.map((cat) => (
              <button
                key={cat.category}
                className={`category-tab ${activeCategory === cat.category ? 'active' : ''}`}
                onClick={() => setActiveCategory(activeCategory === cat.category ? null : cat.category)}
              >
                {cat.category}
              </button>
            ))}
          </div>

          {activeCategory && (
            <div className="popular-list">
              {STOCK_CATEGORIES.find((c) => c.category === activeCategory)
                ?.stocks.filter((s) => !existingSymbols.includes(s.symbol))
                .map((stock) => (
                  <button
                    key={stock.symbol}
                    className="popular-item"
                    onClick={() => onAdd(stock.symbol, stock.name)}
                  >
                    <span className="popular-name">{stock.name}</span>
                    <span className="popular-symbol">{stock.symbol}</span>
                  </button>
                ))}
            </div>
          )}
        </div>

        <div className="modal-section">
          <h3>カスタム銘柄（Yahoo Financeのシンボル）</h3>
          <div className="custom-add">
            <input
              type="text"
              placeholder="シンボル（例: AAPL）"
              value={customSymbol}
              onChange={(e) => setCustomSymbol(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCustomAdd()}
            />
            <input
              type="text"
              placeholder="表示名（任意）"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCustomAdd()}
            />
            <button onClick={handleCustomAdd}>追加</button>
          </div>
        </div>
      </div>
    </div>
  );
}
