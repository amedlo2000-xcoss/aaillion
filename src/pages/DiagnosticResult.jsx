import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
} from 'recharts'
import Sidebar from '../components/Sidebar'
import { useApp } from '../context/AppContext'

// ── Sub-components ─────────────────────────────────────────────────────────────
function ScoreBar({ label, value, color, inverse = false, delay = 0 }) {
  const pct = Math.min(Math.max(inverse ? 100 - value : value, 0), 100)
  const display = value ?? 0
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-white/55 text-xs">{label}</span>
        <span className="font-bold text-sm tabular-nums" style={{ color }}>{display}</span>
      </div>
      <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.1, ease: 'easeOut', delay }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}70, ${color})` }}
        />
      </div>
    </div>
  )
}

function MetricCard({ label, value, color, icon, sub, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass border border-white/8 p-4 relative overflow-hidden"
      style={{ borderColor: `${color}20` }}
    >
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: color }} />
      <div className="text-white/35 text-[10px] uppercase tracking-wider mb-1">{label}</div>
      <div className="font-black text-lg leading-tight" style={{ color }}>{value}</div>
      {sub && <div className="text-white/30 text-[10px] mt-0.5">{sub}</div>}
      {icon && <div className="absolute top-3 right-3 text-xl opacity-30">{icon}</div>}
    </motion.div>
  )
}

function BigScoreCard({ label, score, color, icon, delay = 0, inverse = false }) {
  const pct = inverse ? 100 - score : score
  const level = pct >= 85 ? 'EXCELLENT' : pct >= 70 ? 'GOOD' : pct >= 55 ? 'FAIR' : 'LOW'
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="glass border p-5 text-center relative overflow-hidden"
      style={{ borderColor: `${color}30` }}
    >
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: color }} />
      <div className="text-2xl mb-2" style={{ color }}>{icon}</div>
      <div className="text-3xl font-black tabular-nums mb-0.5" style={{ color }}>
        {score}
      </div>
      <div className="text-white/35 text-[10px] uppercase tracking-wider mb-2">{label}</div>
      <div className="text-[9px] font-bold px-2 py-0.5 rounded-full inline-block"
        style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}
      >{level}</div>
      <div className="mt-3 h-1 bg-white/8 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: delay + 0.2 }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}60, ${color})` }}
        />
      </div>
    </motion.div>
  )
}

const MVP_TIERS = {
  small: {
    name: '小規模スタート',
    icon: '⚡',
    cost: '50万〜150万円',
    period: '2週間〜2ヶ月',
    color: '#34d399',
    features: ['LP（ランディングページ）', '簡易診断ツール', 'ブランド設計・コンセプト', 'SNS発信の型作り', 'メールリスト構築'],
    forWho: 'まず世界観を発信・市場反応を見たい方',
  },
  medium: {
    name: '中規模MVP',
    icon: '◈',
    cost: '150万〜800万円',
    period: '2〜6ヶ月',
    color: '#00D1FF',
    features: ['AI診断・分析機能', '会員・ログイン機能', 'コミュニティ基盤', '管理画面・分析ダッシュ', 'サブスク決済導線'],
    forWho: 'ビジネスを本格始動・ファンを集めたい方',
  },
  large: {
    name: '大規模プロダクト',
    icon: '◭',
    cost: '800万〜5000万円以上',
    period: '6ヶ月〜2年',
    color: '#8B5CF6',
    features: ['独自AI・機械学習エンジン', 'スマホアプリ（iOS/Android）', '大規模データベース', '独自経済圏・マーケットプレイス', '外部API・事業連携基盤'],
    forWho: 'スケーラブルな経済圏を構築したい方',
  },
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function DiagnosticResult() {
  const navigate  = useNavigate()
  const { diagnosticResult } = useApp()

  useEffect(() => {
    if (!diagnosticResult?.worldview_type) navigate('/diagnostic')
  }, [diagnosticResult, navigate])

  if (!diagnosticResult?.worldview_type) return null

  const r = diagnosticResult

  const radarData = [
    { axis: '存在価値',     value: r.existence_value_score  ?? 0 },
    { axis: '共感力',       value: r.empathy_index          ?? 0 },
    { axis: 'AI適性',       value: r.ai_aptitude            ?? 0 },
    { axis: 'コミュニティ', value: r.community_formation    ?? 0 },
    { axis: 'ブランド力',   value: r.brand_potential        ?? 0 },
    { axis: '市場適性',     value: r.market_entry_success_rate ?? 0 },
  ]

  const rec = r.mvp_recommended_tier ?? 'medium'

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-bold tracking-widest text-[#00D1FF] uppercase border border-[#00D1FF]/30 bg-[#00D1FF]/10 px-2 py-0.5 rounded-full">
              AI世界観市場診断OS
            </span>
            <span className="text-[10px] text-white/25 tracking-widest uppercase">COMPLETE</span>
            {r.aiError && (
              <span className="text-[10px] text-[#f59e0b] border border-[#f59e0b]/30 bg-[#f59e0b]/10 px-2 py-0.5 rounded-full">
                ⚠ モック
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-white leading-tight mb-2">
            {r.worldview_type}
          </h1>
          <div className="flex flex-wrap gap-3 text-sm text-white/40">
            <span>推定市場規模 <span className="text-[#00D1FF] font-bold">{r.estimated_market_size}</span></span>
            <span>·</span>
            <span>経済圏予測 <span className="text-[#8B5CF6] font-bold">{r.predicted_economic_sphere}</span></span>
            <span>·</span>
            <span>回収期間目安 <span className="text-[#FF4FD8] font-bold">{r.estimated_recovery_period}</span></span>
          </div>
        </motion.div>

        {/* ── Core 5 Scores ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 mb-8">
          {[
            { label: '存在価値スコア',    score: r.existence_value_score,  color: '#00D1FF', icon: '◈', delay: 0 },
            { label: '共感指数',          score: r.empathy_index,          color: '#8B5CF6', icon: '◉', delay: 0.07 },
            { label: 'AI適性',            score: r.ai_aptitude,            color: '#FF4FD8', icon: '⬡', delay: 0.14 },
            { label: 'コミュニティ形成力', score: r.community_formation,    color: '#34d399', icon: '▣', delay: 0.21 },
            { label: 'ブランド化可能性',   score: r.brand_potential,        color: '#f59e0b', icon: '◫', delay: 0.28 },
          ].map(p => <BigScoreCard key={p.label} {...p} />)}
        </div>

        {/* ── Radar + Market ── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          {/* Radar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
            className="glass border border-white/10 p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[#00D1FF]">◈</span>
              <h2 className="text-white font-semibold">能力レーダーチャート</h2>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="axis" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                <Radar dataKey="value" stroke="#00D1FF" fill="#00D1FF" fillOpacity={0.18} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Market metrics */}
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
            className="flex flex-col gap-3"
          >
            <div className="glass border border-white/10 p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[#8B5CF6]">◉</span>
                <h2 className="text-white font-semibold">市場・収益分析</h2>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <MetricCard label="推定市場規模"     value={r.estimated_market_size}     color="#00D1FF" icon="◈" delay={0.2} />
                <MetricCard label="予測経済圏"       value={r.predicted_economic_sphere} color="#8B5CF6" icon="◉" delay={0.25} />
                <MetricCard label="推定収益モデル"   value={r.estimated_revenue_model}   color="#FF4FD8" icon="▣" delay={0.3} />
                <MetricCard label="推定回収期間"     value={r.estimated_recovery_period} color="#f59e0b" icon="◫" delay={0.35} />
              </div>
              <div className="flex flex-col gap-3">
                <ScoreBar label="市場温度指数"     value={r.market_temperature}   color="#f59e0b" delay={0.4} />
                <ScoreBar label="競合飽和率"       value={r.competition_saturation} color="#FF4FD8" inverse delay={0.45} />
                <ScoreBar label="MVP市場反応予測"   value={r.mvp_market_reaction}  color="#00D1FF" delay={0.5} />
                <ScoreBar label="市場参入成功率"   value={r.market_entry_success_rate} color="#34d399" delay={0.55} />
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Growth & Viral ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="glass border border-white/10 p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[#FF4FD8]">▣</span>
            <h2 className="text-white font-semibold">成長・拡散ポテンシャル</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <ScoreBar label="SNS拡散予測"        value={r.sns_viral_prediction}    color="#FF4FD8" delay={0.3} />
            <ScoreBar label="ファン化速度"        value={r.fan_conversion_speed}    color="#00D1FF" delay={0.35} />
            <ScoreBar label="経済圏形成可能性"    value={r.economic_sphere_formation} color="#8B5CF6" delay={0.4} />
            <ScoreBar label="AI時代適応指数"      value={r.ai_era_adaptation_index} color="#34d399" delay={0.45} />
          </div>
        </motion.div>

        {/* ── Protection & Risk ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
          {[
            { label: '世界観模倣耐性',    value: r.worldview_imitation_resistance, color: '#34d399', icon: '◈',
              sub: '高いほど真似されにくい', delay: 0.3, inverse: false },
            { label: 'AI代替リスク',      value: r.ai_replacement_risk,           color: '#FF4FD8', icon: '⬡',
              sub: '低いほど安全',          delay: 0.35, inverse: true },
            { label: '存在資本スコア',    value: r.existence_capital_score,       color: '#8B5CF6', icon: '◉',
              sub: '人・信用・世界観の資本', delay: 0.4, inverse: false },
          ].map(item => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: item.delay }}
              className="glass border p-5 relative overflow-hidden"
              style={{ borderColor: `${item.color}25` }}
            >
              <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: item.color }} />
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-white/35 text-xs mb-0.5">{item.label}</div>
                  <div className="text-white/20 text-[10px]">{item.sub}</div>
                </div>
                <div className="text-3xl font-black tabular-nums" style={{ color: item.color }}>
                  {item.value}
                </div>
              </div>
              <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.inverse ? 100 - item.value : item.value}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: item.delay + 0.2 }}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${item.color}60, ${item.color})` }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── AI Comprehensive Report ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="glass border border-[#00D1FF]/25 p-6 mb-8 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#00D1FF] to-transparent opacity-70" />
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#00D1FF]/5 blur-3xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[#00D1FF] text-xl">◈</span>
            <h2 className="text-white font-bold">AI総合分析レポート</h2>
            <span className="ml-auto text-xs bg-[#00D1FF]/10 border border-[#00D1FF]/25 text-[#00D1FF] px-2 py-0.5 rounded-full">
              GPT-4o
            </span>
          </div>
          <p className="text-white/75 text-sm leading-relaxed">{r.ai_comprehensive_report}</p>
        </motion.div>

        {/* ── MVP Plans ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-5">
            <span className="text-[#8B5CF6] text-lg">◭</span>
            <h2 className="text-white font-bold text-lg">MVP費用感 — 3段階プラン</h2>
            <span className="text-xs text-white/30 ml-2">AIが「{MVP_TIERS[rec]?.name}」を推奨</span>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            {(['small', 'medium', 'large']).map((tier, i) => {
              const plan = MVP_TIERS[tier]
              const isRec = tier === rec
              return (
                <motion.div
                  key={tier}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 + i * 0.1 }}
                  className="glass border p-6 relative overflow-hidden flex flex-col"
                  style={{
                    borderColor: isRec ? `${plan.color}55` : `${plan.color}22`,
                    boxShadow: isRec ? `0 4px 40px ${plan.color}18` : 'none',
                  }}
                >
                  <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: plan.color }} />
                  <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full blur-3xl opacity-20 pointer-events-none"
                    style={{ background: plan.color }} />

                  {isRec && (
                    <div className="absolute top-4 right-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${plan.color}20`, border: `1px solid ${plan.color}45`, color: plan.color }}
                      >✦ AI推奨</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl" style={{ color: plan.color }}>{plan.icon}</span>
                    <h3 className="font-black text-white">{plan.name}</h3>
                  </div>

                  <div className="p-3.5 rounded-xl mb-4"
                    style={{ background: `${plan.color}09`, border: `1px solid ${plan.color}20` }}
                  >
                    <div className="text-white/30 text-[10px] mb-0.5">費用目安</div>
                    <div className="font-black text-lg" style={{ color: plan.color }}>{plan.cost}</div>
                    <div className="text-white/40 text-xs mt-0.5">期間: {plan.period}</div>
                  </div>

                  <ul className="flex flex-col gap-1.5 mb-4 flex-1">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-xs text-white/60">
                        <span className="shrink-0 mt-px" style={{ color: plan.color }}>▸</span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className="p-2.5 rounded-lg text-xs text-white/50"
                    style={{ background: `${plan.color}07`, border: `1px solid ${plan.color}15` }}
                  >
                    {plan.forWho}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* ── CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          className="flex flex-wrap gap-3 justify-center pb-4"
        >
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/diagnostic')}
            className="px-6 py-3 rounded-xl border border-white/15 text-white/60 hover:text-white hover:border-white/30 text-sm transition-all"
          >
            ↺ もう一度診断する
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => {
              const text = `【AI世界観市場診断OS 結果】\n世界観タイプ：${r.worldview_type}\n存在価値スコア：${r.existence_value_score}\n推定市場規模：${r.estimated_market_size}`
              navigator.clipboard?.writeText(text)
            }}
            className="px-6 py-3 rounded-xl border border-[#8B5CF6]/40 bg-[#8B5CF6]/10 text-[#8B5CF6] hover:bg-[#8B5CF6]/20 text-sm transition-all font-semibold"
          >
            ✦ 結果をコピー
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/mvp-sim')}
            className="px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all"
            style={{ background: 'linear-gradient(135deg, #00D1FF, #8B5CF6)', boxShadow: '0 0 20px rgba(0,209,255,0.25)' }}
          >
            MVP費用シミュレーターへ →
          </motion.button>
        </motion.div>

      </main>
    </div>
  )
}
