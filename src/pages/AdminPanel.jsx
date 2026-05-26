import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, Cell,
} from 'recharts'
import Sidebar from '../components/Sidebar'
import NeonButton from '../components/NeonButton'

const USERS = [
  { id: 'USR-001', name: '田中 太郎',    email: 'tanaka@example.com', role: 'admin',    status: 'active',   plan: 'Enterprise', diagnostics: 12, lastActive: '2026-05-26', score: 88 },
  { id: 'USR-002', name: '鈴木 花子',    email: 'suzuki@example.com', role: 'user',     status: 'active',   plan: 'Pro',        diagnostics: 8,  lastActive: '2026-05-25', score: 74 },
  { id: 'USR-003', name: 'Alex Johnson', email: 'alex@example.com',   role: 'analyst',  status: 'active',   plan: 'Pro',        diagnostics: 15, lastActive: '2026-05-26', score: 92 },
  { id: 'USR-004', name: '佐藤 健',      email: 'sato@example.com',   role: 'user',     status: 'inactive', plan: 'Free',       diagnostics: 2,  lastActive: '2026-05-10', score: 55 },
  { id: 'USR-005', name: '山田 美咲',    email: 'yamada@example.com', role: 'user',     status: 'active',   plan: 'Pro',        diagnostics: 6,  lastActive: '2026-05-24', score: 68 },
  { id: 'USR-006', name: 'Maria Garcia', email: 'maria@example.com',  role: 'analyst',  status: 'active',   plan: 'Enterprise', diagnostics: 20, lastActive: '2026-05-26', score: 95 },
  { id: 'USR-007', name: '伊藤 翔',      email: 'ito@example.com',    role: 'user',     status: 'pending',  plan: 'Free',       diagnostics: 1,  lastActive: '2026-05-20', score: 42 },
]

const LOGS = [
  { time: '14:32:18', type: 'info',    msg: 'ユーザー USR-006 が診断を完了しました', user: 'Maria Garcia' },
  { time: '14:28:05', type: 'success', msg: 'システムバックアップ完了 (3.2GB)',     user: 'SYSTEM' },
  { time: '14:15:44', type: 'warn',    msg: 'API レート制限に近づいています (85%)', user: 'SYSTEM' },
  { time: '13:58:21', type: 'info',    msg: '新規ユーザー登録: ito@example.com',   user: 'SYSTEM' },
  { time: '13:45:09', type: 'error',   msg: 'メール送信失敗: sato@example.com',    user: 'SYSTEM' },
  { time: '13:30:00', type: 'success', msg: 'Stripe 課金処理成功 (¥9,800)',         user: 'USR-003' },
  { time: '13:22:15', type: 'info',    msg: 'USR-001 が設定を更新しました',          user: '田中 太郎' },
  { time: '13:10:55', type: 'warn',    msg: 'DB 接続プール使用率 78%',              user: 'SYSTEM' },
]

const usageData = [
  { day: '月', diagnostics: 18, logins: 45, api: 320 },
  { day: '火', diagnostics: 22, logins: 52, api: 410 },
  { day: '水', diagnostics: 15, logins: 38, api: 280 },
  { day: '木', diagnostics: 28, logins: 61, api: 490 },
  { day: '金', diagnostics: 35, logins: 78, api: 620 },
  { day: '土', diagnostics: 12, logins: 25, api: 190 },
  { day: '日', diagnostics: 8,  logins: 18, api: 140 },
]

const planDist = [
  { name: 'Free',       value: 42, color: '#8B5CF6' },
  { name: 'Pro',        value: 35, color: '#00D1FF' },
  { name: 'Enterprise', value: 23, color: '#FF4FD8' },
]

const ROLE_COLORS = { admin: '#FF4FD8', analyst: '#8B5CF6', user: '#00D1FF' }
const STATUS_CONFIG = {
  active:   { color: '#34d399', label: '稼働中' },
  inactive: { color: '#f59e0b', label: '非稼働' },
  pending:  { color: '#8B5CF6', label: '確認待ち' },
}

const TABS = ['ダッシュボード', 'ユーザー管理', 'システムログ', '設定']

export default function AdminPanel() {
  const [tab, setTab] = useState('ダッシュボード')
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [logFilter, setLogFilter] = useState('all')

  const filteredUsers = USERS.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const filteredLogs = LOGS.filter(l => logFilter === 'all' || l.type === logFilter)

  const sysStats = [
    { label: 'CPU',   value: 42, color: '#00D1FF' },
    { label: 'RAM',   value: 68, color: '#8B5CF6' },
    { label: 'ディスク', value: 31, color: '#FF4FD8' },
    { label: 'API', value: 85, color: '#f59e0b' },
  ]

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Admin header */}
        <div className="border-b border-white/8 px-8 pt-8 pb-0">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-white/40 text-sm tracking-widest uppercase mb-1">System Control</p>
              <h1 className="text-3xl font-black text-white">管理画面 <span className="text-[#FF4FD8]">Admin</span></h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#34d399]/10 border border-[#34d399]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] pulse-neon" />
                <span className="text-[#34d399] text-xs font-medium">システム正常</span>
              </div>
              <NeonButton color="pink">+ ユーザー追加</NeonButton>
            </div>
          </div>
          {/* Tabs */}
          <div className="flex gap-1">
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2.5 text-sm font-medium transition-all duration-200 border-b-2 -mb-px
                  ${tab === t ? 'text-[#FF4FD8] border-[#FF4FD8]' : 'text-white/40 border-transparent hover:text-white'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            {/* ===== DASHBOARD TAB ===== */}
            {tab === 'ダッシュボード' && (
              <motion.div key="dash" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {/* KPI */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: '総ユーザー数', value: USERS.length,   unit: '名', color: '#00D1FF', icon: '◈', trend: '+3' },
                    { label: 'アクティブ',   value: USERS.filter(u => u.status === 'active').length, unit: '名', color: '#34d399', icon: '◉', trend: '+1' },
                    { label: '今週の診断',   value: 138,            unit: '件', color: '#8B5CF6', icon: '⬡', trend: '+22%' },
                    { label: '月次収益',     value: '¥284万',       unit: '',   color: '#FF4FD8', icon: '▣', trend: '+8%' },
                  ].map((k, i) => (
                    <motion.div key={k.label}
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                      className="glass border border-white/10 p-5 relative overflow-hidden"
                      style={{ borderColor: `${k.color}25` }}
                    >
                      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: k.color }} />
                      <div className="text-xl mb-2" style={{ color: k.color }}>{k.icon}</div>
                      <div className="text-2xl font-black text-white">{k.value}{k.unit}</div>
                      <div className="text-white/40 text-xs mt-0.5">{k.label}</div>
                      <div className="text-xs font-medium mt-2 text-[#34d399]">↑ {k.trend} 今週</div>
                    </motion.div>
                  ))}
                </div>

                {/* System health */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass border border-white/10 p-5">
                    <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><span className="text-[#34d399]">◈</span> システムリソース</h2>
                    <div className="flex flex-col gap-4">
                      {sysStats.map(s => (
                        <div key={s.label}>
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-white/50">{s.label}</span>
                            <span style={{ color: s.color }} className="font-bold">{s.value}%</span>
                          </div>
                          <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                            <motion.div className="h-full rounded-full"
                              style={{ background: s.color }}
                              initial={{ width: 0 }} animate={{ width: `${s.value}%` }}
                              transition={{ duration: 1, delay: 0.3 }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="xl:col-span-2 glass border border-white/10 p-5">
                    <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><span className="text-[#00D1FF]">◉</span> 週次アクティビティ</h2>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={usageData}>
                        <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: 'rgba(5,8,22,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 11 }} />
                        <Bar dataKey="diagnostics" name="診断" fill="#00D1FF" fillOpacity={0.8} radius={[4,4,0,0]} />
                        <Bar dataKey="logins"      name="ログイン" fill="#8B5CF6" fillOpacity={0.8} radius={[4,4,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </motion.div>
                </div>

                {/* Recent logs preview */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass border border-white/10 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-white font-semibold flex items-center gap-2"><span className="text-[#FF4FD8]">▣</span> 最新ログ</h2>
                    <button onClick={() => setTab('システムログ')} className="text-[#00D1FF] text-xs hover:text-white">全て見る →</button>
                  </div>
                  {LOGS.slice(0, 4).map((log, i) => {
                    const config = { info: { color: '#00D1FF', icon: 'ℹ' }, success: { color: '#34d399', icon: '✓' }, warn: { color: '#f59e0b', icon: '⚠' }, error: { color: '#ef4444', icon: '✕' } }[log.type]
                    return (
                      <div key={i} className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0 text-sm">
                        <span className="w-5 h-5 rounded flex items-center justify-center text-xs shrink-0 mt-0.5" style={{ background: `${config.color}20`, color: config.color }}>{config.icon}</span>
                        <span className="text-white/60 flex-1">{log.msg}</span>
                        <span className="text-white/25 text-xs shrink-0">{log.time}</span>
                      </div>
                    )
                  })}
                </motion.div>
              </motion.div>
            )}

            {/* ===== USERS TAB ===== */}
            {tab === 'ユーザー管理' && (
              <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex items-center gap-4 mb-5">
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">🔍</span>
                    <input value={search} onChange={e => setSearch(e.target.value)}
                      placeholder="名前・メールで検索..."
                      className="w-full bg-white/5 border border-white/10 focus:border-[#00D1FF]/40 text-white placeholder-white/20 rounded-xl pl-9 pr-4 py-2.5 outline-none text-sm transition-all"
                    />
                  </div>
                  <div className="flex gap-2 text-xs">
                    {[{ k: 'all', l: '全員' }, { k: 'active', l: '稼働中' }, { k: 'inactive', l: '非稼働' }].map(f => (
                      <button key={f.k} className="px-3 py-2 rounded-lg border bg-white/3 border-white/10 text-white/50 hover:text-white transition-all">{f.l}</button>
                    ))}
                  </div>
                </div>

                <div className="glass border border-white/10 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/8">
                        {['ユーザー', 'ロール', 'プラン', 'ステータス', '診断数', 'スコア', '最終ログイン', '操作'].map(h => (
                          <th key={h} className="text-left text-white/30 text-xs uppercase tracking-wider px-4 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u, i) => {
                        const st = STATUS_CONFIG[u.status]
                        return (
                          <motion.tr key={u.id}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                            className={`border-b border-white/5 hover:bg-white/3 cursor-pointer transition-colors ${selectedUser?.id === u.id ? 'bg-[#00D1FF]/5' : ''}`}
                            onClick={() => setSelectedUser(selectedUser?.id === u.id ? null : u)}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00D1FF]/20 to-[#8B5CF6]/20 flex items-center justify-center text-white text-xs font-bold">
                                  {u.name[0]}
                                </div>
                                <div>
                                  <div className="text-white font-medium">{u.name}</div>
                                  <div className="text-white/30 text-xs">{u.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs px-2 py-0.5 rounded-md border font-medium"
                                style={{ color: ROLE_COLORS[u.role], borderColor: `${ROLE_COLORS[u.role]}40`, background: `${ROLE_COLORS[u.role]}15` }}>
                                {u.role}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-white/60 text-xs">{u.plan}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.color }} />
                                <span className="text-xs" style={{ color: st.color }}>{st.label}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-white/50 text-center">{u.diagnostics}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                                  <div className="h-full rounded-full bg-gradient-to-r from-[#00D1FF] to-[#8B5CF6]" style={{ width: `${u.score}%` }} />
                                </div>
                                <span className="text-white/50 text-xs">{u.score}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-white/30 text-xs">{u.lastActive}</td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1">
                                <button className="text-xs px-2 py-1 rounded-lg bg-[#00D1FF]/10 text-[#00D1FF] hover:bg-[#00D1FF]/20 transition-colors">編集</button>
                                <button className="text-xs px-2 py-1 rounded-lg bg-[#FF4FD8]/10 text-[#FF4FD8] hover:bg-[#FF4FD8]/20 transition-colors">停止</button>
                              </div>
                            </td>
                          </motion.tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* User detail panel */}
                <AnimatePresence>
                  {selectedUser && (
                    <motion.div
                      initial={{ opacity: 0, y: 20, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 glass border border-[#00D1FF]/20 p-5 overflow-hidden"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-semibold">{selectedUser.name} の詳細</h3>
                        <button onClick={() => setSelectedUser(null)} className="text-white/30 hover:text-white">✕</button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        {[
                          { label: 'ID', value: selectedUser.id },
                          { label: 'プラン', value: selectedUser.plan },
                          { label: '診断回数', value: `${selectedUser.diagnostics}回` },
                          { label: '平均スコア', value: `${selectedUser.score}pt` },
                        ].map(d => (
                          <div key={d.label} className="p-3 rounded-xl bg-white/3 border border-white/8">
                            <div className="text-white/40 text-xs">{d.label}</div>
                            <div className="text-white font-medium mt-1">{d.value}</div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ===== LOGS TAB ===== */}
            {tab === 'システムログ' && (
              <motion.div key="logs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex gap-2 mb-5">
                  {[
                    { k: 'all',     l: '全て',   c: '#ffffff' },
                    { k: 'info',    l: 'INFO',   c: '#00D1FF' },
                    { k: 'success', l: 'SUCCESS',c: '#34d399' },
                    { k: 'warn',    l: 'WARN',   c: '#f59e0b' },
                    { k: 'error',   l: 'ERROR',  c: '#ef4444' },
                  ].map(f => (
                    <button key={f.k} onClick={() => setLogFilter(f.k)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all
                        ${logFilter === f.k ? '' : 'bg-white/3 border-white/8 text-white/40 hover:text-white'}`}
                      style={logFilter === f.k ? { background: `${f.c}20`, borderColor: `${f.c}40`, color: f.c } : {}}
                    >
                      {f.l}
                    </button>
                  ))}
                  <button className="ml-auto px-3 py-1.5 rounded-lg border border-[#FF4FD8]/30 text-[#FF4FD8]/70 hover:text-[#FF4FD8] text-xs transition-all">
                    ログをクリア
                  </button>
                </div>
                <div className="glass border border-white/10 rounded-2xl overflow-hidden font-mono text-xs">
                  {filteredLogs.map((log, i) => {
                    const config = {
                      info:    { color: '#00D1FF', icon: 'INFO   ', bg: '' },
                      success: { color: '#34d399', icon: 'SUCCESS', bg: 'bg-[#34d399]/3' },
                      warn:    { color: '#f59e0b', icon: 'WARN   ', bg: 'bg-[#f59e0b]/3' },
                      error:   { color: '#ef4444', icon: 'ERROR  ', bg: 'bg-[#ef4444]/5' },
                    }[log.type]
                    return (
                      <motion.div key={i}
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                        className={`flex items-start gap-4 px-5 py-3 border-b border-white/5 last:border-0 ${config.bg}`}
                      >
                        <span className="text-white/25 shrink-0">{log.time}</span>
                        <span className="font-bold shrink-0" style={{ color: config.color }}>[{config.icon}]</span>
                        <span className="text-white/70 flex-1">{log.msg}</span>
                        <span className="text-white/25 shrink-0">{log.user}</span>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* ===== SETTINGS TAB ===== */}
            {tab === '設定' && (
              <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      title: 'AI エンジン設定', icon: '◈', color: '#00D1FF',
                      fields: [
                        { label: 'モデルバージョン', type: 'select', value: 'Neural v2.0', options: ['Neural v1.5', 'Neural v2.0', 'Neural v2.1 Beta'] },
                        { label: '診断精度レベル', type: 'select', value: '高精度', options: ['標準', '高精度', '最大精度'] },
                        { label: 'API タイムアウト (秒)', type: 'number', value: '30' },
                      ],
                    },
                    {
                      title: '通知設定', icon: '◉', color: '#8B5CF6',
                      fields: [
                        { label: 'メール通知', type: 'toggle', value: true },
                        { label: 'Slack 連携', type: 'toggle', value: false },
                        { label: 'エラーアラート', type: 'toggle', value: true },
                        { label: 'レポート自動送信', type: 'toggle', value: false },
                      ],
                    },
                    {
                      title: 'セキュリティ', icon: '⬡', color: '#FF4FD8',
                      fields: [
                        { label: '2FA 強制', type: 'toggle', value: true },
                        { label: 'セッション有効期限 (h)', type: 'number', value: '24' },
                        { label: 'IP制限', type: 'toggle', value: false },
                      ],
                    },
                    {
                      title: 'データ管理', icon: '▣', color: '#34d399',
                      fields: [
                        { label: 'バックアップ間隔', type: 'select', value: '毎日', options: ['毎時', '毎日', '毎週'] },
                        { label: 'データ保持期間 (日)', type: 'number', value: '365' },
                        { label: '匿名化モード', type: 'toggle', value: false },
                      ],
                    },
                  ].map((section, si) => (
                    <motion.div key={section.title}
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: si * 0.1 }}
                      className="glass border border-white/10 p-5"
                      style={{ borderColor: `${section.color}25` }}
                    >
                      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: section.color }} />
                      <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <span style={{ color: section.color }}>{section.icon}</span> {section.title}
                      </h2>
                      <div className="flex flex-col gap-3">
                        {section.fields.map(f => (
                          <div key={f.label} className="flex items-center justify-between">
                            <span className="text-white/60 text-sm">{f.label}</span>
                            {f.type === 'toggle' && (
                              <div className={`w-10 h-5 rounded-full border transition-all cursor-pointer flex items-center px-0.5
                                ${f.value ? 'bg-[#00D1FF]/20 border-[#00D1FF]/50' : 'bg-white/5 border-white/20'}`}>
                                <div className={`w-4 h-4 rounded-full transition-all ${f.value ? 'ml-auto bg-[#00D1FF]' : 'bg-white/30'}`} />
                              </div>
                            )}
                            {f.type === 'select' && (
                              <select className="bg-white/5 border border-white/10 text-white text-xs rounded-lg px-3 py-1.5 outline-none">
                                {f.options?.map(o => <option key={o} style={{ background: '#050816' }}>{o}</option>)}
                              </select>
                            )}
                            {f.type === 'number' && (
                              <input type="number" defaultValue={f.value}
                                className="bg-white/5 border border-white/10 text-white text-xs rounded-lg px-3 py-1.5 outline-none w-20 text-right" />
                            )}
                          </div>
                        ))}
                      </div>
                      <button className="mt-4 w-full py-2 rounded-xl text-xs font-medium border transition-all hover:text-white"
                        style={{ borderColor: `${section.color}40`, color: `${section.color}90` }}
                      >
                        保存
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
