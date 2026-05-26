import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext'

const navGroups = [
  {
    label: 'CORE',
    items: [
      { to: '/dashboard',    icon: '⬡', label: 'ダッシュボード' },
      { to: '/diagnostic',   icon: '◈', label: '診断フォーム' },
      { to: '/result',       icon: '◉', label: '診断結果' },
    ],
  },
  {
    label: 'ANALYSIS',
    items: [
      { to: '/market',       icon: '▣', label: '市場分析' },
      { to: '/mvp-sim',      icon: '◫', label: 'MVP費シミュ' },
      { to: '/crowdfunding', icon: '◬', label: 'クラファン分析' },
    ],
  },
  {
    label: 'STRATEGY',
    items: [
      { to: '/future-sim',   icon: '◭', label: '未来シミュレーション' },
      { to: '/admin',        icon: '◲', label: '管理画面' },
    ],
  },
  {
    label: 'DATA',
    items: [
      { to: '/history',      icon: '◫', label: '診断履歴 (DB)' },
    ],
  },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const { setUser } = useApp()

  const handleLogout = () => {
    setUser(null)
    navigate('/login')
  }

  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col w-64 min-h-screen glass border-r border-white/10 py-8 px-4 relative overflow-hidden"
    >
      {/* Background accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00D1FF] to-transparent opacity-60" />
      <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-[#8B5CF6]/10 blur-3xl pointer-events-none" />

      {/* Logo */}
      <div className="mb-10 px-2">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00D1FF] to-[#8B5CF6] flex items-center justify-center text-white font-bold text-sm glow-blue tracking-tighter">
            AA
          </div>
          <div>
            <div className="text-white font-bold text-lg tracking-wider">AAillion</div>
            <div className="text-white/40 text-xs">v2.0 NEURAL</div>
          </div>
        </motion.div>
      </div>

      {/* Status indicator */}
      <div className="mb-6 px-2 py-3 rounded-xl bg-[#00D1FF]/5 border border-[#00D1FF]/20">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00D1FF] pulse-neon" />
          <span className="text-[#00D1FF] text-xs font-medium">SYSTEM ONLINE</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-4 flex-1 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label}>
            <div className="text-white/20 text-[10px] font-bold tracking-widest px-4 mb-1">{group.label}</div>
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 relative overflow-hidden
                  ${isActive
                    ? 'bg-[#00D1FF]/10 border border-[#00D1FF]/30 text-[#00D1FF]'
                    : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#00D1FF] rounded-r" />
                    )}
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto">
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4" />
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-[#FF4FD8] hover:bg-[#FF4FD8]/10 border border-transparent hover:border-[#FF4FD8]/30 transition-all duration-300 text-sm"
        >
          <span className="text-xl">⏻</span>
          <span>ログアウト</span>
        </button>
      </div>
    </motion.aside>
  )
}
