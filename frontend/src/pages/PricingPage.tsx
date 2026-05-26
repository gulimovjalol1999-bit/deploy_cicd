import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'
import { pricingApi } from '../api/pricing'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Spinner } from '../components/ui/Spinner'
import { formatCurrency, formatDateTime } from '../utils/formatters'

export function PricingPage() {
  const qc = useQueryClient()
  const [newPrice, setNewPrice] = useState('')
  const [editing, setEditing] = useState(false)

  const { data: current, isLoading } = useQuery({
    queryKey: ['pricing-current'],
    queryFn: pricingApi.getCurrent,
  })

  const { data: history = [] } = useQuery({
    queryKey: ['pricing-history'],
    queryFn: pricingApi.getHistory,
  })

  const updateMutation = useMutation({
    mutationFn: () => pricingApi.update(Number(newPrice)),
    onSuccess: () => {
      toast.success('Narx yangilandi')
      setEditing(false)
      setNewPrice('')
      qc.invalidateQueries({ queryKey: ['pricing-current'] })
      qc.invalidateQueries({ queryKey: ['pricing-history'] })
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Xatolik'),
  })

  if (isLoading) return <Spinner className="mt-20" />

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">Narxlar</h1>

      <Card title="Joriy narx">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center">
            <DollarSign size={24} className="text-green-600" />
          </div>
          <div className="flex-1">
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(current?.hourlyPrice ?? 0)}
            </p>
            <p className="text-sm text-gray-500">soatiga</p>
          </div>
          {!editing ? (
            <Button variant="secondary" onClick={() => setEditing(true)}>Narxni o'zgartirish</Button>
          ) : (
            <div className="flex items-end gap-2">
              <Input
                label="Yangi narx (so'm)"
                type="number"
                placeholder="150000"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
              />
              <Button loading={updateMutation.isPending} onClick={() => updateMutation.mutate()}>
                Saqlash
              </Button>
              <Button variant="ghost" onClick={() => setEditing(false)}>Bekor</Button>
            </div>
          )}
        </div>
      </Card>

      <Card title="Narxlar tarixi">
        {(history as any[]).length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">Tarix yo'q</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-100">
                <th className="pb-2 font-medium text-gray-500">Narx</th>
                <th className="pb-2 font-medium text-gray-500">Samarali sana</th>
                <th className="pb-2 font-medium text-gray-500">Kim o'zgartirdi</th>
                <th className="pb-2 font-medium text-gray-500">Vaqt</th>
              </tr>
            </thead>
            <tbody>
              {(history as any[]).map((h) => (
                <tr key={h.id} className="border-b border-gray-50">
                  <td className="py-2 font-medium text-gray-900">{formatCurrency(h.hourlyPrice)}</td>
                  <td className="py-2 text-gray-600">{h.effectiveFrom}</td>
                  <td className="py-2 text-gray-600">{h.changedBy?.fullName ?? '—'}</td>
                  <td className="py-2 text-gray-400">{formatDateTime(h.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}
