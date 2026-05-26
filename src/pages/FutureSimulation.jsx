import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts'
import Sidebar from '../components/Sidebar'

const MILESTONES = [
  { month: 3,  label: 'β版リリース',     icon: '◈', color: '#00D1FF' },
  { month: 6,  label: 'PMF達成',          icon: '◉', color: '#8B5CF6' },
  { month: 12, label: 'シードラウンド',   icon: '⬡', color: '#FF4FD8' },
  { month: 18, label: 'ユーザー10,000人', icon: '▣', color: '#34d399' },
  { month: 24, label: 'Series A',          icon: '◈', color: '#00D1FF' },
  { month: 36, label: '黒字化',            icon: '◉', color: '#8B5CF6' },
  { month: 48, label: 'グローバル展開',   icon: '⬡', color: '#FF4FD8' },
  { month: 60, label: 'IPO / M&A検討',    icon: '▣', color: '#f59e0b' },
]

const SCENARIOS = {
  悲観: { growthRate: 0.08, churnRate: 0.12, arpu: 3000, label: '悲観シナリオ', color: '#f59e0b' },
  標準: { growthRate: 0.18, churnRate: 0.06, arpu: 5000, label: '標準シナリオ', color: '#8B5CF6' },
  楽観: { growthRate: 0.32, churnRate: 0.03, arpu: 8000, label: '楽観シナリオ', color: '#34d399' },
}

function generateProjection(scenario, initialUsers = 100, months = 60) {
  const { growthRate, churnRate, arpu } = scenario
  const data = []
  let users = initialUsers
  let mrr = users * arpu
  let totalRevenue = 0
  let burnRate = 2000000

  for (let m = 1; m <= months; m++) {
    const newUsers = Math.round(users * growthRate * (1 + Math.sin(m * 0.5) * 0.1))
    const churnedUsers = Math.round(users * churnRate)
    users = Math.max(0, users + newUsers - churnedUsers)
    mrr = users * arpu
    totalRevenue += mrr
    burnRate = Math.max(500000, burnRate * 0.97)
    const profit = mrr - burnRate

    data.push({
      month: `M${m}`,
      monthNum: m,
      users,
      mrr: Math.round(mrr / 10000),
      totalRevenue: Math.round(totalRevenue / 10000),
      burnRate: Math.round(burnRate / 10000),
      profit: Math.round(profit / 10000),
      newUsers,
    })
  }
  return data
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#050816]/95 border border-white/10 rounded-xl p-3 text-xs min-w-[140px]">
      <p className="text-white/60 mb-2 font-medium">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="flex justify-between gap-4">
          <span>{p.name}</span>
          <span className="font-bold">{typeof p.value === 'number' && p.value > 100 ? `¥${p.value}万` : p.value?.toLocaleString()}</span>
        </p>
      ))}
    </div>
  )
}

export default function FutureSimulation() {
  const [initialUsers, setInitialUsers] = useState(100)
  const [activeScenarios, setActiveScenarios] = useState(['標準', '楽観'])
  const [selectedMetric, setSelectedMetric] = useState('mrr')
  const [highlightMonth, setHighlightMonth] = useState(null)

  const toggleScenario = s => setActiveScenarios(prev =>
    prev.includes(s) ? (prev.length > 1 ? prev.filter(x => x !== s) : prev) : [...prev, s]
  )

  const projections = useMemo(() =>
    Object.fromEntries(
      Object.entries(SCENARIOS).map(([key, sc]) => [key, generateProjection(sc, initialUsers)])
    ), [initialUsers]
  )

  const metrics = [
    { key: 'mrr',          label: 'MRR (万円)',       color: '#00D1FF' },
    { key: 'users',        label: 'ユーザー数',        color: '#8B5CF6' },
    { key: 'profit',       label: '月次利益 (万円)',   color: '#FF4FD8' },
    { key: 'totalRevenue', label: '累計売上 (万円)',    color: '#34d399' },
  ]

  // Build combined chart data
  const chartData = projections['標準'].map((d, i) => {
    const row = { month: d.month, monthNum: d.monthNum }
    activeScenarios.forEach(sc => {
      const p = projections[sc][i]
      row[`${sc}_${selectedMetric}`] = p[selectedMetric]
    })
    return row
  })

  const breakEvenMonth = projections['標準'].find(d => d.profit > 0)?.monthNum

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-white/40 text-sm tracking-widest uppercase mb-1">5-Year Projection</p>
          <h1 className="text-3xl font-black text-white">未来 <span className="text-[#34d399]">シミュレーション</span></h1>
        </motion.div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-6 items-center">
          {/* Scenario toggles */}
          <div className="flex gap-2">
            {Object.entries(SCENARIOS).map(([key, sc]) => (
              <button key={key} onClick={() => toggleScenario(key)}
                className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-200
                  ${activeScenarios.includes(key) ? 'text-white' : 'bg-white/3 border-white/10 text-white/30'}`}
                style={activeScenarios.includes(key) ? { background: `${sc.color}20`, borderColor: `${sc.color}50`, color: sc.color } : {}}
              >
                {key}
              </button>
            ))}
          </div>

          {/* Metric selector */}
          <div className="flex gap-2 flex-wrap">
            {metrics.map(m => (
              <button key={m.key} onClick={() => setSelectedMetric(m.key)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all
                  ${selectedMetric === m.key ? 'text-white' : 'bg-white/3 border-white/8 text-white/40'}`}
                style={selectedMetric === m.key ? { background: `${m.color}20`, borderColor: `${m.color}50`, color: m.color } : {}}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Initial users */}
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-white/40 text-sm">初期ユーザー:</span>
            <div className="flex gap-1">
              {[50, 100, 500, 1000].map(n => (
                <button key={n} onClick={() => setInitialUsers(n)}
                  className={`px-3 py-1.5 rounded-lg border text-xs transition-all
                    ${initialUsers === n ? 'bg-[#00D1FF]/15 border-[#00D1FF]/50 text-[#00D1FF]' : 'bg-white/3 border-white/8 text-white/40 hover:text-white'}`}
                >
                  {n}人
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main projection chart */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="glass border border-white/10 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <span className="text-[#34d399]">◈</span>
              5年間シナリオ比較 — {metrics.find(m => m.key === selectedMetric)?.label}
            </h2>
            {breakEvenMonth && selectedMetric === 'profit' && (
              <span className="text-xs bg-[#34d399]/10 border border-[#34d399]/30 text-[#34d399] px-3 py-1 rounded-full">
                標準シナリオ 黒字化: M{breakEvenMonth}
              </span>
            )}
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                {activeScenarios.map(sc => (
                  <linearGradient key={sc} id={`grad_${sc}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={SCENARIOS[sc].color} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={SCENARIOS[sc].color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                axisLine={false} tickLine={false}
                tickFormatter={(v, i) => i % 6 === 0 ? v : ''}
              />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={v => selectedMetric === 'users' ? v.toLocaleString() : `${v}万`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
              {selectedMetric === 'profit' && (
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" strokeDasharray="4 4" />
              )}
              {MILESTONES.filter(m => m.month <= 60).map(ms => (
                <ReferenceLine key={ms.month} x={`M${ms.month}`}
                  stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3"
                />
              ))}
              {activeScenarios.map(sc => (
                <Area key={sc} type="monotone"
                  dataKey={`${sc}_${selectedMetric}`}
                  name={SCENARIOS[sc].label}
                  stroke={SCENARIOS[sc].color}
                  fill={`url(#grad_${sc})`}
                  strokeWidth={2}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Milestone timeline */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass border border-white/10 p-6 mb-6">
          <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
            <span className="text-[#8B5CF6]">◉</span> マイルストーンタイムライン
          </h2>
          <div className="relative">
            <div className="absolute top-5 left-0 right-0 h-px bg-gradient-to-r from-[#00D1FF]/20 via-[#8B5CF6]/40 to-[#FF4FD8]/20" />
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
              {MILESTONES.map((ms, i) => (
                <motion.div
                  key={ms.month}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.07 }}
                  className="flex flex-col items-center text-center cursor-pointer group"
                  onMouseEnter={() => setHighlightMonth(ms.month)}
                  onMouseLeave={() => setHighlightMonth(null)}
                >
                  <motion.div
                    whileHover={{ scale: 1.3 }}
                    className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg z-10 transition-all duration-200"
                    style={{
                      borderColor: ms.color,
                      background: highlightMonth === ms.month ? `${ms.color}30` : `${ms.color}10`,
                      boxShadow: highlightMonth === ms.month ? `0 0 20px ${ms.color}50` : 'none',
                      color: ms.color,
                    }}
                  >
                    {ms.icon}
                  </motion.div>
                  <div className="mt-2 text-[10px] font-bold text-white/60">M{ms.month}</div>
                  <div className="text-[10px] text-white/40 leading-tight mt-0.5">{ms.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Scenario KPI comparison */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(SCENARIOS).map(([key, sc], idx) => {
            const p60 = projections[key][59]
            const p12 = projections[key][11]
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                className={`glass border p-5 relative overflow-hidden transition-all duration-200
                  ${activeScenarios.includes(key) ? '' : 'opacity-40'}`}
                style={{ borderColor: `${sc.color}30` }}
              >
                <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: sc.color }} />
                <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-20 pointer-events-none" style={{ background: sc.color }} />

                <div className="flex items-center gap-2 mb-4">
                  <span className="font-bold" style={{ color: sc.color }}>{key}シナリオ</span>
                  <span className="text-xs text-white/30">({sc.label})</span>
                </div>

                {[
                  { label: '1年後ユーザー数', value: `${p12.users.toLocaleString()}人` },
                  { label: '5年後ユーザー数', value: `${p60.users.toLocaleString()}人` },
                  { label: '5年後 MRR',       value: `¥${p60.mrr}万` },
                  { label: '5年後 累計売上',   value: `¥${p60.totalRevenue}万` },
                ].map(stat => (
                  <div key={stat.label} className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
                    <span className="text-white/40 text-xs">{stat.label}</span>
                    <span className="font-bold text-sm" style={{ color: sc.color }}>{stat.value}</span>
                  </div>
                ))}
              </motion.div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
