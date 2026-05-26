import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  BarChart3,
  Users,
  LogOut,
  Trophy,
  DollarSign,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { authApi } from '../../api/auth'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/schedule', label: 'Jadval', icon: CalendarDays },
  { to: '/bookings', label: 'Bronlar', icon: ClipboardList },
  { to: '/analytics', label: 'Tahlil', icon: BarChart3 },
  { to: '/users', label: 'Foydalanuvchilar', icon: Users, adminOnly: true },
]

export function Sidebar() {
  const { user, clearAuth } = useAuthStore()

  async function handleLogout() {
    try {
      await authApi.logout()
    } finally {
      clearAuth()
    }
  }

  return (
    <aside className="w-60 min-h-screen bg-gray-900 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-green-500 rounded-lg flex items-center justify-center">
            <Trophy size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">Stadium</p>
            <p className="text-gray-400 text-xs">Boshqaruv tizimi</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {navItems.map(({ to, label, icon: Icon, adminOnly }) => {
          if (adminOnly && user?.role !== 'super_admin') return null
          return (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${
                  isActive
                    ? 'bg-green-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          )
        })}
      </nav>

      {/* Pricing shortcut */}
      <div className="px-3 pb-2">
        <NavLink
          to="/pricing"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
            ${
              isActive
                ? 'bg-green-600 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`
          }
        >
          <DollarSign size={18} />
          Narxlar
        </NavLink>
      </div>

      {/* User & logout */}
      <div className="px-3 py-4 border-t border-gray-700">
        {user && (
          <div className="mb-3 px-3">
            <p className="text-white text-sm font-medium truncate">{user.fullName}</p>
            <p className="text-gray-400 text-xs truncate">
              {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
            </p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
            text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-colors"
        >
          <LogOut size={18} />
          Chiqish
        </button>
      </div>
    </aside>
  )
}
