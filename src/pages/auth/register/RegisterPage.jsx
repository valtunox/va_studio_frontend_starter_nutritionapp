import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Rocket, Mail, Lock, Eye, EyeOff, Github, Chrome, GitBranch,
  Sun, Moon, Sparkles, Zap, Users, User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function getPasswordStrength(pw) {
  if (!pw) return { label: '', score: 0, color: '' }
  let score = 0
  if (pw.length >= 6) score++
  if (pw.length >= 10) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (score <= 2) return { label: 'Weak', score: 1, color: 'bg-red-500' }
  if (score <= 3) return { label: 'Medium', score: 2, color: 'bg-yellow-500' }
  return { label: 'Strong', score: 3, color: 'bg-green-500' }
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const strength = useMemo(() => getPasswordStrength(password), [password])

  const toggleDark = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <div className="min-h-screen flex font-sans">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-purple-300/10 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white font-display">VA Studio</span>
          </div>

          <div className="max-w-md">
            <h1 className="text-4xl font-bold text-white font-display leading-tight mb-6">
              Start building
              <br />
              <span className="text-indigo-200">today</span>
            </h1>
            <p className="text-violet-100 text-lg leading-relaxed mb-10">
              Join thousands of developers who are already shipping faster with VA Studio's AI-powered platform.
            </p>

            <div className="space-y-4">
              {[
                { icon: Zap, text: 'Get started in under 2 minutes' },
                { icon: Sparkles, text: 'AI generates your first project instantly' },
                { icon: Users, text: 'Join a growing community of builders' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-indigo-200" />
                  </div>
                  <span className="text-white/90 text-sm">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-violet-200 text-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Free forever — no credit card required
          </div>
        </div>
      </div>

      {/* Right Panel — Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-slate-50 dark:bg-slate-950 relative overflow-y-auto">
        {/* Dark mode toggle */}
        <button
          onClick={toggleDark}
          className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-500" />}
        </button>

        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold font-display text-slate-900 dark:text-white">VA Studio</span>
          </div>

          <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-2">Create your account</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Get started for free</p>

          <Card className="border-0 shadow-xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
            <CardContent className="p-6 sm:p-8 space-y-6">
              {/* Social Signup Buttons */}
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center gap-3 h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-sm hover:border-red-300 hover:bg-red-50 dark:hover:border-red-500/30 dark:hover:bg-red-500/10 transition-all">
                  <Chrome className="w-5 h-5" />
                  Continue with Google
                </button>
                <button className="w-full flex items-center justify-center gap-3 h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-sm hover:border-slate-400 hover:bg-slate-100 dark:hover:border-slate-500 dark:hover:bg-slate-700 transition-all">
                  <Github className="w-5 h-5" />
                  Continue with GitHub
                </button>
                <button className="w-full flex items-center justify-center gap-3 h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-sm hover:border-orange-300 hover:bg-orange-50 dark:hover:border-orange-500/30 dark:hover:bg-orange-500/10 transition-all">
                  <GitBranch className="w-5 h-5" />
                  Continue with GitLab
                </button>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 dark:text-slate-500 uppercase tracking-wide">or sign up with email</span>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-slate-700 dark:text-slate-300">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10 h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Strength indicator */}
                {password && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${
                            i <= strength.score ? strength.color : 'bg-slate-200 dark:bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs font-medium ${
                      strength.score === 1 ? 'text-red-500' : strength.score === 2 ? 'text-yellow-500' : 'text-green-500'
                    }`}>
                      {strength.label}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-700 dark:text-slate-300">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Terms checkbox */}
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  I agree to the{' '}
                  <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">Privacy Policy</a>
                </span>
              </label>

              {/* Create Account Button */}
              <Button className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all">
                Create Account
              </Button>

              {/* Sign in link */}
              <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                Already have an account?{' '}
                <Link to="/auth/login" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold">
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
