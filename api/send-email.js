import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const ADMIN = 'amedlo2000@gmail.com'
// 独自ドメインを Resend で認証後、下記 from を更新してください
const FROM = 'AI世界観診断OS <onboarding@resend.dev>'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { to, result } = req.body
  if (!to || !result) return res.status(400).json({ error: 'Missing fields' })

  const html = buildEmailHTML(result, to)
  const subject = `【診断完了】あなたの世界観タイプ：${result.worldview_type}`

  try {
    await Promise.all([
      resend.emails.send({ from: FROM, to, subject, html }),
      resend.emails.send({
        from: FROM,
        to: ADMIN,
        subject: `[管理者通知] 新規診断完了 — ${result.worldview_type}（${to}）`,
        html,
      }),
    ])
    res.status(200).json({ ok: true })
  } catch (e) {
    console.error('Resend error:', e)
    res.status(500).json({ error: e.message })
  }
}

function buildEmailHTML(r, email) {
  const scores = [
    { label: '存在価値スコア',    value: r.existence_value_score,       color: '#00D1FF' },
    { label: '共感指数',          value: r.empathy_index,               color: '#8B5CF6' },
    { label: 'AI適性',            value: r.ai_aptitude,                 color: '#FF4FD8' },
    { label: 'コミュニティ形成力', value: r.community_formation,         color: '#34d399' },
    { label: 'ブランド化可能性',   value: r.brand_potential,             color: '#f59e0b' },
    { label: 'SNS拡散予測',        value: r.sns_viral_prediction,        color: '#00D1FF' },
    { label: 'ファン化速度',       value: r.fan_conversion_speed,        color: '#8B5CF6' },
    { label: '市場参入成功率',     value: r.market_entry_success_rate,   color: '#34d399' },
    { label: 'AI時代適応指数',     value: r.ai_era_adaptation_index,     color: '#FF4FD8' },
  ]

  const nums = scores.map(s => Number(s.value) || 0).filter(Boolean)
  const avgScore = nums.length ? Math.round(nums.reduce((a, b) => a + b) / nums.length) : 0

  const scoreRows = scores.map(s => {
    const pct = Math.min(Number(s.value) || 0, 100)
    return `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="color:rgba(255,255,255,0.5);font-size:12px;padding-bottom:5px;">${s.label}</td>
              <td align="right" style="color:${s.color};font-size:15px;font-weight:900;font-family:monospace;width:44px;padding-bottom:5px;">${s.value ?? '—'}</td>
            </tr>
            <tr>
              <td colspan="2">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:rgba(255,255,255,0.07);border-radius:2px;height:3px;">
                  <tr>
                    <td width="${pct}%" style="background:${s.color};border-radius:2px;height:3px;"></td>
                    <td width="${100 - pct}%"></td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>`
  }).join('')

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>AI世界観市場診断OS — 診断結果</title>
</head>
<body style="margin:0;padding:0;background:#050816;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#050816;padding:48px 16px;">
  <tr>
    <td align="center">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

        <!-- Gradient accent bar -->
        <tr>
          <td style="height:3px;background:linear-gradient(90deg,#00D1FF,#8B5CF6,#FF4FD8);border-radius:3px 3px 0 0;"></td>
        </tr>

        <!-- Main card -->
        <tr>
          <td style="background:#0c1120;border:1px solid rgba(255,255,255,0.07);border-top:none;border-radius:0 0 20px 20px;padding:44px 40px;">

            <!-- Header -->
            <p style="margin:0 0 10px;color:rgba(0,209,255,0.65);font-size:10px;letter-spacing:4px;text-transform:uppercase;font-weight:700;">◈ AI世界観市場診断OS — RESULT</p>
            <h1 style="margin:0 0 6px;color:#ffffff;font-size:32px;font-weight:900;letter-spacing:-0.5px;line-height:1.2;">${r.worldview_type ?? '診断結果'}</h1>
            <p style="margin:0 0 36px;color:rgba(255,255,255,0.3);font-size:12px;letter-spacing:1px;">あなたの世界観診断が完了しました</p>

            <!-- 3 key metrics -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:36px;">
              <tr>
                <td width="33%" style="padding-right:8px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr><td style="background:rgba(0,209,255,0.06);border:1px solid rgba(0,209,255,0.22);border-radius:12px;padding:16px 12px;text-align:center;">
                      <p style="margin:0 0 5px;color:rgba(255,255,255,0.35);font-size:9px;letter-spacing:2px;text-transform:uppercase;">推定市場規模</p>
                      <p style="margin:0;color:#00D1FF;font-size:15px;font-weight:900;">${r.estimated_market_size ?? '—'}</p>
                    </td></tr>
                  </table>
                </td>
                <td width="33%" style="padding:0 4px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr><td style="background:rgba(139,92,246,0.06);border:1px solid rgba(139,92,246,0.22);border-radius:12px;padding:16px 12px;text-align:center;">
                      <p style="margin:0 0 5px;color:rgba(255,255,255,0.35);font-size:9px;letter-spacing:2px;text-transform:uppercase;">予測経済圏</p>
                      <p style="margin:0;color:#8B5CF6;font-size:15px;font-weight:900;">${r.predicted_economic_sphere ?? '—'}</p>
                    </td></tr>
                  </table>
                </td>
                <td width="33%" style="padding-left:8px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr><td style="background:rgba(52,211,153,0.06);border:1px solid rgba(52,211,153,0.22);border-radius:12px;padding:16px 12px;text-align:center;">
                      <p style="margin:0 0 5px;color:rgba(255,255,255,0.35);font-size:9px;letter-spacing:2px;text-transform:uppercase;">総合スコア</p>
                      <p style="margin:0;color:#34d399;font-size:26px;font-weight:900;font-family:monospace;">${avgScore}</p>
                    </td></tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- AI Report -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:36px;">
              <tr>
                <td style="background:rgba(0,209,255,0.04);border:1px solid rgba(0,209,255,0.15);border-radius:14px;padding:28px;">
                  <p style="margin:0 0 14px;color:#00D1FF;font-size:10px;letter-spacing:3px;text-transform:uppercase;font-weight:700;">AI 総合分析レポート</p>
                  <p style="margin:0;color:rgba(255,255,255,0.78);font-size:14px;line-height:1.9;">${r.ai_comprehensive_report ?? ''}</p>
                </td>
              </tr>
            </table>

            <!-- Scores list -->
            <p style="margin:0 0 14px;color:rgba(255,255,255,0.35);font-size:10px;letter-spacing:3px;text-transform:uppercase;font-weight:700;">◉ 各スコア一覧</p>
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
              ${scoreRows}
            </table>

            <!-- Extra market data -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:36px;">
              <tr>
                <td width="50%" style="padding-right:8px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr><td style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:14px 16px;">
                      <p style="margin:0 0 4px;color:rgba(255,255,255,0.3);font-size:9px;letter-spacing:2px;text-transform:uppercase;">推定収益モデル</p>
                      <p style="margin:0;color:#FF4FD8;font-size:13px;font-weight:700;">${r.estimated_revenue_model ?? '—'}</p>
                    </td></tr>
                  </table>
                </td>
                <td width="50%" style="padding-left:8px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr><td style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:14px 16px;">
                      <p style="margin:0 0 4px;color:rgba(255,255,255,0.3);font-size:9px;letter-spacing:2px;text-transform:uppercase;">推定回収期間</p>
                      <p style="margin:0;color:#f59e0b;font-size:13px;font-weight:700;">${r.estimated_recovery_period ?? '—'}</p>
                    </td></tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Footer -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="border-top:1px solid rgba(255,255,255,0.06);padding-top:24px;text-align:center;">
                  <p style="margin:0 0 4px;color:rgba(255,255,255,0.18);font-size:11px;">AI世界観市場診断OS</p>
                  <p style="margin:0;color:rgba(255,255,255,0.1);font-size:10px;">${email} 宛に送信されました</p>
                </td>
              </tr>
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
