"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User, Zap, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import toast from "react-hot-toast";
import axios from "axios";

const schema = z.object({
  name:            z.string().min(2, "Name must be at least 2 characters"),
  email:           z.string().email("Invalid email address"),
  password:        z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  referralCode:    z.string().optional(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
type RegisterForm = z.infer<typeof schema>;

const BENEFITS = [
  "Fund your wallet securely before placing orders",
  "Earn with our referral program",
  "24/7 dedicated support",
  "30-day refill guarantee",
];

export default function RegisterPage() {
  const router = useRouter();
  const [showPw, setShowPw]   = useState(false);
  const [showCp, setShowCp]   = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      await axios.post("/api/auth/register", {
        name:         data.name,
        email:        data.email,
        password:     data.password,
        referralCode: data.referralCode,
      });
      toast.success("Account created! Please check your email to verify.");
      router.push("/auth/login");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto grid lg:grid-cols-2 gap-0"
    >
      {/* Left — Benefits */}
      <div className="hidden lg:flex flex-col justify-center p-10 bg-white/5 backdrop-blur-sm border border-white/10 rounded-l-3xl">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <span className="font-display font-bold text-xl text-white">Jelboost GH</span>
        </div>
        <h2 className="font-display text-3xl font-bold text-white mb-4">
          Grow your social media <span className="gradient-text">today</span>
        </h2>
        <p className="text-white/60 text-sm mb-8 leading-relaxed">
          Create your account, add funds to your secure wallet, then order the services you need in one place.
        </p>
        <ul className="space-y-3">
          {BENEFITS.map((b) => (
            <li key={b} className="flex items-center gap-3 text-white/80 text-sm">
              <CheckCircle2 size={16} className="text-green-400 shrink-0" />
              {b}
            </li>
          ))}
        </ul>
      </div>

      {/* Right — Form */}
      <div className="auth-registration-card bg-white/10 backdrop-blur-xl border border-white/20 lg:border-l-0 rounded-3xl lg:rounded-l-none lg:rounded-r-3xl">
        <div className="text-center mb-6">
          <h1 className="font-display text-2xl font-bold text-white">Create account</h1>
          <p className="text-white/60 text-sm mt-1">Create an account to fund your wallet and place orders</p>
        </div>

        {/* Google */}
        <Button
          variant="outline"
          fullWidth
          loading={googleLoading}
          onClick={() => { setGoogleLoading(true); signIn("google", { callbackUrl: "/dashboard" }); }}
          className="border-white/30 text-white hover:bg-white/10 mb-5"
          icon={
            <svg viewBox="0 0 24 24" className="w-4 h-4">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          }
        >
          Sign up with Google
        </Button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/20" /></div>
          <div className="relative flex justify-center text-xs"><span className="bg-transparent px-2 text-white/50">or with email</span></div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-registration-form">
          <Input
            label="Full Name" type="text" placeholder="John Doe"
            leftIcon={<User size={16} />}
            error={errors.name?.message}
            className="bg-white/10 border-white/20 text-white placeholder-white/40"
            {...register("name")}
          />
          <Input
            label="Email" type="email" placeholder="you@example.com"
            leftIcon={<Mail size={16} />}
            error={errors.email?.message}
            className="bg-white/10 border-white/20 text-white placeholder-white/40"
            {...register("email")}
          />
          <Input
            label="Password" type={showPw ? "text" : "password"} placeholder="Min 8 characters"
            leftIcon={<Lock size={16} />}
            rightIcon={<button type="button" onClick={() => setShowPw(!showPw)} className="text-white/50 hover:text-white">{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>}
            error={errors.password?.message}
            className="bg-white/10 border-white/20 text-white placeholder-white/40"
            {...register("password")}
          />
          <Input
            label="Confirm Password" type={showCp ? "text" : "password"} placeholder="Re-enter password"
            leftIcon={<Lock size={16} />}
            rightIcon={<button type="button" onClick={() => setShowCp(!showCp)} className="text-white/50 hover:text-white">{showCp ? <EyeOff size={16} /> : <Eye size={16} />}</button>}
            error={errors.confirmPassword?.message}
            className="bg-white/10 border-white/20 text-white placeholder-white/40"
            {...register("confirmPassword")}
          />
          <Input
            label="Referral Code (Optional)" type="text" placeholder="Enter referral code"
            className="bg-white/10 border-white/20 text-white placeholder-white/40"
            {...register("referralCode")}
          />

          <p className="text-xs text-white/50">
            By registering, you agree to our{" "}
            <Link href="/terms" className="text-brand-400 hover:text-brand-300">Terms of Service</Link>
            {" "}and{" "}
            <Link href="/privacy" className="text-brand-400 hover:text-brand-300">Privacy Policy</Link>.
          </p>

          <Button type="submit" fullWidth size="lg" gradient loading={isSubmitting}>
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-white/60 mt-5">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
        </p>
      </div>
    </motion.div>
  );
}
