import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'

// Add custom render method with providers if needed
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Custom matchers
export const toHaveValidClasses = (received: HTMLElement, expected: string[]) => {
  const classList = Array.from(received.classList)
  const hasAllClasses = expected.every(className => classList.includes(className))
  
  return {
    message: () => 
      hasAllClasses 
        ? `Expected element NOT to have classes: ${expected.join(', ')}`
        : `Expected element to have classes: ${expected.join(', ')}, but got: ${classList.join(', ')}`,
    pass: hasAllClasses
  }
}