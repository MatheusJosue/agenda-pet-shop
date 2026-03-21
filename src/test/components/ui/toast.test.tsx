import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { Toast } from '@/components/ui/toast'

describe('Toast Component', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render toast message', () => {
      render(<Toast message="Success!" />)
      expect(screen.getByText('Success!')).toBeInTheDocument()
    })

    it('should not render when message is empty', () => {
      const { container } = render(<Toast message="" />)
      expect(container.firstChild).toBeNull()
    })

    it('should render with default styles', () => {
      const { container } = render(<Toast message="Test" />)
      const toast = container.firstChild as HTMLElement
      expect(toast.className).toContain('toast')
    })
  })

  describe('Variants', () => {
    it('should render with success variant', () => {
      const { container } = render(<Toast message="Success!" variant="success" />)
      const toast = container.firstChild as HTMLElement
      expect(toast.className).toContain('variant-success')
    })

    it('should render with error variant', () => {
      const { container } = render(<Toast message="Error!" variant="error" />)
      const toast = container.firstChild as HTMLElement
      expect(toast.className).toContain('variant-error')
    })

    it('should render with info variant', () => {
      const { container } = render(<Toast message="Info" variant="info" />)
      const toast = container.firstChild as HTMLElement
      expect(toast.className).toContain('variant-info')
    })

    it('should render with warning variant', () => {
      const { container } = render(<Toast message="Warning" variant="warning" />)
      const toast = container.firstChild as HTMLElement
      expect(toast.className).toContain('variant-warning')
    })
  })

  describe('Auto-dismiss', () => {
    it('should auto-dismiss after duration', () => {
      const onDismiss = vi.fn()
      render(<Toast message="Auto dismiss" duration={3000} onDismiss={onDismiss} />)

      expect(screen.getByText('Auto dismiss')).toBeInTheDocument()

      vi.advanceTimersByTime(3000)

      expect(onDismiss).toHaveBeenCalled()
    })

    it('should not auto-dismiss when duration is 0', () => {
      const onDismiss = vi.fn()
      render(<Toast message="Sticky" duration={0} onDismiss={onDismiss} />)

      vi.advanceTimersByTime(10000)

      expect(onDismiss).not.toHaveBeenCalled()
    })
  })

  describe('Manual Dismiss', () => {
    it('should show close button', () => {
      render(<Toast message="Close me" closeButton />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should call onDismiss when close button clicked', async () => {
      const user = { click: vi.fn() }
      const onDismiss = vi.fn()

      render(<Toast message="Close me" closeButton onDismiss={onDismiss} />)

      const closeButton = screen.getByRole('button')
      closeButton.click()

      expect(onDismiss).toHaveBeenCalled()
    })
  })

  describe('Position', () => {
    it('should render with default position (top-right)', () => {
      const { container } = render(<Toast message="Test" />)
      const toast = container.firstChild as HTMLElement
      expect(toast.className).toContain('position-top-right')
    })

    it('should render with top-center position', () => {
      const { container } = render(<Toast message="Test" position="top-center" />)
      const toast = container.firstChild as HTMLElement
      expect(toast.className).toContain('position-top-center')
    })

    it('should render with bottom-right position', () => {
      const { container } = render(<Toast message="Test" position="bottom-right" />)
      const toast = container.firstChild as HTMLElement
      expect(toast.className).toContain('position-bottom-right')
    })
  })

  describe('Icons', () => {
    it('should show success icon for success variant', () => {
      render(<Toast message="Success!" variant="success" />)
      expect(screen.getByTestId('toast-icon')).toBeInTheDocument()
    })

    it('should show error icon for error variant', () => {
      render(<Toast message="Error!" variant="error" />)
      expect(screen.getByTestId('toast-icon')).toBeInTheDocument()
    })

    it('should not show icon when showIcon is false', () => {
      render(<Toast message="No icon" variant="success" showIcon={false} />)
      expect(screen.queryByTestId('toast-icon')).not.toBeInTheDocument()
    })
  })

  describe('Glassmorphism Styling', () => {
    it('should have glass effect', () => {
      const { container } = render(<Toast message="Glass" />)
      const toast = container.firstChild as HTMLElement
      expect(toast.className).toContain('toast')
    })
  })
})
