import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext'

function ScoreBar({ label, value, color, delay = 0 }) {
  const pct = Math.min(Math.max(Number(value) || 0, 0), 100)
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>{label}</span>
        <span style={{ color, fontSize: 15, fontWeight: 900, fontFamily: 'monospace' }}>{value ?? '—'}</span>
      </div>
      <div style={{ height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.1, ease: 'easeOut', delay }}
          style={{ height: '100%', borderRadius: 3, background: `linear-gradient(90deg,${color}70,${color})` }}
        />
      </div>
    </div>
  )
}

function BigScore({ label, score, color, icon, delay = 0 }) {
  const pct = Math.min(Math.max(Number(score) || 0, 0), 100)
  const level = pct >= 85 ? 'EXCELLENT' : pct >= 70 ? 'GOOD' : pct >= 55 ? 'FAIR' : 'LOW'
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${color}30`,
        borderRadius: 14, padding: '16px 14px',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: color }} />
      <div style={{ fontSize: 18, marginBottom: 4, color }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 900, color, fontFamily: 'monospace', lineHeight: 1 }}>{score ?? '—'}</div>
      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5, margin: '5px 0 8px' }}>{label}</div>
      <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: `${color}15`, border: `1px solid ${color}30`, color }}>{level}</span>
      <div style={{ marginTop: 10, height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: delay + 0.2 }}
          style={{ height: '100%', borderRadius: 2, background: `linear-gradient(90deg,${color}60,${color})` }}
        />
      </div>
    </motion.div>
  )
}

export default function SimpleResult() {
  const navigate           = useNavigate()
  const { diagnosticResult } = useApp()
  const nickname           = sessionStorage.getItem('simple_nickname') ?? ''

  useEffect(() => {
    if (!diagnosticResult?.worldview_type) navigate('/simple')
  }, [diagnosticResult, navigate])

  if (!diagnosticResult?.worldview_type) return null

  const r = diagnosticResult

  const mainScores = [
    { label: '存在価値スコア',    score: r.existence_value_score,  color: '#00D1FF', icon: '◈', delay: 0 },
    { label: '共感指数',          score: r.empathy_index,          color: '#8B5CF6', icon: '◉', delay: 0.07 },
    { label: 'AI適性',            score: r.ai_aptitude,            color: '#FF4FD8', icon: '⬡', delay: 0.14 },
    { label: 'コミュニティ形成力', score: r.community_formation,    color: '#34d399', icon: '▣', delay: 0.21 },
    { label: 'ブランド化可能性',   score: r.brand_potential,        color: '#f59e0b', icon: '◫', delay: 0.28 },
  ]

  const nums = mainScores.map(s => Number(s.score) || 0).filter(Boolean)
  const avgScore = nums.length ? Math.round(nums.reduce((a, b) => a + b) / nums.length) : 0

  const allScores = [
    { label: 'SNS拡散予測',     value: r.sns_viral_prediction,       color: '#00D1FF' },
    { label: 'ファン化速度',     value: r.fan_conversion_speed,       color: '#8B5CF6' },
    { label: '市場参入成功率',   value: r.market_entry_success_rate,  color: '#34d399' },
    { label: 'AI時代適応指数',  value: r.ai_era_adaptation_index,    color: '#FF4FD8' },
    { label: '経済圏形成可能性', value: r.economic_sphere_formation,  color: '#f59e0b' },
    { label: '世界観模倣耐性',   value: r.worldview_imitation_resistance, color: '#34d399' },
    { label: 'AI代替リスク',    value: r.ai_replacement_risk,        color: '#FF4FD8' },
    { label: '存在資本スコア',   value: r.existence_capital_score,   color: '#8B5CF6' },
    { label: 'MVP市場反応予測', value: r.mvp_market_reaction,        color: '#00D1FF' },
  ]

  const shareText = `【AI世界観診断】\n世界観タイプ：${r.worldview_type}\n総合スコア：${avgScore}/100\n推定市場規模：${r.estimated_market_size}\n\n自分の世界観と経済的価値を診断してみよう👇`
  const shareUrl  = `${window.location.origin}/simple`

  const handleTwitterShare = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank')
  }
  const handleLineShare = () => {
    window.open(`https://line.me/R/msg/text/?${encodeURIComponent(shareText + '\n' + shareUrl)}`, '_blank')
  }
  const handleCopy = () => {
    navigator.clipboard?.writeText(`${shareText}\n${shareUrl}`)
      .then(() => alert('コピーしました！'))
  }

  return (
    <div style={{ minHeight: '100svh', background: '#050816', paddingBottom: 48 }}>

      {/* グロー背景 */}
      <div style={{ position: 'fixed', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: 500, height: 300, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(0,209,255,0.07) 0%,transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 16px' }}>

        {/* ヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ paddingTop: 32, paddingBottom: 24, textAlign: 'center' }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', borderRadius: 999, border: '1px solid rgba(0,209,255,0.3)', background: 'rgba(0,209,255,0.08)', marginBottom: 16 }}>
            <span style={{ color: '#00D1FF', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 700 }}>◈ 診断完了</span>
          </div>
          {nickname && (
            <p style={{ margin: '0 0 8px', color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{nickname} さんの診断結果</p>
          )}
          <h1 style={{ margin: '0 0 12px', color: '#fff', fontSize: 24, fontWeight: 900, lineHeight: 1.3, letterSpacing: -0.5 }}>
            {r.worldview_type}
          </h1>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
            <span>推定市場規模 <span style={{ color: '#00D1FF', fontWeight: 700 }}>{r.estimated_market_size}</span></span>
            <span>·</span>
            <span>経済圏予測 <span style={{ color: '#8B5CF6', fontWeight: 700 }}>{r.predicted_economic_sphere}</span></span>
          </div>
        </motion.div>

        {/* 総合スコア */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          style={{
            textAlign: 'center', marginBottom: 24,
            background: 'linear-gradient(135deg,rgba(0,209,255,0.08),rgba(139,92,246,0.08))',
            border: '1px solid rgba(0,209,255,0.2)',
            borderRadius: 20, padding: '24px 20px', position: 'relative', overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#00D1FF,#8B5CF6,#FF4FD8)' }} />
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>総合スコア</div>
          <div style={{ fontSize: 64, fontWeight: 900, fontFamily: 'monospace', lineHeight: 1, background: 'linear-gradient(135deg,#00D1FF,#8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {avgScore}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 4 }}>/ 100</div>
        </motion.div>

        {/* メインスコア 5つ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
          {mainScores.map(s => <BigScore key={s.label} {...s} />)}
          {/* 5つ目は中央寄せ */}
        </div>

        {/* AI総評 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          style={{
            background: 'rgba(0,209,255,0.04)',
            border: '1px solid rgba(0,209,255,0.18)',
            borderRadius: 16, padding: '20px',
            marginBottom: 24, position: 'relative', overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,#00D1FF,transparent)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ color: '#00D1FF' }}>◈</span>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>AI総合分析レポート</span>
            <span style={{ marginLeft: 'auto', fontSize: 10, padding: '2px 8px', borderRadius: 999, background: 'rgba(0,209,255,0.1)', border: '1px solid rgba(0,209,255,0.25)', color: '#00D1FF' }}>GPT-4o</span>
          </div>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.78)', fontSize: 14, lineHeight: 1.9 }}>{r.ai_comprehensive_report}</p>
        </motion.div>

        {/* 全スコア一覧 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          style={{
            background: '#0c1120',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 16, padding: '20px',
            marginBottom: 24,
          }}
        >
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16, fontWeight: 700 }}>◉ 全スコア一覧</div>
          {allScores.map((s, i) => (
            <ScoreBar key={s.label} label={s.label} value={s.value} color={s.color} delay={0.5 + i * 0.05} />
          ))}

          {/* 市場データ */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16, marginTop: 4, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: '推定収益モデル', value: r.estimated_revenue_model, color: '#FF4FD8' },
              { label: '推定回収期間',   value: r.estimated_recovery_period, color: '#f59e0b' },
            ].map(item => (
              <div key={item.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px' }}>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>{item.label}</div>
                <div style={{ color: item.color, fontSize: 12, fontWeight: 700 }}>{item.value ?? '—'}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* シェアボタン */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          style={{ marginBottom: 24 }}
        >
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', textAlign: 'center', marginBottom: 12 }}>シェアする</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <button
              onClick={handleTwitterShare}
              style={{
                padding: '12px 8px', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              𝕏 シェア
            </button>
            <button
              onClick={handleLineShare}
              style={{
                padding: '12px 8px', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                background: 'rgba(0,185,0,0.15)', border: '1px solid rgba(0,185,0,0.35)',
                color: '#00b900', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              LINE
            </button>
            <button
              onClick={handleCopy}
              style={{
                padding: '12px 8px', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)',
                color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              コピー
            </button>
          </div>
        </motion.div>

        {/* アクションボタン */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
        >
          <button
            onClick={() => navigate('/simple')}
            style={{
              width: '100%', padding: '14px', borderRadius: 14, fontSize: 14, fontWeight: 700,
              cursor: 'pointer', background: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)',
            }}
          >
            ↺ もう一度診断する
          </button>
        </motion.div>

        {/* フッター */}
        <div style={{ textAlign: 'center', paddingTop: 32, color: 'rgba(255,255,255,0.15)', fontSize: 11 }}>
          AI世界観市場診断OS
        </div>
      </div>
    </div>
  )
}
