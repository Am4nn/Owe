import { View, Text } from 'react-native'
import Svg, { Path, Circle } from 'react-native-svg'
import { theme } from '@/lib/theme'

/**
 * SpendingDonutChart
 *
 * Ring / donut chart for the Insights screen showing spending breakdown
 * by category.
 *
 * Design matches insights_updated_navigation:
 * - Large SVG donut ring (thick arc segments, rounded stroke caps)
 * - Centre text: "Spent Total" caption + bold total amount
 * - 2×2 grid of category legend cards below (coloured dot + name + amount)
 *
 * Built with react-native-svg — no extra dependencies.
 *
 * Used in:
 * - insights_updated_navigation
 *
 * Usage:
 *   <SpendingDonutChart
 *     totalLabel="Spent Total"
 *     totalAmount="$2,845"
 *     segments={[
 *       { label: 'Food & Dining', amount: '$1,138', color: '#3B82F6', percent: 40 },
 *       { label: 'Transport',     amount: '$711',   color: '#8B5CF6', percent: 25 },
 *       { label: 'Entertainment', amount: '$569',   color: '#EF4444', percent: 20 },
 *       { label: 'Misc',          amount: '$427',   color: '#64748B', percent: 15 },
 *     ]}
 *   />
 */

export interface DonutSegment {
  label: string
  amount: string
  color: string
  /** Percentage of total (0-100). Segments should sum to 100. */
  percent: number
}

export interface SpendingDonutChartProps {
  segments: DonutSegment[]
  totalLabel?: string
  totalAmount?: string
  /** Outer radius of the donut ring in logical pixels */
  radius?: number
  /** Stroke width of the ring */
  strokeWidth?: number
}

// Converts polar coordinates to cartesian x/y
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  }
}

// Builds an SVG arc path string for a single donut segment
function arcPath(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string {
  const gap = 2 // degrees gap between segments
  const s = startAngle + gap / 2
  const e = endAngle - gap / 2
  if (e <= s) return ''
  const start = polarToCartesian(cx, cy, r, s)
  const end = polarToCartesian(cx, cy, r, e)
  const largeArc = e - s > 180 ? 1 : 0
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`
}

export function SpendingDonutChart({
  segments,
  totalLabel = 'Spent Total',
  totalAmount,
  radius = 90,
  strokeWidth = 22,
}: SpendingDonutChartProps) {
  const size = (radius + strokeWidth / 2 + 4) * 2
  const cx = size / 2
  const cy = size / 2

  // Build arc angles from percentages
  let cursor = 0
  const arcs = segments.map((seg) => {
    const startAngle = cursor
    const endAngle = cursor + (seg.percent / 100) * 360
    cursor = endAngle
    return { ...seg, startAngle, endAngle }
  })

  // Pair segments into rows of 2 for the legend
  const rows: DonutSegment[][] = []
  for (let i = 0; i < segments.length; i += 2) {
    rows.push(segments.slice(i, i + 2))
  }

  return (
    <View style={{ alignItems: 'center' }}>
      {/* Ring chart */}
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size}>
          {/* Background track */}
          <Circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={strokeWidth}
          />

          {/* Coloured segments */}
          {arcs.map((arc) => {
            const d = arcPath(cx, cy, radius, arc.startAngle, arc.endAngle)
            if (!d) return null
            return (
              <Path
                key={arc.label}
                d={d}
                fill="none"
                stroke={arc.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />
            )
          })}
        </Svg>

        {/* Centre label */}
        <View
          style={{
            position: 'absolute',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontSize: theme.typography.caption,
              color: theme.colors.text.tertiary,
              fontWeight: '500',
              marginBottom: 2,
            }}
          >
            {totalLabel}
          </Text>
          {totalAmount ? (
            <Text
              style={{
                fontSize: 22,
                fontWeight: '800',
                color: theme.colors.text.primary,
                letterSpacing: -0.5,
              }}
            >
              {totalAmount}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Category legend — 2-column grid */}
      <View style={{ width: '100%', gap: theme.spacing.sm, marginTop: theme.spacing.md }}>
        {rows.map((row, rowIdx) => (
          <View key={rowIdx} style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
            {row.map((seg) => (
              <View
                key={seg.label}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  backgroundColor: theme.colors.dark.elevated,
                  borderRadius: theme.radii.md,
                  borderWidth: 1,
                  borderColor: theme.colors.glass.border,
                  paddingHorizontal: theme.spacing.md,
                  paddingVertical: theme.spacing.md,
                }}
              >
                {/* Colour dot */}
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: seg.color,
                    flexShrink: 0,
                  }}
                />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    style={{
                      fontSize: theme.typography.caption,
                      color: theme.colors.text.secondary,
                      fontWeight: '500',
                    }}
                    numberOfLines={1}
                  >
                    {seg.label}
                  </Text>
                  <Text
                    style={{
                      fontSize: theme.typography.bodySm,
                      fontWeight: '700',
                      color: theme.colors.text.primary,
                      marginTop: 1,
                    }}
                    numberOfLines={1}
                  >
                    {seg.amount}
                  </Text>
                </View>
              </View>
            ))}
            {/* Fill empty cell if odd count */}
            {row.length === 1 && <View style={{ flex: 1 }} />}
          </View>
        ))}
      </View>
    </View>
  )
}
