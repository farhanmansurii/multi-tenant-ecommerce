'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  CheckCircle2,
  Store,
  TrendingUp
} from 'lucide-react'

import { signIn } from '@/lib/auth/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

// --- Validation Schema ---
const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
})

type FormData = z.infer<typeof schema>

// --- Assets ---
const GoogleIcon = () => (
  <svg role="img" viewBox="0 0 24 24" className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg">
    <path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
  </svg>
)

export default function SignInPageClient() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      rememberMe: true
    }
  })

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn.social({ provider: "google", callbackURL: "/dashboard" })
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : "Google Sign In is not configured. Please use email/password or contact support.";

      // Check if it's a provider not found error
      if (errorMessage.includes("Provider not found") || errorMessage.includes("404")) {
        toast.error("Google Sign In is not available. Please use email/password to sign in.");
      } else {
        toast.error("Something went wrong with Google Sign In");
      }
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    await signIn.email({
      email: data.email,
      password: data.password,
      callbackURL: "/dashboard",
      fetchOptions: {
        onError: (ctx) => {
          setIsLoading(false)
          toast.error(ctx.error.message)
        }
      }
    })
  }

  return (
    <div className="min-h-screen w-full flex">

      {/* --- Left Side: Form --- */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 md:p-12 lg:p-16 bg-background relative z-10">

        {/* Logo Mobile */}
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2 font-bold text-xl">
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <Store className="h-5 w-5" />
          </div>
          GumroadClone
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm space-y-8"
        >
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Welcome back
            </h1>
            <p className="text-muted-foreground text-base">
              Enter your credentials to access your store.
            </p>
          </div>

          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full h-12 text-base font-medium border-border/50 hover:bg-muted/50"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <GoogleIcon />
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className={cn("h-11 bg-muted/30 border-border/50 focus-visible:ring-indigo-500", errors.email && "border-red-500 ring-red-500")}
                  {...register("email")}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-indigo-500 hover:text-indigo-600 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className={cn("h-11 pr-10 bg-muted/30 border-border/50 focus-visible:ring-indigo-500", errors.password && "border-red-500 ring-red-500")}
                    {...register("password")}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="remember" {...register("rememberMe")} />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground"
                >
                  Remember me for 30 days
                </label>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/sign-up"
              className="font-semibold text-indigo-500 hover:text-indigo-600 hover:underline transition-colors"
            >
              Sign up for free
            </Link>
          </p>
        </motion.div>
      </div>

      {/* --- Right Side: Visual Showcase --- */}
      <div className="hidden lg:flex flex-1 relative bg-zinc-900 text-white overflow-hidden flex-col items-center justify-center p-16">

        {/* Background Effects */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-900 to-indigo-950/50"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/30 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-black/80 to-transparent z-10"></div>

        {/* Content Container */}
        <div className="relative z-20 w-full max-w-md space-y-8">

          {/* Logo */}
          <div className="flex items-center gap-3 font-bold text-2xl mb-12">
            <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-xl">
              <Store className="h-6 w-6" />
            </div>
            <span>GumroadClone</span>
          </div>

          {/* Floating Success Card (Visual Flair) */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="bg-zinc-800/50 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-zinc-400 font-medium">New Sale</p>
                  <p className="text-white font-bold">+$49.00</p>
                </div>
              </div>
              <span className="text-xs text-zinc-500 bg-zinc-900/50 px-2 py-1 rounded-full border border-white/5">Just now</span>
            </div>
            <div className="space-y-2">
              <div className="h-2 w-full bg-zinc-700/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "75%" }}
                  transition={{ delay: 0.8, duration: 1 }}
                  className="h-full bg-indigo-500 rounded-full"
                />
              </div>
              <div className="flex justify-between text-xs text-zinc-500">
                <span>Daily Goal</span>
                <span>75%</span>
              </div>
            </div>
          </motion.div>

          {/* Testimonial / Tagline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-4 pt-8"
          >
            <div className="flex gap-1 text-orange-400">
              {[1, 2, 3, 4, 5].map(i => <CheckCircle2 key={i} className="h-5 w-5 fill-orange-400/20" />)}
            </div>
            <h2 className="text-3xl font-bold leading-tight">
              "The easiest way to sell digital products and build your audience."
            </h2>
            <div className="flex items-center gap-3 pt-2">
              <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold">
                JD
              </div>
              <div>
                <p className="text-sm font-semibold">John Doe</p>
                <p className="text-xs text-zinc-400">Creator, earning $10k/mo</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  )
}
