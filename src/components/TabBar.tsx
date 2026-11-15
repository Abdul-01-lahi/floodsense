import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/play', label: 'Play', icon: '🎮' },
  { to: '/trends', label: 'Trends', icon: '📈' },
  { to: '/progress', label: 'Progress', icon: '🌱' },
  { to: '/', label: 'Home', icon: '🏠' },
]

function TabBar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-emerald-100 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(15,118,110,0.08)] backdrop-blur">
      <div className="mx-auto flex max-w-2xl justify-around gap-1">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              `flex min-h-16 min-w-20 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 text-base font-semibold transition-colors ${
                isActive
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'text-slate-500 hover:bg-sky-50 hover:text-sky-800'
              }`
            }
          >
            <span aria-hidden="true" className="text-xl leading-none">
              {tab.icon}
            </span>
            <span>{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default TabBar
