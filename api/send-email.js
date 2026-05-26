import { Resend } from 'resend'

const resend  = new Resend(process.env.RESEND_API_KEY)
const ADMIN   = 'amedlo2000@gmail.com'
const FROM    = 'AI世界観診断OS <onboarding@resend.dev>'
const OAI_KEY = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY

// ─── Handler ─────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { to, result, answers } = req.body
  if (!to || !result) return res.status(400).json({ error: 'Missing fields' })

  // 8.5 秒以内に GPT-4o で 4 分析を生成、タイムアウト時はモックにフォールバック
  const extra = await Promise.race([
    generateExtraAnalyses(result, answers || {}),
    new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 8500)),
  ]).catch(e => {
    console.warn('Extra analysis fallback:', e.message)
    return mockExtra(result)
  })

  const html    = buildEmailHTML(result, extra, to)
  const subject = `【診断完了】あなたの世界観タイプ：${result.worldview_type}`

  try {
    await Promise.all([
      resend.emails.send({ from: FROM, to, subject, html }),
      resend.emails.send({ from: FROM, to: ADMIN, subject: `[管理者通知] ${subject}（${to}）`, html }),
    ])
    res.status(200).json({ ok: true })
  } catch (e) {
    console.error('Resend error:', e)
    res.status(500).json({ error: e.message })
  }
}

// ─── GPT-4o 4分析生成 ────────────────────────────────────────────────────────

const EXTRA_SYSTEM = `あなたは起業家支援AIです。診断結果と回答をもとに4つの分析を行い、以下のJSONのみを返してください（コードブロック・説明文不要）:
{
  "market":{
    "tam":"市場全体の規模（例:1.2兆円）",
    "sam":"狙える市場の規模（例:340億円）",
    "som":"最初に取れる市場（例:8億円）",
    "growth_rate":"年間成長率（例:22.5%）",
    "competition_level":0から100の整数,
    "entry_timing":"今すぐ|6ヶ月以内|1年以内|様子見",
    "entry_reason":"参入タイミングの理由60文字以内"
  },
  "mvp_comment":"このユーザーの業種・強み・MVPジャンル・予算に合わせた中規模MVP（AI診断機能・会員登録・コミュニティ機能・管理画面）への具体的なアドバイス150文字以内",
  "crowdfunding":{
    "expected_supporters":"想定応援人数（例:850名）",
    "total_funding":"予想支援総額（例:2550万円）",
    "avg_support":"平均支援単価（例:3万円）",
    "success_rate":0から100の整数,
    "viral_expectation":0から100の整数,
    "strategy":"クラファン成功戦略100文字以内"
  },
  "future":{
    "year_1":{"revenue":"月間収益予測（例:月50万円）","users":"ユーザー数（例:300名）","milestone":"主要マイルストーン40文字以内"},
    "year_3":{"revenue":"月間収益予測","users":"ユーザー数","milestone":"主要マイルストーン40文字以内"},
    "year_5":{"revenue":"月間収益予測","users":"ユーザー数","milestone":"主要マイルストーン40文字以内"},
    "revenue_model":"推定収益モデル30文字以内",
    "market_position":"市場ポジション予測30文字以内"
  }
}`

async function generateExtraAnalyses(result, answers) {
  if (!OAI_KEY) throw new Error('No OpenAI API key')

  const prompt = `世界観タイプ: ${result.worldview_type}
業種: ${answers.q01_select ?? '未回答'} / ${answers.q01_text ?? ''}
立場: ${answers.q02_select ?? '未回答'}
MVPジャンル: ${answers.q03_select ?? '未回答'} / ${answers.q03_text ?? ''}
発信状況: ${answers.q04_select ?? '未回答'}
予算規模: ${answers.q05_select ?? '未回答'}
変えたい世界: ${answers.q1_select ?? '未回答'} / ${answers.q1_text ?? ''}
強み: ${answers.q4_text ?? '未回答'}
作りたいもの: ${answers.q8_select ?? '未回答'} / ${answers.q8_text ?? ''}
理想の存在: ${answers.q6_select ?? '未回答'}
推定市場規模: ${result.estimated_market_size}
存在価値スコア: ${result.existence_value_score}
AI適性: ${result.ai_aptitude}
ブランド化可能性: ${result.brand_potential}
SNS拡散予測: ${result.sns_viral_prediction}

上記を踏まえて4つの分析を行いJSONで返してください。`

  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OAI_KEY}` },
    body: JSON.stringify({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1200,
      messages: [
        { role: 'system', content: EXTRA_SYSTEM },
        { role: 'user',   content: prompt },
      ],
    }),
  })

  if (!resp.ok) {
    const e = await resp.json().catch(() => ({}))
    throw new Error(e?.error?.message ?? `OpenAI ${resp.status}`)
  }

  const data = await resp.json()
  return JSON.parse(data.choices?.[0]?.message?.content ?? '{}')
}

// ─── フォールバックモック ─────────────────────────────────────────────────────

function mockExtra(r) {
  const timing = (r.market_temperature ?? 60) > 70 ? '今すぐ'
    : (r.market_temperature ?? 60) > 50 ? '6ヶ月以内' : '1年以内'
  return {
    market: {
      tam: r.estimated_market_size ?? '500億円',
      sam: '120億円', som: '5億円', growth_rate: '18%',
      competition_level: r.competition_saturation ?? 45,
      entry_timing: timing,
      entry_reason: '市場成長期にあり、先行者優位を確立できる好タイミングです',
    },
    mvp_comment: 'あなたの世界観と強みを最大限に活かし、まず100名の熱狂的なファンを獲得することを最優先にしてください。AI診断機能はあなたのビジネスの核心的差別化要因になります。',
    crowdfunding: {
      expected_supporters: '500〜1,000名', total_funding: '1,500万〜3,000万円',
      avg_support: '3万円',
      success_rate: r.brand_potential ?? 70,
      viral_expectation: r.sns_viral_prediction ?? 65,
      strategy: 'あなたの世界観を前面に出したストーリー性の高いプロジェクトページで差別化を図ってください。',
    },
    future: {
      year_1: { revenue: '月30〜80万円', users: '200〜500名', milestone: 'MVP完成・最初の100名ファン獲得' },
      year_3: { revenue: '月200〜500万円', users: '2,000〜5,000名', milestone: 'コミュニティ確立・メディア露出拡大' },
      year_5: { revenue: '月1,000〜3,000万円', users: '1万〜3万名', milestone: '独自経済圏確立・ブランド完成' },
      revenue_model: r.estimated_revenue_model ?? 'サブスク × コミュニティ',
      market_position: 'ニッチリーダー → 市場標準へ',
    },
  }
}

// ─── HTMLメール構築 ───────────────────────────────────────────────────────────

function bar(pct, color, height = '4px') {
  const p = Math.min(Math.max(Number(pct) || 0, 0), 100)
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:rgba(255,255,255,0.07);border-radius:3px;">
    <tr>
      <td width="${p}%" style="background:${color};height:${height};border-radius:3px;line-height:0;font-size:0;"> </td>
      <td width="${100 - p}%" style="line-height:0;font-size:0;"> </td>
    </tr>
  </table>`
}

function scoreRow(label, value, color) {
  const pct = Math.min(Number(value) || 0, 100)
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="color:rgba(255,255,255,0.5);font-size:13px;padding-bottom:6px;">${label}</td>
          <td align="right" style="color:${color};font-size:18px;font-weight:900;font-family:monospace;width:44px;padding-bottom:6px;">${value ?? '—'}</td>
        </tr>
        <tr><td colspan="2">${bar(pct, color)}</td></tr>
      </table>
    </td>
  </tr>`
}

function metricCard(label, value, color, width) {
  const pad = width === '33%' ? 'padding:16px 10px' : 'padding:18px 16px'
  return `<td width="${width}" style="padding:0 5px 0 0;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td style="background:rgba(${hexToRgb(color)},0.06);border:1px solid rgba(${hexToRgb(color)},0.22);border-radius:12px;${pad};text-align:center;">
        <p style="margin:0 0 5px;color:rgba(255,255,255,0.35);font-size:9px;letter-spacing:2px;text-transform:uppercase;">${label}</p>
        <p style="margin:0;color:${color};font-size:18px;font-weight:900;line-height:1.2;">${value ?? '—'}</p>
      </td></tr>
    </table>
  </td>`
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}

function sectionWrap(color, emoji, title, content) {
  const rgb = hexToRgb(color)
  return `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
    <tr><td style="background:rgba(${rgb},0.05);border:1px solid rgba(${rgb},0.2);border-radius:16px;overflow:hidden;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="background:${color};height:3px;line-height:0;font-size:0;"> </td></tr>
        <tr><td style="padding:28px 28px 24px;">
          <p style="margin:0 0 20px;color:${color};font-size:16px;font-weight:900;">${emoji} ${title}</p>
          ${content}
        </td></tr>
      </table>
    </td></tr>
  </table>`
}

function timingStyle(t) {
  const map = {
    '今すぐ':    { bg: 'rgba(52,211,153,0.15)',  border: 'rgba(52,211,153,0.45)',  text: '#34d399' },
    '6ヶ月以内': { bg: 'rgba(0,209,255,0.15)',   border: 'rgba(0,209,255,0.45)',   text: '#00D1FF' },
    '1年以内':   { bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.45)', text: '#8B5CF6' },
    '様子見':    { bg: 'rgba(245,158,11,0.15)',  border: 'rgba(245,158,11,0.45)',  text: '#f59e0b' },
  }
  return map[t] ?? map['様子見']
}

// ─────────────────────────────────────────────────────────────────────────────

function buildEmailHTML(r, extra, email) {
  const scores = [
    { label: '存在価値スコア',    value: r.existence_value_score,     color: '#00D1FF' },
    { label: '共感指数',          value: r.empathy_index,             color: '#8B5CF6' },
    { label: 'AI適性',            value: r.ai_aptitude,               color: '#FF4FD8' },
    { label: 'コミュニティ形成力', value: r.community_formation,       color: '#34d399' },
    { label: 'ブランド化可能性',   value: r.brand_potential,           color: '#f59e0b' },
    { label: 'SNS拡散予測',       value: r.sns_viral_prediction,      color: '#00D1FF' },
    { label: 'ファン化速度',       value: r.fan_conversion_speed,      color: '#8B5CF6' },
    { label: '市場参入成功率',     value: r.market_entry_success_rate, color: '#34d399' },
    { label: 'AI時代適応指数',    value: r.ai_era_adaptation_index,   color: '#FF4FD8' },
  ]
  const nums     = scores.map(s => Number(s.value) || 0).filter(Boolean)
  const avgScore = nums.length ? Math.round(nums.reduce((a, b) => a + b) / nums.length) : 0
  const m        = extra?.market ?? {}
  const cf       = extra?.crowdfunding ?? {}
  const fut      = extra?.future ?? {}
  const ts       = timingStyle(m.entry_timing)
  const compLvl  = Number(m.competition_level) || 50

  // ── ① 市場分析 ──
  const marketContent = `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:18px;">
      <tr>
        ${metricCard('市場全体の規模 (TAM)', m.tam, '#00D1FF', '33%')}
        ${metricCard('狙える市場の規模 (SAM)', m.sam, '#8B5CF6', '33%')}
        ${metricCard('最初に取れる市場 (SOM)', m.som, '#FF4FD8', '33%')}
      </tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
      <tr>
        <td width="50%" style="padding-right:8px;">
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.09);border-radius:10px;padding:14px 16px;">
            <p style="margin:0 0 4px;color:rgba(255,255,255,0.35);font-size:9px;letter-spacing:2px;text-transform:uppercase;">年間成長率</p>
            <p style="margin:0 0 2px;color:#34d399;font-size:22px;font-weight:900;">${m.growth_rate ?? '—'}</p>
          </div>
        </td>
        <td width="50%">
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.09);border-radius:10px;padding:14px 16px;">
            <p style="margin:0 0 6px;color:rgba(255,255,255,0.35);font-size:9px;letter-spacing:2px;text-transform:uppercase;">ライバルの多さ <span style="float:right;color:#FF4FD8;font-size:14px;font-weight:900;">${compLvl}</span></p>
            ${bar(compLvl, '#FF4FD8', '5px')}
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.25);font-size:9px;">100に近いほど競争が激しい</p>
          </div>
        </td>
      </tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background:rgba(${hexToRgb(ts.text)},0.1);border:1px solid ${ts.border};border-radius:10px;padding:14px 18px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td><p style="margin:0 0 2px;color:rgba(255,255,255,0.4);font-size:9px;letter-spacing:2px;text-transform:uppercase;">今の参入チャンス</p>
                  <p style="margin:0;color:${ts.text};font-size:18px;font-weight:900;">${m.entry_timing ?? '—'}</p></td>
              <td align="right" style="color:rgba(255,255,255,0.5);font-size:12px;line-height:1.6;">${m.entry_reason ?? ''}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`

  // ── ② MVP費用（中規模） ──
  const features = ['🤖 AI診断・分析機能', '👤 会員登録・ログイン機能', '💬 コミュニティ基盤', '📊 管理画面・分析ダッシュ']
  const featureCells = features.map(f =>
    `<td width="50%" style="padding:0 4px 8px 4px;">
      <div style="background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.2);border-radius:8px;padding:10px 12px;">
        <p style="margin:0;color:rgba(255,255,255,0.75);font-size:12px;">${f}</p>
      </div>
    </td>`
  )
  const mvpContent = `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
      <tr>${featureCells[0]}${featureCells[1]}</tr>
      <tr>${featureCells[2]}${featureCells[3]}</tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
      <tr>
        <td width="50%" style="padding-right:8px;">
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.09);border-radius:10px;padding:14px 16px;">
            <p style="margin:0 0 3px;color:rgba(255,255,255,0.35);font-size:9px;letter-spacing:2px;text-transform:uppercase;">費用レンジ</p>
            <p style="margin:0;color:#8B5CF6;font-size:18px;font-weight:900;">150万〜800万円</p>
          </div>
        </td>
        <td width="50%">
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.09);border-radius:10px;padding:14px 16px;">
            <p style="margin:0 0 3px;color:rgba(255,255,255,0.35);font-size:9px;letter-spacing:2px;text-transform:uppercase;">開発期間</p>
            <p style="margin:0;color:#a78bfa;font-size:18px;font-weight:900;">2〜6ヶ月</p>
          </div>
        </td>
      </tr>
    </table>
    <div style="background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.2);border-radius:12px;padding:20px;">
      <p style="margin:0 0 8px;color:#8B5CF6;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-weight:700;">🤖 AIからのアドバイス</p>
      <p style="margin:0;color:rgba(255,255,255,0.8);font-size:14px;line-height:1.8;">${extra?.mvp_comment ?? '—'}</p>
    </div>`

  // ── ③ クラファン分析 ──
  const cfContent = `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:18px;">
      <tr>
        ${metricCard('想定応援人数', cf.expected_supporters, '#FF4FD8', '33%')}
        ${metricCard('予想支援総額', cf.total_funding, '#FF4FD8', '33%')}
        ${metricCard('平均支援単価', cf.avg_support, '#FF4FD8', '33%')}
      </tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
      <tr>
        <td width="50%" style="padding-right:8px;">
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.09);border-radius:10px;padding:14px 16px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="color:rgba(255,255,255,0.35);font-size:9px;letter-spacing:2px;text-transform:uppercase;padding-bottom:5px;">成功率予測</td>
                <td align="right" style="color:#FF4FD8;font-size:20px;font-weight:900;padding-bottom:5px;">${cf.success_rate ?? '—'}%</td>
              </tr>
              <tr><td colspan="2">${bar(cf.success_rate, '#FF4FD8', '5px')}</td></tr>
            </table>
          </div>
        </td>
        <td width="50%">
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.09);border-radius:10px;padding:14px 16px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="color:rgba(255,255,255,0.35);font-size:9px;letter-spacing:2px;text-transform:uppercase;padding-bottom:5px;">SNS拡散期待値</td>
                <td align="right" style="color:#f59e0b;font-size:20px;font-weight:900;padding-bottom:5px;">${cf.viral_expectation ?? '—'}</td>
              </tr>
              <tr><td colspan="2">${bar(cf.viral_expectation, '#f59e0b', '5px')}</td></tr>
            </table>
          </div>
        </td>
      </tr>
    </table>
    <div style="background:rgba(255,79,216,0.07);border:1px solid rgba(255,79,216,0.2);border-radius:12px;padding:18px;">
      <p style="margin:0 0 6px;color:#FF4FD8;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-weight:700;">💡 成功戦略</p>
      <p style="margin:0;color:rgba(255,255,255,0.8);font-size:14px;line-height:1.8;">${cf.strategy ?? '—'}</p>
    </div>`

  // ── ④ 未来シミュレーション ──
  const futureYears = [
    { year: '1年後', data: fut.year_1, color: '#34d399' },
    { year: '3年後', data: fut.year_3, color: '#00D1FF' },
    { year: '5年後', data: fut.year_5, color: '#8B5CF6' },
  ]
  const yearCards = futureYears.map(({ year, data, color }) =>
    `<tr>
      <td style="padding:0 0 12px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="background:rgba(${hexToRgb(color)},0.07);border:1px solid rgba(${hexToRgb(color)},0.25);border-radius:12px;padding:18px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <p style="margin:0 0 4px;color:${color};font-size:11px;font-weight:800;letter-spacing:2px;">${year}</p>
                    <p style="margin:0 0 2px;color:#fff;font-size:20px;font-weight:900;">${data?.revenue ?? '—'}</p>
                    <p style="margin:0;color:rgba(255,255,255,0.4);font-size:12px;">${data?.users ?? '—'}</p>
                  </td>
                  <td align="right" style="color:rgba(255,255,255,0.55);font-size:12px;line-height:1.6;max-width:200px;">${data?.milestone ?? ''}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>`
  ).join('')

  const futureContent = `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
      ${yearCards}
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td width="50%" style="padding-right:8px;">
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.09);border-radius:10px;padding:14px 16px;">
            <p style="margin:0 0 3px;color:rgba(255,255,255,0.35);font-size:9px;letter-spacing:2px;text-transform:uppercase;">推定収益モデル</p>
            <p style="margin:0;color:#34d399;font-size:14px;font-weight:700;">${fut.revenue_model ?? '—'}</p>
          </div>
        </td>
        <td width="50%">
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.09);border-radius:10px;padding:14px 16px;">
            <p style="margin:0 0 3px;color:rgba(255,255,255,0.35);font-size:9px;letter-spacing:2px;text-transform:uppercase;">市場ポジション予測</p>
            <p style="margin:0;color:#00D1FF;font-size:14px;font-weight:700;">${fut.market_position ?? '—'}</p>
          </div>
        </td>
      </tr>
    </table>`

  // ── スコア行 ──
  const scoreRows = scores.map(s => scoreRow(s.label, s.value, s.color)).join('')

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>AI世界観市場診断OS — 診断結果</title>
  <style>
    @media only screen and (max-width:600px){
      .outer-td{padding:20px 8px!important}
      .main-td{padding:28px 20px!important}
      .three-col td{display:block!important;width:100%!important;padding:0 0 8px 0!important}
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#050816;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#050816;">
  <tr>
    <td class="outer-td" align="center" style="padding:40px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

        <!-- グラデーションアクセントバー -->
        <tr><td style="background:linear-gradient(90deg,#00D1FF,#8B5CF6,#FF4FD8);height:4px;border-radius:4px 4px 0 0;line-height:0;font-size:0;"> </td></tr>

        <!-- メインカード -->
        <tr>
          <td class="main-td" style="background:#0c1120;border:1px solid rgba(255,255,255,0.07);border-top:none;border-radius:0 0 20px 20px;padding:44px 36px;">

            <!-- ヘッダー -->
            <p style="margin:0 0 10px;color:rgba(0,209,255,0.65);font-size:10px;letter-spacing:4px;text-transform:uppercase;font-weight:700;">◈ AI世界観市場診断OS — RESULT</p>
            <h1 style="margin:0 0 6px;color:#fff;font-size:28px;font-weight:900;letter-spacing:-0.5px;line-height:1.3;">${r.worldview_type ?? '診断結果'}</h1>
            <p style="margin:0 0 32px;color:rgba(255,255,255,0.3);font-size:12px;letter-spacing:1px;">あなたの世界観診断レポートが届きました</p>

            <!-- キーメトリクス 3列 -->
            <table class="three-col" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
              <tr>
                ${metricCard('推定市場規模', r.estimated_market_size, '#00D1FF', '33%')}
                ${metricCard('予測経済圏', r.predicted_economic_sphere, '#8B5CF6', '33%')}
                <td width="33%">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr><td style="background:rgba(52,211,153,0.06);border:1px solid rgba(52,211,153,0.22);border-radius:12px;padding:16px 10px;text-align:center;">
                      <p style="margin:0 0 5px;color:rgba(255,255,255,0.35);font-size:9px;letter-spacing:2px;text-transform:uppercase;">総合スコア</p>
                      <p style="margin:0;color:#34d399;font-size:28px;font-weight:900;font-family:monospace;">${avgScore}</p>
                    </td></tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- AI総合分析レポート -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
              <tr><td style="background:rgba(0,209,255,0.04);border:1px solid rgba(0,209,255,0.15);border-radius:14px;padding:24px 26px;">
                <p style="margin:0 0 12px;color:#00D1FF;font-size:10px;letter-spacing:3px;text-transform:uppercase;font-weight:700;">◈ AI 総合分析レポート</p>
                <p style="margin:0;color:rgba(255,255,255,0.78);font-size:14px;line-height:1.9;">${r.ai_comprehensive_report ?? ''}</p>
              </td></tr>
            </table>

            <!-- 各スコア一覧 -->
            <p style="margin:0 0 12px;color:rgba(255,255,255,0.35);font-size:10px;letter-spacing:3px;text-transform:uppercase;font-weight:700;">◉ 各スコア一覧</p>
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:36px;">
              ${scoreRows}
            </table>

            <!-- セクション区切り -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
              <tr>
                <td style="border-top:1px solid rgba(255,255,255,0.08);"></td>
                <td style="padding:0 14px;white-space:nowrap;color:rgba(255,255,255,0.22);font-size:9px;letter-spacing:3px;text-transform:uppercase;">4つの詳細分析</td>
                <td style="border-top:1px solid rgba(255,255,255,0.08);"></td>
              </tr>
            </table>

            <!-- ① 市場分析 -->
            ${sectionWrap('#00D1FF', '📊', '市場分析', marketContent)}

            <!-- ② MVP費用（中規模） -->
            ${sectionWrap('#8B5CF6', '🚀', 'MVP費用（中規模）', mvpContent)}

            <!-- ③ クラファン分析 -->
            ${sectionWrap('#FF4FD8', '🎯', 'クラウドファンディング分析', cfContent)}

            <!-- ④ 未来シミュレーション -->
            ${sectionWrap('#34d399', '🔮', '未来シミュレーション（標準シナリオ）', futureContent)}

            <!-- フッター -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr><td style="border-top:1px solid rgba(255,255,255,0.06);padding-top:24px;text-align:center;">
                <p style="margin:0 0 4px;color:rgba(255,255,255,0.18);font-size:11px;">AI世界観市場診断OS</p>
                <p style="margin:0;color:rgba(255,255,255,0.1);font-size:10px;">${email} 宛に送信されました</p>
              </td></tr>
            </table>

          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`
}
