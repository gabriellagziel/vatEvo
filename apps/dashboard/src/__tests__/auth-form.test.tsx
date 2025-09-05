import React from 'react'
import { render, screen } from '@testing-library/react'
import { AuthForm } from '@/components/auth-form'

describe('AuthForm', () => {
  const mockOnAuthSuccess = jest.fn()

  it('renders sign in form', () => {
    render(<AuthForm onAuthSuccess={mockOnAuthSuccess} />)
    expect(screen.getByText(/Sign In/i)).toBeInTheDocument()
  })

  it('renders create tenant option', () => {
    render(<AuthForm onAuthSuccess={mockOnAuthSuccess} />)
    expect(screen.getByText(/Need a tenant\? Create one here/i)).toBeInTheDocument()
  })
})
