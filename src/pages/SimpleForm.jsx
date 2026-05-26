import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext'
import { supabase } from '../lib/supabase'
import { analyzeWorldviewDiagnosis, mockWorldviewAnalysis } from '../lib/openai'

// ── Questions（メールステップなし） ──────────────────────────────────────────
const STEPS = [
  {
    id: 'q01', q: 'Q0-1', title: '現在の業種',
    desc: '現在あなたが関わっている業界を選んでください。',
    icon: '▣', color: '#00D1FF',
    hasSelect: true, selectLabel: '業種',
    options: ['美容・健康', '飲食', '保険・金融', '教育', 'IT・AI', '建築・不動産', 'コンサル', '物販・EC', 'クリエイティブ', 'その他'],
    textLabel: '現在の仕事内容を具体的に',
    minChars: 20, maxChars: 100, rows: 3,
    placeholder: '現在どんな仕事をしているか、ポジションや担当領域など具体的に教えてください...',
  },
  {
    id: 'q02', q: 'Q0-2', title: '現在の立場',
    desc: '現在のあなたの立場・状況を教えてください。',
    icon: '◉', color: '#8B5CF6',
    hasSelect: true, selectLabel: '立場',
    options: ['会社員', '個人事業主', '経営者', 'フリーランス', '学生', '主婦・主夫', 'クリエイター', '副業段階', '起業準備中', 'その他'],
    textLabel: '現在の状況や今後の理想',
    minChars: 20, maxChars: 100, rows: 3,
    placeholder: '今の状況と、これからどうなりたいか。理想の働き方・生き方を教えてください...',
  },
  {
    id: 'q03', q: 'Q0-3', title: '作りたいMVPジャンル',
    desc: 'どんなMVP（最小プロダクト）を作りたいですか？',
    icon: '◈', color: '#FF4FD8',
    hasSelect: true, selectLabel: 'MVPジャンル',
    options: ['AI診断サービス', 'AIアプリ', 'コミュニティ', '教育・講座', 'サロン・美容', 'ブランド・D2C', 'マッチング', 'SNSメディア', 'AI自動化ツール', '新しい文化・世界観'],
    textLabel: '具体的にどんなMVPを作りたいか',
    minChars: 20, maxChars: 100, rows: 3,
    placeholder: '最初に作りたいサービス・プロダクトのアイデアを教えてください。まだ曖昧でもOK...',
  },
  {
    id: 'q04', q: 'Q0-4', title: '現在の発信状況',
    desc: '現在のSNSや発信の状況を教えてください。',
    icon: '⬡', color: '#34d399',
    hasSelect: true, selectLabel: '発信規模',
    options: ['発信していない', 'フォロワー100以下', '100〜1000', '1000〜1万', '1万以上'],
    textLabel: '現在の発信内容やSNS状況',
    minChars: 20, maxChars: 100, rows: 3,
    placeholder: 'どのSNSで何を発信しているか、今の発信スタイルや反応を教えてください...',
  },
  {
    id: 'q05', q: 'Q0-5', title: '現在の挑戦予算',
    desc: '今回の挑戦に使える予算感を教えてください。',
    icon: '◭', color: '#f59e0b',
    hasSelect: true, selectLabel: '予算規模',
    options: ['5万円以下', '5〜30万円', '30〜100万円', '100〜300万円', '300万円以上'],
    textLabel: '挑戦に使える予算感や考え方',
    minChars: 20, maxChars: 100, rows: 3,
    placeholder: '予算の使い方の考え方、リスク許容度、投資に対するスタンスを教えてください...',
  },
  {
    id: 'q1', q: 'Q1', title: 'あなたが変えたい世界',
    desc: '今の世界で最も変えたいと感じているものは何ですか？',
    icon: '⬡', color: '#00D1FF',
    hasSelect: true, selectLabel: '変えたいテーマ',
    options: ['古い働き方', '人間関係', 'お金・経済', '教育・常識', '美意識・ライフスタイル'],
    textLabel: 'なぜ変えたいか・どんな未来にしたいか',
    minChars: 20, maxChars: 300, rows: 6,
    placeholder: 'あなたが感じている問題意識、理想とする未来のビジョンを具体的に書いてください。「なぜその世界を変えたいのか」という根源的な動機まで掘り下げて...',
  },
  {
    id: 'q2', q: 'Q2', title: 'あなたが理想とする世界観',
    desc: 'あなたが感じる「美しい世界」「正しい空気感」とはどんなものですか？',
    icon: '◈', color: '#8B5CF6',
    hasSelect: true, selectLabel: '世界観のタイプ',
    options: ['未来都市・AI', '高級ブランド', '癒し・ナチュラル', '熱狂・エネルギー', '哲学・知性'],
    textLabel: '理想の世界を具体的に',
    minChars: 20, maxChars: 300, rows: 6,
    placeholder: '理想とする空間・人・文化・生き方・美学を具体的に。「その世界に生きる人たちはどんな顔をしているか」まで想像して書いてください...',
  },
  {
    id: 'q3', q: 'Q3', title: 'あなたが今後発信したいもの',
    desc: 'SNSやコンテンツで世界に伝えていきたいことは何ですか？',
    icon: '◉', color: '#FF4FD8',
    hasSelect: true, selectLabel: '発信ジャンル',
    options: ['知識', '実体験', '世界観', '人との繋がり', '未来'],
    textLabel: 'どんな人へ何を伝えたいか',
    minChars: 20, maxChars: 300, rows: 6,
    placeholder: 'あなたが伝えたいこと、伝えたい相手、そしてその人の人生にどんな変化を起こしたいかを具体的に...',
  },
  {
    id: 'q4', q: 'Q4', title: 'あなたの強み',
    desc: '過去の経験・実績・人から言われること・失敗から得たものをすべて書いてください。',
    icon: '▣', color: '#34d399',
    hasSelect: false,
    textLabel: '経験・実績・人生の武器',
    minChars: 20, maxChars: 300, rows: 8,
    placeholder: '職歴・特技・資格に限らず、人生で積み上げてきたすべて。失敗談・苦労した経験・人から「それすごいね」と言われたことも書いてください...',
  },
  {
    id: 'q5', q: 'Q5', title: 'あなたが嫌いなもの',
    desc: '違和感を感じる世界・嫌いな文化・苦手な価値観を正直に教えてください。',
    icon: '◫', color: '#f59e0b',
    hasSelect: false,
    textLabel: '違和感・嫌悪感・絶対に関わりたくないもの',
    minChars: 20, maxChars: 300, rows: 6,
    placeholder: '「この空気感が嫌い」「こういう人が苦手」「この業界の文化に違和感がある」など。嫌いなものを明確にすることで、あなたの世界観の純度が高まります...',
  },
  {
    id: 'q6', q: 'Q6', title: 'どんな存在になりたいか',
    desc: '5年後・10年後、あなたはどんな存在として世界に立っていたいですか？',
    icon: '◭', color: '#00D1FF',
    hasSelect: true, selectLabel: '理想の存在タイプ',
    options: ['革新的な存在', '信頼型のリーダー', '面白い存在', '世界観型クリエイター', '人を動かす存在'],
    textLabel: '理想の存在像',
    minChars: 20, maxChars: 300, rows: 6,
    placeholder: '「どんな人から慕われたいか」「どんな言葉で語られたいか」「何を残したいか」まで具体的に描いてください...',
  },
  {
    id: 'q7', q: 'Q7', title: 'AI時代に感じていること',
    desc: 'AIが世の中を変えていく今、あなたは何を感じ、どう関わっていきたいですか？',
    icon: '⬡', color: '#8B5CF6',
    hasSelect: false,
    textLabel: 'AIへの考え・感覚・関わり方',
    minChars: 20, maxChars: 300, rows: 8,
    placeholder: '「AIについて正直どう思うか」「怖さ・期待・チャンス」「自分はAIとどう共存したいか」「AI時代に人間にしかできないことは何か」...',
  },
  {
    id: 'q8', q: 'Q8', title: '作りたいもの',
    desc: 'あなたが世界に出したいサービス・ブランド・文化・コミュニティはどんなものですか？',
    icon: '◈', color: '#FF4FD8',
    hasSelect: true, selectLabel: 'カテゴリ',
    options: ['AIサービス', 'ブランド', 'コミュニティ', '教育', '新しい文化'],
    textLabel: 'どんなサービスや世界を作りたいか',
    minChars: 20, maxChars: 300, rows: 8,
    placeholder: 'アイデアの具体的な内容・誰に向けたものか・なぜそれが必要か・どんな未来を作るか。まだ曖昧でも構いません、思いのままに...',
  },
  {
    id: 'q9', q: 'Q9', title: '理想のライフスタイル',
    desc: 'ビジネスが成功した先で、どんな毎日を生きていたいですか？',
    icon: '◉', color: '#34d399',
    hasSelect: false,
    textLabel: '理想の働き方・生活・人間関係',
    minChars: 20, maxChars: 300, rows: 6,
    placeholder: '「朝何時に起きて」「誰と一緒にいて」「どこで仕事して」「何にお金を使って」「どんな人に囲まれているか」まで具体的に...',
  },
  {
    id: 'q10', q: 'Q10', title: '人生を通して一番伝えたいこと',
    desc: 'もし今日が最後の発信だとしたら、あなたは世界に何を残しますか？',
    icon: '◉', color: '#8B5CF6',
    hasSelect: false,
    textLabel: 'あなたの哲学・メッセージ・魂の言葉',
    minChars: 20, maxChars: 300, rows: 10,
    placeholder: 'あなたの人生観・哲学・世界観の集大成。「なぜ生きるのか」「何が大切か」「次の世代に何を渡したいか」。言葉にしたことがないことも、ここで言語化してみてください...',
  },
]

const ANALYZE_PHASES = [
  { label: '回答データを解析中', icon: '◈' },
  { label: '世界観を分析中',     icon: '⬡' },
  { label: '存在価値を算出中',   icon: '◉' },
  { label: '市場性を評価中',     icon: '▣' },
  { label: '経済圏を予測中',     icon: '◭' },
  { label: 'AI総合レポートを生成中', icon: '◫' },
  { label: '診断完了',           icon: '✓' },
]

export default function SimpleForm() {
  const navigate = useNavigate()
  const { setDiagnosticData, setDiagnosticResult } = useApp()
  const [step,         setStep]        = useState(0)
  const [answers,      setAnswers]     = useState({})
  const [analyzing,    setAnalyzing]   = useState(false)
  const [analyzePhase, setAnalyzePhase] = useState(0)
  const [analyzeError, setAnalyzeError] = useState(null)

  const current  = STEPS[step]
  const progress = ((step + 1) / STEPS.length) * 100
  const textVal  = answers[`${current.id}_text`] || ''
  const selectVal = answers[`${current.id}_select`] || null
  const charCount = textVal.length
  const charOk    = charCount >= current.minChars

  const canProceed = () => current.hasSelect ? !!selectVal : charCount >= 20

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1)
    else handleSubmit()
  }
  const handleBack = () => { if (step > 0) setStep(s => s - 1) }
  const setSelect  = val => setAnswers(a => ({ ...a, [`${current.id}_select`]: val }))
  const setText    = val => setAnswers(a => ({ ...a, [`${current.id}_text`]: val }))

  const charColor = charCount === 0 ? 'rgba(255,255,255,0.2)'
    : charCount > current.maxChars ? '#FF4FD8'
    : charOk ? '#34d399' : '#f59e0b'

  const handleSubmit = async () => {
    setAnalyzing(true)
    setAnalyzeError(null)
    setAnalyzePhase(0)
    setDiagnosticData(answers)

    let phaseIdx = 0
    const phaseTimer = setInterval(() => {
      phaseIdx = Math.min(phaseIdx + 1, ANALYZE_PHASES.length - 2)
      setAnalyzePhase(phaseIdx)
    }, 1400)

    let result
    let err = null
    try {
      result = await analyzeWorldviewDiagnosis(answers)
    } catch (e) {
      console.error('Analysis error:', e.message)
      err = e.message
      result = mockWorldviewAnalysis()
    } finally {
      clearInterval(phaseTimer)
      setAnalyzePhase(ANALYZE_PHASES.length - 1)
    }

    // Supabase 保存（失敗しても続行）
    supabase.from('diagnoses').insert({
      q1_select: answers.q1_select ?? null, q1_text: answers.q1_text ?? null,
      q2_select: answers.q2_select ?? null, q2_text: answers.q2_text ?? null,
      q3_select: answers.q3_select ?? null, q3_text: answers.q3_text ?? null,
      q4_text: answers.q4_text ?? null, q5_text: answers.q5_text ?? null,
      q6_select: answers.q6_select ?? null, q6_text: answers.q6_text ?? null,
      q7_text: answers.q7_text ?? null,
      q8_select: answers.q8_select ?? null, q8_text: answers.q8_text ?? null,
      q9_text: answers.q9_text ?? null, q10_text: answers.q10_text ?? null,
      worldview_type: result.worldview_type,
      existence_value_score: result.existence_value_score,
      empathy_index: result.empathy_index,
      sns_viral_prediction: result.sns_viral_prediction,
      estimated_market_size: result.estimated_market_size,
      predicted_economic_sphere: result.predicted_economic_sphere,
      mvp_market_reaction: result.mvp_market_reaction,
      ai_aptitude: result.ai_aptitude,
      community_formation: result.community_formation,
      brand_potential: result.brand_potential,
      estimated_revenue_model: result.estimated_revenue_model,
      market_temperature: result.market_temperature,
      competition_saturation: result.competition_saturation,
      worldview_imitation_resistance: result.worldview_imitation_resistance,
      ai_replacement_risk: result.ai_replacement_risk,
      fan_conversion_speed: result.fan_conversion_speed,
      existence_capital_score: result.existence_capital_score,
      economic_sphere_formation: result.economic_sphere_formation,
      market_entry_success_rate: result.market_entry_success_rate,
      estimated_recovery_period: result.estimated_recovery_period,
      ai_era_adaptation_index: result.ai_era_adaptation_index,
      mvp_recommended_tier: result.mvp_recommended_tier,
      ai_comprehensive_report: result.ai_comprehensive_report,
    }).then(({ error }) => { if (error) console.error('Supabase:', error.message) })

    // メール送信（sessionStorage から email を取得）
    const userEmail = sessionStorage.getItem('simple_email')
    if (userEmail) {
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: userEmail, result, answers }),
      }).catch(e => console.error('Email failed:', e))
    }

    await new Promise(r => setTimeout(r, 600))
    setDiagnosticResult({ ...result, aiError: err, answers })
    setAnalyzing(false)
    navigate('/simple/result')
  }

  return (
    <div style={{ minHeight: '100svh', background: '#050816', display: 'flex', flexDirection: 'column' }}>

      {/* プログレスバー */}
      <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', flexShrink: 0 }}>
        <motion.div
          style={{ height: '100%', background: 'linear-gradient(90deg,#00D1FF,#8B5CF6,#FF4FD8)' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* ヘッダーミニ */}
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ color: 'rgba(0,209,255,0.6)', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 700 }}>◈ AI世界観市場診断OS</span>
        <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11 }}>{step + 1} / {STEPS.length}</span>
      </div>

      {/* ステップドット */}
      <div style={{ padding: '0 16px 16px', display: 'flex', flexWrap: 'wrap', gap: 5, justifyContent: 'center' }}>
        {STEPS.map((s, i) => {
          const done = i < step, active = i === step
          return (
            <button
              key={s.id}
              onClick={() => done && setStep(i)}
              style={{
                width: active ? 32 : 26, height: 26, borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 700, cursor: done ? 'pointer' : 'default',
                background: done ? `${s.color}20` : active ? `${s.color}25` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${done ? `${s.color}50` : active ? `${s.color}70` : 'rgba(255,255,255,0.1)'}`,
                color: done ? s.color : active ? s.color : 'rgba(255,255,255,0.25)',
                transition: 'all 0.2s',
              }}
            >
              {done ? '✓' : s.q}
            </button>
          )
        })}
      </div>

      {/* フォームエリア */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 12px 32px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 28, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -28, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            style={{
              width: '100%', maxWidth: 480,
              background: '#0c1120',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20, padding: '24px 20px',
              position: 'relative', overflow: 'hidden',
            }}
          >
            {/* 上部カラーライン */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${current.color},transparent)` }} />

            {/* 質問ヘッダー */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                background: `${current.color}18`, border: `1px solid ${current.color}40`, color: current.color,
              }}>
                {current.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: `${current.color}15`, color: current.color }}>{current.q}</span>
                </div>
                <h2 style={{ margin: 0, color: '#fff', fontSize: 17, fontWeight: 800, lineHeight: 1.3 }}>{current.title}</h2>
                <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.4)', fontSize: 12, lineHeight: 1.5 }}>{current.desc}</p>
              </div>
            </div>

            {/* 選択肢 */}
            {current.hasSelect && (
              <div style={{ marginBottom: 18 }}>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>{current.selectLabel}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
                  {current.options.map(opt => {
                    const sel = selectVal === opt
                    return (
                      <motion.button
                        key={opt}
                        onClick={() => setSelect(opt)}
                        whileTap={{ scale: 0.96 }}
                        style={{
                          padding: '10px 10px', borderRadius: 10, fontSize: 12, fontWeight: 500,
                          textAlign: 'center', cursor: 'pointer', border: '1px solid',
                          transition: 'all 0.15s',
                          background: sel ? `${current.color}18` : 'rgba(255,255,255,0.03)',
                          borderColor: sel ? `${current.color}60` : 'rgba(255,255,255,0.1)',
                          color: sel ? current.color : 'rgba(255,255,255,0.55)',
                          position: 'relative', overflow: 'hidden',
                        }}
                      >
                        {sel && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: current.color }} />}
                        {opt}
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* テキストエリア */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5 }}>
                  {current.textLabel}
                  {current.hasSelect && <span style={{ color: 'rgba(255,255,255,0.2)', textTransform: 'none', letterSpacing: 0, marginLeft: 6 }}>（任意）</span>}
                </span>
                <span style={{ color: charColor, fontSize: 11, fontWeight: 600 }}>
                  {charOk && '✓ '}{charCount} / {current.maxChars}
                </span>
              </div>
              <textarea
                value={textVal}
                onChange={e => setText(e.target.value)}
                placeholder={current.placeholder}
                rows={current.rows}
                maxLength={current.maxChars}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${charCount > 0 ? (charOk ? `${current.color}40` : 'rgba(245,158,11,0.3)') : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 12, padding: '12px 14px',
                  color: '#fff', fontSize: 14, lineHeight: 1.7,
                  resize: 'none', outline: 'none',
                  fontFamily: 'inherit', transition: 'border-color 0.2s',
                  caretColor: current.color,
                }}
              />
              {!current.hasSelect && !charOk && charCount > 0 && (
                <p style={{ margin: '5px 0 0', color: '#f59e0b', fontSize: 11 }}>あと {20 - charCount} 文字以上書いてください</p>
              )}
            </div>

            {/* ナビゲーション */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
              <button
                onClick={handleBack}
                disabled={step === 0}
                style={{
                  padding: '10px 20px', borderRadius: 10, fontSize: 13, cursor: step === 0 ? 'default' : 'pointer',
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.12)',
                  color: step === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.5)',
                  opacity: step === 0 ? 0.4 : 1,
                }}
              >
                ← 前へ
              </button>

              <motion.button
                onClick={handleNext}
                disabled={!canProceed()}
                whileTap={{ scale: canProceed() ? 0.97 : 1 }}
                style={{
                  padding: '11px 24px', borderRadius: 12, fontSize: 14, fontWeight: 700,
                  cursor: canProceed() ? 'pointer' : 'default',
                  border: 'none',
                  background: canProceed()
                    ? step === STEPS.length - 1
                      ? 'linear-gradient(135deg,#00D1FF,#8B5CF6)'
                      : `linear-gradient(135deg,${current.color}cc,${current.color}88)`
                    : 'rgba(255,255,255,0.08)',
                  color: canProceed() ? '#fff' : 'rgba(255,255,255,0.3)',
                  boxShadow: canProceed() ? `0 0 20px ${current.color}30` : 'none',
                }}
              >
                {step === STEPS.length - 1 ? '✦ 診断スタート' : '次へ →'}
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 分析中オーバーレイ */}
      <AnimatePresence>
        {analyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(5,8,22,0.97)', backdropFilter: 'blur(20px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
            }}
          >
            <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.15, pointerEvents: 'none' }} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ textAlign: 'center', maxWidth: 320, width: '100%', padding: '0 24px', position: 'relative' }}
            >
              {/* 回転リング */}
              <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto 28px' }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                  style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#00D1FF', borderRightColor: '#8B5CF6' }}
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
                  style={{ position: 'absolute', inset: 10, borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#FF4FD8', borderBottomColor: '#34d399' }}
                />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00D1FF', fontSize: 24 }}>
                  {analyzePhase >= ANALYZE_PHASES.length - 1 ? '✓' : '◈'}
                </div>
              </div>

              <h2 style={{ margin: '0 0 4px', color: '#fff', fontSize: 20, fontWeight: 900 }}>AI存在経済OSが分析中</h2>
              <p style={{ margin: '0 0 24px', color: 'rgba(255,255,255,0.3)', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase' }}>WORLDVIEW MARKET ANALYSIS</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
                {ANALYZE_PHASES.map((phase, i) => (
                  <motion.div
                    key={phase.label}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: analyzePhase >= i ? 1 : 0.15 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                  >
                    <motion.span
                      animate={analyzePhase === i ? { scale: [1, 1.4, 1] } : {}}
                      transition={{ duration: 0.7, repeat: analyzePhase === i ? Infinity : 0 }}
                      style={{ fontSize: 14, width: 18, flexShrink: 0, color: analyzePhase > i ? '#34d399' : analyzePhase === i ? '#00D1FF' : 'rgba(255,255,255,0.15)' }}
                    >
                      {analyzePhase > i ? '✓' : phase.icon}
                    </motion.span>
                    <span style={{ fontSize: 13, color: analyzePhase > i ? '#34d399' : analyzePhase === i ? '#fff' : 'rgba(255,255,255,0.2)' }}>
                      {phase.label}
                    </span>
                  </motion.div>
                ))}
              </div>

              {analyzeError && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ marginTop: 16, padding: '10px 14px', borderRadius: 10, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b', fontSize: 11, textAlign: 'left' }}
                >
                  ⚠ API エラー: {analyzeError}
                  <br /><span style={{ color: 'rgba(255,255,255,0.3)' }}>モックデータで代替表示します</span>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
