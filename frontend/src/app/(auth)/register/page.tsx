'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Bot, Loader2 } from 'lucide-react';

import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  orgName: z.string().min(2, 'Organization name must be at least 2 characters').max(100, 'Organization name is too long'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/register', data);
      setAuth(response.data.user, response.data.access_token);
      toast.success('Account created successfully!');
      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      toast.error(error.response?.data?.error?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl">
      <CardHeader className="space-y-3 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
          <Bot className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
        <CardDescription className="text-muted-foreground">
          Enter your details to get started with SupportGPT
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              placeholder="John Doe"
              className="bg-white/5 border-white/10 focus-visible:ring-indigo-500"
              {...register('fullName')}
            />
            {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="orgName">Organization Name</Label>
            <Input
              id="orgName"
              placeholder="Acme Corp"
              className="bg-white/5 border-white/10 focus-visible:ring-indigo-500"
              {...register('orgName')}
            />
            {errors.orgName && <p className="text-sm text-destructive">{errors.orgName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              className="bg-white/5 border-white/10 focus-visible:ring-indigo-500"
              {...register('email')}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              className="bg-white/5 border-white/10 focus-visible:ring-indigo-500"
              {...register('password')}
            />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Sign up'}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-transparent px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <Button variant="outline" type="button" className="w-full border-white/10 bg-white/5 hover:bg-white/10">
          <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
          </svg>
          Google
        </Button>
      </CardContent>
      <CardFooter className="flex justify-center border-t border-white/5 pt-6">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-indigo-400 hover:text-indigo-300">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

