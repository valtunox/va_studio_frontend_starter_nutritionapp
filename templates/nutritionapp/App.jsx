import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Home, UtensilsCrossed, BookOpen, CalendarDays, UserCircle, Search, Bell,
  Plus, Camera, Flame, Droplets, Star, ChevronRight, Sparkles, Trophy,
  Heart, Clock, Zap, Apple, Egg, Cookie, Coffee, Salad, Fish, Beef,
  Settings, LogOut, Award, ChevronLeft, ChevronDown, Check, X,
  ScanBarcode, Wheat, Leaf, Timer, ArrowRight, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ThemeSwitcher } from '@/components/shared/ThemeSwitcher'
import { Progress, ProgressRing } from '@/components/ui/progress'
import { useAuth } from '@/context/AuthContext'

/* ------------------------------------------------------------------ */
/*  HELPERS                                                             */
/* ------------------------------------------------------------------ */

const getHeaders = () => {
  const token = localStorage.getItem('va-access-token')
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : {}
}

const mealIcons = { breakfast: Coffee, lunch: Salad, dinner: UtensilsCrossed, snack: Apple }

const TODAY = new Date().toISOString().split('T')[0]

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatToday() {
  const d = new Date()
  return `${dayNames[d.getDay()]}, ${monthNames[d.getMonth()]} ${d.getDate()}`
}

const recipeGradients = [
  'from-orange-400 to-red-400',
  'from-green-400 to-emerald-500',
  'from-pink-400 to-rose-400',
  'from-lime-400 to-green-500',
  'from-purple-400 to-pink-400',
  'from-amber-400 to-orange-400',
  'from-sky-400 to-blue-500',
  'from-indigo-400 to-purple-500',
]

const achievements = [
  { name: 'First Week', icon: Trophy, earned: true, color: 'text-amber-500' },
  { name: '10 Day Streak', icon: Flame, earned: true, color: 'text-orange-500' },
  { name: 'Protein Pro', icon: Zap, earned: true, color: 'text-emerald-500' },
  { name: 'Hydration Hero', icon: Droplets, earned: false, color: 'text-blue-400' },
]

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export default function NutritionApp({ onNavigate }) {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth()

  const [activeTab, setActiveTab] = useState('home')
  const [recipeFilter, setRecipeFilter] = useState('All')
  const [selectedDay, setSelectedDay] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMealType, setSelectedMealType] = useState(null)

  // Data state
  const [projectId, setProjectId] = useState(null)
  const [profile, setProfile] = useState(null)
  const [todayLog, setTodayLog] = useState(null)
  const [foods, setFoods] = useState([])
  const [searchResults, setSearchResults] = useState(null)
  const [recipes, setRecipes] = useState([])
  const [mealPlans, setMealPlans] = useState([])
  const [weightEntries, setWeightEntries] = useState([])
  const [dailyLogs, setDailyLogs] = useState([])

  // Loading states
  const [initialLoading, setInitialLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [waterLoading, setWaterLoading] = useState(false)
  const [addingMeal, setAddingMeal] = useState(null)

  const searchTimer = useRef(null)

  /* ---- FETCH PROJECT ---- */
  const fetchProject = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/projects/public')
      const data = await res.json()
      const projects = data.items || data || []
      const nutriProject = projects.find(p => p.name === 'NutriTrack' || p.template_type === 'blog')
      if (nutriProject) {
        setProjectId(nutriProject.id)
        return nutriProject.id
      }
    } catch (e) {
      console.error('Failed to fetch project:', e)
    }
    return null
  }, [])

  /* ---- API HELPERS ---- */
  const apiFetch = useCallback(async (path, options = {}) => {
    const res = await fetch(path, {
      ...options,
      headers: { ...getHeaders(), ...(options.headers || {}) },
    })
    if (!res.ok) throw new Error(`API error ${res.status}`)
    return res.json()
  }, [])

  /* ---- LOAD INITIAL DATA ---- */
  const loadData = useCallback(async (pid) => {
    if (!pid) return
    setInitialLoading(true)
    try {
      const [profileData, foodsData, recipesData, logsData, mealPlanData, weightData] = await Promise.allSettled([
        apiFetch(`/api/v1/nutrition/profile?project_id=${pid}`),
        apiFetch(`/api/v1/nutrition/foods?project_id=${pid}`),
        apiFetch(`/api/v1/nutrition/recipes?project_id=${pid}`),
        apiFetch(`/api/v1/nutrition/daily-logs?project_id=${pid}`),
        apiFetch(`/api/v1/nutrition/meal-plans?project_id=${pid}`),
        apiFetch(`/api/v1/nutrition/weight?project_id=${pid}`),
      ])

      if (profileData.status === 'fulfilled') setProfile(profileData.value)
      if (foodsData.status === 'fulfilled') {
        const fd = foodsData.value
        setFoods(fd.items || fd || [])
      }
      if (recipesData.status === 'fulfilled') setRecipes(recipesData.value.items || recipesData.value || [])
      if (mealPlanData.status === 'fulfilled') setMealPlans(mealPlanData.value.items || mealPlanData.value || [])
      if (weightData.status === 'fulfilled') setWeightEntries(weightData.value.items || weightData.value || [])

      let logs = []
      if (logsData.status === 'fulfilled') {
        logs = logsData.value.items || logsData.value || []
        setDailyLogs(logs)
      }

      // Find today's log or create it
      let todaysLog = logs.find(l => l.date === TODAY)
      if (!todaysLog) {
        try {
          const calTarget = profileData.status === 'fulfilled' ? (profileData.value.calorie_target || 2100) : 2100
          todaysLog = await apiFetch(`/api/v1/nutrition/daily-logs?project_id=${pid}`, {
            method: 'POST',
            body: JSON.stringify({ date: TODAY, calories_target: calTarget }),
          })
          setDailyLogs(prev => [...prev, todaysLog])
        } catch (e) {
          console.error('Failed to create daily log:', e)
        }
      }
      if (todaysLog) setTodayLog(todaysLog)
    } catch (e) {
      console.error('Failed to load data:', e)
    } finally {
      setInitialLoading(false)
    }
  }, [apiFetch])

  /* ---- INIT ---- */
  useEffect(() => {
    if (!isAuthenticated) {
      setInitialLoading(false)
      return
    }
    ;(async () => {
      const pid = await fetchProject()
      if (pid) await loadData(pid)
      else setInitialLoading(false)
    })()
  }, [isAuthenticated, fetchProject, loadData])

  /* ---- SEARCH FOODS ---- */
  useEffect(() => {
    if (!projectId) return
    if (!searchQuery.trim()) {
      setSearchResults(null)
      return
    }
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(async () => {
      setSearchLoading(true)
      try {
        const data = await apiFetch(`/api/v1/nutrition/foods/search?project_id=${projectId}&q=${encodeURIComponent(searchQuery)}`)
        setSearchResults(data.items || data || [])
      } catch {
        setSearchResults([])
      } finally {
        setSearchLoading(false)
      }
    }, 400)
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current) }
  }, [searchQuery, projectId, apiFetch])

  /* ---- WATER TRACKER ---- */
  const handleWaterClick = async (count) => {
    if (!todayLog || !projectId || waterLoading) return
    setWaterLoading(true)
    try {
      const updated = await apiFetch(`/api/v1/nutrition/daily-logs/${todayLog.id}?project_id=${projectId}`, {
        method: 'PATCH',
        body: JSON.stringify({ water_consumed: count }),
      })
      setTodayLog(prev => ({ ...prev, ...updated }))
    } catch (e) {
      console.error('Failed to update water:', e)
    } finally {
      setWaterLoading(false)
    }
  }

  /* ---- ADD MEAL ---- */
  const handleAddMeal = async (food, mealType) => {
    if (!todayLog || !projectId) return
    const type = mealType || selectedMealType || 'snack'
    setAddingMeal(food.id || food.name)
    try {
      const meal = {
        meal_type: type,
        name: food.name,
        calories: food.calories || food.cal || 0,
        protein: food.protein || 0,
        carbs: food.carbs || 0,
        fat: food.fat || 0,
        food_id: food.id || undefined,
        servings: 1,
      }
      const updated = await apiFetch(`/api/v1/nutrition/daily-logs/${todayLog.id}/meals?project_id=${projectId}`, {
        method: 'POST',
        body: JSON.stringify(meal),
      })
      // Refresh today's log
      try {
        const refreshed = await apiFetch(`/api/v1/nutrition/daily-logs?project_id=${projectId}`)
        const logs = refreshed.items || refreshed || []
        const tl = logs.find(l => l.date === TODAY)
        if (tl) setTodayLog(tl)
        setDailyLogs(logs)
      } catch {
        // If refresh fails, manually update
        if (updated && updated.meals) {
          setTodayLog(updated)
        }
      }
    } catch (e) {
      console.error('Failed to add meal:', e)
    } finally {
      setAddingMeal(null)
      setSelectedMealType(null)
    }
  }

  /* ---- DERIVED DATA ---- */
  const caloriesConsumed = todayLog?.calories_consumed || 0
  const caloriesGoal = todayLog?.calories_target || profile?.calorie_target || 2100
  const caloriePercent = caloriesGoal > 0 ? Math.round((caloriesConsumed / caloriesGoal) * 100) : 0

  const macros = [
    { name: 'Protein', current: todayLog?.protein || 0, target: profile?.protein_target || 130, unit: 'g', color: 'bg-emerald-500', ring: 'text-emerald-500' },
    { name: 'Carbs', current: todayLog?.carbs || 0, target: profile?.carbs_target || 250, unit: 'g', color: 'bg-sky-500', ring: 'text-sky-500' },
    { name: 'Fat', current: todayLog?.fat || 0, target: profile?.fat_target || 70, unit: 'g', color: 'bg-amber-500', ring: 'text-amber-500' },
  ]

  const waterCount = todayLog?.water_consumed || 0
  const waterTarget = todayLog?.water_target || profile?.water_target || 8

  const todaysMeals = (() => {
    const meals = todayLog?.meals || []
    const types = ['breakfast', 'lunch', 'snack', 'dinner']
    return types.map(type => {
      const meal = meals.find(m => m.meal_type === type)
      const MealIcon = mealIcons[type] || UtensilsCrossed
      if (meal) {
        return { id: meal.id, meal: type.charAt(0).toUpperCase() + type.slice(1), name: meal.name, cal: meal.calories, icon: MealIcon, logged: true }
      }
      return { id: type, meal: type.charAt(0).toUpperCase() + type.slice(1), name: null, cal: 0, icon: MealIcon, logged: false }
    })
  })()

  // Streak from consecutive daily logs
  const streak = (() => {
    if (!dailyLogs.length) return 0
    const sorted = [...dailyLogs].sort((a, b) => b.date.localeCompare(a.date))
    let count = 0
    const today = new Date(TODAY)
    for (let i = 0; i < sorted.length; i++) {
      const expected = new Date(today)
      expected.setDate(today.getDate() - i)
      const expectedStr = expected.toISOString().split('T')[0]
      if (sorted.find(l => l.date === expectedStr)) {
        count++
      } else {
        break
      }
    }
    return count
  })()

  // Recipe categories from API
  const recipeCategories = (() => {
    const cats = new Set(['All'])
    recipes.forEach(r => { if (r.category) cats.add(r.category) })
    return Array.from(cats)
  })()

  const filteredRecipes = recipeFilter === 'All'
    ? recipes
    : recipes.filter(r => r.category === recipeFilter)

  const featuredRecipe = recipes.find(r => r.is_featured) || recipes[0]

  // Active meal plan
  const activePlan = mealPlans.find(p => p.is_active) || mealPlans[0]
  const planEntries = activePlan?.entries || []
  const planDays = (() => {
    const days = [...new Set(planEntries.map(e => e.day))].sort()
    return days
  })()
  const currentPlanDay = planDays[selectedDay] || planDays[0]
  const currentDayEntries = planEntries.filter(e => e.day === currentPlanDay)

  // Weight chart data
  const weightHistory = weightEntries.slice(-7).map(w => w.weight)
  const weightDays = weightEntries.slice(-7).map(w => {
    const d = new Date(w.date)
    return dayNames[d.getDay()].slice(0, 3)
  })

  const firstName = user?.full_name ? user.full_name.split(' ')[0] : 'there'
  const userInitials = user?.full_name ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?'

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'log', label: 'Log Food', icon: Plus },
    { id: 'recipes', label: 'Recipes', icon: BookOpen },
    { id: 'plan', label: 'Plan', icon: CalendarDays },
    { id: 'profile', label: 'Profile', icon: UserCircle },
  ]

  /* ---- AUTH CHECK ---- */
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center transition-colors">
        <div className="fixed top-4 right-4 z-50">
          <ThemeSwitcher />
        </div>
        <div className="max-w-[430px] mx-auto bg-white dark:bg-gray-900 shadow-2xl rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-4">
            <Apple className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">NutriTrack</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Please log in to track your nutrition and reach your goals.</p>
          <Button
            onClick={() => onNavigate && onNavigate('login')}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg"
          >
            Log In
          </Button>
        </div>
      </div>
    )
  }

  /* ---- LOADING STATE ---- */
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading your nutrition data...</p>
        </div>
      </div>
    )
  }

  /* ---- HOME TAB ---- */
  const renderHome = () => (
    <div className="space-y-5">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{getGreeting()}, {firstName}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{formatToday()}</p>
        </div>
        <button className="relative p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
          <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </div>

      {/* Calorie Ring */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/40 dark:to-green-950/40">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="relative flex-shrink-0">
              <ProgressRing value={Math.min(caloriePercent, 100)} size={120} strokeWidth={10} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{caloriesConsumed}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">/ {caloriesGoal} cal</span>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Daily Calories</p>
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{Math.max(caloriesGoal - caloriesConsumed, 0)}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">remaining today</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Macro Pills */}
      <div className="grid grid-cols-3 gap-3">
        {macros.map(m => (
          <Card key={m.name} className="border-0 shadow-sm">
            <CardContent className="p-3 text-center">
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{m.name}</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{Math.round(m.current)}<span className="text-xs font-normal text-gray-400">/{m.target}{m.unit}</span></p>
              <div className="mt-2">
                <Progress value={m.target > 0 ? Math.min(Math.round((m.current / m.target) * 100), 100) : 0} className="h-1.5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Water Tracker */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-500" />
              <span className="font-semibold text-gray-900 dark:text-white text-sm">Water Intake</span>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {waterCount}/{waterTarget} glasses
              {waterLoading && <Loader2 className="w-3 h-3 animate-spin inline ml-1" />}
            </span>
          </div>
          <div className="flex gap-2">
            {Array.from({ length: waterTarget }).map((_, i) => (
              <button
                key={i}
                onClick={() => handleWaterClick(i + 1)}
                disabled={waterLoading}
                className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${
                  i < waterCount
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600 hover:border-blue-300'
                }`}
              >
                <Droplets className="w-4 h-4" />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Today's Meals */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Today&apos;s Meals</h2>
        <div className="space-y-2">
          {todaysMeals.map(meal => (
            <Card key={meal.id} className="border-0 shadow-sm">
              <CardContent className="p-3 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  meal.logged ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-gray-100 dark:bg-gray-800'
                }`}>
                  <meal.icon className={`w-5 h-5 ${meal.logged ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{meal.meal}</p>
                  {meal.logged ? (
                    <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{meal.name}</p>
                  ) : (
                    <p className="text-sm text-gray-400 dark:text-gray-500 italic">Not logged yet</p>
                  )}
                </div>
                {meal.logged ? (
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">{meal.cal} cal</span>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-emerald-600 border-emerald-300 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-950"
                    onClick={() => { setSelectedMealType(meal.meal.toLowerCase()); setActiveTab('log') }}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Streak Card */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white">{streak} day streak!</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {streak > 0 ? "Keep it up! You're on fire!" : 'Log your first meal to start!'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Insights */}
      {macros[0].target > 0 && (
        <Card className="border-0 shadow-sm bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                You&apos;re {macros[0].target > 0 ? Math.min(Math.round((macros[0].current / macros[0].target) * 100), 100) : 0}% to your protein goal.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {macros[0].current < macros[0].target ? 'Try adding a protein shake!' : 'Great job hitting your target!'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  /* ---- LOG FOOD TAB ---- */
  const renderLogFood = () => {
    const displayFoods = searchResults !== null ? searchResults : foods

    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Log Food</h1>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search food or scan barcode"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 pr-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-800 border-0 text-sm"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition">
            <Camera className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Add Buttons */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Breakfast', icon: Coffee, color: 'from-amber-400 to-orange-400', type: 'breakfast' },
            { label: 'Lunch', icon: Salad, color: 'from-emerald-400 to-green-500', type: 'lunch' },
            { label: 'Dinner', icon: UtensilsCrossed, color: 'from-indigo-400 to-purple-500', type: 'dinner' },
            { label: 'Snack', icon: Cookie, color: 'from-pink-400 to-rose-400', type: 'snack' },
          ].map(item => (
            <button
              key={item.label}
              onClick={() => setSelectedMealType(item.type)}
              className={`flex flex-col items-center gap-2 p-3 rounded-2xl shadow-sm hover:shadow-md transition ${
                selectedMealType === item.type
                  ? 'bg-emerald-50 dark:bg-emerald-900/30 ring-2 ring-emerald-500'
                  : 'bg-white dark:bg-gray-800'
              }`}
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
            </button>
          ))}
        </div>

        {searchLoading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
            <span className="ml-2 text-sm text-gray-500">Searching...</span>
          </div>
        )}

        {/* Foods List */}
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            {searchResults !== null ? `Search Results (${searchResults.length})` : 'Available Foods'}
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {displayFoods.slice(0, 8).map(food => (
              <button
                key={food.id || food.name}
                onClick={() => handleAddMeal(food)}
                disabled={addingMeal === (food.id || food.name)}
                className="flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
                  {addingMeal === (food.id || food.name) ? (
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  ) : (
                    <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{food.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{food.calories} cal</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* More Foods */}
        {displayFoods.length > 8 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">More Foods</h2>
            <div className="space-y-2">
              {displayFoods.slice(8).map(food => (
                <Card key={food.id || food.name} className="border-0 shadow-sm">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm text-gray-900 dark:text-white">{food.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{food.calories} cal &middot; {food.protein}g protein</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950"
                      onClick={() => handleAddMeal(food)}
                      disabled={addingMeal === (food.id || food.name)}
                    >
                      {addingMeal === (food.id || food.name) ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Plus className="w-5 h-5" />
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty search state */}
        {searchResults !== null && searchResults.length === 0 && !searchLoading && (
          <div className="text-center py-8">
            <Search className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No foods found for &quot;{searchQuery}&quot;</p>
          </div>
        )}

        {/* Create Custom */}
        <Button variant="outline" className="w-full h-12 rounded-xl border-dashed border-emerald-300 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950">
          <Plus className="w-4 h-4 mr-2" /> Create Custom Food
        </Button>
      </div>
    )
  }

  /* ---- RECIPES TAB ---- */
  const renderRecipes = () => (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recipes</h1>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {recipeCategories.map(cat => (
          <button
            key={cat}
            onClick={() => setRecipeFilter(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
              recipeFilter === cat
                ? 'bg-emerald-500 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Featured Recipe */}
      {featuredRecipe && (
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="h-36 bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-500 flex items-center justify-center relative">
            <Fish className="w-16 h-16 text-white/30" />
            <Badge className="absolute top-3 left-3 bg-white/20 text-white border-0 backdrop-blur-sm">Featured</Badge>
          </div>
          <CardContent className="p-4">
            <h3 className="font-bold text-gray-900 dark:text-white">{featuredRecipe.title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{featuredRecipe.description || (featuredRecipe.ingredients || []).map(i => i.name).join(', ')}</p>
            <div className="flex items-center gap-4 mt-3">
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1"><Flame className="w-3 h-3" /> {featuredRecipe.calories} cal</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {(featuredRecipe.prep_time || 0) + (featuredRecipe.cook_time || 0)} min</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1"><Egg className="w-3 h-3" /> {featuredRecipe.protein}g protein</span>
              {featuredRecipe.rating && <span className="text-xs text-amber-500 flex items-center gap-1 ml-auto"><Star className="w-3 h-3 fill-amber-500" /> {featuredRecipe.rating}</span>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recipe Grid */}
      <div className="grid grid-cols-2 gap-3">
        {filteredRecipes.map((recipe, idx) => (
          <Card key={recipe.id} className="border-0 shadow-sm overflow-hidden hover:shadow-md transition cursor-pointer">
            <div className={`h-24 bg-gradient-to-br ${recipeGradients[idx % recipeGradients.length]} flex items-center justify-center`}>
              <UtensilsCrossed className="w-8 h-8 text-white/30" />
            </div>
            <CardContent className="p-3">
              <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{recipe.title}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">{recipe.calories} cal</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-0.5"><Clock className="w-3 h-3" /> {(recipe.prep_time || 0) + (recipe.cook_time || 0)} min</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                {recipe.rating && (
                  <>
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-xs text-amber-600 dark:text-amber-400">{recipe.rating}</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {recipes.length === 0 && (
        <div className="text-center py-8">
          <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No recipes available yet.</p>
        </div>
      )}
    </div>
  )

  /* ---- MEAL PLAN TAB ---- */
  const renderPlan = () => {
    // Group entries by meal_type for current day
    const mealPlanByType = {}
    currentDayEntries.forEach(e => {
      const type = e.meal_type || 'meal'
      if (!mealPlanByType[type]) mealPlanByType[type] = { name: e.name, cal: e.calories || 0, items: [] }
      else {
        mealPlanByType[type].cal += (e.calories || 0)
        mealPlanByType[type].items.push(e.name)
      }
    })
    // If entries exist but aren't grouped by type, show them individually
    const planCards = Object.keys(mealPlanByType).length > 0
      ? Object.entries(mealPlanByType)
      : currentDayEntries.map((e, i) => [e.meal_type || `meal-${i}`, { name: e.name, cal: e.calories || 0, items: [] }])

    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meal Plan</h1>

        {activePlan && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{activePlan.name}</p>
        )}

        {/* Day Selector */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          {planDays.length > 0 ? planDays.map((day, i) => (
            <button
              key={day}
              onClick={() => setSelectedDay(i)}
              className={`flex flex-col items-center min-w-[3rem] py-2 px-3 rounded-xl text-sm font-medium transition ${
                selectedDay === i
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <span className="text-[10px] uppercase tracking-wider">{typeof day === 'string' ? day.slice(0, 3) : `Day`}</span>
              <span className="text-lg font-bold">{typeof day === 'number' ? day : i + 1}</span>
            </button>
          )) : (
            ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
              <button
                key={day}
                onClick={() => setSelectedDay(i)}
                className={`flex flex-col items-center min-w-[3rem] py-2 px-3 rounded-xl text-sm font-medium transition ${
                  selectedDay === i
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <span className="text-[10px] uppercase tracking-wider">{day}</span>
                <span className="text-lg font-bold">{i + 1}</span>
              </button>
            ))
          )}
        </div>

        {/* Meal Plan Cards */}
        {planCards.length > 0 ? planCards.map(([key, meal]) => (
          <Card key={key} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="text-emerald-600 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800 capitalize text-xs">
                  {key}
                </Badge>
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">{meal.cal} cal</span>
              </div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">{meal.name}</p>
              {meal.items && meal.items.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {meal.items.map((item, idx) => (
                    <span key={idx} className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{item}</span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )) : (
          <div className="text-center py-8">
            <CalendarDays className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No meal plan entries for this day.</p>
          </div>
        )}

        {/* Daily Total */}
        {currentDayEntries.length > 0 && (
          <Card className="border-0 shadow-sm bg-emerald-50 dark:bg-emerald-950/30">
            <CardContent className="p-4 flex items-center justify-between">
              <span className="font-semibold text-gray-900 dark:text-white">Daily Total</span>
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {currentDayEntries.reduce((sum, e) => sum + (e.calories || 0), 0)} cal
              </span>
            </CardContent>
          </Card>
        )}

        {/* AI Meal Plan */}
        <Button className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg">
          <Sparkles className="w-5 h-5 mr-2" /> Generate AI Meal Plan
        </Button>

        {/* Weekly Summary */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Weekly Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {dailyLogs.length > 0
                    ? Math.round(dailyLogs.reduce((s, l) => s + (l.calories_consumed || 0), 0) / dailyLogs.length).toLocaleString()
                    : '0'}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">Avg Calories</p>
              </div>
              <div>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {dailyLogs.length > 0
                    ? (() => {
                        const best = dailyLogs.reduce((a, b) => (Math.abs((a.calories_consumed || 0) - (a.calories_target || 2100)) < Math.abs((b.calories_consumed || 0) - (b.calories_target || 2100)) ? a : b))
                        const d = new Date(best.date)
                        return dayNames[d.getDay()].slice(0, 3)
                      })()
                    : '--'}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">Best Day</p>
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {dailyLogs.length > 0
                    ? Math.round(dailyLogs.reduce((s, l) => {
                        const ratio = l.calories_target ? Math.min((l.calories_consumed || 0) / l.calories_target, 1) : 0
                        return s + ratio * 100
                      }, 0) / dailyLogs.length)
                    : 0}
                  <span className="text-sm text-gray-400">/100</span>
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">Nutrition Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  /* ---- PROFILE TAB ---- */
  const renderProfile = () => {
    const maxWeight = weightHistory.length > 0 ? Math.max(...weightHistory) : 0
    const minWeight = weightHistory.length > 0 ? Math.min(...weightHistory) : 0
    const range = maxWeight - minWeight || 1

    const currentWeight = profile?.current_weight || todayLog?.weight || (weightHistory.length > 0 ? weightHistory[weightHistory.length - 1] : '--')
    const targetWeight = profile?.target_weight || '--'
    const height = profile?.height || '--'
    const goal = profile?.goal || 'Weight Loss'

    return (
      <div className="space-y-5">
        {/* User Header */}
        <div className="flex flex-col items-center text-center pt-2">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {userInitials}
            </div>
            <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center border border-gray-200 dark:border-gray-700">
              <Camera className="w-3.5 h-3.5 text-gray-500" />
            </button>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mt-3">{user?.full_name || 'User'}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {user?.created_at ? `Member since ${new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : 'NutriTrack Member'}
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Current', value: String(currentWeight), unit: typeof currentWeight === 'number' ? 'lbs' : '' },
            { label: 'Goal', value: String(targetWeight), unit: typeof targetWeight === 'number' ? 'lbs' : '' },
            { label: 'Height', value: height ? String(height) : '--', unit: typeof height === 'number' ? 'in' : '' },
          ].map(stat => (
            <Card key={stat.label} className="border-0 shadow-sm">
              <CardContent className="p-3 text-center">
                <p className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}<span className="text-xs font-normal text-gray-400 ml-0.5">{stat.unit}</span></p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Goals */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-gray-900 dark:text-white capitalize">{goal}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {profile?.diet_type ? `Diet: ${profile.diet_type}` : 'Target: 1 lb/week'}
              </p>
            </div>
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-0">On Track</Badge>
          </CardContent>
        </Card>

        {/* Weight Chart */}
        {weightHistory.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Weight Progress (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex items-end gap-2 h-28">
                {weightHistory.map((w, i) => {
                  const height = 20 + ((maxWeight - w) / range) * 60
                  const barHeight = 100 - height
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">{w}</span>
                      <div className="w-full flex flex-col justify-end h-20">
                        <div
                          className="w-full rounded-t-md bg-gradient-to-t from-emerald-500 to-emerald-300 dark:from-emerald-600 dark:to-emerald-400 transition-all"
                          style={{ height: `${Math.max(barHeight, 15)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-400">{weightDays[i] || ''}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {weightHistory.length === 0 && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">No weight data yet. Start logging to see your progress!</p>
            </CardContent>
          </Card>
        )}

        {/* Achievements */}
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Achievements</h2>
          <div className="grid grid-cols-4 gap-3">
            {achievements.map(a => {
              const isEarned = a.name === 'First Week' ? streak >= 7
                : a.name === '10 Day Streak' ? streak >= 10
                : a.name === 'Protein Pro' ? (macros[0].current >= macros[0].target)
                : a.name === 'Hydration Hero' ? (waterCount >= waterTarget)
                : a.earned
              return (
                <div key={a.name} className="flex flex-col items-center gap-1 text-center">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    isEarned
                      ? 'bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-950/20 shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-800 opacity-50'
                  }`}>
                    <a.icon className={`w-6 h-6 ${isEarned ? a.color : 'text-gray-400'}`} />
                  </div>
                  <span className="text-[10px] text-gray-600 dark:text-gray-400 leading-tight">{a.name}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Diet Info */}
        {profile?.restrictions && profile.restrictions.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Dietary Restrictions</p>
              <div className="flex flex-wrap gap-1">
                {(Array.isArray(profile.restrictions) ? profile.restrictions : [profile.restrictions]).map((r, i) => (
                  <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{r}</span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Settings Links */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0 divide-y divide-gray-100 dark:divide-gray-800">
            {[
              { label: 'Dietary Preferences', icon: Leaf },
              { label: 'Notifications', icon: Bell },
              { label: 'Units & Measurements', icon: Settings },
              { label: 'Connected Apps', icon: Zap },
            ].map(link => (
              <button key={link.label} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition text-left">
                <link.icon className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1">{link.label}</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Logout */}
        <Button
          variant="outline"
          className="w-full h-12 rounded-xl text-red-500 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
          onClick={() => { logout(); if (onNavigate) onNavigate('login') }}
        >
          <LogOut className="w-4 h-4 mr-2" /> Log Out
        </Button>
      </div>
    )
  }

  /* ---- MAIN RENDER ---- */
  const renderContent = () => {
    switch (activeTab) {
      case 'home': return renderHome()
      case 'log': return renderLogFood()
      case 'recipes': return renderRecipes()
      case 'plan': return renderPlan()
      case 'profile': return renderProfile()
      default: return renderHome()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* Theme Switcher */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeSwitcher />
      </div>

      {/* App Container */}
      <div className="max-w-[430px] mx-auto min-h-screen bg-white dark:bg-gray-900 shadow-2xl relative">
        {/* Scrollable Content */}
        <div className="pb-24 pt-6 px-5 overflow-y-auto">
          {renderContent()}
        </div>

        {/* Bottom Tab Bar */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 z-40">
          <div className="flex items-center justify-around py-2 px-2">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id
              const isLog = tab.id === 'log'
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all ${
                    isLog
                      ? ''
                      : isActive
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                >
                  {isLog ? (
                    <div className={`w-12 h-12 -mt-5 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
                      isActive
                        ? 'bg-emerald-500 scale-110'
                        : 'bg-emerald-500 hover:bg-emerald-600'
                    }`}>
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                  ) : (
                    <tab.icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : ''}`} />
                  )}
                  <span className={`text-[10px] font-medium ${isLog ? 'mt-0.5' : ''}`}>{tab.label}</span>
                </button>
              )
            })}
          </div>
          {/* Safe area spacer for notched phones */}
          <div className="h-[env(safe-area-inset-bottom,0px)]" />
        </nav>
      </div>
    </div>
  )
}
