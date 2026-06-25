import { redirect } from 'next/navigation'

export default function BrushInstructionsRedirect() {
  redirect('/brush?tab=instructions')
}
