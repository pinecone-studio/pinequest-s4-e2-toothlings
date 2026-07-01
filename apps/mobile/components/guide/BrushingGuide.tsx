import { ScrollView } from 'react-native'
import { useState } from 'react'
import { useFloatingTabBarPad } from '@/lib/tabBarLayout'
import AgeGroupSelector, { AgeGroup } from './AgeGroupSelector'
import BrushingStepGrid from './BrushingStepGrid'
import BrushingTip from './BrushingTip'
import { BrushingStep } from './BrushingStepCard'

const STEPS: Record<AgeGroup, BrushingStep[]> = {
  young: [
    { name: 'Гадна тал', description: 'Дээд доод шүдийг хамт дээш доош чиглэлд' },
    { name: 'Дотор тал', description: 'Дээрээс доош сойзыг шүдтэй босоо байрлалд' },
    { name: 'Зажлах гадаргуу', description: 'Урагш хойш' },
    { name: 'Хэл', description: 'Хойноос урагш шүүрдэх хөдөлгөөнөөр' },
  ],
  older: [
    { name: 'Гадна тал', description: 'Дээд доод шүдийг тусад нь дээрээс доош чиглэлд' },
    { name: 'Дотор тал', description: 'Дээш доош сойзыг шүдтэй босоо байрлалд' },
    { name: 'Зажлах тал', description: 'Урагш хойш' },
    { name: 'Хэлээ', description: 'Хойноос урагш шүүрдэх хөдөлгөөнөөр' },
  ],
}

const TIPS: Record<AgeGroup, string> = {
  young:
    '3-6 насанд зажлууртай хатуу юм идэх (мах, хатуу ааруул гэх мэт). Ингэснээр байнгын шүдэнд зай тавигдана.',
  older:
    '6+ насанд шүдээ угаахдааа хамгийн багадаа хоёр минутын турш зөв угааж хэвшинэ. Шүдний завсрыг угаахын өмнө утсаар цэвэрлэнэ.',
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
