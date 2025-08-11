import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button, buttonVariants } from '../../ui/button'

describe('Button Component', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Button>Click me</Button>)
      
      const button = screen.getByRole('button', { name: /click me/i })
      expect(button).toBeDefined()
      expect(button.className).toContain('inline-flex')
      expect(button.className).toContain('items-center')
      expect(button.className).toContain('justify-center')
    })

    it('renders with custom className', () => {
      render(<Button className="custom-class">Test</Button>)
      
      const button = screen.getByRole('button')
      expect(button.className).toContain('custom-class')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>()
      render(<Button ref={ref}>Test</Button>)
      
      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    })
  })

  describe('Variants', () => {
    it('renders default variant', () => {
      render(<Button variant="default">Default</Button>)
      
      const button = screen.getByRole('button')
      expect(button.className).toContain('bg-gradient-to-r')
      expect(button.className).toContain('from-emerald-600')
      expect(button.className).toContain('to-teal-600')
    })

    it('renders destructive variant', () => {
      render(<Button variant="destructive">Delete</Button>)
      
      const button = screen.getByRole('button')
      expect(button.className).toContain('from-red-600')
      expect(button.className).toContain('to-red-700')
    })

    it('renders outline variant', () => {
      render(<Button variant="outline">Outline</Button>)
      
      const button = screen.getByRole('button')
      expect(button.className).toContain('border-2')
      expect(button.className).toContain('border-emerald-200')
    })

    it('renders secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>)
      
      const button = screen.getByRole('button')
      expect(button.className).toContain('from-slate-100')
      expect(button.className).toContain('to-slate-200')
    })

    it('renders ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>)
      
      const button = screen.getByRole('button')
      expect(button.className).toContain('text-emerald-700')
      expect(button.className).toContain('hover:bg-emerald-50')
    })

    it('renders link variant', () => {
      render(<Button variant="link">Link</Button>)
      
      const button = screen.getByRole('button')
      expect(button.className).toContain('text-emerald-600')
      expect(button.className).toContain('underline-offset-4')
    })

    it('renders premium variant', () => {
      render(<Button variant="premium">Premium</Button>)
      
      const button = screen.getByRole('button')
      expect(button.className).toContain('from-amber-500')
      expect(button.className).toContain('via-orange-500')
      expect(button.className).toContain('to-red-500')
    })
  })

  describe('Sizes', () => {
    it('renders default size', () => {
      render(<Button size="default">Default Size</Button>)
      
      const button = screen.getByRole('button')
      expect(button.className).toContain('h-12')
      expect(button.className).toContain('px-6')
      expect(button.className).toContain('py-3')
    })

    it('renders small size', () => {
      render(<Button size="sm">Small</Button>)
      
      const button = screen.getByRole('button')
      expect(button.className).toContain('h-10')
      expect(button.className).toContain('px-4')
      expect(button.className).toContain('py-2')
    })

    it('renders large size', () => {
      render(<Button size="lg">Large</Button>)
      
      const button = screen.getByRole('button')
      expect(button.className).toContain('h-14')
      expect(button.className).toContain('px-8')
      expect(button.className).toContain('py-4')
    })

    it('renders extra large size', () => {
      render(<Button size="xl">Extra Large</Button>)
      
      const button = screen.getByRole('button')
      expect(button.className).toContain('h-16')
      expect(button.className).toContain('px-10')
      expect(button.className).toContain('py-5')
    })

    it('renders icon size', () => {
      render(<Button size="icon">Icon</Button>)
      
      const button = screen.getByRole('button')
      expect(button.className).toContain('h-12')
      expect(button.className).toContain('w-12')
    })

    it('renders wide size', () => {
      render(<Button size="wide">Wide</Button>)
      
      const button = screen.getByRole('button')
      expect(button.className).toContain('px-12')
      expect(button.className).toContain('min-w-[200px]')
    })
  })

  describe('States', () => {
    it('handles disabled state', () => {
      render(<Button disabled>Disabled</Button>)
      
      const button = screen.getByRole('button')
      expect((button as HTMLButtonElement).disabled).toBe(true)
      expect(button.className).toContain('disabled:pointer-events-none')
      expect(button.className).toContain('disabled:opacity-50')
    })

    it('has focus styles', () => {
      render(<Button>Focusable</Button>)
      
      const button = screen.getByRole('button')
      expect(button.className).toContain('focus-visible:outline-none')
      expect(button.className).toContain('focus-visible:ring-2')
      expect(button.className).toContain('focus-visible:ring-offset-2')
    })

    it('has active styles', () => {
      render(<Button>Active</Button>)
      
      const button = screen.getByRole('button')
      expect(button.className).toContain('active:scale-95')
    })
  })

  describe('Interactions', () => {
    it('handles click events', async () => {
      const handleClick = jest.fn()
      const user = userEvent.setup()
      
      render(<Button onClick={handleClick}>Click me</Button>)
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('does not trigger click when disabled', async () => {
      const handleClick = jest.fn()
      const user = userEvent.setup()
      
      render(<Button onClick={handleClick} disabled>Disabled</Button>)
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('handles keyboard events', () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Press Enter</Button>)
      
      const button = screen.getByRole('button')
      button.focus()
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' })
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('handles form submission', () => {
      const handleSubmit = jest.fn(e => e.preventDefault())
      
      render(
        <form onSubmit={handleSubmit}>
          <Button type="submit">Submit</Button>
        </form>
      )
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      expect(handleSubmit).toHaveBeenCalledTimes(1)
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<Button aria-label="Custom label">Icon Only</Button>)
      
      const button = screen.getByRole('button')
      expect(button.getAttribute('aria-label')).toBe('Custom label')
    })

    it('supports ARIA pressed state', () => {
      render(<Button aria-pressed="true">Toggle</Button>)
      
      const button = screen.getByRole('button')
      expect(button.getAttribute('aria-pressed')).toBe('true')
    })

    it('is keyboard navigable', () => {
      render(
        <div>
          <Button>First</Button>
          <Button>Second</Button>
        </div>
      )
      
      const buttons = screen.getAllByRole('button')
      buttons[0].focus()
      
      expect(document.activeElement).toBe(buttons[0])
    })

    it('supports custom ARIA attributes', () => {
      render(
        <Button 
          aria-describedby="help-text" 
          aria-expanded="false"
          role="button"
        >
          Accessible Button
        </Button>
      )
      
      const button = screen.getByRole('button')
      expect(button.getAttribute('aria-describedby')).toBe('help-text')
      expect(button.getAttribute('aria-expanded')).toBe('false')
    })
  })

  describe('Custom Props', () => {
    it('forwards HTML button attributes', () => {
      render(
        <Button 
          type="submit" 
          name="submit-button" 
          value="submit"
          data-testid="custom-button"
        >
          Submit
        </Button>
      )
      
      const button = screen.getByTestId('custom-button')
      expect(button.getAttribute('type')).toBe('submit')
      expect(button.getAttribute('name')).toBe('submit-button')
      expect(button.getAttribute('value')).toBe('submit')
    })

    it('merges className with variant classes', () => {
      render(<Button className="m-4 custom-class" variant="outline">Test</Button>)
      
      const button = screen.getByRole('button')
      expect(button.className).toContain('m-4')
      expect(button.className).toContain('custom-class')
      expect(button.className).toContain('border-2')
      expect(button.className).toContain('border-emerald-200')
    })

    it('supports data attributes', () => {
      render(
        <Button 
          data-track="button-click"
          data-category="navigation"
        >
          Track Me
        </Button>
      )
      
      const button = screen.getByRole('button')
      expect(button.getAttribute('data-track')).toBe('button-click')
      expect(button.getAttribute('data-category')).toBe('navigation')
    })
  })

  describe('ButtonVariants Function', () => {
    it('returns correct classes for default variant and size', () => {
      const classes = buttonVariants()
      
      expect(classes).toContain('inline-flex')
      expect(classes).toContain('items-center')
      expect(classes).toContain('justify-center')
      expect(classes).toContain('bg-gradient-to-r')
      expect(classes).toContain('from-emerald-600')
      expect(classes).toContain('to-teal-600')
    })

    it('returns correct classes for custom variant and size', () => {
      const classes = buttonVariants({ variant: 'destructive', size: 'lg' })
      
      expect(classes).toContain('from-red-600')
      expect(classes).toContain('to-red-700')
      expect(classes).toContain('h-14')
      expect(classes).toContain('px-8')
    })

    it('handles custom className', () => {
      const classes = buttonVariants({ className: 'custom-class' })
      
      expect(classes).toContain('custom-class')
    })

    it('handles all variant combinations', () => {
      const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link', 'premium'] as const
      const sizes = ['default', 'sm', 'lg', 'xl', 'icon', 'wide'] as const
      
      variants.forEach(variant => {
        sizes.forEach(size => {
          const classes = buttonVariants({ variant, size })
          expect(typeof classes).toBe('string')
          expect(classes.length).toBeGreaterThan(0)
        })
      })
    })
  })

  describe('Design System Integration', () => {
    it('maintains consistent spacing and typography', () => {
      render(<Button>Design System</Button>)
      
      const button = screen.getByRole('button')
      expect(button.className).toContain('text-sm')
      expect(button.className).toContain('font-medium')
      expect(button.className).toContain('whitespace-nowrap')
    })

    it('has consistent focus states across variants', () => {
      const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const
      
      variants.forEach(variant => {
        const { unmount } = render(<Button variant={variant}>Focus Test</Button>)
        const button = screen.getByRole('button')
        
        expect(button.className).toContain('focus-visible:ring-2')
        expect(button.className).toContain('focus-visible:ring-offset-2')
        
        unmount()
      })
    })

    it('has consistent rounded corners', () => {
      render(<Button>Rounded</Button>)
      
      const button = screen.getByRole('button')
      expect(button.className).toContain('rounded-xl')
    })

    it('has consistent transition effects', () => {
      render(<Button>Transition</Button>)
      
      const button = screen.getByRole('button')
      expect(button.className).toContain('transition-all')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty children', () => {
      render(<Button></Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeDefined()
    })

    it('handles null children', () => {
      render(<Button>{null}</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeDefined()
    })

    it('handles multiple children', () => {
      render(
        <Button>
          <span>Icon</span>
          <span>Text</span>
        </Button>
      )
      
      const button = screen.getByRole('button')
      expect(button.textContent).toBe('IconText')
      expect(button.children).toHaveLength(2)
    })

    it('handles conditional rendering', () => {
      const showIcon = true
      render(
        <Button>
          {showIcon && <span data-testid="icon">📁</span>}
          Text
        </Button>
      )
      
      expect(screen.getByTestId('icon')).toBeDefined()
      expect(screen.getByRole('button').textContent).toBe('📁Text')
    })

    it('handles very long text content', () => {
      const longText = 'This is a very long button text that might cause layout issues'
      render(<Button>{longText}</Button>)
      
      const button = screen.getByRole('button')
      expect(button.textContent).toBe(longText)
      expect(button.className).toContain('whitespace-nowrap')
    })
  })

  describe('Performance', () => {
    it('does not re-render unnecessarily', () => {
      let renderCount = 0
      const TestButton = React.memo(() => {
        renderCount++
        return <Button>Test</Button>
      })
      
      const { rerender } = render(<TestButton />)
      expect(renderCount).toBe(1)
      
      // Re-render with same props
      rerender(<TestButton />)
      expect(renderCount).toBe(1) // Should not re-render
    })

    it('handles rapid clicks gracefully', async () => {
      const handleClick = jest.fn()
      const user = userEvent.setup()
      
      render(<Button onClick={handleClick}>Rapid Click</Button>)
      
      const button = screen.getByRole('button')
      
      // Simulate rapid clicking
      await user.click(button)
      await user.click(button)
      await user.click(button)
      
      expect(handleClick).toHaveBeenCalledTimes(3)
    })

    it('maintains consistent className generation', () => {
      const classes1 = buttonVariants({ variant: 'default', size: 'lg' })
      const classes2 = buttonVariants({ variant: 'default', size: 'lg' })
      
      expect(classes1).toBe(classes2)
    })
  })

  describe('Type Safety', () => {
    it('accepts valid HTML button props', () => {
      // This test verifies TypeScript compilation
      render(
        <Button
          type="button"
          disabled={false}
          autoFocus={true}
          form="my-form"
          formAction="/submit"
          formEncType="multipart/form-data"
          formMethod="post"
          formNoValidate={true}
          formTarget="_blank"
          name="button-name"
          value="button-value"
        >
          TypeScript Test
        </Button>
      )
      
      const button = screen.getByRole('button')
      expect(button).toBeDefined()
    })

    it('maintains proper ref typing', () => {
      const ref = React.createRef<HTMLButtonElement>()
      render(<Button ref={ref}>Ref Test</Button>)
      
      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
      expect(ref.current?.tagName).toBe('BUTTON')
    })
  })
})