import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, XCircle, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { bookingsApi } from '../api/bookings'
import { paymentsApi } from '../api/payments'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Spinner } from '../components/ui/Spinner'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import {
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
  CANCELLATION_REASON_LABELS,
  formatDate,
  formatTime,
  formatCurrency,
  formatDateTime,
} from '../utils/formatters'

export function BookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [showCancel, setShowCancel] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [cancelReason, setCancelReason] = useState('customer_request')
  const [cancelNote, setCancelNote] = useState('')
  const [payAmount, setPayAmount] = useState('')
  const [payMethod, setPayMethod] = useState('cash')

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingsApi.findOne(id!),
  })

  const { data: paymentData } = useQuery({
    queryKey: ['payments', id],
    queryFn: () => paymentsApi.findByBooking(id!),
    enabled: !!id,
  })

  const { data: history = [] } = useQuery({
    queryKey: ['booking-history', id],
    queryFn: () => bookingsApi.findHistory(id!),
  })

  const cancelMutation = useMutation({
    mutationFn: () =>
      bookingsApi.cancel(id!, { reason: cancelReason, note: cancelNote }),
    onSuccess: () => {
      toast.success('Bron bekor qilindi')
      setShowCancel(false)
      qc.invalidateQueries({ queryKey: ['booking', id] })
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Xatolik'),
  })

  const paymentMutation = useMutation({
    mutationFn: () =>
      paymentsApi.create({ bookingId: id!, amount: Number(payAmount), paymentMethod: payMethod }),
    onSuccess: () => {
      toast.success("To'lov qo'shildi")
      setShowPayment(false)
      setPayAmount('')
      qc.invalidateQueries({ queryKey: ['payments', id] })
      qc.invalidateQueries({ queryKey: ['booking', id] })
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Xatolik'),
  })

  const deletePaymentMutation = useMutation({
    mutationFn: (payId: string) => paymentsApi.remove(payId),
    onSuccess: () => {
      toast.success("To'lov o'chirildi")
      qc.invalidateQueries({ queryKey: ['payments', id] })
      qc.invalidateQueries({ queryKey: ['booking', id] })
    },
  })

  if (isLoading) return <Spinner className="mt-20" />
  if (!booking) return <p className="text-center mt-20 text-gray-400">Bron topilmadi</p>

  const canCancel = booking.status !== 'cancelled' && booking.status !== 'completed'

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{booking.customerFullName}</h1>
          <p className="text-gray-400 text-sm">{booking.customerPhone}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge label={BOOKING_STATUS_LABELS[booking.status]} colorClass={BOOKING_STATUS_COLORS[booking.status]} />
          <Badge label={PAYMENT_STATUS_LABELS[booking.paymentStatus]} colorClass={PAYMENT_STATUS_COLORS[booking.paymentStatus]} />
        </div>
        {canCancel && (
          <Button variant="danger" size="sm" onClick={() => setShowCancel(true)}>
            <XCircle size={15} />
            Bekor qilish
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking info */}
        <Card title="Bron ma'lumotlari">
          <dl className="flex flex-col gap-3 text-sm">
            {[
              ['Sana', formatDate(booking.date)],
              ['Vaqt', `${formatTime(booking.startTime)} – ${formatTime(booking.endTime)}`],
              ['Soatlar soni', `${booking.totalHours} soat`],
              ['Soatlik narx', formatCurrency(booking.hourlyPrice)],
              ['Jami summa', formatCurrency(booking.totalPrice)],
              ['Yaratilgan', booking.createdBy?.fullName ?? '—'],
              ['Sana', formatDateTime(booking.createdAt)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <dt className="text-gray-500">{label}</dt>
                <dd className="font-medium text-gray-900 text-right">{value}</dd>
              </div>
            ))}
            {booking.status === 'cancelled' && (
              <>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Bekor sababi</dt>
                  <dd className="font-medium text-gray-900">
                    {CANCELLATION_REASON_LABELS[booking.cancellationReason ?? ''] ?? '—'}
                  </dd>
                </div>
                {booking.cancellationNote && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Izoh</dt>
                    <dd className="font-medium text-gray-900 text-right max-w-48">{booking.cancellationNote}</dd>
                  </div>
                )}
              </>
            )}
          </dl>
        </Card>

        {/* Payments */}
        <Card
          title="To'lovlar"
          action={
            canCancel && (
              <Button size="sm" onClick={() => setShowPayment(true)}>
                <Plus size={14} /> To'lov qo'shish
              </Button>
            )
          }
        >
          {!paymentData || paymentData.payments.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">To'lovlar yo'q</p>
          ) : (
            <div className="flex flex-col gap-2">
              {paymentData.payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(p.amount)}</p>
                    <p className="text-xs text-gray-400">{p.paymentMethod} · {formatDateTime(p.createdAt)}</p>
                  </div>
                  <button
                    onClick={() => deletePaymentMutation.mutate(p.id)}
                    className="p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-500 transition"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
              <div className="flex justify-between pt-2 text-sm font-semibold">
                <span>To'langan</span>
                <span className="text-green-600">{formatCurrency(paymentData.totalPaid)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Qoldi</span>
                <span className="text-red-600">{formatCurrency(paymentData.remaining)}</span>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* History */}
      {history.length > 0 && (
        <Card title="O'zgarishlar tarixi">
          <div className="flex flex-col gap-3">
            {history.map((h) => (
              <div key={h.id} className="flex gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">{h.changeDescription}</p>
                  <p className="text-gray-400 text-xs">
                    {h.changedBy?.fullName ?? 'Tizim'} · {formatDateTime(h.changedAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Cancel Modal */}
      <Modal open={showCancel} onClose={() => setShowCancel(false)} title="Bronni bekor qilish" size="sm">
        <div className="flex flex-col gap-4">
          <Select
            label="Bekor qilish sababi"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          >
            <option value="customer_request">Mijoz talabi</option>
            <option value="electricity_outage">Svet yo'q</option>
            <option value="weather_conditions">Ob-havo</option>
            <option value="field_issues">Maydon muammosi</option>
            <option value="emergency">Favqulodda holat</option>
          </Select>
          <Input
            label="Izoh (ixtiyoriy)"
            placeholder="..."
            value={cancelNote}
            onChange={(e) => setCancelNote(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowCancel(false)}>Yopish</Button>
            <Button variant="danger" loading={cancelMutation.isPending} onClick={() => cancelMutation.mutate()}>
              Bekor qilish
            </Button>
          </div>
        </div>
      </Modal>

      {/* Payment Modal */}
      <Modal open={showPayment} onClose={() => setShowPayment(false)} title="To'lov qo'shish" size="sm">
        <form
          onSubmit={(e) => { e.preventDefault(); paymentMutation.mutate() }}
          className="flex flex-col gap-4"
        >
          <Input
            label="Summa (so'm)"
            type="number"
            placeholder="500000"
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
            required
          />
          <Select
            label="To'lov usuli"
            value={payMethod}
            onChange={(e) => setPayMethod(e.target.value)}
          >
            <option value="cash">Naqd</option>
            <option value="card">Karta</option>
            <option value="transfer">O'tkazma</option>
          </Select>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setShowPayment(false)}>Yopish</Button>
            <Button type="submit" loading={paymentMutation.isPending}>Saqlash</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
