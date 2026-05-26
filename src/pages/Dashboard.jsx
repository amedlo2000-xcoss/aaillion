import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import Sidebar from '../components/Sidebar'
import MetricCard from '../components/MetricCard'
import NeonButton from '../components/NeonButton'
import { useApp } from '../context/AppContext'

const radarData = [
  { subject: '市場性', A: 82 },
  { subject: '革新性', A: 75 },
  { subject: '収益性', A: 68 },
  { subject: 'AI活用', A: 90 },
  { subject: 'SNS拡散', A: 72 },
  { subject: 'コミュニティ', A: 65 },
]

const areaData = [
  { month: '1月', score: 62 }, { month: '2月', score: 68 },
  { month: '3月', score: 65 }, { month: '4月', score: 74 },
  { month: '5月', score: 80 }, { month: '6月', score: 78 },
  { month: '7月', score: 85 },
]

const metrics = [
  { label: '総合スコア',    value: '85',  unit: 'pt', icon: '◈', color: 'blue',   trend: 12 },
  { label: '市場ポテンシャル', value: '72', unit: '%', icon: '◉', color: 'purple', trend: 8  },
  { label: 'AI適合スコア',  value: '90',  unit: 'pt', icon: '⬡', color: 'pink',   trend: 18 },
  { label: '診断回数',      value: '3',   unit: '回', icon: '▣', color: 'blue',   trend: null },
]

const recentDiagnostics = [
  { name: 'AIヘルスケアアプリ', score: 85, date: '2026-05-20', industry: 'ヘルスケア' },
  { name: 'NFTマーケット',     score: 62, date: '2026-05-15', industry: 'Web3'      },
  { name: 'B2B SaaSツール',    score: 78, date: '2026-05-10', industry: 'SaaS'      },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useApp()

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <p className="text-white/40 text-sm tracking-widest uppercase mb-1">Welcome back</p>
            <h1 className="text-3xl font-black text-white">
              {user?.name || 'User'}<span className="text-[#00D1FF]">_</span>
            </h1>
          </div>
          <NeonButton color="solid" onClick={() => navigate('/diagnostic')}>
            ＋ 新規診断
          </NeonButton>
        </motion.div>

        {/* Metrics */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {metrics.map((m, i) => <MetricCard key={m.label} {...m} index={i} />)}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          {/* Radar */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass border border-white/10 p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[#8B5CF6] text-xl">◈</span>
              <h2 className="text-white font-semibold">能力レーダー</h2>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                <Radar dataKey="A" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Area chart */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass border border-white/10 p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[#00D1FF] text-xl">◉</span>
              <h2 className="text-white font-semibold">スコア推移</h2>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={areaData}>
                <defs>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#00D1FF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00D1FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} domain={[50, 100]} />
                <Tooltip
                  contentStyle={{ background: 'rgba(5,8,22,0.9)', border: '1px solid rgba(0,209,255,0.3)', borderRadius: 12, color: '#fff' }}
                  cursor={{ stroke: 'rgba(0,209,255,0.3)' }}
                />
                <Area type="monotone" dataKey="score" stroke="#00D1FF" strokeWidth={2} fill="url(#blueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Recent diagnostics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass border border-white/10 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[#FF4FD8] text-xl">▣</span>
              <h2 className="text-white font-semibold">直近の診断履歴</h2>
            </div>
            <button
              onClick={() => navigate('/result')}
              className="text-[#00D1FF] text-sm hover:text-white transition-colors"
            >
              全て見る →
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {recentDiagnostics.map((d, i) => (
              <motion.div
                key={d.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center justify-between p-4 rounded-xl bg-white/3 border border-white/6 hover:border-[#00D1FF]/30 hover:bg-white/5 transition-all cursor-pointer group"
                onClick={() => navigate('/result')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00D1FF]/20 to-[#8B5CF6]/20 flex items-center justify-center text-[#00D1FF] font-bold">
                    {d.score}
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">{d.name}</div>
                    <div className="text-white/40 text-xs mt-0.5">{d.industry} · {d.date}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-20 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#00D1FF] to-[#8B5CF6]"
                      style={{ width: `${d.score}%` }}
                    />
                  </div>
                  <span className="text-white/30 group-hover:text-[#00D1FF] transition-colors">→</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  )
}
