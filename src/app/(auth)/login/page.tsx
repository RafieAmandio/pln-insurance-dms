'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/');
    router.refresh();
  }

  return (
    <>
      {/* Logo */}
      <div className="mb-12 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center overflow-hidden">
          <img src="/logo_pln.png" alt="PLN" className="h-8 w-8 object-contain" />
        </div>
        <span className="text-lg font-semibold tracking-tight">PLN Insurance</span>
      </div>

      {/* Heading */}
      <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
      <p className="mt-2 text-muted-foreground">Please enter your details</p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {error && (
          <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
        {resetSent && (
          <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
            Password reset link sent! Check your email inbox.
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium">
            Email address
          </label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@pln-insurance.co.id"
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox id="remember" />
            <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
              Remember for 30 days
            </label>
          </div>
          <button
            type="button"
            className="text-sm font-medium text-[#022874] hover:underline"
            onClick={async () => {
              if (!email) {
                setError('Enter your email address first, then click Forgot password');
                return;
              }
              setError('');
              const supabase = createClient();
              const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
              if (resetError) {
                setError(resetError.message);
              } else {
                setResetSent(true);
              }
            }}
          >
            Forgot password
          </button>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-[#022874] hover:bg-[#021d5a] text-white"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
    </>
  );
}
