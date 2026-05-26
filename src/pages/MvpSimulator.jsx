import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '../components/Sidebar'

// ── Question definitions ──────────────────────────────────────────────────────
const QUESTIONS = [
  {
    id: 'platform',
    num: '①',
    question: '何を作りたいですか？',
    color: '#00D1FF',
    options: [
      { value: 'app',  icon: '📱', label: 'スマホアプリ',  desc: 'iPhone / Android 対応アプリ' },
      { value: 'web',  icon: '🌐', label: 'Webサービス',   desc: 'ブラウザで使えるサービス' },
      { value: 'both', icon: '✨', label: '両方',          desc: 'アプリ + Web どちらも対応' },
    ],
  },
  {
    id: 'timeline',
    num: '②',
    question: 'リリースまでの希望期間は？',
    color: '#8B5CF6',
    options: [
      { value: 'fast',     icon: '⚡', label: 'とにかく早く',      desc: '1〜2ヶ月でとにかく出したい' },
      { value: 'normal',   icon: '⚖️', label: 'じっくり丁寧に',    desc: '3〜6ヶ月でしっかり作る' },
      { value: 'thorough', icon: '🏗️', label: 'しっかり作り込む',  desc: '6ヶ月以上・完成度を重視' },
    ],
  },
  {
    id: 'budget',
    num: '③',
    question: '予算感は？',
    color: '#FF4FD8',
    options: [
      { value: 'cheap',    icon: '💡', label: 'できるだけ安く',  desc: '〜100万円で抑えたい' },
      { value: 'standard', icon: '💰', label: '標準的に',        desc: '100〜500万円で投資したい' },
      { value: 'invest',   icon: '🚀', label: 'しっかり投資',    desc: '500万円以上・品質重視' },
    ],
  },
  {
    id: 'ai',
    num: '④',
    question: 'AIをどう使いたい？',
    color: '#34d399',
    options: [
      { value: 'unknown',   icon: '🤖', label: 'わからない（おまかせ）', desc: '最適なAI機能を提案してもらう' },
      { value: 'chat',      icon: '💬', label: 'チャット・会話機能',     desc: 'AIと会話・文章を自動生成' },
      { value: 'vision',    icon: '🎯', label: '画像・音声認識',        desc: '写真や音声を解析して活用' },
      { value: 'analytics', icon: '📊', label: 'データ分析・予測',      desc: 'データから傾向や未来を予測' },
    ],
  },
]

// ── Cost / plan computation ───────────────────────────────────────────────────
const PLATFORM_COST = {
  app:  { lean: [50, 90],   std: [110, 260], prem: [260, 520] },
  web:  { lean: [25, 55],   std: [75,  200], prem: [190, 420] },
  both: { lean: [85, 160],  std: [190, 440], prem: [420, 900] },
}

const TIMELINE_FACTOR = { fast: 0.65, normal: 1.0, thorough: 1.75 }

const DURATION = {
  lean:    { fast: '1〜2ヶ月', normal: '2〜3ヶ月', thorough: '3〜5ヶ月' },
  std:     { fast: '2〜3ヶ月', normal: '3〜5ヶ月', thorough: '5〜8ヶ月' },
  prem:    { fast: '3〜4ヶ月', normal: '5〜7ヶ月', thorough: '7〜12ヶ月' },
}

const AI_ADD = {
  unknown:   { min: 10, max: 25,  label: '基本AI機能（自動選択）' },
  chat:      { min: 25, max: 60,  label: 'AIチャット・文章生成' },
  vision:    { min: 45, max: 100, label: '画像・音声認識AI' },
  analytics: { min: 55, max: 125, label: 'AIデータ分析・予測' },
}

const PLATFORM_FEATURES = {
  app:  ['ユーザー登録・ログイン', 'プッシュ通知機能', 'アプリストア申請対応', 'スマホ専用デザイン'],
  web:  ['ユーザー登録・ログイン', 'レスポンシブデザイン', 'ダッシュボード画面', 'メール通知機能'],
  both: ['ユーザー登録・ログイン', 'アプリ + Web 両対応', 'プッシュ通知機能', 'ダッシュボード画面', '共通API設計'],
}

function buildPlans(answers) {
  const pc  = PLATFORM_COST[answers.platform]
  const tf  = TIMELINE_FACTOR[answers.timeline]
  const ai  = AI_ADD[answers.ai]
  const base = PLATFORM_FEATURES[answers.platform]

  const range = (costs) => {
    const lo = Math.round((costs[0] * tf + ai.min) / 5) * 5
    const hi = Math.round((costs[1] * tf + ai.max) / 5) * 5
    return { lo, hi, label: `¥${lo}万 〜 ¥${hi}万` }
  }

  // "おすすめ" follows budget
  const rec = { cheap: 'lean', standard: 'std', invest: 'prem' }[answers.budget]

  const plans = [
    {
      tier: 'lean',
      name: 'スピードプラン',
      sub:  'まず動くものを最速で',
      icon: '⚡',
      color: '#34d399',
      border: '#34d399',
      cost: range(pc.lean),
      duration: DURATION.lean[answers.timeline],
      approach: 'ノーコード + AI開発ツール活用',
      features: [base[0], base[1], '基本的な画面デザイン', ai.label],
      forWho: 'アイデアをまず形にして検証したい方',
      tags: ['最速リリース', 'コスト最小', '仮説検証向け'],
    },
    {
      tier: 'std',
      name: 'スタンダードプラン',
      sub:  'コスパ最高のバランス型',
      icon: '◈',
      color: '#00D1FF',
      border: '#00D1FF',
      cost: range(pc.std),
      duration: DURATION.std[answers.timeline],
      approach: '専門エンジニア + AI支援開発',
      features: [...base.slice(0, 3), ai.label, '管理・分析ダッシュボード'],
      forWho: 'バランスよく本格的に作り上げたい方',
      tags: ['コスパ最高', '実績多数', '拡張しやすい'],
    },
    {
      tier: 'prem',
      name: 'プレミアムプラン',
      sub:  '品質・拡張性を最優先',
      icon: '◭',
      color: '#8B5CF6',
      border: '#8B5CF6',
      cost: range(pc.prem),
      duration: DURATION.prem[answers.timeline],
      approach: '専任チーム + PM / デザイナー体制',
      features: [...base, ai.label, '管理画面フル実装', 'セキュリティ強化', 'パフォーマンス最適化'],
      forWho: '品質・スケーラビリティにこだわる方',
      tags: ['高品質', '大規模対応', '長期運用向け'],
    },
  ]

  return plans.map(p => ({ ...p, recommended: p.tier === rec }))
}

// ── Main component ────────────────────────────────────────────────────────────
export default function MvpSimulator() {
  const [answers, setAnswers] = useState({ platform: null, timeline: null, budget: null, ai: null })

  const answered    = Object.values(answers).filter(Boolean).length
  const allAnswered = answered === 4
  const progress    = (answered / 4) * 100

  const plans = useMemo(
    () => (allAnswered ? buildPlans(answers) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(answers), allAnswered],
  )

  const reset = () => setAnswers({ platform: null, timeline: null, budget: null, ai: null })

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <p className="text-white/40 text-sm tracking-widest uppercase mb-1">Cost Estimation</p>
          <h1 className="text-3xl font-black text-white">
            開発費 <span className="text-[#8B5CF6]">シミュレーター</span>
          </h1>
          <p className="text-white/40 text-sm mt-2">
            4つの質問に答えるだけで、あなたに合った開発プランと費用レンジがわかります
          </p>
        </motion.div>

        {/* Progress bar */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <div className="flex justify-between mb-1.5 text-xs text-white/30">
            <span>STEP {answered} / 4</span>
            <span>{allAnswered ? '✓ すべて回答済み' : `あと ${4 - answered} 問`}</span>
          </div>
          <div className="h-1 bg-white/8 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#00D1FF] via-[#8B5CF6] to-[#FF4FD8]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
          </div>
        </motion.div>

        {/* Questions */}
        <div className="flex flex-col gap-5 mb-8">
          {QUESTIONS.map((q, qi) => {
            const isAnswered = !!answers[q.id]
            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: qi * 0.06 }}
                className="glass border border-white/8 p-6 relative overflow-hidden transition-all duration-300"
                style={isAnswered ? { borderColor: `${q.color}30` } : {}}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-0.5 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${q.color}, transparent)`,
                    opacity: isAnswered ? 0.75 : 0.25,
                  }}
                />

                {/* Question title */}
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shrink-0"
                    style={{ background: `${q.color}18`, border: `1px solid ${q.color}35`, color: q.color }}
                  >
                    {q.num}
                  </span>
                  <h3 className="text-white font-semibold text-base">{q.question}</h3>
                  <AnimatePresence>
                    {isAnswered && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.7 }}
                        className="ml-auto text-[10px] px-2.5 py-1 rounded-full font-semibold"
                        style={{ background: `${q.color}12`, border: `1px solid ${q.color}30`, color: q.color }}
                      >
                        ✓ 選択済み
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                {/* Options */}
                <div className={`grid gap-2.5 ${q.options.length === 4 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1 sm:grid-cols-3'}`}>
                  {q.options.map(opt => {
                    const sel = answers[q.id] === opt.value
                    return (
                      <motion.button
                        key={opt.value}
                        onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt.value }))}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        className="relative p-4 rounded-xl border text-left transition-all duration-200 overflow-hidden"
                        style={sel ? {
                          background: `${q.color}12`,
                          borderColor: `${q.color}55`,
                          boxShadow: `0 0 16px ${q.color}18`,
                        } : {
                          background: 'rgba(255,255,255,0.03)',
                          borderColor: 'rgba(255,255,255,0.09)',
                        }}
                      >
                        {sel && (
                          <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: q.color }} />
                        )}
                        <div className="text-2xl mb-2">{opt.icon}</div>
                        <div
                          className="font-bold text-sm leading-tight mb-0.5"
                          style={{ color: sel ? q.color : 'rgba(255,255,255,0.8)' }}
                        >
                          {opt.label}
                        </div>
                        <div className="text-white/35 text-xs leading-relaxed">{opt.desc}</div>
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Pending message */}
        <AnimatePresence>
          {!allAnswered && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-white/20 text-sm mb-8"
            >
              あと <span className="text-white/40 font-semibold">{4 - answered}</span> 問に答えると、あなた専用の開発プランが表示されます
            </motion.p>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {allAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              {/* Section header */}
              <div className="flex items-center gap-4 mb-5">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="text-[#8B5CF6] text-xl">◭</span>
                  <h2 className="text-white font-bold text-lg">あなたへの開発プラン 3選</h2>
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>

              {/* Answer summary chips */}
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {QUESTIONS.map(q => {
                  const opt = q.options.find(o => o.value === answers[q.id])
                  return (
                    <div
                      key={q.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                      style={{ background: `${q.color}10`, border: `1px solid ${q.color}25`, color: q.color }}
                    >
                      <span>{opt?.icon}</span>
                      <span>{opt?.label}</span>
                    </div>
                  )
                })}
                <button
                  onClick={reset}
                  className="px-3 py-1.5 rounded-full text-xs bg-white/5 border border-white/12 text-white/35 hover:text-white/60 transition-colors"
                >
                  ↺ やり直す
                </button>
              </div>

              {/* Plan cards */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-6">
                {plans.map((plan, i) => (
                  <motion.div
                    key={plan.tier}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass border p-6 relative overflow-hidden flex flex-col"
                    style={{
                      borderColor: plan.recommended ? `${plan.color}60` : `${plan.color}25`,
                      boxShadow: plan.recommended ? `0 4px 48px ${plan.color}20` : `0 4px 24px ${plan.color}0a`,
                    }}
                  >
                    {/* Top color bar */}
                    <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: plan.color }} />

                    {/* BG glow */}
                    <div
                      className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl pointer-events-none opacity-30"
                      style={{ background: plan.color }}
                    />

                    {/* おすすめバッジ */}
                    {plan.recommended && (
                      <div className="absolute top-4 right-4">
                        <span
                          className="text-xs font-bold px-2.5 py-1 rounded-full"
                          style={{ background: `${plan.color}20`, border: `1px solid ${plan.color}50`, color: plan.color }}
                        >
                          ⭐ おすすめ
                        </span>
                      </div>
                    )}

                    {/* Plan name */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xl" style={{ color: plan.color }}>{plan.icon}</span>
                        <h3 className="font-black text-white text-lg">{plan.name}</h3>
                      </div>
                      <p className="text-white/35 text-xs ml-8">{plan.sub}</p>
                    </div>

                    {/* Cost */}
                    <div
                      className="mb-4 p-4 rounded-xl relative overflow-hidden"
                      style={{ background: `${plan.color}08`, border: `1px solid ${plan.color}20` }}
                    >
                      <div className="text-white/35 text-xs mb-1">費用レンジ（目安）</div>
                      <div className="text-2xl font-black leading-tight" style={{ color: plan.color }}>
                        {plan.cost.label}
                      </div>
                    </div>

                    {/* Duration + approach */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="p-2.5 rounded-lg bg-white/3 border border-white/8 text-center">
                        <div className="text-white/30 text-[10px] uppercase tracking-wider mb-0.5">期間目安</div>
                        <div className="text-white text-xs font-semibold">{plan.duration}</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white/3 border border-white/8 text-center">
                        <div className="text-white/30 text-[10px] uppercase tracking-wider mb-0.5">開発方式</div>
                        <div className="text-white/70 text-[10px] font-medium leading-tight">{plan.approach}</div>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="mb-4 flex-1">
                      <div className="text-white/30 text-[10px] uppercase tracking-wider mb-2">含まれる主な機能</div>
                      <ul className="flex flex-col gap-1.5">
                        {plan.features.map((f, fi) => (
                          <li key={fi} className="flex items-start gap-2 text-xs text-white/60">
                            <span className="shrink-0 mt-px text-xs" style={{ color: plan.color }}>▸</span>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* For who */}
                    <div
                      className="p-3 rounded-xl mb-3"
                      style={{ background: `${plan.color}08`, border: `1px solid ${plan.color}18` }}
                    >
                      <div className="text-white/30 text-[10px] uppercase tracking-wider mb-0.5">こんな方に</div>
                      <div className="text-white/65 text-xs">{plan.forWho}</div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {plan.tags.map(tag => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 rounded-md font-medium"
                          style={{ background: `${plan.color}10`, border: `1px solid ${plan.color}22`, color: plan.color }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Disclaimer */}
              <p className="text-center text-white/18 text-xs">
                ※ 費用・期間は目安です。実際の開発内容・チーム体制により変動します。詳細はお見積もりをご依頼ください。
              </p>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  )
}
