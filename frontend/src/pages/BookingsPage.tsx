import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, SlidersHorizontal } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { bookingsApi } from '../api/bookings'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Spinner } from '../components/ui/Spinner'
import {
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
  formatDate,
  formatTime,
  formatCurrency,
} from '../utils/formatters'
import { CreateBookingModal } from './bookings/CreateBookingModal'
import type { BookingStatus, PaymentStatus } from '../types'

export function BookingsPage() {
  const navigate = useNavigate()
  const [showCreate, setShowCreate] = useState(false)
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState<BookingStatus | ''>('')
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | ''>('')

  const { data: bookings = [], isLoading, refetch } = useQuery({
    queryKey: ['bookings', { phone, status, paymentStatus }],
    queryFn: () =>
      bookingsApi.findAll({
        customerPhone: phone || undefined,
        status: status || undefined,
        paymentStatus: paymentStatus || undefined,
      }),
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Bronlar</h1>
        <Button onClick={() => setShowCreate(true)}>
          <Plus size={16} />
          Yangi bron
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap gap-3">
        <SlidersHorizontal size={18} className="text-gray-400 self-center" />
        <div className="flex-1 min-w-40">
          <Input
            placeholder="Telefon raqam..."
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="w-44">
          <Select value={status} onChange={(e) => setStatus(e.target.value as BookingStatus | '')}>
            <option value="">Barcha holat</option>
            <option value="pending">Kutilmoqda</option>
            <option value="confirmed">Tasdiqlangan</option>
            <option value="completed">Tugallangan</option>
            <option value="cancelled">Bekor qilingan</option>
          </Select>
        </div>
        <div className="w-48">
          <Select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus | '')}
          >
            <option value="">Barcha to'lov</option>
            <option value="unpaid">To'lanmagan</option>
            <option value="partial">Qisman to'langan</option>
            <option value="paid">To'langan</option>
          </Select>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <Spinner className="mt-10" />
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left">
                <th className="px-4 py-3 font-medium text-gray-500">Mijoz</th>
                <th className="px-4 py-3 font-medium text-gray-500">Sana</th>
                <th className="px-4 py-3 font-medium text-gray-500">Vaqt</th>
                <th className="px-4 py-3 font-medium text-gray-500">Summa</th>
                <th className="px-4 py-3 font-medium text-gray-500">Holat</th>
                <th className="px-4 py-3 font-medium text-gray-500">To'lov</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    Bron topilmadi
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr
                    key={b.id}
                    onClick={() => navigate(`/bookings/${b.id}`)}
                    className="border-b border-gray-50 hover:bg-green-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{b.customerFullName}</p>
                      <p className="text-xs text-gray-400">{b.customerPhone}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{formatDate(b.date)}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {formatTime(b.startTime)} – {formatTime(b.endTime)}
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-medium">
                      {formatCurrency(b.totalPrice)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        label={BOOKING_STATUS_LABELS[b.status]}
                        colorClass={BOOKING_STATUS_COLORS[b.status]}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        label={PAYMENT_STATUS_LABELS[b.paymentStatus]}
                        colorClass={PAYMENT_STATUS_COLORS[b.paymentStatus]}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <CreateBookingModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => { setShowCreate(false); refetch() }}
      />
    </div>
  )
}
