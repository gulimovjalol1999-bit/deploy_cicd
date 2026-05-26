import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, addDays, subDays, parseISO } from 'date-fns'
import { bookingsApi } from '../api/bookings'
import { Spinner } from '../components/ui/Spinner'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import {
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_COLORS,
  formatTime,
  formatCurrency,
} from '../utils/formatters'
import type { Booking } from '../types'
import { useNavigate } from 'react-router-dom'

export function SchedulePage() {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const navigate = useNavigate()

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['schedule', date],
    queryFn: () => bookingsApi.getSchedule(date),
  })

  function prev() { setDate(format(subDays(parseISO(date), 1), 'yyyy-MM-dd')) }
  function next() { setDate(format(addDays(parseISO(date), 1), 'yyyy-MM-dd')) }
  function today() { setDate(format(new Date(), 'yyyy-MM-dd')) }

  const displayDate = format(parseISO(date), 'dd.MM.yyyy')

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Kunlik jadval</h1>
        <Button variant="secondary" size="sm" onClick={today}>Bugun</Button>
      </div>

      {/* Date navigator */}
      <div className="flex items-center gap-3">
        <button
          onClick={prev}
          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex-1 text-center">
          <p className="text-lg font-semibold text-gray-900">{displayDate}</p>
        </div>
        <button
          onClick={next}
          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {isLoading ? (
        <Spinner className="mt-10" />
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">Bu kunda bron yo'q</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {(bookings as Booking[]).map((b) => (
            <div
              key={b.id}
              onClick={() => navigate(`/bookings/${b.id}`)}
              className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4
                hover:border-green-300 hover:shadow-sm transition cursor-pointer"
            >
              {/* Time block */}
              <div className="w-24 flex-shrink-0 text-center">
                <p className="text-sm font-semibold text-gray-900">{formatTime(b.startTime)}</p>
                <div className="h-px bg-gray-200 my-1" />
                <p className="text-sm text-gray-500">{formatTime(b.endTime)}</p>
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{b.customerFullName}</p>
                <p className="text-sm text-gray-500">{b.customerPhone}</p>
              </div>

              <div className="flex flex-col items-end gap-1">
                <Badge
                  label={BOOKING_STATUS_LABELS[b.status]}
                  colorClass={BOOKING_STATUS_COLORS[b.status]}
                />
                <p className="text-sm font-medium text-gray-700">{formatCurrency(b.totalPrice)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
