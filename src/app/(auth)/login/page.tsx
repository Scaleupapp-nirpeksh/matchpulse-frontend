'use client';

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Mail, Phone, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { sendOtp } from '@/lib/api/auth';

// ---------- Schemas ----------

const emailSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const phoneSchema = z.object({
  phone: z
    .string()
    .min(10, 'Enter a valid 10-digit phone number')
    .max(10, 'Enter a valid 10-digit phone number')
    .regex(/^\d+$/, 'Phone number must contain only digits'),
});

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

type EmailValues = z.infer<typeof emailSchema>;
type PhoneValues = z.infer<typeof phoneSchema>;
type OtpValues = z.infer<typeof otpSchema>;

// ---------- Tabs ----------

const tabs = [
  { id: 'email' as const, label: 'Email', icon: Mail },
  { id: 'phone' as const, label: 'Phone', icon: Phone },
];

// ---------- OTP Input ----------

function OtpInput({
  value,
  onChange,
  length = 6,
}: {
  value: string;
  onChange: (val: string) => void;
  length?: number;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, char: string) => {
    if (!/^\d*$/.test(char)) return;
    const newValue = value.split('');
    newValue[index] = char;
    const joined = newValue.join('').slice(0, length);
    onChange(joined);
    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(pasted);
    const focusIndex = Math.min(pasted.length, length - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputRefs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={cn(
            'h-12 w-10 rounded-lg border border-border bg-white text-center text-lg font-semibold text-text-primary',
            'focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20',
            'transition-all duration-200'
          )}
        />
      ))}
    </div>
  );
}

// ---------- Login Page ----------

export default function LoginPageWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-text-secondary">Loading...</div>}>
      <LoginPage />
    </Suspense>
  );
}

function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const { login, loginWithPhone } = useAuth();

  const [activeTab, setActiveTab] = useState<'email' | 'phone'>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [phoneStep, setPhoneStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [otpSubmitting, setOtpSubmitting] = useState(false);

  const emailForm = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '', password: '' },
  });

  const phoneForm = useForm<PhoneValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '' },
  });

  const onEmailSubmit = async (data: EmailValues) => {
    try {
      await login(data.email, data.password);
      toast.success('Logged in successfully');
      router.push(redirectTo);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Login failed. Please try again.';
      toast.error(message);
    }
  };

  const onPhoneSubmit = async (data: PhoneValues) => {
    try {
      const fullPhone = `+91${data.phone.replace(/^(\+91|91)/, '')}`;
      await sendOtp({ phone: fullPhone, purpose: 'login' });
      setPhoneNumber(fullPhone);
      setPhoneStep('otp');
      setOtpValue('');
      toast.success('OTP sent to your phone');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to send OTP. Please try again.';
      toast.error(message);
    }
  };

  const onOtpSubmit = useCallback(async () => {
    if (otpValue.length !== 6) return;
    setOtpSubmitting(true);
    try {
      await loginWithPhone(phoneNumber, otpValue);
      toast.success('Logged in successfully');
      router.push(redirectTo);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Invalid OTP. Please try again.';
      toast.error(message);
    } finally {
      setOtpSubmitting(false);
    }
  }, [otpValue, phoneNumber, loginWithPhone, router, redirectTo]);

  // Auto-submit OTP when all 6 digits are entered
  useEffect(() => {
    if (otpValue.length === 6 && phoneStep === 'otp') {
      onOtpSubmit();
    }
  }, [otpValue, phoneStep, onOtpSubmit]);

  return (
    <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-text-primary">Welcome back</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Sign in to your MatchPulse account
      </p>

      {/* Tab switcher */}
      <div className="relative mt-6 flex rounded-lg bg-surface p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setPhoneStep('phone');
              setOtpValue('');
            }}
            className={cn(
              'relative z-10 flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'text-text-primary'
                : 'text-text-tertiary hover:text-text-secondary'
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
        {/* Active indicator */}
        <div
          className={cn(
            'absolute inset-y-1 w-[calc(50%-4px)] rounded-md bg-white shadow-sm transition-transform duration-200 ease-out',
            activeTab === 'email' ? 'translate-x-0 left-1' : 'translate-x-full left-1'
          )}
        />
      </div>

      {/* Form area */}
      <div className="mt-6">
        {activeTab === 'email' ? (
          <form
            onSubmit={emailForm.handleSubmit(onEmailSubmit)}
            className="space-y-4"
          >
            {/* Email */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary">
                Email
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                {...emailForm.register('email')}
              />
              {emailForm.formState.errors.email && (
                <p className="mt-1 text-xs text-danger">
                  {emailForm.formState.errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-sm font-medium text-text-primary">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-accent hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  {...emailForm.register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {emailForm.formState.errors.password && (
                <p className="mt-1 text-xs text-danger">
                  {emailForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={emailForm.formState.isSubmitting}
            >
              {emailForm.formState.isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Sign In
            </Button>
          </form>
        ) : (
          <div>
            {phoneStep === 'phone' ? (
              <form
                onSubmit={phoneForm.handleSubmit(onPhoneSubmit)}
                className="space-y-4"
              >
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-primary">
                    Phone Number
                  </label>
                  <div className="flex gap-2">
                    <div className="flex h-10 items-center rounded-lg border border-border bg-surface px-3 text-sm text-text-secondary">
                      +91
                    </div>
                    <Input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="9876543210"
                      className="flex-1"
                      {...phoneForm.register('phone')}
                    />
                  </div>
                  {phoneForm.formState.errors.phone && (
                    <p className="mt-1 text-xs text-danger">
                      {phoneForm.formState.errors.phone.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={phoneForm.formState.isSubmitting}
                >
                  {phoneForm.formState.isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Send OTP
                </Button>
              </form>
            ) : (
              <div className="space-y-5">
                <div className="text-center">
                  <p className="text-sm text-text-secondary">
                    Enter the 6-digit code sent to
                  </p>
                  <p className="text-sm font-medium text-text-primary mt-0.5">
                    {phoneNumber.slice(0, 6)}****{phoneNumber.slice(-3)}
                  </p>
                </div>

                <OtpInput value={otpValue} onChange={setOtpValue} />

                <Button
                  type="button"
                  className="w-full"
                  onClick={onOtpSubmit}
                  disabled={otpSubmitting || otpValue.length !== 6}
                >
                  {otpSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Verify & Sign In
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setPhoneStep('phone');
                    setOtpValue('');
                  }}
                  className="flex w-full items-center justify-center gap-1 text-sm text-text-tertiary hover:text-text-secondary transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Change number
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-medium text-accent hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
