import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { analyticsApi } from '../api/analytics'
import { Card } from '../components/ui/Card'
import { Spinner } from '../components/ui/Spinner'
import { formatCurrency } from '../utils/formatters'

export function AnalyticsPage() {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)

  const { data: yearly, isLoading: yearlyLoading } = useQuery({
    queryKey: ['analytics-yearly', year],
    queryFn: () => analyticsApi.getYearlyRevenue(year),
  })

  const { data: busiestHours, isLoading: hoursLoading } = useQuery({
    queryKey: ['analytics-busiest-hours'],
    queryFn: () => analyticsApi.getBusiestHours(),
  })

  const { data: adminStats, isLoading: adminLoading } = useQuery({
    queryKey: ['analytics-admins'],
    queryFn: () => analyticsApi.getAdminStats(),
  })

  const monthNames = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek']

  // Backend returns { year, totalRevenue, months: [{month, revenue, ...}] }
  const yearlyChartData = yearly?.months?.map((item) => ({
    month: monthNames[(item.month ?? 1) - 1],
    revenue: Number(item.revenue ?? 0),
  })) ?? []

  // Backend returns [{ hour, bookings }]
  const hoursChartData = Array.isArray(busiestHours)
    ? busiestHours.map((h) => ({
        hour: `${h.hour}:00`,
        bookings: h.bookings,
      }))
    : []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tahlil</h1>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white"
        >
          {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Yearly revenue chart */}
      <Card title={`${year} yil oylik daromad`}>
        {yearlyLoading ? (
          <Spinner className="h-48" />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={yearlyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`}
              />
              <Tooltip formatter={(v) => [formatCurrency(Number(v ?? 0)), 'Daromad']} />
              <Bar dataKey="revenue" fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Busiest hours */}
      <Card title="Eng band soatlar">
        {hoursLoading ? (
          <Spinner className="h-48" />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={hoursChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip formatter={(v) => [Number(v ?? 0), 'Bronlar']} />
              <Bar dataKey="bookings" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Admin stats */}
      <Card title="Admin statistikasi">
        {adminLoading ? (
          <Spinner className="h-20" />
        ) : !adminStats?.length ? (
          <p className="text-gray-400 text-sm text-center py-4">Ma'lumot yo'q</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-100">
                <th className="pb-2 font-medium text-gray-500">Admin</th>
                <th className="pb-2 font-medium text-gray-500">Bronlar</th>
                <th className="pb-2 font-medium text-gray-500">Daromad</th>
                <th className="pb-2 font-medium text-gray-500">Bekor %</th>
              </tr>
            </thead>
            <tbody>
              {adminStats.map((a) => (
                <tr key={a.adminId} className="border-b border-gray-50">
                  <td className="py-2 font-medium text-gray-900">{a.adminName}</td>
                  <td className="py-2 text-gray-700">{a.totalBookings}</td>
                  <td className="py-2 text-gray-700">{formatCurrency(a.revenue)}</td>
                  <td className="py-2 text-gray-700">{a.cancellationRate.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}
