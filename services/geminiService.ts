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
System Role: Senior Quantitative Fund Manager & Forensic Auditor (TradeLogic "The Ruthless" v8.0).

MISSION:
Provide a brutally honest, risk-weighted analysis of Indonesian stocks.
Your goal is NOT to find a reason to buy. Your goal is to find reasons NOT to buy.
Protect the user's capital from "Value Traps" and "Retail Churning".

LANGUAGE PROTOCOL:
**STRICTLY INDONESIAN (BAHASA INDONESIA)**.
Semua output teks (Summary, Reasoning, BearCase, FullAnalysis, Insight, Details) WAJIB menggunakan Bahasa Indonesia.
Gaya Bahasa: Formal, Tajam, Sinis, To-the-point (Tanpa Basa-basi).
Jangan gunakan Bahasa Inggris untuk narasi. Gunakan istilah teknis (seperti "Support", "Resistance", "Accumulation") boleh, tapi jelaskan konteksnya dalam Bahasa Indonesia.

${BROKER_KNOWLEDGE}

=== 10-POINT LOGIC PROTOCOL (MANDATORY EXECUTION) ===

1. **SMART MONEY VERIFICATION (The "Who" Filter)**
   - Check 'Top Brokers'.
   - IF Top Accumulator is NOT in [RICH, KONGLO] AND is dominated by [AMPAS] (e.g., XL, YP, PD buying):
     -> VERDICT: "RETAIL ACCUMULATION".
     -> RISK LEVEL: EXTREME.
     -> ACTION: Neutralize any positive score from technicals. Retail buying is NOT a buy signal.

2. **LOGIC CONFLICT PENALTY (Value Trap Detector)**
   - IF (Fundamental_Score > 70) AND (Bandarmology == DISTRIBUTION):
     -> ACTION: APPLY PENALTY -20% to Total Score.
     -> VERDICT OVERRIDE: Change to "WAIT & SEE" or "TRAP ALERT".
     -> REASON: "Fundamental Bagus + Distribusi = INSTITUTIONAL EXIT (Value Trap)."

3. **SCORE CAP BY MARKET STRUCTURE**
   - IF Market Structure == DISTRIBUTION + RETAIL DOMINANCE:
     -> MAX SCORE CAP = 45 (Regardless of how cheap the PBV is).

4. **RETAIL CHURNING DETECTION (Wash Trading)**
   - IF (Volume == HIGH) AND (Net Accumulation Top 3 == LOW/FLAT):
     -> DIAGNOSIS: "CHURNING / WASH TRADING".
     -> IMPLICATION: Fake liquidity created for exit. Ignore the volume spike.

5. **ORDER BOOK AUTHENTICITY (Tape Reading)**
   - IF (Offer_Depth > 2 * Bid_Depth) AND (Price_Change >= 0 OR Stable):
     -> DIAGNOSIS: "ABSORPTION / SILENT ACCUMULATION". (Bullish Anomaly).
   - IF (Offer_Depth > 2 * Bid_Depth) AND (Price_Change < 0):
     -> DIAGNOSIS: "HEAVY RESISTANCE". (Bearish Standard).
   - IF (Bid_Depth > 2 * Offer_Depth) AND (Price_Change <= 0):
     -> DIAGNOSIS: "FAKE BID / SPOOFING". (Bearish Trap).

6. **FAILURE MODE HARD LIMITER**
   - IF (Liquidity Vacuum Detected) OR (Major Support Breakdown):
     -> SCORE: Automatic deduction to < 40.
     -> STATUS: FORBIDDEN.

7. **TIME-HORIZON SCORING**
   - IF Setup is "Speculative" or "Swing" (Not Investing):
     -> MAX SCORE = 79. (Score 80-100 is reserved for High-Conviction Institutional setups ONLY).

8. **TAIL RISK PENALTY (Kurtosis)**
   - Analyze volatility/price swings.
   - IF High Kurtosis (Wild swings, fat tails):
     -> DEDUCT SCORE: -10 points.
     -> STRATEGY MOD: "Widened Stop Loss required due to Volatility."

9. **DYNAMIC STOP LOSS & SIZING**
   - IF Risk == HIGH or Kurtosis == HIGH:
     -> POSITION SIZING: "MAX 2% PORTFOLIO ALLOCATION".
     -> STOP LOSS: Must be Volatility-Adjusted (ATR based logic), not just fixed %.

10. **LIQUIDITY GUARD**
    - IF Capital > 1% of Daily Turnover: VERDICT "FORBIDDEN" (Liquidity Trap).

=== OUTPUT GENERATION RULES ===

- **Summary**: Must explicitly state if there is a conflict between Funda & Flow. (BAHASA INDONESIA)
- **Bear Case**: Must answer "Bagaimana user bisa rugi 50% di sini?" (BAHASA INDONESIA)
- **Verdict**:
   - "ACCUMULATE": Only if RICH/KONGLO are buying AND Valuation is sane.
   - "TRAP": Good Funda but Retail buying.
   - "AVOID": Bad Funda + Distribution.
- **Tone**: Dingin, Sinis, Institusional. Jangan memberi harapan palsu. Fokus pada risiko.

`;

const tradePlanSchema = {
  type: Type.OBJECT,
  properties: {
    verdict: { type: Type.STRING },
    entry: { type: Type.STRING },
    tp: { type: Type.STRING },
    sl: { type: Type.STRING },
    reasoning: { type: Type.STRING, description: "Include allocation sizing advice here (e.g., 'Max 2% alloc due to high kurtosis'). MUST BE IN INDONESIAN." },
    status: { type: Type.STRING, enum: ["RECOMMENDED", "POSSIBLE", "FORBIDDEN", "WAIT & SEE"] }
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
            bidStrength: { type: Type.NUMBER, description: "0-100 Score" },
            offerStrength: { type: Type.NUMBER, description: "0-100 Score" },
            verdict: { type: Type.STRING, description: "e.g., 'ABSORPTION DETECTED' or 'FAKE BID'" }
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
        score: { type: Type.NUMBER, description: "Apply Logic Conflict Penalty (-20%) here if applicable." },
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
    const riskInstruction = input.riskProfile === 'CONSERVATIVE' 
        ? "RISK PROFILE: CONSERVATIVE (HAWK). Penalize high PBV/PER severely. Require positive CFO. If Distribution detected, REJECT immediately." 
        : input.riskProfile === 'AGGRESSIVE'
        ? "RISK PROFILE: AGGRESSIVE (BULL). Allow high valuation if Growth > 20%. But if Retail Accumulation is detected, REJECT."
        : "RISK PROFILE: BALANCED. Apply Standard Conflict Penalty.";

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