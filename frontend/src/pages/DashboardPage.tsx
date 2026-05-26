import { useQuery } from '@tanstack/react-query'
import { CalendarDays, TrendingUp, DollarSign, CreditCard, Clock } from 'lucide-react'
import { dashboardApi } from '../api/dashboard'
import { StatCard } from '../components/ui/StatCard'
import { Spinner } from '../components/ui/Spinner'
import { formatCurrency } from '../utils/formatters'
import { format } from 'date-fns'

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getOverview,
    refetchInterval: 60_000,
  })

  const today = format(new Date(), 'dd.MM.yyyy')

  const todayBookings =
    data?.today.bookingsByStatus.reduce((s, b) => s + b.count, 0) ?? 0

  const todayRevenue =
    data?.today.bookingsByStatus
      .filter((b) => b.status !== 'cancelled')
      .reduce((s, b) => s + b.revenue, 0) ?? 0

  if (isLoading) return <Spinner className="mt-20" />

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">Bugun: {today}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Bugungi bronlar"
          value={todayBookings}
          icon={CalendarDays}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Bugungi daromad"
          value={formatCurrency(todayRevenue)}
          icon={TrendingUp}
          iconColor="text-green-600"
          iconBg="bg-green-50"
        />
        <StatCard
          title="Oylik daromad"
          value={formatCurrency(data?.currentMonth.revenue ?? 0)}
          icon={DollarSign}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
        <StatCard
          title="Joriy soatlik narx"
          value={formatCurrency(data?.currentHourlyPrice ?? 0)}
          icon={Clock}
          iconColor="text-orange-600"
          iconBg="bg-orange-50"
        />
      </div>

      {(data?.pendingPayments.count ?? 0) > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-3">
          <CreditCard size={20} className="text-orange-600 flex-shrink-0" />
          <p className="text-orange-800 text-sm font-medium">
            {data?.pendingPayments.count} ta bron to'lovini kutmoqda —{' '}
            {formatCurrency(data?.pendingPayments.totalOwed ?? 0)} qarzdorlik
          </p>
        </div>
      )}
    </div>
  )
}
