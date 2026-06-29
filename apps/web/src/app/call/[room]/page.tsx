'use client'

import { useParams } from 'next/navigation'
import CallSession from '@/components/call/CallSession'

const CallPage = () => {
  const params = useParams<{ room: string }>()
  return <CallSession roomId={params.room} />
}

export default CallPage
