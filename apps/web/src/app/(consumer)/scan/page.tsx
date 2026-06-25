'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/routes'
import { isQuestionnaireComplete } from '@/lib/consumerState'

/** Scan hub → questionnaire or straight to AI detector */
const ScanHubPage = () => {
  const router = useRouter()

  useEffect(() => {
    router.replace(
      isQuestionnaireComplete() ? ROUTES.scan.camera : ROUTES.scan.questionnaire,
    )
  }, [router])

  return null
}

export default ScanHubPage
