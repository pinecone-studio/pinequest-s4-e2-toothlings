import { View } from 'react-native'

type Props = { mode: 'upper' | 'lower' }

// canine → lateral → central → central → lateral → canine
const TEETH = [
  { w: 17, h: 30 },
  { w: 21, h: 36 },
  { w: 27, h: 42 },
  { w: 27, h: 42 },
  { w: 21, h: 36 },
  { w: 17, h: 30 },
]
const GAP = 3
const BW = 2.5
const COLOR = '#FFFFFF'

export default function ToothGuide({ mode }: Props) {
  const isUpper = mode === 'upper'

  return (
    <View style={{ flexDirection: 'row', gap: GAP, alignItems: isUpper ? 'flex-start' : 'flex-end' }}>
      {TEETH.map(({ w, h }, i) => {
        const tipR = h / 2.8
        return (
          <View
            key={i}
            style={{
              width: w,
              height: h,
              borderWidth: BW,
              borderColor: COLOR,
              borderTopLeftRadius: isUpper ? 3 : tipR,
              borderTopRightRadius: isUpper ? 3 : tipR,
              borderBottomLeftRadius: isUpper ? tipR : 3,
              borderBottomRightRadius: isUpper ? tipR : 3,
            }}
          />
        )
      })}
    </View>
  )
}
