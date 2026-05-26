import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, Cell, PieChart, Pie, LineChart, Line, Legend,
} from 'recharts'
import Sidebar from '../components/Sidebar'
import { generateMarketAnalysis } from '../lib/openai'

// ── Static chart data (existing) ────────────────────────────────────────────
const INDUSTRIES = ['テクノロジー', 'ヘルスケア', 'フィンテック', 'エドテック', 'Web3']

const AI_INDUSTRIES = [
  'テクノロジー / SaaS', 'ヘルスケア / MedTech', 'フィンテック',
  'エンタメ / クリエイター', 'EC / リテール', 'Web3 / ブロックチェーン',
  'エドテック', 'フードテック', 'PropTech / 不動産', 'HRテック',
  'サステナビリティ / GreenTech', 'その他',
]

const marketSizeData = {
  テクノロジー: [
    { year: '2022', tam: 420, sam: 180, som: 45 }, { year: '2023', tam: 510, sam: 210, som: 58 },
    { year: '2024', tam: 620, sam: 265, som: 72 }, { year: '2025', tam: 750, sam: 320, som: 91 },
    { year: '2026', tam: 910, sam: 390, som: 115 }, { year: '2027', tam: 1100, sam: 470, som: 142 },
  ],
  ヘルスケア: [
    { year: '2022', tam: 280, sam: 120, som: 28 }, { year: '2023', tam: 330, sam: 145, som: 35 },
    { year: '2024', tam: 400, sam: 175, som: 44 }, { year: '2025', tam: 490, sam: 210, som: 56 },
    { year: '2026', tam: 590, sam: 255, som: 70 }, { year: '2027', tam: 710, sam: 305, som: 87 },
  ],
  フィンテック: [
    { year: '2022', tam: 350, sam: 150, som: 38 }, { year: '2023', tam: 430, sam: 185, som: 48 },
    { year: '2024', tam: 530, sam: 230, som: 61 }, { year: '2025', tam: 650, sam: 280, som: 76 },
    { year: '2026', tam: 800, sam: 345, som: 95 }, { year: '2027', tam: 980, sam: 420, som: 118 },
  ],
  エドテック: [
    { year: '2022', tam: 180, sam: 75, som: 18 }, { year: '2023', tam: 215, sam: 90, som: 22 },
    { year: '2024', tam: 260, sam: 110, som: 28 }, { year: '2025', tam: 315, sam: 135, som: 35 },
    { year: '2026', tam: 380, sam: 162, som: 43 }, { year: '2027', tam: 460, sam: 195, som: 53 },
  ],
  Web3: [
    { year: '2022', tam: 120, sam: 50, som: 12 }, { year: '2023', tam: 175, sam: 72, som: 18 },
    { year: '2024', tam: 255, sam: 105, som: 27 }, { year: '2025', tam: 370, sam: 152, som: 40 },
    { year: '2026', tam: 535, sam: 220, som: 58 }, { year: '2027', tam: 775, sam: 318, som: 85 },
  ],
}

const staticCompetitors = [
  { name: 'Alpha Corp',  market: 28, growth: 18, innovation: 85, price: 72, support: 65 },
  { name: 'Beta Tech',   market: 22, growth: 12, innovation: 70, price: 88, support: 75 },
  { name: 'Gamma AI',    market: 15, growth: 35, innovation: 92, price: 55, support: 60 },
  { name: 'Delta Cloud', market: 18, growth: 8,  innovation: 60, price: 95, support: 85 },
  { name: 'あなた',       market: 5,  growth: 65, innovation: 90, price: 70, support: 80 },
]

const trendData = [
  { month: '1月', ai: 72, blockchain: 45, saas: 85, mobile: 68 },
  { month: '2月', ai: 78, blockchain: 42, saas: 87, mobile: 70 },
  { month: '3月', ai: 82, blockchain: 55, saas: 83, mobile: 72 },
  { month: '4月', ai: 88, blockchain: 60, saas: 89, mobile: 75 },
  { month: '5月', ai: 91, blockchain: 52, saas: 91, mobile: 78 },
  { month: '6月', ai: 95, blockchain: 65, saas: 88, mobile: 80 },
]

const staticShareData = [
  { name: 'Alpha Corp',  value: 28, color: '#00D1FF' },
  { name: 'Beta Tech',   value: 22, color: '#8B5CF6' },
  { name: 'Delta Cloud', value: 18, color: '#FF4FD8' },
  { name: 'Gamma AI',    value: 15, color: '#34d399' },
  { name: 'その他',       value: 12, color: '#f59e0b' },
  { name: 'あなた',       value: 5,  color: '#ffffff' },
]

// ── Helpers ──────────────────────────────────────────────────────────────────
const IMPACT_CONFIG = {
  高: { color: '#FF4FD8', bg: 'bg-[#FF4FD8]/15', border: 'border-[#FF4FD8]/40' },
  中: { color: '#f59e0b', bg: 'bg-[#f59e0b]/15', border: 'border-[#f59e0b]/40' },
  低: { color: '#34d399', bg: 'bg-[#34d399]/15', border: 'border-[#34d399]/40' },
}
const TIMING_CONFIG = {
  '今すぐ':    { color: '#34d399', label: '今すぐ参入' },
  '6ヶ月以内': { color: '#00D1FF', label: '6ヶ月以内' },
  '1年以内':   { color: '#8B5CF6', label: '1年以内' },
  '様子見':    { color: '#f59e0b', label: '様子見' },
}
const PLAYER_COLORS = ['#00D1FF','#8B5CF6','#FF4FD8','#34d399','#f59e0b','#ec4899','#a78bfa']

const ANALYZE_PHASES = [
  '業界データを収集中',
  '市場規模を推計中',
  '競合企業を分析中',
  'トレンドを解析中',
  'レポートを生成中',
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#050816]/95 border border-white/10 rounded-xl p-3 text-xs">
      <p className="text-white/60 mb-1">{label}</p>
      {payload.map(p => <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}億ドル</p>)}
    </div>
  )
}

// ── AI Result Sections ───────────────────────────────────────────────────────
function SectionHeader({ icon, color, children, badge }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span style={{ color }} className="text-xl">{icon}</span>
      <h2 className="text-white font-semibold">{children}</h2>
      {badge && (
        <span className="ml-1 text-xs px-2 py-0.5 rounded-full border"
          style={{ color, borderColor: `${color}40`, background: `${color}10` }}
        >{badge}</span>
      )}
    </div>
  )
}

function AIResultPanel({ result, industry }) {
  const timing = TIMING_CONFIG[result.ideal_entry_timing] ?? TIMING_CONFIG['様子見']
  const intensity = result.competitive_intensity ?? 50

  // Build share data from key_players
  const playerShare = result.key_players?.slice(0, 5).map((p, i) => ({
    name: p.name,
    value: Number(p.share) || Math.round(60 / (i + 1)),
    color: PLAYER_COLORS[i],
  })) ?? []
  const shownSum = playerShare.reduce((a, b) => a + b.value, 0)
  if (shownSum < 95) playerShare.push({ name: 'その他', value: 100 - shownSum, color: '#4b5563' })

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-6 flex flex-col gap-6"
    >
      {/* Summary + timing */}
      <div className="glass border border-[#00D1FF]/20 p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#00D1FF] to-transparent opacity-60" />
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#00D1FF]/5 blur-3xl pointer-events-none" />
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[#00D1FF]">◈</span>
              <span className="text-white/40 text-xs uppercase tracking-widest">GPT-4o 市場概況</span>
              <span className="text-xs bg-[#00D1FF]/10 border border-[#00D1FF]/30 text-[#00D1FF] px-2 py-0.5 rounded-full">{industry}</span>
            </div>
            <p className="text-white/80 text-sm leading-relaxed">{result.summary}</p>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <div className="text-center p-3 rounded-xl border"
              style={{ borderColor: `${timing.color}40`, background: `${timing.color}10` }}
            >
              <div className="text-xs text-white/40 mb-1">今の参入チャンス</div>
              <div className="font-bold text-sm" style={{ color: timing.color }}>{timing.label}</div>
              <div className="text-[10px] text-white/25 mt-1">市場に入るベストな時期</div>
            </div>
            <div className="text-center p-3 rounded-xl border border-[#FF4FD8]/30 bg-[#FF4FD8]/5">
              <div className="text-xs text-white/40 mb-1">ライバルの多さ</div>
              <div className="font-bold text-sm text-[#FF4FD8]">{intensity}/100</div>
              <div className="mt-1.5 h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-[#34d399] via-[#f59e0b] to-[#FF4FD8]"
                  initial={{ width: 0 }} animate={{ width: `${intensity}%` }} transition={{ duration: 1 }}
                />
              </div>
              <div className="text-[10px] text-white/25 mt-1">100に近いほど競争が激しい</div>
            </div>
          </div>
        </div>
      </div>

      {/* Market size KPIs */}
      <div>
        <SectionHeader icon="◉" color="#8B5CF6">市場規模推計 ({result.market_size?.forecast_year ?? '2030年'})</SectionHeader>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: '市場全体の規模 (日本)',   value: result.market_size?.tam_japan,  color: '#00D1FF', hint: '日本国内の業界全体の規模' },
            { label: '市場全体の規模 (世界)', value: result.market_size?.tam_global, color: '#8B5CF6', hint: '世界全体の業界市場の総量' },
            { label: '狙える市場の規模',     value: result.market_size?.sam,        color: '#FF4FD8', hint: '実際に届けられる顧客層の規模' },
            { label: '最初に取れる市場',     value: result.market_size?.som,        color: '#34d399', hint: '現実的に最初に獲得できる範囲' },
            { label: '年間成長率',          value: result.market_size?.cagr,       color: '#f59e0b', hint: '毎年の市場拡大スピード' },
          ].map((k, i) => (
            <motion.div key={k.label}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="glass border border-white/10 p-4 text-center relative overflow-hidden"
              style={{ borderColor: `${k.color}25` }}
            >
              <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: k.color }} />
              <div className="text-lg font-black" style={{ color: k.color }}>{k.value ?? '—'}</div>
              <div className="text-white/40 text-xs mt-0.5">{k.label}</div>
              {k.hint && <div className="text-white/25 text-[10px] mt-0.5 leading-tight">{k.hint}</div>}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Growth drivers + Trends */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Growth drivers */}
        <div>
          <SectionHeader icon="⬡" color="#00D1FF">成長ドライバー</SectionHeader>
          <div className="flex flex-col gap-2">
            {result.growth_drivers?.map((d, i) => {
              const cfg = IMPACT_CONFIG[d.impact] ?? IMPACT_CONFIG['中']
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border ${cfg.bg} ${cfg.border}`}
                >
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <span className="text-lg" style={{ color: cfg.color }}>◈</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                      style={{ color: cfg.color, background: `${cfg.color}20` }}
                    >{d.impact}</span>
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">{d.title}</div>
                    <div className="text-white/50 text-xs mt-0.5 leading-relaxed">{d.description}</div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Trends */}
        <div>
          <SectionHeader icon="▣" color="#FF4FD8">市場トレンド</SectionHeader>
          <div className="flex flex-col gap-2">
            {result.trends?.map((t, i) => {
              const cfg = IMPACT_CONFIG[t.impact] ?? IMPACT_CONFIG['中']
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                  className="glass border border-white/8 p-3.5 rounded-xl hover:border-white/15 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white text-sm">{t.title}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${cfg.bg} ${cfg.border}`}
                      style={{ color: cfg.color }}
                    >{t.impact}影響</span>
                    <span className="text-[10px] text-white/30 ml-auto">{t.timeframe}</span>
                  </div>
                  <p className="text-white/50 text-xs leading-relaxed">{t.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Key players */}
      <div>
        <SectionHeader icon="◫" color="#8B5CF6" badge={`${result.key_players?.length ?? 0}社`}>主要プレイヤー</SectionHeader>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Player table */}
          <div className="xl:col-span-2 glass border border-white/10 overflow-hidden rounded-2xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  {['企業名','地域','推定シェア','成長率','強み'].map(h => (
                    <th key={h} className="text-left text-white/30 text-xs uppercase tracking-wider px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.key_players?.map((p, i) => (
                  <tr key={p.name}
                    className="border-b border-white/5 hover:bg-white/3 transition-colors"
                    style={{ opacity: 0, animation: 'fadeIn 0.4s ease forwards', animationDelay: `${0.1 + i * 0.06}s` }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: PLAYER_COLORS[i] }} />
                        <span className="text-white font-medium">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${p.region === '国内' ? 'bg-[#00D1FF]/10 text-[#00D1FF]' : 'bg-[#8B5CF6]/10 text-[#8B5CF6]'}`}>
                        {p.region}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-14 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${Math.min(p.share, 100)}%`, background: PLAYER_COLORS[i] }} />
                        </div>
                        <span className="text-white/60 text-xs">{p.share}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${Number(p.growth) >= 20 ? 'text-[#34d399]' : Number(p.growth) >= 10 ? 'text-[#f59e0b]' : 'text-white/40'}`}>
                        +{p.growth}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/50 text-xs max-w-[160px] truncate">{p.strength}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Share donut */}
          <div className="glass border border-white/10 p-5">
            <div className="text-white/40 text-xs uppercase tracking-widest mb-3">シェア分布</div>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie data={playerShare} cx="50%" cy="50%" innerRadius={42} outerRadius={68} dataKey="value" strokeWidth={0}>
                  {playerShare.map((e, i) => <Cell key={i} fill={e.color} fillOpacity={0.85} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'rgba(5,8,22,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 11 }} formatter={v => [`${v}%`]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-1 mt-1">
              {playerShare.map(d => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                    <span className="text-white/50 truncate max-w-[80px]">{d.name}</span>
                  </div>
                  <span style={{ color: d.color }} className="font-medium">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Opportunities & Risks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass border border-[#34d399]/20 p-5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#34d399]" />
          <SectionHeader icon="◈" color="#34d399">機会 (Opportunities)</SectionHeader>
          <div className="flex flex-col gap-2">
            {result.opportunities?.map((o, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                className="flex items-start gap-2.5 text-sm"
              >
                <span className="text-[#34d399] mt-0.5 shrink-0 text-xs font-bold">0{i + 1}</span>
                <span className="text-white/70 leading-relaxed">{o}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="glass border border-[#FF4FD8]/20 p-5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#FF4FD8]" />
          <SectionHeader icon="⚠" color="#FF4FD8">リスク (Risks)</SectionHeader>
          <div className="flex flex-col gap-2">
            {result.risks?.map((r, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                className="flex items-start gap-2.5 text-sm"
              >
                <span className="text-[#FF4FD8] mt-0.5 shrink-0 text-xs font-bold">0{i + 1}</span>
                <span className="text-white/70 leading-relaxed">{r}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Entry recommendation */}
      <div className="glass border border-[#8B5CF6]/25 p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#8B5CF6] to-transparent" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-[#8B5CF6]/8 blur-3xl pointer-events-none" />
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[#8B5CF6] text-xl">◭</span>
          <h2 className="text-white font-semibold">参入戦略レコメンデーション</h2>
          <span className="ml-auto text-xs bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-[#8B5CF6] px-2 py-0.5 rounded-full">GPT-4o</span>
        </div>
        <p className="text-white/75 text-sm leading-relaxed">{result.entry_recommendation}</p>
      </div>
    </motion.div>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function MarketAnalysis() {
  const [selectedIndustry, setSelectedIndustry] = useState('テクノロジー')
  const data = marketSizeData[selectedIndustry]

  // AI analysis state
  const [aiIndustry, setAiIndustry]   = useState('テクノロジー / SaaS')
  const [aiContext, setAiContext]     = useState('')
  const [aiLoading, setAiLoading]    = useState(false)
  const [aiPhase, setAiPhase]        = useState(0)
  const [aiResult, setAiResult]      = useState(null)
  const [aiError, setAiError]        = useState(null)
  const [aiGenerated, setAiGenerated] = useState(null) // { industry }

  const handleGenerate = async () => {
    setAiLoading(true)
    setAiError(null)
    setAiResult(null)
    setAiPhase(0)

    const timer = setInterval(() => setAiPhase(p => Math.min(p + 1, ANALYZE_PHASES.length - 1)), 1400)

    try {
      const result = await generateMarketAnalysis(aiIndustry, aiContext)
      clearInterval(timer)
      setAiPhase(ANALYZE_PHASES.length)
      setAiResult(result)
      setAiGenerated({ industry: aiIndustry })
    } catch (err) {
      clearInterval(timer)
      setAiError(err.message)
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-white/40 text-sm tracking-widest uppercase mb-1">Market Intelligence</p>
          <h1 className="text-3xl font-black text-white">市場分析 <span className="text-[#00D1FF]">ダッシュボード</span></h1>
        </motion.div>

        {/* ── AI Analysis Generator ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="glass border border-[#00D1FF]/25 p-6 mb-8 relative overflow-hidden"
        >
          {/* Top glow */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#00D1FF] to-transparent opacity-70" />
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-[#00D1FF]/5 blur-3xl pointer-events-none" />

          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00D1FF]/20 to-[#8B5CF6]/20 border border-[#00D1FF]/30 flex items-center justify-center text-[#00D1FF] text-lg">◈</div>
            <div>
              <h2 className="text-white font-bold">GPT-4o 市場分析ジェネレーター</h2>
              <p className="text-white/40 text-xs">業界を選択してAIがリアルタイムで市場調査レポートを生成します</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Industry select */}
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">業界を選択</label>
              <div className="flex flex-wrap gap-1.5">
                {AI_INDUSTRIES.map(ind => (
                  <button key={ind} onClick={() => setAiIndustry(ind)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200
                      ${aiIndustry === ind
                        ? 'bg-[#00D1FF]/15 border-[#00D1FF]/50 text-[#00D1FF]'
                        : 'bg-white/3 border-white/10 text-white/45 hover:text-white'}`}
                  >{ind}</button>
                ))}
              </div>
            </div>

            {/* Context input */}
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">
                サービス概要 <span className="text-white/20 normal-case">(任意 — より精度の高い分析が得られます)</span>
              </label>
              <textarea
                value={aiContext}
                onChange={e => setAiContext(e.target.value)}
                placeholder="例: AIを使った健康管理アプリ。ユーザーの食事・運動データを分析しパーソナライズされたアドバイスを提供する..."
                rows={4}
                className="w-full bg-white/5 border border-white/10 focus:border-[#00D1FF]/40 text-white placeholder-white/20 rounded-xl px-4 py-3 outline-none text-sm resize-none transition-all"
              />
            </div>
          </div>

          {/* Generate button */}
          <div className="flex items-center gap-4">
            <motion.button
              onClick={handleGenerate}
              disabled={aiLoading}
              whileHover={{ scale: aiLoading ? 1 : 1.02 }}
              whileTap={{ scale: aiLoading ? 1 : 0.98 }}
              className="relative px-8 py-3.5 rounded-xl font-semibold text-white overflow-hidden group disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #00D1FF, #8B5CF6)' }}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              {aiLoading ? (
                <span className="flex items-center gap-2">
                  <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  分析中...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>◈</span> GPT-4oで市場分析を生成
                </span>
              )}
            </motion.button>

            {aiResult && (
              <span className="text-[#34d399] text-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34d399]" />
                {aiGenerated?.industry} の分析が完了しました
              </span>
            )}
          </div>

          {/* Loading phases */}
          <AnimatePresence>
            {aiLoading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="mt-5 overflow-hidden"
              >
                <div className="flex items-center gap-3 flex-wrap">
                  {ANALYZE_PHASES.map((phase, i) => (
                    <motion.div key={phase}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-1.5 text-xs"
                    >
                      <motion.span
                        animate={aiPhase === i ? { scale: [1, 1.4, 1] } : {}}
                        transition={{ duration: 0.6, repeat: aiPhase === i ? Infinity : 0 }}
                        style={{ color: aiPhase > i ? '#34d399' : aiPhase === i ? '#00D1FF' : 'rgba(255,255,255,0.2)' }}
                      >
                        {aiPhase > i ? '✓' : '◈'}
                      </motion.span>
                      <span style={{ color: aiPhase > i ? '#34d399' : aiPhase === i ? '#fff' : 'rgba(255,255,255,0.25)' }}>
                        {phase}
                      </span>
                      {i < ANALYZE_PHASES.length - 1 && <span className="text-white/15 ml-1">→</span>}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          {aiError && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
            >
              ⚠ {aiError}
            </motion.div>
          )}

          {/* AI Results */}
          {aiResult && <AIResultPanel result={aiResult} industry={aiGenerated?.industry} />}
        </motion.div>

        {/* ── Static Charts ── */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px flex-1 bg-white/8" />
          <span className="text-white/30 text-xs uppercase tracking-widest">スタティック市場データ</span>
          <div className="h-px flex-1 bg-white/8" />
        </div>

        {/* Industry selector */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {INDUSTRIES.map(ind => (
            <motion.button key={ind} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedIndustry(ind)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200
                ${selectedIndustry === ind
                  ? 'bg-[#00D1FF]/15 border-[#00D1FF]/50 text-[#00D1FF]'
                  : 'bg-white/3 border-white/10 text-white/50 hover:text-white'}`}
            >{ind}</motion.button>
          ))}
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: '市場全体の規模 (2027)', value: `${data[5].tam}億ドル`, color: '#00D1FF', icon: '◈', sub: `年間成長率 ${Math.round((Math.pow(data[5].tam / data[0].tam, 1/5) - 1) * 100)}%`, hint: 'その業界全体のお金の総量' },
            { label: '狙える市場の規模 (2027)', value: `${data[5].sam}億ドル`, color: '#8B5CF6', icon: '◉', sub: `全体の${Math.round(data[5].sam / data[5].tam * 100)}%`, hint: '実際に届けられる顧客層の規模' },
            { label: '最初に取れる市場 (2027)', value: `${data[5].som}億ドル`, color: '#FF4FD8', icon: '⬡', sub: `狙い目の${Math.round(data[5].som / data[5].sam * 100)}%`, hint: '現実的に最初に獲得できる範囲' },
          ].map((k, i) => (
            <motion.div key={k.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="glass border border-white/10 p-5 relative overflow-hidden" style={{ borderColor: `${k.color}25` }}
            >
              <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg,transparent,${k.color},transparent)` }} />
              <div className="text-2xl mb-2" style={{ color: k.color }}>{k.icon}</div>
              <div className="text-2xl font-black text-white">{k.value}</div>
              <div className="text-white/40 text-sm mt-0.5">{k.label}</div>
              <div className="text-xs mt-2 font-medium" style={{ color: k.color }}>{k.sub}</div>
              {k.hint && <div className="text-white/30 text-xs mt-1">{k.hint}</div>}
            </motion.div>
          ))}
        </div>

        {/* Market size chart + Share */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="xl:col-span-2 glass border border-white/10 p-6"
          >
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span className="text-[#00D1FF]">◈</span> 市場規模推移 (全体規模 / 狙い目 / 獲得目標)
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={data}>
                <defs>
                  {[['tamGrad','#00D1FF'],['samGrad','#8B5CF6'],['somGrad','#FF4FD8']].map(([id,c]) => (
                    <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={c} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={c} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="year" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                <Area type="monotone" dataKey="tam" name="市場全体の規模" stroke="#00D1FF" fill="url(#tamGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="sam" name="狙える市場の規模" stroke="#8B5CF6" fill="url(#samGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="som" name="最初に取れる市場" stroke="#FF4FD8" fill="url(#somGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="glass border border-white/10 p-6"
          >
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span className="text-[#8B5CF6]">◉</span> 市場シェア
            </h2>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={staticShareData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" strokeWidth={0}>
                  {staticShareData.map((e, i) => <Cell key={i} fill={e.color} fillOpacity={e.name === 'あなた' ? 1 : 0.75} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'rgba(5,8,22,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-1.5 mt-2">
              {staticShareData.map(d => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                    <span className="text-white/60">{d.name}</span>
                  </div>
                  <span className="font-medium" style={{ color: d.color }}>{d.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Competitor matrix */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass border border-white/10 p-6 mb-6"
        >
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span className="text-[#FF4FD8]">▣</span> 競合比較マトリクス
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {['企業名','シェア','成長率','革新性','価格競争力','サポート'].map(h => (
                    <th key={h} className="text-left text-white/40 text-xs uppercase tracking-wider pb-3 pr-6">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {staticCompetitors.map((c, i) => (
                  <tr key={c.name}
                    className={`border-b border-white/5 ${c.name === 'あなた' ? 'bg-[#00D1FF]/5' : ''}`}
                    style={{ opacity: 0, animation: `fadeIn 0.4s ease forwards`, animationDelay: `${0.4 + i * 0.08}s` }}
                  >
                    <td className={`py-3 pr-6 font-medium ${c.name === 'あなた' ? 'text-[#00D1FF]' : 'text-white'}`}>
                      {c.name === 'あなた' && <span className="mr-1 text-xs">★</span>}{c.name}
                    </td>
                    {[
                      { val: `${c.market}%`,   color: '#00D1FF' },
                      { val: `+${c.growth}%`,  color: c.growth > 30 ? '#34d399' : '#f59e0b' },
                      { val: c.innovation, bar: true, color: '#8B5CF6' },
                      { val: c.price,      bar: true, color: '#FF4FD8' },
                      { val: c.support,    bar: true, color: '#00D1FF' },
                    ].map((cell, j) => (
                      <td key={j} className="py-3 pr-6">
                        {cell.bar ? (
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${cell.val}%`, background: cell.color }} />
                            </div>
                            <span className="text-white/50 text-xs">{cell.val}</span>
                          </div>
                        ) : (
                          <span style={{ color: cell.color }} className="font-medium">{cell.val}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Trend chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass border border-white/10 p-6"
        >
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span className="text-[#00D1FF]">⬡</span> 技術トレンド指数 (2026年)
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[30, 100]} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'rgba(5,8,22,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} />
              <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
              <Line type="monotone" dataKey="ai"         name="AI/ML"          stroke="#00D1FF" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="blockchain" name="ブロックチェーン" stroke="#8B5CF6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="saas"       name="SaaS"            stroke="#FF4FD8" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="mobile"     name="モバイル"         stroke="#34d399" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

      </main>
    </div>
  )
}
