'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      if (data.user) {
        router.push('/dashboard')
      } else {
        setError('Sign in failed. Please try again.')
      }
    } catch (error: any) {
      setError(error.message || 'Sign in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-blue-50 to-white py-8 px-4 font-sans">
      <div className="max-w-md w-full space-y-8 bg-white/90 rounded-2xl shadow-xl p-10" style={{ fontFamily: 'Montserrat, sans-serif' }}>
        <div className="flex flex-col items-center">
          <span className="inline-block bg-[#0071ce] rounded-full p-3 mb-4 shadow">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15h-2v-2h2v2Zm0-4h-2V7h2v6Z"/></svg>
          </span>
          <h2 className="mt-2 text-center text-2xl font-bold text-[#0071ce]">Sign in to Gualmart</h2>
          <p className="mt-1 text-center text-sm text-gray-600">
            Log shelf events and track inventory
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSignIn}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0071ce] focus:border-[#0071ce] sm:text-base transition"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1 appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0071ce] focus:border-[#0071ce] sm:text-base transition"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-bold rounded-lg text-white bg-[#0071ce] hover:bg-[#005fa3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0071ce] disabled:opacity-50 transition"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 