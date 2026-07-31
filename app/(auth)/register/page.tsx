'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';

export default function RegisterPage() {
  const { register: registerUser, loginWithGoogle } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState<boolean>(false);
  const [registeredEmail, setRegisteredEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await registerUser(data.email, data.password, data.full_name);
      setRegisteredEmail(data.email);
      setShowVerificationModal(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create account. Email may already be registered.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-margin-mobile md:px-margin-desktop">
      <div className="w-full max-w-md flex flex-col gap-md">
        {/* Brand Logo */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-secondary text-on-secondary font-extrabold text-2xl flex items-center justify-center shadow-md">
            K
          </div>
          <h1 className="text-3xl font-extrabold text-on-surface tracking-tight">Join Kindra</h1>
          <p className="text-sm text-on-surface-variant">Create your Citizen Account and start contributing.</p>
        </div>

        {/* Registration Card */}
        <Card className="p-lg gap-md border-outline-variant/30">
          {errorMessage && (
            <div className="bg-error-container text-on-error-container p-3 rounded-lg text-xs font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-md">
            <Input
              label="Full Name"
              placeholder="Jane Doe"
              icon="person"
              error={errors.full_name?.message}
              {...register('full_name')}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              icon="mail"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon="lock"
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              icon="lock_reset"
              error={errors.confirm_password?.message}
              {...register('confirm_password')}
            />

            <Button
              type="submit"
              variant="secondary"
              isLoading={isLoading}
              className="w-full font-bold mt-2"
            >
              Create Account
            </Button>
          </form>

          <div className="text-center text-xs text-on-surface-variant pt-2 border-t border-outline-variant/20">
            Already have an account?{' '}
            <a href="/login" className="font-bold text-primary hover:underline">
              Sign In
            </a>
          </div>
        </Card>
      </div>

      {/* Email Verification Dialog */}
      {showVerificationModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-surface border border-outline-variant/30 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center gap-4 animate-in zoom-in-95 duration-300 relative">
            <button
              onClick={() => setShowVerificationModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            {/* Icon Badge */}
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border-2 border-primary/20 text-primary flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-3xl">mark_email_read</span>
            </div>

            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-black text-on-surface tracking-tight">Check Your Email</h2>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                We've sent a confirmation link to{' '}
                <span className="font-bold text-primary">{registeredEmail}</span>.
              </p>
            </div>

            <div className="bg-primary/5 border border-primary/20 p-4 rounded-2xl text-xs text-on-surface-variant text-left flex items-start gap-3 w-full">
              <span className="material-symbols-outlined text-primary text-xl shrink-0 mt-0.5">mail</span>
              <div className="flex flex-col gap-1">
                <span className="font-bold text-on-surface">Verification Link Sent</span>
                <span className="leading-relaxed">
                  Please check your inbox (and spam folder) and click the link to verify your email address before signing in.
                </span>
              </div>
            </div>

            <div className="flex flex-col w-full gap-2 pt-2">
              <a
                href="/login"
                className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 rounded-xl text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Sign In</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
