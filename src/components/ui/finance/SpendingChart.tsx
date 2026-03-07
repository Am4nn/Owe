import { View, Text } from 'react-native'
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Line, Text as SvgText } from 'react-native-svg'
import { theme } from '@/lib/theme'

/**
 * SpendingChart
 *
 * SVG line chart visualising monthly spending or balance trends.
 * Built with react-native-svg (already installed — no extra dependency).
 *
 * Features:
 * - Smooth curved line (cubic bezier) in brand purple
 * - Gradient area fill (purple → transparent)
 * - X-axis month labels
 * - Y-axis amount labels (auto-scaled)
 * - Active data point highlight dot
 * - Optional zero line for balance charts
 *
 * Used in:
 * - insights_updated_navigation
 *
 * Usage:
 *   <SpendingChart
 *     data={[
 *       { label: 'Jan', value: 12000 },
 *       { label: 'Feb', value: 8500 },
 *       { label: 'Mar', value: 15000 },
 *     ]}
 *     height={160}
 *   />
 */

export interface SpendingDataPoint {
  /** Short label for x-axis (e.g. "Jan", "Feb") */
  label: string
  /** Value in integer cents */
  value: number
}

export interface SpendingChartProps {
  data: SpendingDataPoint[]
  height?: number
  currency?: string
  /** Index of the highlighted/active data point */
  activeIndex?: number
  /** When true, draws a zero baseline (useful for net balance charts) */
  showZeroLine?: boolean
  /** Accent colour for the line (defaults to brand primary) */
  color?: string
}

// Pad min/max for visual breathing room
const V_PAD = 0.15

function formatYLabel(cents: number, currency: string): string {
  const abs = Math.abs(cents)
  if (abs >= 100000) return `${currency}${(cents / 100000).toFixed(1)}k`
  if (abs >= 10000) return `${currency}${(cents / 10000).toFixed(1)}k`
  return `${currency}${(cents / 100).toFixed(0)}`
}

// Smooth cubic bezier path through points
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return ''
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1]
    const curr = pts[i]
    const cp1x = prev.x + (curr.x - prev.x) / 3
    const cp1y = prev.y
    const cp2x = curr.x - (curr.x - prev.x) / 3
    const cp2y = curr.y
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`
  }
  return d
}

const X_LABEL_HEIGHT = 20
const Y_LABEL_WIDTH = 40

export function SpendingChart({
  data,
  height = 180,
  currency = '$',
  activeIndex,
  showZeroLine = false,
  color = theme.colors.brand.primary,
}: SpendingChartProps) {
  if (data.length === 0) {
    return (
      <View
        style={{
          height,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.dark.surface,
          borderRadius: theme.radii.card,
          borderWidth: 1,
          borderColor: theme.colors.glass.border,
        }}
      >
        <Text style={{ color: theme.colors.text.tertiary, fontSize: theme.typography.bodySm }}>
          No data available
        </Text>
      </View>
    )
  }

  const chartHeight = height - X_LABEL_HEIGHT
  const values = data.map((d) => d.value)
  const rawMin = Math.min(...values)
  const rawMax = Math.max(...values)
  const range = rawMax - rawMin || 1

  const yMin = rawMin - range * V_PAD
  const yMax = rawMax + range * V_PAD

  // Map value → y coordinate (top = 0, bottom = chartHeight)
  const toY = (v: number) => chartHeight - ((v - yMin) / (yMax - yMin)) * chartHeight

  // Chart drawing area starts after Y label column
  const chartWidth_placeholder = 300 // We don't know actual width, use onLayout or fixed

  return (
    <View
      style={{
        backgroundColor: theme.colors.dark.surface,
        borderRadius: theme.radii.card,
        borderWidth: 1,
        borderColor: theme.colors.glass.border,
        padding: theme.spacing.base,
        overflow: 'hidden',
      }}
    >
      <View style={{ height }}>
        <ChartCanvas
          data={data}
          height={height}
          chartHeight={chartHeight}
          yMin={yMin}
          yMax={yMax}
          toY={toY}
          currency={currency}
          activeIndex={activeIndex}
          showZeroLine={showZeroLine}
          color={color}
        />
      </View>
    </View>
  )
}

// ── Inner canvas with onLayout ─────────────────────────────────────────────────

import { useState } from 'react'
import type { LayoutChangeEvent } from 'react-native'

interface CanvasProps {
  data: SpendingDataPoint[]
  height: number
  chartHeight: number
  yMin: number
  yMax: number
  toY: (v: number) => number
  currency: string
  activeIndex?: number
  showZeroLine: boolean
  color: string
}

function ChartCanvas({
  data,
  height,
  chartHeight,
  yMin,
  yMax,
  toY,
  currency,
  activeIndex,
  showZeroLine,
  color,
}: CanvasProps) {
  const [width, setWidth] = useState(0)

  const handleLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width)
  }

  if (width === 0) {
    return <View style={{ flex: 1 }} onLayout={handleLayout} />
  }

  const drawWidth = width - Y_LABEL_WIDTH
  const n = data.length
  const xStep = n > 1 ? drawWidth / (n - 1) : drawWidth / 2

  const pts = data.map((d, i) => ({
    x: Y_LABEL_WIDTH + i * xStep,
    y: toY(d.value),
  }))

  const linePath = smoothPath(pts)

  // Close path for gradient fill (line → bottom-right → bottom-left)
  const areaPath = linePath
    + ` L ${pts[pts.length - 1].x} ${chartHeight} L ${pts[0].x} ${chartHeight} Z`

  // Y-axis labels (3 levels)
  const yLevels = [yMax, yMin + (yMax - yMin) / 2, yMin]

  // Zero line y
  const zeroY = toY(0)
  const showZero = showZeroLine && zeroY > 0 && zeroY < chartHeight

  return (
    <View style={{ flex: 1 }} onLayout={handleLayout}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0.3" />
            <Stop offset="1" stopColor={color} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Y-axis gridlines */}
        {yLevels.map((level, i) => {
          const y = toY(level)
          return (
            <Line
              key={i}
              x1={Y_LABEL_WIDTH}
              y1={y}
              x2={width}
              y2={y}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          )
        })}

        {/* Zero line */}
        {showZero && (
          <Line
            x1={Y_LABEL_WIDTH}
            y1={zeroY}
            x2={width}
            y2={zeroY}
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1"
          />
        )}

        {/* Area fill */}
        <Path d={areaPath} fill="url(#areaGrad)" />

        {/* Line */}
        <Path
          d={linePath}
          stroke={color}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {pts.map((pt, i) => {
          const isActive = activeIndex === i
          return (
            <Circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={isActive ? 5 : 3}
              fill={isActive ? color : theme.colors.dark.surface}
              stroke={color}
              strokeWidth={isActive ? 0 : 2}
            />
          )
        })}

        {/* Y-axis labels */}
        {yLevels.map((level, i) => {
          const y = toY(level)
          return (
            <SvgText
              key={i}
              x={Y_LABEL_WIDTH - 6}
              y={y + 4}
              textAnchor="end"
              fontSize="9"
              fill="rgba(148,163,184,0.7)"
            >
              {formatYLabel(level, currency)}
            </SvgText>
          )
        })}

        {/* X-axis labels */}
        {data.map((d, i) => (
          <SvgText
            key={i}
            x={Y_LABEL_WIDTH + i * xStep}
            y={height - 2}
            textAnchor="middle"
            fontSize="10"
            fill={activeIndex === i ? color : 'rgba(148,163,184,0.7)'}
            fontWeight={activeIndex === i ? 'bold' : 'normal'}
          >
            {d.label}
          </SvgText>
        ))}
      </Svg>
    </View>
  )
}
