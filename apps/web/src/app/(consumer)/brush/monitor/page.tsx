import { redirect } from 'next/navigation'

export default function BrushMonitorRedirect() {
  redirect('/brush?tab=monitor')
}
