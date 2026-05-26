import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext'

export default function Login() {
  const navigate = useNavigate()
  const { setUser } = useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [focused, setFocused] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) { setError('全項目を入力してください'); return }
    setLoading(true)
    setError('')
    await new Promise(r => setTimeout(r, 1200))
    setUser({ email, name: email.split('@')[0] })
    setLoading(false)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#8B5CF6]/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[#00D1FF]/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#FF4FD8]/5 blur-3xl pointer-events-none" />

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            background: ['#00D1FF', '#8B5CF6', '#FF4FD8'][i % 3],
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{ y: [-10, 10, -10], opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 3 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 3 }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md px-4"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 float">
            <img src="/logo.png" alt="AAillion" className="w-20 h-20 rounded-2xl object-contain" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            AAillion
          </h1>
          <p className="text-white/40 mt-2 text-sm tracking-widest uppercase">Neural Business Analyzer</p>
        </motion.div>

        {/* Card */}
        <div className="glass-strong p-8 border border-animated relative overflow-hidden">
          {/* Top glow line */}
          <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#00D1FF] to-transparent opacity-60" />

          <h2 className="text-xl font-semibold text-white mb-6">
            <span className="text-[#00D1FF] mr-2">▶</span>システムログイン
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div className="relative">
              <label className="block text-xs font-medium text-white/50 mb-2 tracking-wider uppercase">
                Email / ID
              </label>
              <div className={`relative transition-all duration-300 ${focused === 'email' ? 'glow-blue' : ''}`}>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused('')}
                  placeholder="user@aaillion.ai"
                  className="w-full bg-white/5 border border-white/10 focus:border-[#00D1FF]/60 text-white placeholder-white/20 rounded-xl px-4 py-3.5 outline-none transition-all duration-300 text-sm"
                />
                <div className={`absolute right-3 top-1/2 -translate-y-1/2 text-[#00D1FF] text-lg transition-opacity ${email ? 'opacity-100' : 'opacity-0'}`}>✓</div>
              </div>
            </div>

            {/* Password */}
            <div className="relative">
              <label className="block text-xs font-medium text-white/50 mb-2 tracking-wider uppercase">
                Access Key
              </label>
              <div className={`relative transition-all duration-300 ${focused === 'pass' ? 'glow-purple' : ''}`}>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocused('pass')}
                  onBlur={() => setFocused('')}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 focus:border-[#8B5CF6]/60 text-white placeholder-white/20 rounded-xl px-4 py-3.5 outline-none transition-all duration-300 text-sm"
                />
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-[#FF4FD8] text-sm bg-[#FF4FD8]/10 border border-[#FF4FD8]/30 rounded-xl px-4 py-2.5"
                >
                  ⚠ {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative w-full py-4 rounded-xl font-semibold text-white overflow-hidden group disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              style={{ background: 'linear-gradient(135deg, #00D1FF, #8B5CF6, #FF4FD8)' }}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  <span>認証中...</span>
                </div>
              ) : (
                <span className="tracking-wider">SYSTEM ACCESS →</span>
              )}
            </motion.button>
          </form>

          {/* Bottom info */}
          <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between text-xs text-white/25">
            <span>v2.0.0 NEURAL</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-neon" />
              All systems nominal
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
