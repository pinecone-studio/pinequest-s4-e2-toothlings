import { useSafeAreaInsets } from 'react-native-safe-area-context'

// Shared geometry for the floating glass tab bar so screens and the bar agree.
export const TAB_BAR_HEIGHT = 64
export const TAB_BAR_RADIUS = 28
export const TAB_BAR_SIDE_INSET = 20 // left/right gap — matches Home's card padding
export const TAB_BAR_BOTTOM_GAP = 6 // gap between the bar and the screen bottom

/**
 * Bottom padding for a tab screen's scroll/list content. Screens render UNDER
 * the floating bar (so the glass blurs their content), so each scroll pads its
 * last item clear of the bar. Use together with a SafeAreaView whose `edges`
 * EXCLUDE 'bottom'.
 */
export const useFloatingTabBarPad = () => {
  const insets = useSafeAreaInsets()
  return (insets.bottom || 12) + TAB_BAR_BOTTOM_GAP + TAB_BAR_HEIGHT + 16
}
