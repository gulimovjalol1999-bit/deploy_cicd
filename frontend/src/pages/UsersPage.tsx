import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, UserX, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { usersApi } from '../api/users'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Spinner } from '../components/ui/Spinner'
import { formatDate } from '../utils/formatters'

export function UsersPage() {
  const qc = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ username: '', fullName: '', password: '', role: 'admin' })

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.findAll,
  })

  const createMutation = useMutation({
    mutationFn: () => usersApi.create(form),
    onSuccess: () => {
      toast.success('Foydalanuvchi yaratildi')
      setShowCreate(false)
      setForm({ username: '', fullName: '', password: '', role: 'admin' })
      qc.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Xatolik'),
  })

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => usersApi.deactivate(id),
    onSuccess: () => {
      toast.success("Foydalanuvchi o'chirildi")
      qc.invalidateQueries({ queryKey: ['users'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.remove(id),
    onSuccess: () => {
      toast.success("Foydalanuvchi o'chirildi")
      qc.invalidateQueries({ queryKey: ['users'] })
    },
  })

  if (isLoading) return <Spinner className="mt-20" />

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Foydalanuvchilar</h1>
        <Button onClick={() => setShowCreate(true)}>
          <Plus size={16} />
          Yangi admin
        </Button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left">
              <th className="px-4 py-3 font-medium text-gray-500">Ism</th>
              <th className="px-4 py-3 font-medium text-gray-500">Username</th>
              <th className="px-4 py-3 font-medium text-gray-500">Rol</th>
              <th className="px-4 py-3 font-medium text-gray-500">Holat</th>
              <th className="px-4 py-3 font-medium text-gray-500">Yaratilgan</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{u.fullName}</td>
                <td className="px-4 py-3 text-gray-600">{u.username}</td>
                <td className="px-4 py-3">
                  <Badge
                    label={u.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                    colorClass={u.role === 'super_admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}
                  />
                </td>
                <td className="px-4 py-3">
                  <Badge
                    label={u.isActive ? 'Faol' : 'Nofaol'}
                    colorClass={u.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}
                  />
                </td>
                <td className="px-4 py-3 text-gray-500">{formatDate(u.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    {u.isActive && (
                      <button
                        onClick={() => deactivateMutation.mutate(u.id)}
                        className="p-1.5 rounded-lg hover:bg-orange-50 text-gray-300 hover:text-orange-500 transition"
                        title="Deaktivatsiya"
                      >
                        <UserX size={15} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteMutation.mutate(u.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition"
                      title="O'chirish"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Yangi admin yaratish" size="sm">
        <form
          onSubmit={(e) => { e.preventDefault(); createMutation.mutate() }}
          className="flex flex-col gap-4"
        >
          <Input
            label="To'liq ism"
            placeholder="Abdullayev Sardor"
            value={form.fullName}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
            required
          />
          <Input
            label="Username"
            type="text"
            placeholder="sardor01"
            value={form.username}
            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
            required
          />
          <Input
            label="Parol"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            required
          />
          <Select
            label="Rol"
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
          >
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </Select>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>Bekor</Button>
            <Button type="submit" loading={createMutation.isPending}>Yaratish</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
