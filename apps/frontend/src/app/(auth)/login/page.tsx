'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LogIn, Loader2, MapPin, AlertCircle } from 'lucide-react';
import { useLogin } from '@/hooks/use-auth';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const router = useRouter();
  const { mutate: login, isPending } = useLogin();
  const { isAuthenticated, _hasHydrated, logout } = useAuthStore();

  // If already logged in, redirect; also clear stale state on mount
  useEffect(() => {
    if (_hasHydrated && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [_hasHydrated, isAuthenticated, router]);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginForm) => {
    setApiError('');
    login(data, {
      onSuccess: (res) => {
        router.push(res.user?.role === 'USER' ? '/dashboard' : '/admin');
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.message;
        setApiError(Array.isArray(msg) ? msg.join(', ') : (msg || 'Login failed. Please check your credentials.'));
      },
    });
  };

  const fillDemo = (email: string) => {
    (document.getElementById('email') as HTMLInputElement).value = email;
    (document.getElementById('password') as HTMLInputElement).value = 'Admin@123!';
    setApiError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 h-14 flex items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
            <MapPin className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-gray-900">Indoor<span className="text-primary">Book</span></span>
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Card className="shadow-sm">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <CardDescription>Sign in to your IndoorBook account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

                {/* Inline API Error */}
                {apiError && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{apiError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    {...register('email')}
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={errors.email ? 'border-red-400' : ''}
                  />
                  {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className={`pr-10 ${errors.password ? 'border-red-400' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
                </div>

                <Button type="submit" className="w-full gap-2" disabled={isPending}>
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                  {isPending ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              <div className="mt-5 text-center text-sm text-gray-500">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-primary hover:underline font-medium">
                  Create one free
                </Link>
              </div>

              {/* Demo box — click to fill */}
              <div className="mt-5 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Demo Credentials — click to fill</p>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => fillDemo('admin@indoorbook.com')}
                    className="w-full text-left text-xs text-gray-600 p-2 hover:bg-white hover:border hover:border-gray-200 rounded-lg transition-all"
                  >
                    🛡️ <strong>Admin:</strong> <span className="font-mono">admin@indoorbook.com</span> / <span className="font-mono">Admin@123!</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemo('user@indoorbook.com')}
                    className="w-full text-left text-xs text-gray-600 p-2 hover:bg-white hover:border hover:border-gray-200 rounded-lg transition-all"
                  >
                    👤 <strong>User:</strong> <span className="font-mono">user@indoorbook.com</span> / <span className="font-mono">Admin@123!</span>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
