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
