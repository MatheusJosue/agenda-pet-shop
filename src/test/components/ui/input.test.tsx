import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '@/components/ui/input'

describe('Input Component', () => {
  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      render(<Input placeholder="Enter text" />)
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
    })

    it('should render with default styles', () => {
      const { container } = render(<Input />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('wrapper')
    })

    it('should apply custom className', () => {
      const { container } = render(<Input className="custom-class" />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('custom-class')
    })

    it('should pass through HTML input attributes', () => {
      render(<Input type="email" name="email" required />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('type', 'email')
      expect(input).toHaveAttribute('name', 'email')
      expect(input).toBeRequired()
    })
  })

  describe('Variants', () => {
    it('should render with default variant', () => {
      const { container } = render(<Input />)
      const wrapper = container.firstChild as HTMLElement
      const inputWrapper = wrapper.querySelector(':scope > div') as HTMLElement
      expect(inputWrapper.className).toContain('variant-default')
    })

    it('should render with filled variant', () => {
      const { container } = render(<Input variant="filled" />)
      const wrapper = container.firstChild as HTMLElement
      const inputWrapper = wrapper.querySelector(':scope > div') as HTMLElement
      expect(inputWrapper.className).toContain('variant-filled')
    })

    it('should render with underline variant', () => {
      const { container } = render(<Input variant="underline" />)
      const wrapper = container.firstChild as HTMLElement
      const inputWrapper = wrapper.querySelector(':scope > div') as HTMLElement
      expect(inputWrapper.className).toContain('variant-underline')
    })
  })

  describe('Sizes', () => {
    it('should render with medium size by default', () => {
      const { container } = render(<Input />)
      const wrapper = container.firstChild as HTMLElement
      const inputWrapper = wrapper.querySelector(':scope > div') as HTMLElement
      expect(inputWrapper.className).toContain('size-md')
    })

    it('should render with small size', () => {
      const { container } = render(<Input size="sm" />)
      const wrapper = container.firstChild as HTMLElement
      const inputWrapper = wrapper.querySelector(':scope > div') as HTMLElement
      expect(inputWrapper.className).toContain('size-sm')
    })

    it('should render with large size', () => {
      const { container } = render(<Input size="lg" />)
      const wrapper = container.firstChild as HTMLElement
      const inputWrapper = wrapper.querySelector(':scope > div') as HTMLElement
      expect(inputWrapper.className).toContain('size-lg')
    })
  })

  describe('States', () => {
    it('should render with error state', () => {
      const { container } = render(<Input error />)
      const wrapper = container.firstChild as HTMLElement
      const inputWrapper = wrapper.querySelector(':scope > div') as HTMLElement
      expect(inputWrapper.className).toContain('error')
    })

    it('should be disabled when disabled prop is true', () => {
      render(<Input disabled />)
      expect(screen.getByRole('textbox')).toBeDisabled()
    })

    it('should show error message when provided', () => {
      render(<Input error errorMessage="This field is required" />)
      expect(screen.getByText('This field is required')).toBeInTheDocument()
    })

    it('should not show error message when error is false', () => {
      render(<Input errorMessage="This field is required" />)
      expect(screen.queryByText('This field is required')).not.toBeInTheDocument()
    })
  })

  describe('Labels', () => {
    it('should render with label when provided', () => {
      render(<Input label="Email" />)
      expect(screen.getByText('Email')).toBeInTheDocument()
    })

    it('should associate label with input', () => {
      render(<Input label="Email" id="email-input" />)
      const input = screen.getByRole('textbox')
      const label = screen.getByText('Email')
      expect(label).toHaveAttribute('for', 'email-input')
      expect(input).toHaveAttribute('id', 'email-input')
    })

    it('should show required indicator when required', () => {
      render(<Input label="Email" required />)
      expect(screen.getByText('*')).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('should call onChange when user types', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()

      render(<Input onChange={handleChange} />)

      const input = screen.getByRole('textbox')
      await user.type(input, 'hello')

      expect(handleChange).toHaveBeenCalled()
    })

    it('should update value on user input', async () => {
      const user = userEvent.setup()

      render(<Input />)

      const input = screen.getByRole('textbox') as HTMLInputElement
      await user.type(input, 'hello')

      expect(input.value).toBe('hello')
    })

    it('should call onFocus when focused', async () => {
      const user = userEvent.setup()
      const handleFocus = vi.fn()

      render(<Input onFocus={handleFocus} />)

      await user.click(screen.getByRole('textbox'))
      expect(handleFocus).toHaveBeenCalled()
    })

    it('should call onBlur when blurred', async () => {
      const user = userEvent.setup()
      const handleBlur = vi.fn()

      render(<Input onBlur={handleBlur} />)

      const input = screen.getByRole('textbox')
      await user.click(input)
      await user.tab() // Move focus away

      expect(handleBlur).toHaveBeenCalled()
    })
  })

  describe('Left and Right Icons/Elements', () => {
    it('should render left icon', () => {
      render(<Input leftIcon={<span data-testid="left-icon">L</span>} />)
      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
    })

    it('should render right icon', () => {
      render(<Input rightIcon={<span data-testid="right-icon">R</span>} />)
      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
    })

    it('should render both icons', () => {
      render(
        <Input
          leftIcon={<span data-testid="left-icon">L</span>}
          rightIcon={<span data-testid="right-icon">R</span>}
        />
      )
      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
    })
  })

  describe('Glassmorphism Styling', () => {
    it('should have glass effect on default variant', () => {
      const { container } = render(<Input variant="default" />)
      const wrapper = container.firstChild as HTMLElement
      const inputWrapper = wrapper.querySelector(':scope > div') as HTMLElement
      // Should have glassmorphism styling
      expect(inputWrapper.className).toContain('variant-default')
    })
  })
})
