import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  RadialBarChart, RadialBar,
} from 'recharts'
import Sidebar from '../components/Sidebar'
import NeonButton from '../components/NeonButton'

const PLATFORMS = {
  Kickstarter:  { fee: 5, paymentFee: 3, successRate: 38, avgBackers: 420, color: '#00D1FF' },
  Makuake:      { fee: 12, paymentFee: 3.6, successRate: 78, avgBackers: 280, color: '#8B5CF6' },
  CAMPFIRE:     { fee: 17, paymentFee: 3.6, successRate: 72, avgBackers: 240, color: '#FF4FD8' },
  Indiegogo:    { fee: 5, paymentFee: 3, successRate: 28, avgBackers: 380, color: '#34d399' },
  'GREEN FUNDING': { fee: 20, paymentFee: 4, successRate: 85, avgBackers: 200, color: '#f59e0b' },
}

const CATEGORIES = ['テクノロジー', 'ゲーム', 'デザイン', 'フード', 'ファッション', 'アート']

const CAT_MULTIPLIERS = {
  テクノロジー: 1.25, ゲーム: 1.40, デザイン: 1.10,
  フード: 0.85, ファッション: 0.90, アート: 0.95,
}

function SliderRow({ label, value, min, max, step = 1, onChange, color, format }) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1.5">
        <span className="text-white/60 text-sm">{label}</span>
        <span className="font-bold text-sm" style={{ color }}>{format ? format(value) : value}</span>
      </div>
      <div className="relative">
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
        </div>
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-1.5" />
      </div>
    </div>
  )
}

const TIERS_TEMPLATES = [
  { name: 'アーリーバード',  price: 3000,  reward: '製品 30%OFF + 限定ステッカー',    limit: 100 },
  { name: 'スタンダード',    price: 5000,  reward: '製品 + お礼メール',               limit: 500 },
  { name: 'プレミアム',      price: 12000, reward: '製品 + 名前掲載 + 限定グッズ',    limit: 200 },
  { name: 'スペシャル',      price: 30000, reward: '製品 + 1:1ミーティング + Tシャツ', limit: 50  },
  { name: 'コーポレート',    price: 100000,reward: 'ロゴ掲載 + チームライセンス',      limit: 10  },
]

export default function CrowdfundingAnalysis() {
  const [goal, setGoal] = useState(1000000)
  const [duration, setDuration] = useState(30)
  const [platform, setPlatform] = useState('Makuake')
  const [category, setCategory] = useState('テクノロジー')
  const [preLaunch, setPreLaunch] = useState(200)
  const [snsBudget, setSnsBudget] = useState(50000)
  const [tiers, setTiers] = useState(TIERS_TEMPLATES)

  const plt = PLATFORMS[platform]
  const catMul = CAT_MULTIPLIERS[category]

  const calc = useMemo(() => {
    const totalFeeRate = (plt.fee + plt.paymentFee) / 100
    const netRate = 1 - totalFeeRate

    // Estimate backers per tier based on price curve
    const tierResults = tiers.map(t => {
      const demand = Math.max(1, Math.floor(
        plt.avgBackers * catMul
        * (50000 / Math.max(t.price, 1000))
        * (1 + preLaunch / 1000)
        * (1 + snsBudget / 500000)
        * (duration / 30)
      ))
      const backers = Math.min(demand, t.limit)
      const raised  = backers * t.price
      return { ...t, backers, raised }
    })

    const totalRaised  = tierResults.reduce((a, b) => a + b.raised, 0)
    const totalBackers = tierResults.reduce((a, b) => a + b.backers, 0)
    const netAmount    = Math.round(totalRaised * netRate)
    const progress     = Math.min(Math.round((totalRaised / goal) * 100), 999)
    const fees         = totalRaised - netAmount

    // Daily projection
    const days = Array.from({ length: duration }, (_, i) => {
      const dayPct = i === 0 ? 0.15 : i === duration - 1 ? 0.12 : i < 3 ? 0.06 : 0.02
      return {
        day: `Day ${i + 1}`,
        raised: Math.round(totalRaised * dayPct * (1 + Math.sin(i * 0.4) * 0.2)),
        cumulative: Math.round(totalRaised * Math.min(1, (i + 1) / duration * 1.2)),
      }
    })

    // Probability
    const successProb = Math.min(95, Math.round(
      plt.successRate * catMul
      * (1 + preLaunch / 500)
      * (progress > 100 ? 1.3 : progress / 100)
      * (1 + snsBudget / 300000)
    ))

    return { tierResults, totalRaised, totalBackers, netAmount, progress, fees, days, successProb }
  }, [goal, duration, platform, category, preLaunch, snsBudget, tiers])

  const fmt = n => `¥${n.toLocaleString()}`
  const fmtM = n => n >= 1000000 ? `¥${(n / 1000000).toFixed(1)}M` : `¥${(n / 10000).toFixed(0)}万`

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-white/40 text-sm tracking-widest uppercase mb-1">Crowdfunding Intelligence</p>
          <h1 className="text-3xl font-black text-white">クラファン <span className="text-[#FF4FD8]">分析</span></h1>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Settings column */}
          <div className="flex flex-col gap-5">
            {/* Platform */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass border border-white/10 p-5">
              <h2 className="text-white font-semibold mb-3 flex items-center gap-2"><span className="text-[#FF4FD8]">◈</span> プラットフォーム</h2>
              <div className="flex flex-col gap-1.5">
                {Object.entries(PLATFORMS).map(([key, val]) => (
                  <button key={key} onClick={() => setPlatform(key)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm transition-all
                      ${platform === key ? 'text-white border-opacity-50' : 'bg-white/3 border-white/8 text-white/50 hover:text-white'}`}
                    style={platform === key ? { background: `${val.color}20`, borderColor: `${val.color}50`, color: val.color } : {}}
                  >
                    <span className="font-medium">{key}</span>
                    <span className="text-xs opacity-70">手数料 {val.fee + val.paymentFee}% · 成功率 {val.successRate}%</span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Category */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }} className="glass border border-white/10 p-5">
              <h2 className="text-white font-semibold mb-3 flex items-center gap-2"><span className="text-[#00D1FF]">◉</span> カテゴリ</h2>
              <div className="grid grid-cols-2 gap-1.5">
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setCategory(c)}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all
                      ${category === c ? 'bg-[#00D1FF]/15 border-[#00D1FF]/50 text-[#00D1FF]' : 'bg-white/3 border-white/8 text-white/50 hover:text-white'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Sliders */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass border border-white/10 p-5">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><span className="text-[#8B5CF6]">▣</span> 設定</h2>
              <SliderRow label="目標金額" value={goal} min={100000} max={10000000} step={100000} onChange={setGoal} color="#8B5CF6" format={fmtM} />
              <SliderRow label="掲載期間" value={duration} min={7} max={60} onChange={setDuration} color="#00D1FF" format={v => `${v}日間`} />
              <SliderRow label="事前登録者数" value={preLaunch} min={0} max={2000} step={50} onChange={setPreLaunch} color="#FF4FD8" format={v => `${v}人`} />
              <SliderRow label="SNS広告予算" value={snsBudget} min={0} max={500000} step={10000} onChange={setSnsBudget} color="#34d399" format={fmtM} />
            </motion.div>
          </div>

          {/* Center + Right */}
          <div className="xl:col-span-2 flex flex-col gap-6">
            {/* KPI row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: '予測調達額', value: fmtM(calc.totalRaised), color: '#FF4FD8', icon: '◈' },
                { label: '手取り額',   value: fmtM(calc.netAmount),   color: '#34d399', icon: '◉' },
                { label: '支援者数',   value: `${calc.totalBackers}人`, color: '#00D1FF', icon: '▣' },
                { label: '成功確率',   value: `${calc.successProb}%`, color: '#8B5CF6', icon: '⬡' },
              ].map((k, i) => (
                <motion.div key={k.label}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className="glass border border-white/10 p-4 relative overflow-hidden"
                  style={{ borderColor: `${k.color}25` }}
                >
                  <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: k.color }} />
                  <div className="text-lg mb-1" style={{ color: k.color }}>{k.icon}</div>
                  <div className="text-xl font-black text-white">{k.value}</div>
                  <div className="text-white/40 text-xs mt-0.5">{k.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Progress gauge */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass border border-white/10 p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-white font-semibold flex items-center gap-2"><span className="text-[#FF4FD8]">◉</span> 目標達成予測</h2>
                <span className={`text-sm font-bold px-3 py-1 rounded-full border ${calc.progress >= 100 ? 'text-[#34d399] border-[#34d399]/30 bg-[#34d399]/10' : 'text-[#f59e0b] border-[#f59e0b]/30 bg-[#f59e0b]/10'}`}>
                  {calc.progress >= 100 ? '✓ 達成見込み' : '要強化'}
                </span>
              </div>
              <div className="relative h-6 bg-white/5 rounded-full overflow-hidden mb-2">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #FF4FD8, #8B5CF6, #00D1FF)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(calc.progress, 100)}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                  {calc.progress}%
                </div>
              </div>
              <div className="flex justify-between text-xs text-white/30">
                <span>¥0</span>
                <span className="text-white/50">{fmtM(goal / 2)}</span>
                <span>{fmtM(goal)}</span>
              </div>
            </motion.div>

            {/* Daily projection */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass border border-white/10 p-6">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><span className="text-[#00D1FF]">⬡</span> 日次累計調達額シミュレーション</h2>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={calc.days.filter((_, i) => i % Math.ceil(duration / 15) === 0)}>
                  <defs>
                    <linearGradient id="cfGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF4FD8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#FF4FD8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => fmtM(v)} />
                  <Tooltip contentStyle={{ background: 'rgba(5,8,22,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 11 }} formatter={v => [fmtM(v), '累計']} />
                  <Area type="monotone" dataKey="cumulative" stroke="#FF4FD8" fill="url(#cfGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Tier breakdown */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass border border-white/10 p-6">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><span className="text-[#8B5CF6]">▣</span> リターン別シミュレーション</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      {['リターン名', '金額', '上限数', '予測支援者', '調達額'].map(h => (
                        <th key={h} className="text-left text-white/30 text-xs uppercase tracking-wider pb-2 pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {calc.tierResults.map((t, i) => (
                      <motion.tr key={t.name}
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.06 }}
                        className="border-b border-white/5"
                      >
                        <td className="py-2.5 pr-4 text-white font-medium">{t.name}</td>
                        <td className="py-2.5 pr-4 text-[#00D1FF] font-mono">{fmt(t.price)}</td>
                        <td className="py-2.5 pr-4 text-white/50">{t.limit}名</td>
                        <td className="py-2.5 pr-4">
                          <span className={`font-bold ${t.backers >= t.limit ? 'text-[#34d399]' : 'text-[#8B5CF6]'}`}>{t.backers}名</span>
                          {t.backers >= t.limit && <span className="text-[#34d399] text-xs ml-1">満枠</span>}
                        </td>
                        <td className="py-2.5 text-[#FF4FD8] font-bold">{fmtM(t.raised)}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Platform comparison */}
              <div className="mt-5 pt-4 border-t border-white/5">
                <div className="text-white/40 text-xs uppercase tracking-wider mb-3">プラットフォーム手数料内訳</div>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="text-center">
                    <div className="text-white/40">プラットフォーム</div>
                    <div className="text-[#FF4FD8] font-bold mt-0.5">{plt.fee}%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white/40">決済手数料</div>
                    <div className="text-[#8B5CF6] font-bold mt-0.5">{plt.paymentFee}%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white/40">手取り率</div>
                    <div className="text-[#34d399] font-bold mt-0.5">{100 - plt.fee - plt.paymentFee}%</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}
