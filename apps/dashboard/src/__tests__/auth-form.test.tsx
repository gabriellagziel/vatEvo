import { render, screen } from '@testing-library/react'
import AuthForm from '@/components/auth-form'

describe('AuthForm', () => {
  it('renders sign in form', () => {
    render(<AuthForm />)
    expect(screen.getByText(/Sign In/i)).toBeInTheDocument()
  })

  it('renders create tenant option', () => {
    render(<AuthForm />)
    expect(screen.getByText(/Need a tenant\? Create one here/i)).toBeInTheDocument()
  })
})
