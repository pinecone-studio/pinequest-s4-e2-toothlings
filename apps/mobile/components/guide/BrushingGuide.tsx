import { ScrollView } from 'react-native'
import { useState } from 'react'
import { useFloatingTabBarPad } from '@/lib/tabBarLayout'
import AgeGroupSelector, { AgeGroup } from './AgeGroupSelector'
import BrushingStepGrid from './BrushingStepGrid'
import BrushingTip from './BrushingTip'
import { BrushingStep } from './BrushingStepCard'

const STEPS: Record<AgeGroup, BrushingStep[]> = {
  young: [
    { name: 'Гадна тал', description: 'Дугуй хөдөлгөөн' },
    { name: 'Дотор тал', description: 'Дээш доош' },
    { name: 'Зажлах тал', description: 'Урагш хойш' },
    { name: 'Хэлээ', description: 'Хойноос урагш шүүрдэх хөдөлгөөнөөр' },
  ],
  older: [
    { name: 'Гадна тал', description: 'Дээш доош шүдтэй зэрэгцээ байрлалд' },
    { name: 'Дотор тал', description: 'Дээш доош шүдтэй босоо байрлалд' },
    { name: 'Зажлах тал', description: 'Урагш хойш' },
    { name: 'Хэлээ', description: 'Хойноос урагш шүүрдэх хөдөлгөөнөөр' },
  ],
}

const TIPS: Record<AgeGroup, string> = {
  young:
    '7–12 насанд зажлууртай хатуу юм идэх (мах, хатуу ааруул гэх мэт). Ингэснээр байнгын шүдний зай тавигдана.',
  older:
    '12+ насанд шүдээ угаахдааа хоёр минут зарцуулах нь зайлшгүй. Шүдний утас хэрэглэхийг санаарай.',
}

export default function BrushingGuide() {
  const [group, setGroup] = useState<AgeGroup>('young')
  const tabBarPad = useFloatingTabBarPad()

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: tabBarPad }} showsVerticalScrollIndicator={false}>
      <AgeGroupSelector selected={group} onSelect={setGroup} />
      <BrushingStepGrid steps={STEPS[group]} />
      <BrushingTip text={TIPS[group]} />
    </ScrollView>
  )
}
