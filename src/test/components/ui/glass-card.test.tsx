import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GlassCard } from '@/components/ui/glass-card'

describe('GlassCard Component', () => {
  describe('Basic Rendering', () => {
    it('should render children content', () => {
      render(<GlassCard>Hello World</GlassCard>)
      expect(screen.getByText('Hello World')).toBeInTheDocument()
    })

    it('should render with default glassmorphism styles', () => {
      const { container } = render(<GlassCard>Content</GlassCard>)
      const card = container.firstChild as HTMLElement
      expect(card.className).toContain('glass-card')
    })

    it('should apply custom className', () => {
      const { container } = render(
        <GlassCard className="custom-class">Content</GlassCard>
      )
      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('custom-class')
    })

    it('should pass through other HTML div attributes', () => {
      const { container } = render(
        <GlassCard data-testid="card" id="my-card">
          Content
        </GlassCard>
      )
      const card = container.firstChild as HTMLElement
      expect(card).toHaveAttribute('data-testid', 'card')
      expect(card).toHaveAttribute('id', 'my-card')
    })
  })

  describe('Variants', () => {
    it('should render with default variant', () => {
      const { container } = render(<GlassCard>Content</GlassCard>)
      const card = container.firstChild as HTMLElement
      expect(card.className).toContain('variant-default')
    })

    it('should render with elevated variant', () => {
      const { container } = render(<GlassCard variant="elevated">Content</GlassCard>)
      const card = container.firstChild as HTMLElement
      expect(card.className).toContain('variant-elevated')
    })

    it('should render with subtle variant', () => {
      const { container } = render(<GlassCard variant="subtle">Content</GlassCard>)
      const card = container.firstChild as HTMLElement
      expect(card.className).toContain('variant-subtle')
    })
  })

  describe('Sizes', () => {
    it('should render with default size', () => {
      const { container } = render(<GlassCard>Content</GlassCard>)
      const card = container.firstChild as HTMLElement
      expect(card.className).toContain('size-md')
    })

    it('should render with small size', () => {
      const { container } = render(<GlassCard size="sm">Content</GlassCard>)
      const card = container.firstChild as HTMLElement
      expect(card.className).toContain('size-sm')
    })

    it('should render with large size', () => {
      const { container } = render(<GlassCard size="lg">Content</GlassCard>)
      const card = container.firstChild as HTMLElement
      expect(card.className).toContain('size-lg')
    })
  })

  describe('Styling', () => {
    it('should apply glassmorphism blur effect', () => {
      const { container } = render(<GlassCard>Content</GlassCard>)
      const card = container.firstChild as HTMLElement
      const style = window.getComputedStyle(card)
      // Glass effect should have backdrop blur
      expect(card).toHaveStyle({ backdropFilter: expect.stringContaining('blur') })
    })

    it('should have semi-transparent background', () => {
      const { container } = render(<GlassCard>Content</GlassCard>)
      const card = container.firstChild as HTMLElement
      const style = window.getComputedStyle(card)
      // Should have some transparency
      const bg = style.backgroundColor
      expect(bg).toBeTruthy()
    })

    it('should have border with transparency', () => {
      const { container } = render(<GlassCard>Content</GlassCard>)
      const card = container.firstChild as HTMLElement
      const style = window.getComputedStyle(card)
      // Should have border (CSS may format this differently)
      const borderWidth = style.borderWidth
      expect(borderWidth).not.toBe('0px')
    })
  })

  describe('Click Handling', () => {
    it('should handle click events when clickable', () => {
      let clicked = false
      const handleClick = () => { clicked = true }

      const { container } = render(
        <GlassCard clickable onClick={handleClick}>
          Click me
        </GlassCard>
      )

      const card = container.firstChild as HTMLElement
      card.click()
      expect(clicked).toBe(true)
    })

    it('should add clickable class when clickable prop is true', () => {
      const { container } = render(<GlassCard clickable>Content</GlassCard>)
      const card = container.firstChild as HTMLElement
      expect(card.className).toContain('clickable')
    })
  })

  describe('Gradient Border', () => {
    it('should apply gradient border when enabled', () => {
      const { container } = render(<GlassCard gradientBorder>Content</GlassCard>)
      const card = container.firstChild as HTMLElement
      expect(card.className).toContain('gradient-border')
    })
  })
})
