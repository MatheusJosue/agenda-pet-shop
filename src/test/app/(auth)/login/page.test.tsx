import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import LoginPage from '@/app/(auth)/login/page'

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
}))

// Mock the server action
vi.mock('@/lib/actions/auth', () => ({
  login: vi.fn()
}))

// Mock React's useActionState
const mockUseActionState = vi.fn()
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>()
  return {
    ...actual,
    useActionState: (...args: unknown[]) => mockUseActionState(...args)
  }
})

describe('Login Page', () => {
  beforeEach(() => {
    // Reset mock to default state before each test
    mockUseActionState.mockReturnValue([{}, vi.fn(), false])
  })

  describe('Basic Rendering', () => {
    it('should render login form with heading', () => {
      render(<LoginPage />)
      expect(screen.getByRole('heading', { name: /bem-vindo/i })).toBeInTheDocument()
    })

    it('should render subtitle', () => {
      render(<LoginPage />)
      expect(screen.getByText(/entre na sua conta/i)).toBeInTheDocument()
    })

    it('should render email input', () => {
      render(<LoginPage />)
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    })

    it('should render password input', () => {
      render(<LoginPage />)
      expect(screen.getByLabelText(/senha/i)).toBeInTheDocument()
    })

    it('should render submit button', () => {
      render(<LoginPage />)
      expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
    })

    it('should render register link', () => {
      render(<LoginPage />)
      expect(screen.getByRole('link', { name: /criar conta/i })).toBeInTheDocument()
    })
  })

  describe('Error Display', () => {
    it('should show error message from server action', async () => {
      mockUseActionState.mockReturnValue([
        { error: 'Credenciais inválidas' },
        vi.fn(),
        false
      ])
      render(<LoginPage />)

      await waitFor(() => {
        expect(screen.getByText(/credenciais inválidas/i)).toBeInTheDocument()
      })
    })
  })

  describe('Loading State', () => {
    it('should show loading state when pending', () => {
      mockUseActionState.mockReturnValue([{}, vi.fn(), true])
      render(<LoginPage />)

      expect(screen.getByRole('button', { name: /entrando/i })).toBeInTheDocument()
    })

    it('should show normal submit button when not pending', () => {
      mockUseActionState.mockReturnValue([{}, vi.fn(), false])
      render(<LoginPage />)

      expect(screen.getByRole('button', { name: /^entrar$/i })).toBeInTheDocument()
    })
  })

  describe('Form Structure', () => {
    it('should have form with proper input types', () => {
      render(<LoginPage />)

      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
      const passwordInput = screen.getByLabelText(/senha/i) as HTMLInputElement

      expect(emailInput.type).toBe('email')
      expect(passwordInput.type).toBe('password')
    })

    it('should have email autocomplete enabled', () => {
      render(<LoginPage />)
      expect(screen.getByLabelText(/email/i)).toHaveAttribute('autoComplete', 'email')
    })

    it('should have password autocomplete enabled', () => {
      render(<LoginPage />)
      expect(screen.getByLabelText(/senha/i)).toHaveAttribute('autoComplete', 'current-password')
    })

    it('should have required fields', () => {
      render(<LoginPage />)

      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
      const passwordInput = screen.getByLabelText(/senha/i) as HTMLInputElement

      expect(emailInput.required).toBe(true)
      expect(passwordInput.required).toBe(true)
    })
  })

  describe('Glassmorphism Styling', () => {
    it('should have glass card container', () => {
      const { container } = render(<LoginPage />)
      const card = container.querySelector('[class*="glass-card"]')
      expect(card).toBeInTheDocument()
    })
  })

  describe('Link Navigation', () => {
    it('should have link to register page', () => {
      render(<LoginPage />)
      const link = screen.getByRole('link', { name: /criar conta/i })
      expect(link).toHaveAttribute('href', '/register')
    })
  })
})
