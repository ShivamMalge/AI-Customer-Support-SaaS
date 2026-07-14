'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Bot, Loader2, Mail } from 'lucide-react';

import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const resetSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ResetForm = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetForm) => {
    setIsLoading(true);
    try {
      await apiClient.post('/auth/password-reset/request', data);
      setIsSubmitted(true);
      toast.success('Reset link sent!');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      toast.error(error.response?.data?.error?.message || 'Failed to request reset. Please try again.');
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
        <CardTitle className="text-2xl font-bold tracking-tight">Reset password</CardTitle>
        <CardDescription className="text-muted-foreground">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isSubmitted ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-4 text-center">
            <div className="rounded-full bg-indigo-500/10 p-3">
              <Mail className="h-6 w-6 text-indigo-400" />
            </div>
            <p className="text-sm text-muted-foreground">
              We have sent a password reset link to your email address. Please check your inbox.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Send reset link'}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex justify-center border-t border-white/5 pt-6">
        <p className="text-sm text-muted-foreground">
          Remember your password?{' '}
          <Link href="/login" className="font-medium text-indigo-400 hover:text-indigo-300">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

