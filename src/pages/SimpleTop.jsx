import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function SimpleTop() {
  const navigate  = useNavigate()
  const [nickname, setNickname] = useState('')
  const [email,    setEmail]    = useState('')
  const [errors,   setErrors]   = useState({})

  const emailOk    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const nicknameOk = nickname.trim().length >= 1

  const handleStart = () => {
    const e = {}
    if (!nicknameOk) e.nickname = 'ニックネームを入力してください'
    if (!emailOk)    e.email    = '正しいメールアドレスを入力してください'
    if (Object.keys(e).length) { setErrors(e); return }

    sessionStorage.setItem('simple_nickname', nickname.trim())
    sessionStorage.setItem('simple_email',    email.trim())
    navigate('/simple/form')
  }

  return (
    <div style={{ minHeight: '100svh', background: '#050816', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>

      {/* 背景グリッド */}
      <div className="grid-bg" style={{ position: 'fixed', inset: 0, opacity: 0.15, pointerEvents: 'none' }} />

      {/* グロー */}
      <div style={{ position: 'fixed', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(0,209,255,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 480, position: 'relative' }}>

        {/* ロゴ・タイトル */}
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: 40 }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '6px 16px', borderRadius: 999, border: '1px solid rgba(0,209,255,0.3)', background: 'rgba(0,209,255,0.08)' }}>
            <span style={{ color: '#00D1FF', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 700 }}>◈ AI世界観市場診断OS</span>
          </div>
          <h1 style={{ margin: '0 0 12px', color: '#fff', fontSize: 28, fontWeight: 900, lineHeight: 1.3, letterSpacing: -0.5 }}>
            あなたの<span style={{ background: 'linear-gradient(90deg,#00D1FF,#8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>世界観</span>と<br />
            <span style={{ background: 'linear-gradient(90deg,#8B5CF6,#FF4FD8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>経済的価値</span>を診断
          </h1>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: 13, lineHeight: 1.7 }}>
            15問に答えるだけで、AIがあなたの<br />市場価値・世界観タイプを分析します
          </p>
        </motion.div>

        {/* 入力フォームカード */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          style={{
            background: '#0c1120',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20,
            padding: '32px 28px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* 上部グラデーションライン */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#00D1FF,#8B5CF6,#FF4FD8)' }} />

          {/* ニックネーム */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8, fontWeight: 600 }}>
              ニックネーム <span style={{ color: '#FF4FD8' }}>*</span>
            </label>
            <input
              type="text"
              value={nickname}
              onChange={e => { setNickname(e.target.value); setErrors(v => ({ ...v, nickname: '' })) }}
              placeholder="例：田中さん"
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${errors.nickname ? 'rgba(255,79,216,0.5)' : nicknameOk && nickname ? 'rgba(0,209,255,0.4)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 12, padding: '14px 16px',
                color: '#fff', fontSize: 15, outline: 'none',
              }}
            />
            {errors.nickname && <p style={{ margin: '6px 0 0', color: '#FF4FD8', fontSize: 12 }}>{errors.nickname}</p>}
          </div>

          {/* メールアドレス */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8, fontWeight: 600 }}>
              メールアドレス <span style={{ color: '#FF4FD8' }}>*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrors(v => ({ ...v, email: '' })) }}
              placeholder="your@email.com"
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${errors.email ? 'rgba(255,79,216,0.5)' : emailOk ? 'rgba(0,209,255,0.4)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 12, padding: '14px 16px',
                color: '#fff', fontSize: 15, outline: 'none',
              }}
            />
            {emailOk && !errors.email && (
              <p style={{ margin: '6px 0 0', color: '#34d399', fontSize: 12 }}>✓ 診断結果をこのアドレスに送信します</p>
            )}
            {errors.email && <p style={{ margin: '6px 0 0', color: '#FF4FD8', fontSize: 12 }}>{errors.email}</p>}
          </div>

          {/* スタートボタン */}
          <motion.button
            onClick={handleStart}
            whileTap={{ scale: 0.97 }}
            style={{
              width: '100%', padding: '16px 24px',
              background: 'linear-gradient(135deg, #00D1FF, #8B5CF6)',
              border: 'none', borderRadius: 14, cursor: 'pointer',
              color: '#fff', fontSize: 16, fontWeight: 900, letterSpacing: 0.5,
              boxShadow: '0 0 32px rgba(0,209,255,0.25)',
            }}
          >
            診断を始める →
          </motion.button>

          {/* 補足情報 */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 20 }}>
            {['無料', 'ログイン不要', '約5〜10分'].map(t => (
              <span key={t} style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ color: '#34d399' }}>✓</span> {t}
              </span>
            ))}
          </div>
        </motion.div>

        {/* 診断内容の説明 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}
        >
          {[
            { icon: '◈', label: '世界観タイプ診断', color: '#00D1FF' },
            { icon: '◉', label: '存在価値スコア',   color: '#8B5CF6' },
            { icon: '⬡', label: '市場性・経済圏予測', color: '#FF4FD8' },
            { icon: '▣', label: 'AI総合分析レポート', color: '#34d399' },
          ].map(item => (
            <div key={item.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: item.color, fontSize: 14 }}>{item.icon}</span>
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>{item.label}</span>
            </div>
          ))}
        </motion.div>

      </div>
    </div>
  )
}
