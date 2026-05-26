import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { bookingsApi } from '../../api/bookings'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

interface Props {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

export function CreateBookingModal({ open, onClose, onCreated }: Props) {
  const [form, setForm] = useState({
    customerFullName: '',
    customerPhone: '',
    date: '',
    startTime: '',
    endTime: '',
  })

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const { mutate, isPending } = useMutation({
    mutationFn: () => bookingsApi.create(form),
    onSuccess: () => {
      toast.success('Bron muvaffaqiyatli yaratildi')
      setForm({ customerFullName: '', customerPhone: '', date: '', startTime: '', endTime: '' })
      onCreated()
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.message ?? 'Xatolik yuz berdi')
    },
  })

  return (
    <Modal open={open} onClose={onClose} title="Yangi bron yaratish">
      <form
        onSubmit={(e) => { e.preventDefault(); mutate() }}
        className="flex flex-col gap-4"
      >
        <Input
          label="Mijoz to'liq ismi"
          placeholder="Abdullayev Sardor"
          value={form.customerFullName}
          onChange={(e) => set('customerFullName', e.target.value)}
          required
        />
        <Input
          label="Telefon raqam"
          placeholder="+998901234567"
          value={form.customerPhone}
          onChange={(e) => set('customerPhone', e.target.value)}
          required
        />
        <Input
          label="Sana"
          type="date"
          value={form.date}
          onChange={(e) => set('date', e.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Boshlanish vaqti"
            type="text"
            placeholder="09:00"
            pattern="^([01]\d|2[0-3]):[0-5]\d$"
            title="HH:MM (masalan: 09:00, 14:30)"
            value={form.startTime}
            onChange={(e) => set('startTime', e.target.value)}
            required
          />
          <Input
            label="Tugash vaqti"
            type="text"
            placeholder="11:00"
            pattern="^([01]\d|2[0-3]):[0-5]\d$"
            title="HH:MM (masalan: 09:00, 14:30)"
            value={form.endTime}
            onChange={(e) => set('endTime', e.target.value)}
            required
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button type="submit" loading={isPending}>
            Yaratish
          </Button>
        </div>
      </form>
    </Modal>
  )
}
