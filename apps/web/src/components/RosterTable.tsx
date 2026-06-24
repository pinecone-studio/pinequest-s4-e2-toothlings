import Link from 'next/link'
import type { Child } from '@pinequest/types'

export const RosterTable = ({ rows }: { rows: Child[] }) => {
  if (rows.length === 0) {
    return <p className="text-sm text-neutral-500">Хүүхэд бүртгэгдээгүй байна.</p>
  }
  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-neutral-200 text-neutral-500">
          <th className="py-2 font-medium">Суудал</th>
          <th className="font-medium">Нэр</th>
          <th className="font-medium">Төрсөн он</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {rows.map((c) => (
          <tr key={c.id} className="border-b border-neutral-100">
            <td className="py-2">{c.rosterSlot}</td>
            <td>
              {c.lastName} {c.firstName}
            </td>
            <td>{c.birthYear}</td>
            <td>
              <Link href={`/admin/children/${c.id}`} className="text-neutral-500 underline">
                Дэлгэрэнгүй
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
