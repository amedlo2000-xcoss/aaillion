import { motion } from 'framer-motion'

const colorMap = {
  blue:   { text: 'text-[#00D1FF]', glow: 'glow-blue',   bg: 'bg-[#00D1FF]/10', border: 'border-[#00D1FF]/20' },
  purple: { text: 'text-[#8B5CF6]', glow: 'glow-purple', bg: 'bg-[#8B5CF6]/10', border: 'border-[#8B5CF6]/20' },
  pink:   { text: 'text-[#FF4FD8]', glow: 'glow-pink',   bg: 'bg-[#FF4FD8]/10', border: 'border-[#FF4FD8]/20' },
}

export default function MetricCard({ label, value, unit = '', icon, color = 'blue', trend, index = 0 }) {
  const c = colorMap[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`glass border ${c.border} p-6 relative overflow-hidden group cursor-default`}
    >
      {/* Corner accent */}
      <div className={`absolute top-0 right-0 w-16 h-16 ${c.bg} rounded-bl-3xl opacity-50`} />
      <div className={`absolute top-0 right-0 w-px h-16 bg-gradient-to-b from-transparent ${c.text.replace('text-', 'to-')}`} style={{ background: 'linear-gradient(to bottom, transparent, currentColor)' }} />

      {/* Icon */}
      <div className={`text-3xl mb-3 ${c.text}`}>{icon}</div>

      {/* Value */}
      <div className={`text-3xl font-bold ${c.text} font-mono`}>
        {value}<span className="text-lg ml-1 opacity-70">{unit}</span>
      </div>

      {/* Label */}
      <div className="text-white/50 text-sm mt-1">{label}</div>

      {/* Trend */}
      {trend && (
        <div className={`mt-3 text-xs font-medium flex items-center gap-1 ${trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          <span>{trend > 0 ? '▲' : '▼'}</span>
          <span>{Math.abs(trend)}%</span>
          <span className="text-white/30 ml-1">vs 先月</span>
        </div>
      )}

      {/* Glow on hover */}
      <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${c.glow} pointer-events-none`} style={{ boxShadow: 'none' }} />
    </motion.div>
  )
}
