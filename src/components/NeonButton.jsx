import { motion } from 'framer-motion'

const variants = {
  blue:   'border-[#00D1FF]/50 text-[#00D1FF] hover:bg-[#00D1FF]/10 hover:shadow-[0_0_20px_rgba(0,209,255,0.3)]',
  purple: 'border-[#8B5CF6]/50 text-[#8B5CF6] hover:bg-[#8B5CF6]/10 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]',
  pink:   'border-[#FF4FD8]/50 text-[#FF4FD8] hover:bg-[#FF4FD8]/10 hover:shadow-[0_0_20px_rgba(255,79,216,0.3)]',
  solid:  'bg-gradient-to-r from-[#00D1FF] to-[#8B5CF6] text-white border-transparent hover:shadow-[0_0_30px_rgba(0,209,255,0.5)]',
}

export default function NeonButton({ children, color = 'blue', onClick, type = 'button', disabled = false, className = '' }) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.03 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      className={`px-6 py-3 rounded-xl border font-medium transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed ${variants[color]} ${className}`}
    >
      {children}
    </motion.button>
  )
}
