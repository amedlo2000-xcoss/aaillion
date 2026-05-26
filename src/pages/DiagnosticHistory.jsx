import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import Sidebar from '../components/Sidebar'
import { supabase } from '../lib/supabase'
import { useApp } from '../context/AppContext'

const GRADE = s => s >= 85 ? { g: 'S', c: '#00D1FF' } : s >= 75 ? { g: 'A', c: '#8B5CF6' } : s >= 65 ? { g: 'B', c: '#FF4FD8' } : { g: 'C', c: '#f59e0b' }

const SCORE_KEYS = [
  { key: 'market_potential',    label: '市場性' },
  { key: 'innovation',          label: '革新性' },
  { key: 'revenue_score',       label: '収益性' },
  { key: 'ai_utilization',      label: 'AI活用' },
  { key: 'sns_viral_potential', label: 'SNS拡散' },
  { key: 'community_score',     label: 'コミュ' },
]

function RadarMini({ row }) {
  const data = SCORE_KEYS.map(k => ({ subject: k.label, value: row[k.key] ?? 0 }))
  return (
    <ResponsiveContainer width="100%" height={120}>
      <RadarChart data={data}>
        <PolarGrid stroke="rgba(255,255,255,0.08)" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9 }} />
        <Radar dataKey="value" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.25} strokeWidth={1.5} />
      </RadarChart>
    </ResponsiveContainer>
  )
}

export default function DiagnosticHistory() {
  const navigate = useNavigate()
  const { setDiagnosticResult } = useApp()

  const [rows, setRows]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [selected, setSelected]   = useState(null)
  const [deleting, setDeleting]   = useState(null)
  const [sortCol, setSortCol]     = useState('created_at')
  const [sortAsc, setSortAsc]     = useState(false)
  const [filterGrade, setFilter]  = useState('ALL')
  const [search, setSearch]       = useState('')

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('diagnoses')
      .select('*')
      .order(sortCol, { ascending: sortAsc })
      .limit(100)
    if (err) { setError(err.message); setLoading(false); return }
    setRows(data ?? [])
    setLoading(false)
  }, [sortCol, sortAsc])

  useEffect(() => { fetch() }, [fetch])

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!confirm('この診断結果を削除しますか？')) return
    setDeleting(id)
    const { error: err } = await supabase.from('diagnoses').delete().eq('id', id)
    if (err) { alert('削除に失敗しました: ' + err.message); setDeleting(null); return }
    setRows(prev => prev.filter(r => r.id !== id))
    if (selected?.id === id) setSelected(null)
    setDeleting(null)
  }

  const handleReview = (row) => {
    setDiagnosticResult({
      total: row.total_score,
      scores: {
        marketPotential:   row.market_potential,
        innovation:        row.innovation,
        revenue:           row.revenue_score,
        aiUtilization:     row.ai_utilization,
        snsViralPotential: row.sns_viral_potential,
        community:         row.community_score,
      },
      answers: {
        industry:     row.industry,
        appIdea:      row.app_idea,
        worldView:    row.world_view,
        target:       row.target,
        problem:      row.problem,
        aiUsage:      row.ai_usage,
        revenueModel: row.revenue_model,
        snsStrategy:  row.sns_strategy,
        community:    row.community,
      },
    })
    navigate('/result')
  }

  const handleSort = (col) => {
    if (sortCol === col) setSortAsc(a => !a)
    else { setSortCol(col); setSortAsc(false) }
  }

  const filtered = rows.filter(r => {
    const g = GRADE(r.total_score).g
    if (filterGrade !== 'ALL' && g !== filterGrade) return false
    if (search && !r.industry?.includes(search) && !r.app_idea?.includes(search)) return false
    return true
  })

  const avg    = rows.length ? Math.round(rows.reduce((a, b) => a + b.total_score, 0) / rows.length) : 0
  const best   = rows.length ? Math.max(...rows.map(r => r.total_score)) : 0
  const latest = rows[0]

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <p className="text-white/40 text-sm tracking-widest uppercase mb-1">Supabase · diagnoses</p>
            <h1 className="text-3xl font-black text-white">診断 <span className="text-[#00D1FF]">履歴</span></h1>
          </div>
          <button onClick={fetch} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#00D1FF]/30 text-[#00D1FF] hover:bg-[#00D1FF]/10 transition-all text-sm disabled:opacity-40"
          >
            <motion.span animate={loading ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: 'linear' }}
            >↻</motion.span>
            更新
          </button>
        </motion.div>

        {/* KPI strip */}
        {!loading && rows.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: '総診断数',      value: rows.length,  unit: '件', color: '#00D1FF', icon: '◈' },
              { label: '平均スコア',    value: avg,          unit: 'pt', color: '#8B5CF6', icon: '◉' },
              { label: '最高スコア',    value: best,         unit: 'pt', color: '#FF4FD8', icon: '⬡' },
            ].map((k, i) => (
              <motion.div key={k.label}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="glass border border-white/10 p-5 relative overflow-hidden"
                style={{ borderColor: `${k.color}25` }}
              >
                <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: k.color }} />
                <div className="text-xl mb-1.5" style={{ color: k.color }}>{k.icon}</div>
                <div className="text-2xl font-black text-white">{k.value}<span className="text-base ml-1 opacity-60">{k.unit}</span></div>
                <div className="text-white/40 text-xs mt-0.5">{k.label}</div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-3 mb-5 flex-wrap items-center">
          <div className="relative flex-1 min-w-48">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="業界・アイデアで検索..."
              className="w-full bg-white/5 border border-white/10 focus:border-[#00D1FF]/40 text-white placeholder-white/20 rounded-xl pl-9 pr-4 py-2.5 outline-none text-sm transition-all"
            />
          </div>
          <div className="flex gap-1.5">
            {['ALL', 'S', 'A', 'B', 'C'].map(g => (
              <button key={g} onClick={() => setFilter(g)}
                className={`px-3 py-2 rounded-lg border text-xs font-bold transition-all
                  ${filterGrade === g ? 'bg-[#8B5CF6]/20 border-[#8B5CF6]/50 text-[#8B5CF6]' : 'bg-white/3 border-white/10 text-white/40 hover:text-white'}`}
              >
                {g === 'ALL' ? '全て' : `Grade ${g}`}
              </button>
            ))}
          </div>
          <span className="text-white/30 text-xs ml-auto">{filtered.length} 件表示</span>
        </div>

        {/* Error */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
          >
            ⚠ Supabase エラー: {error}
          </motion.div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="w-10 h-10 rounded-full border-2 border-[#00D1FF]/20 border-t-[#00D1FF]"
              />
              <span className="text-white/40 text-sm">Supabase から読み込み中...</span>
            </div>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-4xl mb-3 opacity-30">◈</div>
            <p className="text-white/40">診断データがありません</p>
            <button onClick={() => navigate('/diagnostic')}
              className="mt-4 px-5 py-2 rounded-xl bg-[#00D1FF]/10 border border-[#00D1FF]/30 text-[#00D1FF] text-sm hover:bg-[#00D1FF]/20 transition-all"
            >
              診断を開始する →
            </button>
          </div>
        )}

        {/* Table */}
        {!loading && filtered.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="glass border border-white/10 overflow-hidden mb-6"
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  {[
                    { label: '業界',         col: 'industry'    },
                    { label: 'アイデア概要', col: 'app_idea'    },
                    { label: 'スコア',       col: 'total_score' },
                    { label: 'グレード',     col: null          },
                    { label: '日時',         col: 'created_at'  },
                    { label: '操作',         col: null          },
                  ].map(h => (
                    <th key={h.label}
                      className={`text-left text-white/30 text-xs uppercase tracking-wider px-4 py-3 ${h.col ? 'cursor-pointer hover:text-white/60' : ''}`}
                      onClick={() => h.col && handleSort(h.col)}
                    >
                      {h.label}
                      {sortCol === h.col && <span className="ml-1">{sortAsc ? '↑' : '↓'}</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => {
                  const { g, c } = GRADE(row.total_score)
                  const isSelected = selected?.id === row.id
                  return (
                    <motion.tr key={row.id}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                      className={`border-b border-white/5 cursor-pointer transition-all duration-200
                        ${isSelected ? 'bg-[#00D1FF]/5' : 'hover:bg-white/3'}`}
                      onClick={() => setSelected(isSelected ? null : row)}
                    >
                      <td className="px-4 py-3 text-white/70 text-xs">{row.industry ?? '—'}</td>
                      <td className="px-4 py-3 text-white/60 text-xs max-w-xs truncate">
                        {row.app_idea ? row.app_idea.slice(0, 60) + (row.app_idea.length > 60 ? '…' : '') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-[#00D1FF] to-[#8B5CF6]"
                              style={{ width: `${row.total_score}%` }} />
                          </div>
                          <span className="font-bold text-white">{row.total_score}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-black px-2 py-0.5 rounded-lg border"
                          style={{ color: c, borderColor: `${c}40`, background: `${c}15` }}
                        >{g}</span>
                      </td>
                      <td className="px-4 py-3 text-white/30 text-xs">
                        {new Date(row.created_at).toLocaleString('ja-JP', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button onClick={e => { e.stopPropagation(); handleReview(row) }}
                            className="text-xs px-2.5 py-1 rounded-lg bg-[#00D1FF]/10 text-[#00D1FF] hover:bg-[#00D1FF]/20 transition-colors"
                          >表示</button>
                          <button onClick={e => handleDelete(row.id, e)} disabled={deleting === row.id}
                            className="text-xs px-2.5 py-1 rounded-lg bg-[#FF4FD8]/10 text-[#FF4FD8] hover:bg-[#FF4FD8]/20 transition-colors disabled:opacity-40"
                          >
                            {deleting === row.id ? '…' : '削除'}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </motion.div>
        )}

        {/* Detail panel */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="glass border border-[#00D1FF]/20 p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-semibold flex items-center gap-2">
                  <span className="text-[#00D1FF]">◈</span> 診断詳細
                  <span className="text-white/30 text-xs font-normal ml-1">ID: {selected.id.slice(0, 8)}…</span>
                </h2>
                <button onClick={() => setSelected(null)} className="text-white/30 hover:text-white transition-colors">✕</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Scores */}
                <div>
                  <div className="text-white/40 text-xs uppercase tracking-widest mb-3">スコア詳細</div>
                  <div className="flex flex-col gap-2">
                    {SCORE_KEYS.map(k => (
                      <div key={k.key} className="flex items-center gap-3">
                        <span className="text-white/50 text-xs w-20 shrink-0">{k.label}</span>
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <motion.div className="h-full rounded-full bg-gradient-to-r from-[#00D1FF] to-[#8B5CF6]"
                            initial={{ width: 0 }} animate={{ width: `${selected[k.key] ?? 0}%` }}
                            transition={{ duration: 0.8 }}
                          />
                        </div>
                        <span className="text-white font-bold text-xs w-8 text-right">{selected[k.key] ?? '—'}</span>
                      </div>
                    ))}
                  </div>
                  <RadarMini row={selected} />
                </div>

                {/* Answers */}
                <div>
                  <div className="text-white/40 text-xs uppercase tracking-widest mb-3">回答内容</div>
                  <div className="flex flex-col gap-2.5 text-xs">
                    {[
                      { label: '業界',         value: selected.industry },
                      { label: 'アイデア',     value: selected.app_idea },
                      { label: '世界観',       value: selected.world_view },
                      { label: 'ターゲット',   value: selected.target },
                      { label: '課題',         value: selected.problem },
                      { label: 'AI活用',       value: Array.isArray(selected.ai_usage) ? selected.ai_usage.join(', ') : selected.ai_usage },
                      { label: '収益モデル',   value: selected.revenue_model },
                      { label: 'SNS戦略',      value: selected.sns_strategy },
                      { label: 'コミュニティ', value: selected.community },
                    ].filter(f => f.value).map(f => (
                      <div key={f.label} className="p-2.5 rounded-xl bg-white/3 border border-white/6">
                        <div className="text-white/30 mb-0.5">{f.label}</div>
                        <div className="text-white/70 leading-relaxed">{f.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex gap-3 justify-end">
                <button onClick={() => handleReview(selected)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00D1FF] to-[#8B5CF6] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  結果ページで表示 →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
