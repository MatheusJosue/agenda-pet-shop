import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  describe('Basic Rendering', () => {
    it('should render children content', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByRole('button')).toHaveTextContent('Click me')
    })

    it('should render with default styles', () => {
      const { container } = render(<Button>Click</Button>)
      const button = container.firstChild as HTMLElement
      expect(button.className).toContain('button')
    })

    it('should apply custom className', () => {
      const { container } = render(<Button className="custom-class">Click</Button>)
      const button = container.firstChild as HTMLElement
      expect(button.className).toContain('custom-class')
    })

    it('should pass through HTML button attributes', () => {
      render(<Button disabled type="submit">Click</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'submit')
      expect(button).toBeDisabled()
    })
  })

  describe('Variants', () => {
    it('should render with primary variant by default', () => {
      const { container } = render(<Button>Click</Button>)
      const button = container.firstChild as HTMLElement
      expect(button.className).toContain('variant-primary')
    })

    it('should render with secondary variant', () => {
      const { container } = render(<Button variant="secondary">Click</Button>)
      const button = container.firstChild as HTMLElement
      expect(button.className).toContain('variant-secondary')
    })

    it('should render with outline variant', () => {
      const { container } = render(<Button variant="outline">Click</Button>)
      const button = container.firstChild as HTMLElement
      expect(button.className).toContain('variant-outline')
    })

    it('should render with ghost variant', () => {
      const { container } = render(<Button variant="ghost">Click</Button>)
      const button = container.firstChild as HTMLElement
      expect(button.className).toContain('variant-ghost')
    })
  })

  describe('Sizes', () => {
    it('should render with medium size by default', () => {
      const { container } = render(<Button>Click</Button>)
      const button = container.firstChild as HTMLElement
      expect(button.className).toContain('size-md')
    })

    it('should render with small size', () => {
      const { container } = render(<Button size="sm">Click</Button>)
      const button = container.firstChild as HTMLElement
      expect(button.className).toContain('size-sm')
    })

    it('should render with large size', () => {
      const { container } = render(<Button size="lg">Click</Button>)
      const button = container.firstChild as HTMLElement
      expect(button.className).toContain('size-lg')
    })
  })

  describe('Click Handling', () => {
    it('should call onClick handler when clicked', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()

      render(<Button onClick={handleClick}>Click me</Button>)

      await user.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should not call onClick when disabled', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()

      render(<Button onClick={handleClick} disabled>Click me</Button>)

      await user.click(screen.getByRole('button'))
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Loading State', () => {
    it('should show loading spinner when loading', () => {
      render(<Button loading>Loading</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('loading')
      expect(button).toHaveAttribute('data-loading', 'true')
    })

    it('should be disabled when loading', () => {
      render(<Button loading>Loading</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('should not call onClick when loading', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()

      render(<Button onClick={handleClick} loading>Loading</Button>)

      await user.click(screen.getByRole('button'))
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Glassmorphism Styling', () => {
    it('should have gradient effect on primary variant', () => {
      const { container } = render(<Button variant="primary">Click</Button>)
      const button = container.firstChild as HTMLElement
      // Primary variant uses gradient
      expect(button.className).toContain('variant-primary')
    })

    it('should have glass effect on secondary variant', () => {
      const { container } = render(<Button variant="secondary">Click</Button>)
      const button = container.firstChild as HTMLElement
      // Secondary variant uses glassmorphism
      expect(button.className).toContain('variant-secondary')
    })
  })
})
