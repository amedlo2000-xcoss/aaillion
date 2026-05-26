const SYSTEM_PROMPT = `あなたはシリコンバレーのトップVCアナリストです。
ユーザーのビジネスアイデアを厳正に評価し、必ず以下のJSON形式のみで回答してください。

各スコアの評価基準：
- market_score     (0-100): 市場規模・成長性・競合環境・参入タイミングの優位性
- sns_score        (0-100): バイラル要素・シェア動機・UGC可能性・インフルエンサー親和性
- ai_fit_score     (0-100): AI活用の独自性・競合優位性への貢献度・技術実現可能性
- community_score  (0-100): コミュニティ形成力・ロイヤルユーザー獲得力・口コミ拡散効果
- revenue_score    (0-100): 収益モデルの明確さ・単価・LTV・早期マネタイズ可能性
- innovation_score (0-100): 既存サービスとの差別化度・新規性・パラダイムシフト度

overall_rank の基準（厳格に適用すること）:
- SSS : overall_score 95以上  → 革命的。ユニコーン候補レベル
- SS  : overall_score 88〜94  → 卓越。VC投資対象レベル
- S   : overall_score 80〜87  → 優秀。事業化を強く推奨
- A   : overall_score 70〜79  → 有望。重点課題の改善で成功可能
- B   : overall_score 55〜69  → 可能性あり。戦略的な大幅改善が必要
- C   : overall_score 54以下  → 要再設計。ピボットを検討

必ずこのJSONのみを返してください（コードブロック不要）:
{
  "market_score": <0-100の整数>,
  "sns_score": <0-100の整数>,
  "ai_fit_score": <0-100の整数>,
  "community_score": <0-100の整数>,
  "revenue_score": <0-100の整数>,
  "innovation_score": <0-100の整数>,
  "overall_score": <6項目の加重平均。0-100の整数>,
  "overall_rank": <"SSS" | "SS" | "S" | "A" | "B" | "C">,
  "ai_commentary": <日本語200文字以内のVCアナリストとしての総評。強みと改善点を含めること>
}`

function buildUserPrompt(answers) {
  const aiUsageList = Array.isArray(answers.aiUsage)
    ? answers.aiUsage.join('、')
    : (answers.aiUsage ?? '未回答')

  return `以下のビジネスアイデアを評価してください。

【業界】
${answers.industry ?? '未回答'}

【アプリ・サービスのアイデア】
${answers.appIdea ?? '未回答'}

【サービスの世界観・ブランドイメージ】
${answers.worldView ?? '未回答'}

【メインターゲット】
${answers.target ?? '未回答'}

【解決したい課題・ペインポイント】
${answers.problem ?? '未回答'}

【AI活用方法】
${aiUsageList}

【収益モデル】
${answers.revenueModel ?? '未回答'}

【SNS・バイラル戦略】
${answers.snsStrategy ?? '未回答'}

【コミュニティ構想】
${answers.community ?? '未回答'}`
}

export async function analyzeWithGPT(answers) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY

  if (!apiKey) {
    throw new Error('VITE_OPENAI_API_KEY が .env.local に設定されていません')
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 600,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: buildUserPrompt(answers) },
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? `OpenAI API error: ${response.status}`)
  }

  const data = await response.json()
  const raw  = data.choices?.[0]?.message?.content ?? '{}'
  const result = JSON.parse(raw)

  // Validate all required keys exist
  const required = ['market_score','sns_score','ai_fit_score','community_score','revenue_score','innovation_score','overall_score','overall_rank','ai_commentary']
  for (const key of required) {
    if (result[key] === undefined) throw new Error(`GPT response missing key: ${key}`)
  }

  return result
}

// ─── Market Analysis ────────────────────────────────────────────────────────

const MARKET_SYSTEM_PROMPT = `あなたは世界トップのマーケットリサーチアナリストです。
指定された業界・サービスについて詳細な市場分析を行い、必ず以下のJSON形式のみで回答してください。
数値は可能な限り実際の市場データに基づいた現実的な推定値を使用してください。
日本語で回答してください。

必ずこのJSONのみを返してください（コードブロック不要）:
{
  "summary": <市場全体の概況。200文字以内の日本語>,
  "market_size": {
    "tam_japan": <日本国内TAM。例: "1.2兆円">,
    "tam_global": <グローバルTAM。例: "$450B">,
    "sam": <獲得可能市場SAM。例: "3,500億円">,
    "som": <現実的な獲得目標SOM。例: "120億円">,
    "cagr": <年平均成長率。例: "18.5%">,
    "forecast_year": <予測年。例: "2030年">
  },
  "growth_drivers": [
    { "title": <ドライバー名 20文字以内>, "description": <説明 60文字以内>, "impact": <"高"|"中"|"低"> }
  ],
  "key_players": [
    { "name": <企業名>, "region": <"国内"|"海外">, "share": <推定シェア% 数値のみ>, "strength": <強み 40文字以内>, "growth": <成長率% 数値のみ> }
  ],
  "trends": [
    { "title": <トレンド名 25文字以内>, "description": <説明 80文字以内>, "impact": <"高"|"中"|"低">, "timeframe": <"短期"|"中期"|"長期"> }
  ],
  "opportunities": [<機会1 60文字以内>, <機会2>, <機会3>],
  "risks": [<リスク1 60文字以内>, <リスク2>, <リスク3>],
  "entry_recommendation": <参入戦略の推奨 150文字以内>,
  "ideal_entry_timing": <"今すぐ"|"6ヶ月以内"|"1年以内"|"様子見">,
  "competitive_intensity": <競合激化度 0-100の整数>
}`

export async function generateMarketAnalysis(industry, serviceContext = '') {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (!apiKey) throw new Error('VITE_OPENAI_API_KEY が .env.local に設定されていません')

  const userMsg = serviceContext
    ? `業界: ${industry}\nサービス概要: ${serviceContext}\n\n上記の業界・サービスについて詳細な市場分析を行ってください。`
    : `業界: ${industry}\n\n上記の業界について詳細な市場分析を行ってください。`

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      temperature: 0.6,
      max_tokens: 1800,
      messages: [
        { role: 'system', content: MARKET_SYSTEM_PROMPT },
        { role: 'user',   content: userMsg },
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? `OpenAI API error: ${response.status}`)
  }

  const data   = await response.json()
  const raw    = data.choices?.[0]?.message?.content ?? '{}'
  const result = JSON.parse(raw)

  const required = ['summary','market_size','growth_drivers','key_players','trends','opportunities','risks','entry_recommendation']
  for (const key of required) {
    if (result[key] === undefined) throw new Error(`Market analysis response missing key: ${key}`)
  }

  return result
}

// ─── Fallback mock scores when API is unavailable ──────────────────────────
export function mockAnalysis() {
  const s = () => Math.floor(55 + Math.random() * 35)
  const scores = { market_score: s(), sns_score: s(), ai_fit_score: s(), community_score: s(), revenue_score: s(), innovation_score: s() }
  const overall_score = Math.floor(Object.values(scores).reduce((a, b) => a + b, 0) / 6)
  const overall_rank = overall_score >= 95 ? 'SSS' : overall_score >= 88 ? 'SS' : overall_score >= 80 ? 'S' : overall_score >= 70 ? 'A' : overall_score >= 55 ? 'B' : 'C'
  return { ...scores, overall_score, overall_rank, ai_commentary: '（オフラインモード）APIキーが未設定のため、モックスコアを表示しています。.env.local に VITE_OPENAI_API_KEY を設定してください。' }
}

// ─── AI Worldview Market Diagnosis ───────────────────────────────────────────

const WORLDVIEW_SYSTEM_PROMPT = `あなたは「AI存在経済OS」——存在価値・世界観・市場性を統合分析する世界最高峰のビジネス診断AIです。
ユーザーの思想・才能・欲求・世界観を深層分析し、「経済的存在価値」と「市場創造可能性」を定量化します。
スコアは辛口かつリアルに採点してください。簡単に高得点を出さないこと。

Q0（前提情報）を必ず各スコアへ反映してください：
- 業種（Q0-1）: 業界市場性・AI代替リスク・業界成長率・世界観親和性・市場参入優位性を評価に織り込む
- 立場（Q0-2）: 実行可能性・初期推進力・リスク耐性・挑戦スピード・継続可能性を評価に織り込む
- MVPジャンル（Q0-3）: 市場規模・競合飽和率・MVP制作難易度・収益モデル適性・世界観一致率・MVP市場反応予測を評価に織り込む
- 発信状況（Q0-4）: 初期拡散力・MVP立ち上がり速度・コミュニティ形成速度・SNS市場適性を評価に織り込む
- 挑戦予算（Q0-5）: MVP現実性・実行可能ルート・初期最適戦略・投資回収予測・AI活用最適化を評価に織り込む

必ずこのJSONのみを返してください（コードブロック不要）:
{
  "worldview_type": <世界観タイプ。必ず「〇〇型 × 〇〇型」形式。例: "未来革命型 × 共感市場型">,
  "existence_value_score": <存在価値スコア 0-100>,
  "empathy_index": <共感指数 0-100>,
  "sns_viral_prediction": <SNS拡散予測 0-100>,
  "estimated_market_size": <推定市場規模。例: "2.4兆円">,
  "predicted_economic_sphere": <この人が形成できる経済圏規模。例: "5億〜50億円">,
  "mvp_market_reaction": <MVP市場反応予測 0-100>,
  "ai_aptitude": <AI活用適性 0-100>,
  "community_formation": <コミュニティ形成力 0-100>,
  "brand_potential": <ブランド化可能性 0-100>,
  "estimated_revenue_model": <最適な収益モデル予測。例: "世界観サブスク × スクール型">,
  "market_temperature": <市場温度指数 0-100（高いほど今がホット）>,
  "competition_saturation": <競合飽和率 0-100（低いほど空白市場）>,
  "worldview_imitation_resistance": <世界観の模倣されにくさ 0-100>,
  "ai_replacement_risk": <AI代替リスク 0-100（低いほど安全）>,
  "fan_conversion_speed": <ファン化速度 0-100>,
  "existence_capital_score": <存在資本スコア 0-100>,
  "economic_sphere_formation": <経済圏形成可能性 0-100>,
  "market_entry_success_rate": <市場参入成功率 0-100>,
  "estimated_recovery_period": <投資回収期間目安。例: "12〜24ヶ月">,
  "ai_era_adaptation_index": <AI時代適応指数 0-100>,
  "mvp_recommended_tier": <推奨MVP規模: "small" | "medium" | "large">,
  "ai_comprehensive_report": <存在価値×世界観×市場性の観点から400文字以内の日本語総合分析。独自性・可能性・具体的な市場戦略アドバイスを含む>
}`

function buildWorldviewPrompt(answers) {
  return `以下の15問の回答を深層分析してください。

【Q0-1：現在の業種】
業種: ${answers.q01_select ?? '未回答'}
記述: ${answers.q01_text ?? '未回答'}

【Q0-2：現在の立場】
立場: ${answers.q02_select ?? '未回答'}
記述: ${answers.q02_text ?? '未回答'}

【Q0-3：作りたいMVPジャンル】
ジャンル: ${answers.q03_select ?? '未回答'}
記述: ${answers.q03_text ?? '未回答'}

【Q0-4：現在の発信状況】
発信規模: ${answers.q04_select ?? '未回答'}
記述: ${answers.q04_text ?? '未回答'}

【Q0-5：現在の挑戦予算】
予算規模: ${answers.q05_select ?? '未回答'}
記述: ${answers.q05_text ?? '未回答'}

【Q1：あなたが変えたい世界】
テーマ: ${answers.q1_select ?? '未回答'}
記述: ${answers.q1_text ?? '未回答'}

【Q2：あなたが理想とする世界観】
タイプ: ${answers.q2_select ?? '未回答'}
記述: ${answers.q2_text ?? '未回答'}

【Q3：あなたが今後発信したいもの】
ジャンル: ${answers.q3_select ?? '未回答'}
記述: ${answers.q3_text ?? '未回答'}

【Q4：あなたの強み・人生経験】
${answers.q4_text ?? '未回答'}

【Q5：あなたが嫌いなもの・違和感】
${answers.q5_text ?? '未回答'}

【Q6：どんな存在になりたいか】
タイプ: ${answers.q6_select ?? '未回答'}
記述: ${answers.q6_text ?? '未回答'}

【Q7：AI時代に感じていること】
${answers.q7_text ?? '未回答'}

【Q8：作りたいもの】
カテゴリ: ${answers.q8_select ?? '未回答'}
記述: ${answers.q8_text ?? '未回答'}

【Q9：理想のライフスタイル】
${answers.q9_text ?? '未回答'}

【Q10：人生を通して一番伝えたいこと】
${answers.q10_text ?? '未回答'}`
}

export async function analyzeWorldviewDiagnosis(answers) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (!apiKey) throw new Error('VITE_OPENAI_API_KEY が .env.local に設定されていません')

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      temperature: 0.75,
      max_tokens: 2500,
      messages: [
        { role: 'system', content: WORLDVIEW_SYSTEM_PROMPT },
        { role: 'user',   content: buildWorldviewPrompt(answers) },
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? `OpenAI API error: ${response.status}`)
  }

  const data   = await response.json()
  const raw    = data.choices?.[0]?.message?.content ?? '{}'
  const result = JSON.parse(raw)

  const required = [
    'worldview_type','existence_value_score','empathy_index','sns_viral_prediction',
    'estimated_market_size','predicted_economic_sphere','mvp_market_reaction','ai_aptitude',
    'community_formation','brand_potential','estimated_revenue_model','market_temperature',
    'competition_saturation','worldview_imitation_resistance','ai_replacement_risk',
    'fan_conversion_speed','existence_capital_score','economic_sphere_formation',
    'market_entry_success_rate','estimated_recovery_period','ai_era_adaptation_index',
    'mvp_recommended_tier','ai_comprehensive_report',
  ]
  for (const key of required) {
    if (result[key] === undefined) throw new Error(`Worldview analysis missing key: ${key}`)
  }
  return result
}

export function mockWorldviewAnalysis() {
  const s = () => Math.floor(58 + Math.random() * 32)
  const low = () => Math.floor(15 + Math.random() * 40)
  return {
    worldview_type: '未来創造型 × 共感市場型',
    existence_value_score: s(), empathy_index: s(), sns_viral_prediction: s(),
    estimated_market_size: '1.2兆円', predicted_economic_sphere: '3億〜30億円',
    mvp_market_reaction: s(), ai_aptitude: s(), community_formation: s(), brand_potential: s(),
    estimated_revenue_model: 'サブスク × コミュニティ × スクール',
    market_temperature: s(), competition_saturation: low(),
    worldview_imitation_resistance: s(), ai_replacement_risk: low(),
    fan_conversion_speed: s(), existence_capital_score: s(),
    economic_sphere_formation: s(), market_entry_success_rate: s(),
    estimated_recovery_period: '12〜24ヶ月', ai_era_adaptation_index: s(),
    mvp_recommended_tier: 'medium',
    ai_comprehensive_report: '（オフラインモード）APIキーが未設定のため、モック分析を表示しています。実際の分析には VITE_OPENAI_API_KEY の設定が必要です。',
  }
}
