import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import RegisterPage from '@/app/(auth)/register/page'

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
}))

// Mock the server action
vi.mock('@/lib/actions/auth', () => ({
  register: vi.fn()
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

describe('Register Page', () => {
  beforeEach(() => {
    // Reset mock to default state before each test
    mockUseActionState.mockReturnValue([{}, vi.fn(), false])
  })

  describe('Basic Rendering', () => {
    it('should render register form with heading', () => {
      render(<RegisterPage />)
      expect(screen.getByRole('heading', { name: /criar conta/i })).toBeInTheDocument()
    })

    it('should render subtitle', () => {
      render(<RegisterPage />)
      expect(screen.getByText(/preencha seus dados para se cadastrar/i)).toBeInTheDocument()
    })

    it('should render name input', () => {
      render(<RegisterPage />)
      expect(screen.getByLabelText(/nome/i)).toBeInTheDocument()
    })

    it('should render email input', () => {
      render(<RegisterPage />)
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    })

    it('should render password input', () => {
      render(<RegisterPage />)
      expect(screen.getByLabelText(/senha/i)).toBeInTheDocument()
    })

    it('should render invite code input', () => {
      render(<RegisterPage />)
      expect(screen.getByLabelText(/código de convite/i)).toBeInTheDocument()
    })

    it('should render submit button', () => {
      render(<RegisterPage />)
      expect(screen.getByRole('button', { name: /criar conta/i })).toBeInTheDocument()
    })

    it('should render login link', () => {
      render(<RegisterPage />)
      expect(screen.getByRole('link', { name: /fazer login/i })).toBeInTheDocument()
    })
  })

  describe('Error Display', () => {
    it('should show error message from server action', async () => {
      mockUseActionState.mockReturnValue([
        { error: 'Código de convite inválido' },
        vi.fn(),
        false
      ])
      render(<RegisterPage />)

      await waitFor(() => {
        expect(screen.getByText(/código de convite inválido/i)).toBeInTheDocument()
      })
    })
  })

  describe('Loading State', () => {
    it('should show loading state when pending', () => {
      mockUseActionState.mockReturnValue([{}, vi.fn(), true])
      render(<RegisterPage />)

      expect(screen.getByRole('button', { name: /criando/i })).toBeInTheDocument()
    })

    it('should show normal submit button when not pending', () => {
      mockUseActionState.mockReturnValue([{}, vi.fn(), false])
      render(<RegisterPage />)

      expect(screen.getByRole('button', { name: /^criar conta$/i })).toBeInTheDocument()
    })
  })

  describe('Form Structure', () => {
    it('should have form with proper input types', () => {
      render(<RegisterPage />)

      const nameInput = screen.getByLabelText(/nome/i) as HTMLInputElement
      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
      const passwordInput = screen.getByLabelText(/senha/i) as HTMLInputElement
      const inviteCodeInput = screen.getByLabelText(/código/i) as HTMLInputElement

      expect(nameInput.type).toBe('text')
      expect(emailInput.type).toBe('email')
      expect(passwordInput.type).toBe('password')
      expect(inviteCodeInput.type).toBe('text')
    })

    it('should have proper autocomplete attributes', () => {
      render(<RegisterPage />)

      expect(screen.getByLabelText(/nome/i)).toHaveAttribute('autoComplete', 'name')
      expect(screen.getByLabelText(/email/i)).toHaveAttribute('autoComplete', 'email')
      expect(screen.getByLabelText(/senha/i)).toHaveAttribute('autoComplete', 'new-password')
    })

    it('should have required fields', () => {
      render(<RegisterPage />)

      const nameInput = screen.getByLabelText(/nome/i) as HTMLInputElement
      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
      const passwordInput = screen.getByLabelText(/senha/i) as HTMLInputElement
      const inviteCodeInput = screen.getByLabelText(/código/i) as HTMLInputElement

      expect(nameInput.required).toBe(true)
      expect(emailInput.required).toBe(true)
      expect(passwordInput.required).toBe(true)
      expect(inviteCodeInput.required).toBe(true)
    })

    it('should have maxlength on invite code', () => {
      render(<RegisterPage />)
      const inviteCodeInput = screen.getByLabelText(/código/i) as HTMLInputElement
      expect(inviteCodeInput.maxLength).toBe(6)
    })
  })

  describe('Glassmorphism Styling', () => {
    it('should have glass card container', () => {
      const { container } = render(<RegisterPage />)
      const card = container.querySelector('[class*="glass-card"]')
      expect(card).toBeInTheDocument()
    })
  })

  describe('Link Navigation', () => {
    it('should have link to login page', () => {
      render(<RegisterPage />)
      const link = screen.getByRole('link', { name: /fazer login/i })
      expect(link).toHaveAttribute('href', '/login')
    })

    it('should show "já tem uma conta" label', () => {
      render(<RegisterPage />)
      expect(screen.getByText(/já tem uma conta/i)).toBeInTheDocument()
    })
  })
})
