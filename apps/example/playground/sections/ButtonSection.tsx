import React from 'react'
import { ScrollView } from 'react-native'
import { Text, Button, Flex, Box, useColor } from 'radix-native'
import type { ButtonSize, ButtonVariant, RadiusToken, AccentColor } from 'radix-native'
import { BookmarkSimple, Heart, ArrowRight, DownloadSimple, Share, Plus, MagnifyingGlass, PaperPlaneTilt } from 'phosphor-react-native'
import { ComponentSection } from '../ui'
import { ALL_COLORS } from '../constants'

const VARIANTS: ButtonVariant[] = ['classic', 'solid', 'soft', 'surface', 'outline', 'ghost']
const SIZES: ButtonSize[] = [1, 2, 3, 4]
const RADII: { label: string; value: RadiusToken }[] = [
  { label: 'No radius', value: 'none' },
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
  { label: 'Large', value: 'large' },
  { label: 'Full', value: 'full' },
]

const LABEL = 'Next \u2192'

function ColHeader({ label, center }: { label: string; center?: boolean }) {
  const color = useColor('gray-9')
  return (
    <Text
      size={1}
      weight="medium"
      style={{ color, textAlign: center ? 'center' : undefined }}
    >
      {label}
    </Text>
  )
}

function RowLbl({ label }: { label: string }) {
  const color = useColor('gray-11')
  return (
    <Box width={72} flexShrink={0}>
      <Text size={2} style={{ color }}>
        {label}
      </Text>
    </Box>
  )
}

// ─── Theme colors tab ────────────────────────────────────────────────────────
// Columns: Accent (×2 centered), Gray (×2 centered), Disabled, Loading

function ThemeColors() {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <Flex gap={3}>
        <Flex direction="row" align="center" gap={2}>
          <Box width={72} flexShrink={0} />
          <Flex align="center" style={{ flex: 1 }}>
            <ColHeader label="Accent" center />
          </Flex>
          <Flex align="center" style={{ flex: 1 }}>
            <ColHeader label="Gray" center />
          </Flex>
          <Flex minWidth={100} align="start">
            <ColHeader label="Disabled" />
          </Flex>
          <Flex minWidth={100} align="start">
            <ColHeader label="Loading" />
          </Flex>
        </Flex>

        {VARIANTS.map((variant) => (
          <Flex key={variant} direction="row" align="center" gap={2}>
            <RowLbl label={capitalize(variant)} />
            <Flex direction="row" gap={2} align="center" style={{ flex: 1 }}>
              <Button size={2} variant={variant}>
                {LABEL}
              </Button>
              <Button size={2} variant={variant} highContrast>
                {LABEL}
              </Button>
            </Flex>
            <Flex direction="row" gap={2} align="center" style={{ flex: 1 }}>
              <Button size={2} variant={variant} color="gray">
                {LABEL}
              </Button>
              <Button size={2} variant={variant} color="gray" highContrast>
                {LABEL}
              </Button>
            </Flex>
            <Flex minWidth={100} align="start">
              <Button size={2} variant={variant} disabled>
                {LABEL}
              </Button>
            </Flex>
            <Flex minWidth={100} align="start">
              <Button size={2} variant={variant} loading>
                {LABEL}
              </Button>
            </Flex>
          </Flex>
        ))}
      </Flex>
    </ScrollView>
  )
}

// ─── All colors tab ──────────────────────────────────────────────────────────

function AllColors() {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <Flex gap={3}>
        <Flex direction="row" align="center" gap={2}>
          <Box width={72} flexShrink={0} />
          {VARIANTS.map((v) => (
            <Flex key={v} align="center" style={{ flex: 1 }}>
              <ColHeader label={capitalize(v)} center />
            </Flex>
          ))}
        </Flex>

        {ALL_COLORS.map((color) => (
          <Flex key={color} direction="row" align="center" gap={2}>
            <RowLbl label={capitalize(color)} />
            {VARIANTS.map((variant) => (
              <Flex key={variant} direction="row" gap={2} align="center" style={{ flex: 1 }}>
                <Button size={2} variant={variant} color={color as AccentColor}>
                  {LABEL}
                </Button>
                <Button size={2} variant={variant} color={color as AccentColor} highContrast>
                  {LABEL}
                </Button>
              </Flex>
            ))}
          </Flex>
        ))}
      </Flex>
    </ScrollView>
  )
}

// ─── All sizes tab ───────────────────────────────────────────────────────────

function AllSizes() {
  return (
    <Flex gap={6}>
      {VARIANTS.map((variant) => (
        <ScrollView key={variant} horizontal showsHorizontalScrollIndicator={false}>
          <Flex gap={3}>
            <Flex direction="row" align="center" gap={2}>
              <Box width={72} flexShrink={0}>
                <ColHeader label={capitalize(variant)} />
              </Box>
              {RADII.map((r) => (
                <Flex key={r.value} minWidth={100} align="start">
                  <ColHeader label={r.label} />
                </Flex>
              ))}
            </Flex>

            {SIZES.map((size) => (
              <Flex key={size} direction="row" align="center" gap={2}>
                <RowLbl label={`Size ${size}`} />
                {RADII.map((r) => (
                  <Flex key={r.value} minWidth={100} align="start">
                    <Button size={size} variant={variant} radius={r.value}>
                      {LABEL}
                    </Button>
                  </Flex>
                ))}
              </Flex>
            ))}
          </Flex>
        </ScrollView>
      ))}
    </Flex>
  )
}

// ─── With icons tab ─────────────────────────────────────────────────────────

function WithIcons() {
  return (
    <Flex gap={5}>
      {/* Icon + text combinations */}
      <Flex gap={3}>
        <ColHeader label="Icon + text" />
        <Flex direction="row" wrap="wrap" gap={2} align="center">
          <Button size={2} variant="solid"><BookmarkSimple size={16} weight="bold" /> Bookmark</Button>
          <Button size={2} variant="soft"><Heart size={16} weight="bold" /> Like</Button>
          <Button size={2} variant="surface"><Share size={16} weight="bold" /> Share</Button>
          <Button size={2} variant="outline"><DownloadSimple size={16} weight="bold" /> Download</Button>
          <Button size={2} variant="ghost"><Plus size={16} weight="bold" /> Add</Button>
        </Flex>
      </Flex>

      {/* Text + trailing icon */}
      <Flex gap={3}>
        <ColHeader label="Text + trailing icon" />
        <Flex direction="row" wrap="wrap" gap={2} align="center">
          <Button size={2} variant="solid">Next <ArrowRight size={16} weight="bold" /></Button>
          <Button size={2} variant="soft">Send <PaperPlaneTilt size={16} weight="bold" /></Button>
          <Button size={2} variant="classic">Continue <ArrowRight size={16} weight="bold" /></Button>
        </Flex>
      </Flex>

      {/* All sizes with icon */}
      <Flex gap={3}>
        <ColHeader label="All sizes" />
        <Flex direction="row" wrap="wrap" gap={2} align="center">
          <Button size={1} variant="solid"><MagnifyingGlass size={14} weight="bold" /> Search</Button>
          <Button size={2} variant="solid"><MagnifyingGlass size={16} weight="bold" /> Search</Button>
          <Button size={3} variant="solid"><MagnifyingGlass size={18} weight="bold" /> Search</Button>
          <Button size={4} variant="solid"><MagnifyingGlass size={20} weight="bold" /> Search</Button>
        </Flex>
      </Flex>

      {/* All variants with icon */}
      <Flex gap={3}>
        <ColHeader label="All variants" />
        {VARIANTS.map((variant) => (
          <Flex key={variant} direction="row" gap={2} align="center">
            <Box width={72} flexShrink={0}>
              <Text size={2} style={{ color: '#999' }}>{capitalize(variant)}</Text>
            </Box>
            <Button size={2} variant={variant}><Heart size={16} weight="bold" /> Like</Button>
            <Button size={2} variant={variant} highContrast><Heart size={16} weight="bold" /> Like</Button>
          </Flex>
        ))}
      </Flex>
    </Flex>
  )
}

export function ButtonSection() {
  return (
    <ComponentSection
      title="Button"
      tabs={[
        { id: 'theme-colors', label: 'Theme colors', render: () => <ThemeColors /> },
        { id: 'all-colors', label: 'All colors', render: () => <AllColors /> },
        { id: 'all-sizes', label: 'All sizes', render: () => <AllSizes /> },
        { id: 'with-icons', label: 'With icons', render: () => <WithIcons /> },
      ]}
    />
  )
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
