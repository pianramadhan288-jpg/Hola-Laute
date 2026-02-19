import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, StockAnalysisInput, GroundingSource, ConsistencyResult } from "../types";

// Note: Client initialization is now handled dynamically inside the retry loop to ensure freshness.

const BROKER_KNOWLEDGE = `
[INTELLIGENCE DATABASE: IDX BROKER MAP]
MS: 'RICH', desc: 'Morgan Stanley: Asing US.' 
  UB: 'RICH', desc: 'UBS: Asing kuat.' 
  BK: 'RICH', desc: 'JP Morgan: Arus institusi.' 
  AK: 'RICH', desc: 'UBS Patungan.' 
  YP: 'RICH', desc: 'Mirae Asset: Top Ritel Pro & Institusi.' 
  ZP: 'RICH', desc: 'MNC Sekuritas: Institusi Lokal.' 
  HD: 'RICH', desc: 'KGI Sekuritas.' 
  RX: 'RICH', desc: 'RHB Sekuritas.' 
  DU: 'RICH', desc: 'Deutsche Sekuritas.' 
  CG: 'RICH', desc: 'CGS-CIMB.' 
  KZ: 'RICH', desc: 'CLSA Sekuritas.' 
  DR: 'RICH', desc: 'Danareksa (Institusi).' 
  LH: 'RICH', desc: 'Lautandhana.' 
  AH: 'RICH', desc: 'Andalan.' 
  GW: 'RICH', desc: 'Golden.' 
  RB: 'RICH', desc: 'RHB.' 
  TP: 'RICH', desc: 'Trimegah (Institusi).' 
  KK: 'RICH', desc: 'Kresna.' 
  LS: 'RICH', desc: 'Laurent.' 

  // --- KONGLO SPESIAL (Market Maker / Group) ---
  HP: 'KONGLO', desc: 'Henan Putihrai: Spesialis grup konglomerasi.' 
  DX: 'KONGLO', desc: 'Bahana (Kadang Institusi/Konglo).' 
  LG: 'KONGLO', desc: 'Trimegah (Akun Khusus).' 
  MU: 'KONGLO', desc: 'Minna Padi.' 
  ES: 'KONGLO', desc: 'Ekosistem Grup Tertentu.' 
  MG: 'KONGLO', desc: 'Semesta Indovest (Sering jadi MM).' 

  // --- AMPAS / RITEL (Crowd / Lemah) ---
  XL: 'AMPAS', desc: 'Stockbit: Ritel crowd, panic easy.' 
  XC: 'AMPAS', desc: 'Ajaib: Ritel pemula & mahasiswa.' 
  PD: 'AMPAS', desc: 'Indo Premier: Ritel massal.' 
  CC: 'AMPAS', desc: 'Mandiri Sekuritas (Akun Ritel).' 
  CP: 'AMPAS', desc: 'Valbury (Ritel).' 
  NI: 'AMPAS', desc: 'BNI Sekuritas (Ritel).' 
  IF: 'AMPAS', desc: 'Samuel Sekuritas (Ritel).' 
  BB: 'AMPAS', desc: 'Verdhana (Ritel).' 
  SS: 'AMPAS', desc: 'Ajaib (Kode lama/baru).' 
  BQ: 'AMPAS', desc: 'Korea Investment (Ritel).' 
  GR: 'AMPAS', desc: 'Panin (Ritel).' 
  SA: 'AMPAS', desc: 'Ritel Kecil.' 
  SC: 'AMPAS', desc: 'Ritel Kecil.' 
  SF: 'AMPAS', desc: 'Surya Fajar.' 
  SH: 'AMPAS', desc: 'Artha Sekuritas (Ritel).' 
  SQ: 'AMPAS', desc: 'BCA Sekuritas (Ritel).' 
  TF: 'AMPAS', desc: 'Universal.' 
  TS: 'AMPAS', desc: 'Tri Megah (Ritel).' 
  TX: 'AMPAS', desc: 'Ritel.' 
  XA: 'AMPAS', desc: 'Ritel.' 
  YB: 'AMPAS', desc: 'Mega Capital (Ritel).' 
  YJ: 'AMPAS', desc: 'Lotus (Ritel).' 
  YO: 'AMPAS', desc: 'Amantara.' 
  ZR: 'AMPAS', desc: 'Bumiputera.' 

  // --- CAMPUR (Mixed / Unknown / Tidak Signifikan) ---
  AD: 'CAMPUR', desc: 'Oso Sekuritas.' 
  AF: 'CAMPUR', desc: 'Harita.' 
  AG: 'CAMPUR', desc: 'Kiwoom.' 
  AI: 'CAMPUR', desc: 'UOB Kay Hian.' 
  AJ: 'CAMPUR', desc: 'Pillars.' 
  AN: 'CAMPUR', desc: 'Wanteg.' 
  AO: 'CAMPUR', desc: 'Erdikha.' 
  AP: 'CAMPUR', desc: 'Pacific.' 
  AR: 'CAMPUR', desc: 'Binaartha.' 
  AZ: 'CAMPUR', desc: 'Sucor (Campur Ritel/Institusi).' 
  BF: 'CAMPUR', desc: 'Inti Fikasa.' 
  BS: 'CAMPUR', desc: 'Equity.' 
  BZ: 'CAMPUR', desc: 'Batavia.' 
  DD: 'CAMPUR', desc: 'Makinta.' 
  DM: 'CAMPUR', desc: 'Masindo.' 
  DP: 'CAMPUR', desc: 'DBS Vickers.' 
  EL: 'CAMPUR', desc: 'Evergreen.' 
  FO: 'CAMPUR', desc: 'Forte.' 
  FS: 'CAMPUR', desc: 'Fasilitas.' 
  FZ: 'CAMPUR', desc: 'Waterfront.' 
  IC: 'CAMPUR', desc: 'BCA (Campur).' 
  ID: 'CAMPUR', desc: 'Anugerah.' 
  IH: 'CAMPUR', desc: 'Pacific 2000.' 
  II: 'CAMPUR', desc: 'Danatama.' 
  IN: 'CAMPUR', desc: 'Investindo.' 
  IT: 'CAMPUR', desc: 'Inti Teladan.' 
  IU: 'CAMPUR', desc: 'Indo Capital.' 
  JB: 'CAMPUR', desc: 'Jasa Utama.' 
  KI: 'CAMPUR', desc: 'Ciptadana.' 
  KS: 'CAMPUR', desc: 'Karta.' 
  MI: 'CAMPUR', desc: 'Victoria.' 
  MK: 'CAMPUR', desc: 'MNC (Campur).' 
  OD: 'CAMPUR', desc: 'Danareksa.' 
  OK: 'CAMPUR', desc: 'Nett.' 
  PC: 'CAMPUR', desc: 'Panca Global.' 
  PF: 'CAMPUR', desc: 'Danasakti.' 
  PG: 'CAMPUR', desc: 'Panca Global.' 
  PI: 'CAMPUR', desc: 'Pendanaan.' 
  PO: 'CAMPUR', desc: 'Pilar.' 
  PP: 'CAMPUR', desc: 'Aldiracita.' 
  PS: 'CAMPUR', desc: 'Paramitra.' 
  RG: 'CAMPUR', desc: 'Profindo.' 
  RO: 'CAMPUR', desc: 'NISP.' 
  RS: 'CAMPUR', desc: 'Yulie.' 
  YU: 'CAMPUR', desc: 'CIMB.' 
  KAF: 'CAMPUR', desc: 'KAF Sekuritas.'
`;

const SYSTEM_INSTRUCTION = `
Kamu adalah Senior Quantitative Fund Manager & Forensic Market Auditor (TradeLogic "The Ruthless" v9.1 – Institutional Grade).

TUGAS UTAMA:
Kasih analisa saham Indonesia yang dingin, skeptis, dan berdasarkan risiko nyata.
Tujuan utama: PISAHKAN saham yang GAK LAYAK DITRADE, yang LAYAK DIPANTAU, dan yang LAYAK DIEKSEKUSI.

Ini BUKAN mesin buat BELI langsung.
Ini mesin FILTER, AUDIT, dan KONTROL RISIKO.

Cash itu posisi yang valid.

BAHASA: STRICTLY BAHASA INDONESIA.
Gaya: Semi-formal, tajam, seperti trader pro, tanpa cerita motivasi.
Data lebih penting dari opini.

${BROKER_KNOWLEDGE}

==============================
LANGKAH LOGIC YANG WAJIB DIJALANKAN
==============================

1. CEK SMART MONEY (SIAPA DAN GIMANA FILTERNYA)
   - Broker kaya/konglo dianggap VALID kalau:
     a) Pegang minimal 3 hari
     b) Harga rata-rata naik
     c) Gak ada distribusi besar-besaran paralel
   - Kalau gak memenuhi:
     -> STATUS: ALIRAN DANA BELUM KONFIRMASI
     -> Dampak: Turunkan edge, BUKAN LANGSUNG TOLAK

2. DETEKTOR KONFLIK LOGIC (NILAI vs ALIRAN DANA)
   - Kalau fundamental kuat tapi aliran dana DISTRIBUSI:
     -> Label: KONFLIK LOGIC
     -> Kurangi nilai skor, BUKAN LANGSUNG DILARANG
     -> Keputusan default: TUNGGU KONFIRMASI

3. PENURUNAN STRUKTUR PASAR (BERTAHAP)
   - DISTRIBUSI + DOMINASI RETAIL:
     -> Turunkan skor secara bertahap
     -> Gak boleh hasilkan AKUMULASI
     -> Masih boleh TUNGGU kalau likuiditas cukup

4. DETEKTOR PUTARAN RETAIL
   - Volume tinggi + Akumulasi netto datar/negatif:
     -> Volume dianggap noise
     -> Edge spekulatif boleh ada, tapi dengan keyakinan rendah (probabilitas <60%)

5. KEASLIAN BUKU ORDER
   - Offer > 2x Bid:
     -> Kalau harga stagnan: DISTRIBUSI TERKONTROL
     -> Kalau harga turun: RESISTENSI BERAT
   - PENYERAPAN hanya valid kalau:
     Harga naik + VWAP naik + Inventory naik

6. MODE GAGAL (HANYA KALAU GAK BISA DITRADE)
   - LARANG HANYA KALAU:
     a) Likuiditas gak cukup buat keluar realistis
     b) Modal user > 1% ADTV
     c) Trading halt / vakum ekstrem
   - Kalau cuma risiko tinggi:
     -> Keputusan: TUNGGU KONFIRMASI / GAK ADA EDGE

7. FILTER WAKTU HOLD
   - Setup spekulatif:
     -> Gak boleh AKUMULASI
     -> Maksimal TUNGGU / MUNGKIN

8. ANALISA RISIKO EKOR
   - Kurtosis / CVaR tinggi:
     -> Kurangi skor
     -> Batasi ukuran posisi
     -> BUKAN LANGSUNG TOLAK

9. VOLATILITAS CHECK (TAMBAHAN)
   - ATR tinggi (>2x rata-rata): Probabilitas stop-loss kena 70-80%, kurangi sizing 50%
   - VIX setara naik: Tambah probabilitas chop 65%

10. INTEGRASI BERITA (TAMBAHAN)
    - Selalu cari berita terkini soal saham via tool web_search atau browse_page.
    - Query contoh: "berita terbaru [ticker] Indonesia site:investing.com OR cnbcindonesia.com OR kontan.co.id"
    - Ambil 3-5 berita relevan, kasih link asli.
    - Gabung ke analisa: Kalau berita negatif (korupsi, rugi), naikkan risiko 75-90%. Kalau positif (akuisisi), cek match dengan flow, kalau gak match = konflik (probabilitas edge drop 60%).

11. SENTIMENT RETAIL DARI X (TAMBAHAN)
    - Pakai x_keyword_search atau x_semantic_search buat cek tweet/post soal [ticker] (query: "[ticker] saham buy OR sell OR pump OR dump min_faves:50").
    - Kalau banyak FOMO (kata "moon", "to the moon", "beli sekarang"), probabilitas trap retail 80-90%, turunkan edge ke AVOID.
    - Gabung ke verdict: Sentiment positif berlebih = distribusi disguised (probabilitas 75%).

==============================
URUTAN KEPUTUSAN (WAJIB)
==============================

1. LARANG
   - Gak bisa ditrade karena teknis atau likuiditas (probabilitas loss 95%)

2. HINDARI
   - Bisa ditrade, tapi probabilitas negatif (>70% downside)

3. GAK ADA EDGE / TETAP FLAT
   - Gak ada keunggulan statistik sekarang (chop probability 80%)

4. TUNGGU KONFIRMASI
   - Ada aliran dana / struktur awal
   - Belum layak masuk
   - Layak MASUK WATCHLIST (monitor probability 60%)

5. MUNGKIN ENTRY (TAMBAHAN)
   - Edge sedang, probabilitas win 55-65%
   - Sizing kecil, stop ketat

6. AKUMULASI
   - Institusi valid
   - Struktur sehat
   - Valuasi gak gila (probabilitas upside >75%)

==============================
FILOSOFI OUTPUT
==============================

- Kebanyakan saham HARUS berakhir di:
  HINDARI / GAK ADA EDGE / TUNGGU

- AKUMULASI itu LANGKA dan ELIT (hanya kalau data keras dukung 80%+)

- Kalau ragu antara LARANG dan TUNGGU:
  Pilih TUNGGU kecuali bukti gak bisa keluar

NADA:
Dingin. Skeptis. Seperti pro trader.
Gak cari alasan buat BELI.
Setiap keputusan wajib kasih probabilitas % berdasarkan metrik (misal: RSI<30 = 75% rebound pressure).
`;

const tradePlanSchema = {
  type: Type.OBJECT,
  properties: {
    verdict: { type: Type.STRING },
    entry: { type: Type.STRING },
    tp: { type: Type.STRING },
    sl: { type: Type.STRING },
    reasoning: { type: Type.STRING, description: "WAJIB berisi: (1) alasan teknis keputusan status, " +
    "(2) konsekuensi risiko utama, dan " +
    "(3) aturan alokasi modal (jika status ≠ FORBIDDEN). " +
    "Jika status = FORBIDDEN, reasoning WAJIB menjelaskan kenapa TIDAK BOLEH TRADE. " +
    "Bahasa Indonesia, tanpa motivasi." },
   status: {
  type: Type.STRING,
  enum: ["RECOMMENDED", "POSSIBLE", "WAIT & SEE", "FORBIDDEN"],
  description:
    "RECOMMENDED = Edge statistik jelas, layak eksekusi.\n" +
    "POSSIBLE = Edge lemah, hanya untuk size kecil & cepat.\n" +
    "WAIT & SEE = Tidak ada edge, observasi saja.\n" +
    "FORBIDDEN = Risiko struktural / likuiditas / distribusi. DILARANG TRADE."}
  }
};

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    ticker: { type: Type.STRING },
    priceInfo: {
      type: Type.OBJECT,
      properties: {
        current: { type: Type.STRING },
        bandarAvg: { type: Type.STRING },
        diffPercent: { type: Type.NUMBER },
        status: { type: Type.STRING },
      }
    },
    marketCapAnalysis: {
      type: Type.OBJECT,
      properties: {
        category: { type: Type.STRING, enum: ["Small Cap", "Mid Cap", "Big Cap", "UNKNOWN"] },
        behavior: { type: Type.STRING },
      }
    },
    supplyDemand: {
        type: Type.OBJECT,
        properties: {
            bidStrength: {
      type: Type.NUMBER,
      description: 
        "Skor kekuatan BID riil (0–100). " +
        "0–30 = Lemah / Spoofing. " +
        "31–60 = Netral. " +
        "61–100 = Aktif & konsisten."
    },
            offerStrength: {
      type: Type.NUMBER,
      description: 
        "Skor tekanan OFFER (0–100). " +
        "0–30 = Supply tipis. " +
        "31–60 = Normal. " +
        "61–100 = Distribusi aktif."
    },
            verdict: {
      type: Type.STRING,
      enum: [
        "ABSORPTION_VALID",
        "CONTROLLED_DISTRIBUTION",
        "FAKE_LIQUIDITY",
        "BALANCED_FLOW",
        "NO_DEMAND"
      ],
      description:
        "Kesimpulan WAJIB dipilih dari enum. " +
        "Tidak boleh narasi bebas." }
        }
    },
    prediction: {
      type: Type.OBJECT,
      properties: {
        direction: { type: Type.STRING, enum: ["UP", "DOWN", "CONSOLIDATE", "UNKNOWN"] },
        probability: { type: Type.NUMBER },
        reasoning: { type: Type.STRING, description: "MUST BE IN INDONESIAN." },
      }
    },
    stressTest: {
      type: Type.OBJECT,
      properties: {
        passed: { type: Type.BOOLEAN },
       score: {
  type: Type.NUMBER,
  description:
    "Final Risk-Adjusted Conviction Score (0–100) " +
    "SETELAH semua penalty diterapkan. " +
    "0–39 = FORBIDDEN, 40–54 = NO EDGE, 55–69 = SPECULATIVE, ≥70 = CONVICTION."},
        details: { type: Type.STRING, description: "MUST BE IN INDONESIAN." },
      }
    },
    brokerAnalysis: {
      type: Type.OBJECT,
      properties: {
        classification: { type: Type.STRING },
        insight: { type: Type.STRING, description: "Mention if 'Retail Churning' or 'Smart Money' is detected. MUST BE IN INDONESIAN." },
      }
    },
    summary: { type: Type.STRING, description: "MUST BE IN INDONESIAN." },
    bearCase: { type: Type.STRING, description: "MUST BE IN INDONESIAN." },
    strategy: {
      type: Type.OBJECT,
      properties: {
        bestTimeframe: { type: Type.STRING, enum: ["SHORT", "MEDIUM", "LONG"] },
        shortTerm: tradePlanSchema,
        mediumTerm: tradePlanSchema,
        longTerm: tradePlanSchema
      }
    },
    fullAnalysis: { type: Type.STRING, description: "MUST BE IN INDONESIAN." }
  },
  required: ["ticker", "priceInfo", "marketCapAnalysis", "supplyDemand", "prediction", "stressTest", "brokerAnalysis", "summary", "bearCase", "strategy", "fullAnalysis"]
};

// --- ROBUST RETRY LOGIC & FRESH CLIENT GENERATOR ---

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function generateWithRetry(params: any, retries = 3): Promise<any> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing");

  for (let i = 0; i < retries; i++) {
    try {
      // "Ganti AI Jadi Baru": Create a new instance for every attempt to ensure freshness
      const ai = new GoogleGenAI({ apiKey });
      return await ai.models.generateContent(params);
    } catch (error: any) {
      // Handle 429 (Quota Exceeded) and 503 (Server Overload)
      const isQuotaError = error.status === 429 || error.code === 429 || (error.message && error.message.includes('429'));
      const isServerError = error.status === 503 || error.code === 503;

      if (isQuotaError || isServerError) {
        if (i === retries - 1) throw error; // Max retries reached, fail loudly

        // Exponential Backoff: 2s, 4s, 8s
        const delay = 2000 * Math.pow(2, i);
        console.warn(`⚠️ API Quota/Busy (Attempt ${i + 1}/${retries}). Retrying in ${delay}ms...`);
        await wait(delay);
        continue;
      }
      
      // If it's another error (like 400 Bad Request), throw immediately
      throw error;
    }
  }
}

export const analyzeStock = async (input: StockAnalysisInput): Promise<AnalysisResult> => {
  try {
   const riskInstruction =
  input.riskProfile === 'CONSERVATIVE'
    ? `
RISK PROFILE: CONSERVATIVE (HAWK)
- PBV > 5x: penalty -15
- PER > 25x: penalty -15
- CFO <= 0: penalty -20
- Market Structure = DISTRIBUTION: score cap MAX 49
`
    : input.riskProfile === 'AGGRESSIVE'
    ? `
RISK PROFILE: AGGRESSIVE (BULL)
- PBV > 10x: penalty -5
- PER > 40x: penalty -5
- Market Structure = DISTRIBUTION: penalty -10
- Retail Accumulation detected: score cap MAX 54
`
    : `
RISK PROFILE: BALANCED
- PBV > 7x: penalty -10
- PER > 30x: penalty -10
- Fundamental vs Flow conflict: penalty -15
`;
    const prompt = `
    RUTHLESS AUDIT REQUEST: ${input.ticker} @ ${input.price}
    MANDATE: ${input.riskProfile}
    CAPITAL: ${input.capital} IDR (Tier: ${input.capitalTier})
    LANGUAGE: INDONESIA ONLY.
    
    [LOGIC INJECTION]
    ${riskInstruction}

    [FUNDAMENTALS]
    ROE: ${input.fundamentals.roe}% | DER: ${input.fundamentals.der}x | PBV: ${input.fundamentals.pbv}x
    PER: ${input.fundamentals.per}x | CFO: ${input.fundamentals.cfo} | FCF: ${input.fundamentals.fcf}
    
    [MARKET STRUCTURE & TAPE READING]
    Bandar Score: ${input.bandarmology.brokerSummaryVal} (0=Dist, 100=Acc)
    Top Brokers: ${input.bandarmology.topBrokers}
    Avg Cost Dominant: ${input.bandarmology.bandarAvgPrice}
    Duration: ${input.bandarmology.duration}
    
    ORDER BOOK (Analyze for Spoofing/Absorption):
    Bid Vol: ${input.bandarmology.orderBookBid}
    Ask Vol: ${input.bandarmology.orderBookAsk}
    
    TRADE BOOK (Analyze for Churning):
    HAKA (Buy Power): ${input.bandarmology.tradeBookAsk}
    HAKI (Sell Power): ${input.bandarmology.tradeBookBid}
    
    [INTELLIGENCE TEXT]
    ${input.rawIntelligenceData}
    `;

    // Use the robust retry wrapper
    const response = await generateWithRetry({
      model: 'gemini-3-flash-preview', 
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.0, // Strict Logic
        topK: 1, 
        topP: 0.1, 
        seed: 42069, 
      }
    });

    const data = JSON.parse(response.text) as AnalysisResult;
    return { ...data, id: crypto.randomUUID(), timestamp: Date.now(), sources: [] };
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};

export const runConsistencyCheck = async (history: AnalysisResult[]): Promise<ConsistencyResult> => {
  const sorted = history.sort((a, b) => a.timestamp - b.timestamp);
  const prompt = `Analisa tren konsistensi untuk ${sorted[0].ticker}. Data: ${JSON.stringify(sorted)}. Gunakan BAHASA INDONESIA profesional dan berikan outlook trend jangka panjang.`;
  
  const consistencySchema: Schema = {
    type: Type.OBJECT,
    properties: {
        ticker: { type: Type.STRING },
        dataPoints: { type: Type.NUMBER },
        trendVerdict: { type: Type.STRING, enum: ['IMPROVING', 'STABLE', 'DEGRADING', 'VOLATILE'] },
        consistencyScore: { type: Type.NUMBER },
        analysis: { type: Type.STRING, description: "MUST BE IN INDONESIAN." },
        actionItem: { type: Type.STRING, description: "MUST BE IN INDONESIAN." }
    }
  };

  // Use the robust retry wrapper
  const response = await generateWithRetry({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { 
        responseMimeType: "application/json", 
        responseSchema: consistencySchema,
        temperature: 0.0, 
        seed: 42069
    }
  });

  return JSON.parse(response.text) as ConsistencyResult;
};
