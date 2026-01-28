"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, CheckCircle2, Circle, TrendingUp, Calendar, Target, Award, Flame, BarChart3, Settings, Trash2, Edit2, X, Bell, BellOff, Clock, LineChart, PieChart, Activity, Zap, Trophy, Sparkles, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useHabits, useUserStats, useNotificationSettings } from "@/hooks/useSupabaseData";
import AuthPage from "@/components/AuthPage";

// Types
interface Habit {
  id: string;
  user_id: string;
  name: string;
  category: 'health' | 'productivity' | 'mindfulness' | 'fitness' | 'learning' | 'social';
  color: string;
  icon: string;
  streak: number;
  best_streak: number;
  completed_dates: string[];
  created_at: string;
  reminder_time?: string;
  reminder_enabled: boolean;
}

interface Stats {
  id: string;
  user_id: string;
  total_habits: number;
  completed_today: number;
  total_points: number;
  level: number;
  longest_streak: number;
  updated_at: string;
}

interface NotificationSettings {
  id: string;
  user_id: string;
  enabled: boolean;
  daily_reminder: boolean;
  daily_reminder_time: string;
  sound_enabled: boolean;
  updated_at: string;
}

interface DayStats {
  date: string;
  completed: number;
  total: number;
  percentage: number;
}

const categoryColors = {
  health: "from-emerald-500 via-teal-500 to-cyan-500",
  productivity: "from-blue-500 via-indigo-500 to-purple-500",
  mindfulness: "from-purple-500 via-pink-500 to-rose-500",
  fitness: "from-orange-500 via-amber-500 to-yellow-500",
  learning: "from-cyan-500 via-sky-500 to-blue-500",
  social: "from-pink-500 via-rose-500 to-red-500",
};

const categoryIcons = {
  health: "❤️",
  productivity: "⚡",
  mindfulness: "🧘",
  fitness: "💪",
  learning: "📚",
  social: "👥",
};

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const { habits, loading: habitsLoading, addHabit, updateHabit, deleteHabit } = useHabits();
  const { stats, loading: statsLoading, updateStats } = useUserStats();
  const { settings: notificationSettings, loading: settingsLoading, updateSettings } = useNotificationSettings();

  const [view, setView] = useState<"today" | "stats" | "calendar" | "progress">("today");
  const [progressPeriod, setProgressPeriod] = useState<"week" | "month" | "all">("week");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [newHabit, setNewHabit] = useState({
    name: "",
    category: "health" as Habit["category"],
    reminderTime: "",
    reminderEnabled: false,
  });
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");

  // Show auth page if not authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  // Advanced analytics calculations
  const progressData = useMemo(() => {
    const days = progressPeriod === "week" ? 7 : progressPeriod === "month" ? 30 : 90;
    const data: DayStats[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const completed = habits.filter(h => h.completed_dates.includes(dateStr)).length;
      const total = habits.length;
      const percentage = total > 0 ? (completed / total) * 100 : 0;

      data.push({ date: dateStr, completed, total, percentage });
    }

    return data;
  }, [habits, progressPeriod]);

  const weekdayAnalysis = useMemo(() => {
    const analysis = Array(7).fill(0).map((_, i) => ({
      day: weekDays[i],
      completed: 0,
      total: 0,
      percentage: 0,
    }));

    habits.forEach(habit => {
      habit.completed_dates.forEach(dateStr => {
        const date = new Date(dateStr);
        const dayIndex = date.getDay();
        analysis[dayIndex].completed++;
      });
    });

    const totalDays = progressData.length;
    analysis.forEach((day, i) => {
      const daysInPeriod = progressData.filter(d => new Date(d.date).getDay() === i).length;
      day.total = habits.length * daysInPeriod;
      day.percentage = day.total > 0 ? (day.completed / day.total) * 100 : 0;
    });

    return analysis;
  }, [habits, progressData]);

  const habitComparison = useMemo(() => {
    return habits.map(habit => {
      const relevantDates = progressData.map(d => d.date);
      const completed = habit.completed_dates.filter(d => relevantDates.includes(d)).length;
      const total = relevantDates.length;
      const percentage = total > 0 ? (completed / total) * 100 : 0;

      return {
        ...habit,
        completedInPeriod: completed,
        totalInPeriod: total,
        percentageInPeriod: percentage,
      };
    }).sort((a, b) => b.percentageInPeriod - a.percentageInPeriod);
  }, [habits, progressData]);

  const insights = useMemo(() => {
    const insights: string[] = [];

    // Best day analysis
    const bestDay = weekdayAnalysis.reduce((best, day) =>
      day.percentage > best.percentage ? day : best
    , weekdayAnalysis[0]);

    if (bestDay.percentage > 0) {
      insights.push(`🎯 Seu melhor dia é ${bestDay.day} com ${bestDay.percentage.toFixed(0)}% de conclusão!`);
    }

    // Streak analysis
    const activeStreaks = habits.filter(h => h.streak > 0).length;
    if (activeStreaks > 0) {
      insights.push(`🔥 Você tem ${activeStreaks} streak(s) ativo(s)! Continue assim!`);
    }

    // Recent performance
    const last7Days = progressData.slice(-7);
    const avgLast7 = last7Days.reduce((sum, d) => sum + d.percentage, 0) / 7;
    if (avgLast7 > 70) {
      insights.push(`⭐ Excelente! Média de ${avgLast7.toFixed(0)}% nos últimos 7 dias!`);
    } else if (avgLast7 < 30) {
      insights.push(`💪 Você pode melhorar! Tente completar mais hábitos esta semana.`);
    }

    // Best habit
    const bestHabit = habitComparison[0];
    if (bestHabit && bestHabit.percentageInPeriod > 80) {
      insights.push(`🏆 "${bestHabit.name}" está indo muito bem com ${bestHabit.percentageInPeriod.toFixed(0)}%!`);
    }

    // Improvement opportunity
    const worstHabit = habitComparison[habitComparison.length - 1];
    if (worstHabit && worstHabit.percentageInPeriod < 30) {
      insights.push(`📈 "${worstHabit.name}" precisa de mais atenção. Que tal focar nele hoje?`);
    }

    return insights;
  }, [habits, weekdayAnalysis, progressData, habitComparison]);

  // Check notification permission
  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === "granted") {
        updateSettings({ enabled: true });
      }
    }
  };

  // Show notification
  const showNotification = (title: string, body: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/icon.svg",
        badge: "/icon.svg",
        tag: "daily-routine",
        requireInteraction: false,
      });
    }
  };

  // Check and send reminders
  useEffect(() => {
    if (!notificationSettings?.enabled) return;

    const checkReminders = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
      const today = now.toISOString().split("T")[0];

      // Daily reminder
      if (notificationSettings.daily_reminder && currentTime === notificationSettings.daily_reminder_time) {
        const incomplete = habits.filter(h => !h.completed_dates.includes(today));
        if (incomplete.length > 0) {
          showNotification(
            "Lembrete Diário! 📅",
            `Você tem ${incomplete.length} hábito(s) para completar hoje.`
          );
        }
      }

      // Individual habit reminders
      habits.forEach(habit => {
        if (habit.reminder_enabled && habit.reminder_time === currentTime && !habit.completed_dates.includes(today)) {
          showNotification(
            `Hora do hábito! ${habit.icon}`,
            `Não esqueça: ${habit.name}`
          );
        }
      });
    };

    const interval = setInterval(checkReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [habits, notificationSettings]);

  const toggleHabit = async (habitId: string) => {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const isCompleted = habit.completed_dates.includes(today);
    let newCompletedDates: string[];
    let newStreak = habit.streak;

    if (isCompleted) {
      // Uncomplete
      newCompletedDates = habit.completed_dates.filter((d) => d !== today);
      newStreak = habit.completed_dates.includes(yesterday) ? habit.streak - 1 : 0;
    } else {
      // Complete
      newCompletedDates = [...habit.completed_dates, today];
      newStreak = habit.completed_dates.includes(yesterday) ? habit.streak + 1 : 1;

      // Show celebration notification
      if (notificationSettings?.enabled && newStreak > 0) {
        if (newStreak % 7 === 0) {
          showNotification("🎉 Incrível!", `${newStreak} dias de streak em "${habit.name}"!`);
        } else if (newStreak === 1) {
          showNotification("✅ Ótimo começo!", `Você completou "${habit.name}" hoje!`);
        }
      }
    }

    const newBestStreak = Math.max(newStreak, habit.best_streak);

    try {
      await updateHabit(habitId, {
        completed_dates: newCompletedDates,
        streak: newStreak,
        best_streak: newBestStreak,
      });

      // Update stats
      const completedToday = habits.filter(h => h.id !== habitId && h.completed_dates.includes(today)).length + (isCompleted ? 0 : 1);
      const totalPoints = habits.reduce((sum, h) => sum + h.completed_dates.length * 10, 0) + (isCompleted ? -10 : 10);
      const longestStreak = Math.max(...habits.map(h => h.id === habitId ? newBestStreak : h.best_streak));

      await updateStats({
        total_habits: habits.length,
        completed_today: completedToday,
        total_points: totalPoints,
        level: Math.floor(totalPoints / 500) + 1,
        longest_streak: longestStreak,
      });
    } catch (error) {
      console.error('Error toggling habit:', error);
    }
  };

  const handleAddHabit = async () => {
    if (!newHabit.name.trim()) return;

    const habit: Omit<Habit, 'id' | 'user_id' | 'created_at'> = {
      name: newHabit.name,
      category: newHabit.category,
      color: categoryColors[newHabit.category],
      icon: categoryIcons[newHabit.category],
      streak: 0,
      best_streak: 0,
      completed_dates: [],
      reminder_time: newHabit.reminderTime || undefined,
      reminder_enabled: newHabit.reminderEnabled,
    };

    try {
      await addHabit(habit);
      setNewHabit({ name: "", category: "health", reminderTime: "", reminderEnabled: false });
      setShowAddModal(false);

      if (notificationSettings?.enabled) {
        showNotification("Novo Hábito Criado! 🎯", `"${habit.name}" foi adicionado à sua rotina.`);
      }
    } catch (error) {
      console.error('Error adding habit:', error);
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    try {
      await deleteHabit(habitId);
      setShowEditModal(false);
      setEditingHabit(null);
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  };

  const handleUpdateHabit = async () => {
    if (!editingHabit) return;

    try {
      await updateHabit(editingHabit.id, {
        name: editingHabit.name,
        category: editingHabit.category,
        color: categoryColors[editingHabit.category],
        icon: categoryIcons[editingHabit.category],
        reminder_time: editingHabit.reminder_time,
        reminder_enabled: editingHabit.reminder_enabled,
      });
      setShowEditModal(false);
      setEditingHabit(null);
    } catch (error) {
      console.error('Error updating habit:', error);
    }
  };

  const saveNotificationSettings = async () => {
    if (!notificationSettings) return;

    try {
      await updateSettings(notificationSettings);
      setShowSettingsModal(false);
      if (notificationSettings.enabled) {
        showNotification("Configurações Salvas! ⚙️", "Suas preferências de notificação foram atualizadas.");
      }
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const completionRate = habits.length > 0 ? Math.round((stats?.completed_today || 0) / habits.length * 100) : 0;

  if (habitsLoading || statsLoading || settingsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="relative bg-black/20 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-60 animate-pulse"></div>
                <div className="relative w-14 h-14 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/50 transform hover:scale-110 transition-transform">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
                  Daily Routine
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <p className="text-sm text-gray-300 font-medium">Nível {stats?.level || 1}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm px-4 py-2 rounded-2xl border border-orange-500/30 shadow-lg shadow-orange-500/20">
                <Flame className="w-5 h-5 text-orange-400" />
                <span className="text-base font-bold text-orange-300">
                  {stats?.longest_streak || 0}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm px-4 py-2 rounded-2xl border border-purple-500/30 shadow-lg shadow-purple-500/20">
                <Award className="w-5 h-5 text-purple-400" />
                <span className="text-base font-bold text-purple-300">
                  {stats?.total_points || 0}
                </span>
              </div>
              <button
                onClick={() => setShowSettingsModal(true)}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all backdrop-blur-sm border border-white/10 hover:border-white/20 hover:scale-110 transform"
              >
                <Settings className="w-5 h-5 text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Notification Banner */}
      {notificationPermission !== "granted" && (
        <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white">Ative as notificações!</p>
                <p className="text-sm text-white/80">
                  Receba lembretes para nunca esquecer seus hábitos
                </p>
              </div>
            </div>
            <button
              onClick={requestNotificationPermission}
              className="bg-white text-purple-600 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-100 transition-all shadow-xl hover:scale-105 transform"
            >
              Ativar Agora
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-32">
        {/* Progress Card */}
        <div className="relative mb-8 group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
          <div className="relative bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 rounded-3xl p-8 shadow-2xl border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Progresso de Hoje</h2>
                <p className="text-white/90 text-base flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  {stats?.completed_today || 0} de {habits.length} hábitos completados
                </p>
              </div>
              <div className="text-right">
                <div className="text-6xl font-black text-white drop-shadow-2xl">{completionRate}%</div>
                <p className="text-white/80 text-sm font-medium mt-1">Completo</p>
              </div>
            </div>
            <div className="relative w-full bg-white/20 rounded-full h-4 overflow-hidden backdrop-blur-sm">
              <div
                className="absolute inset-0 bg-gradient-to-r from-white via-yellow-200 to-white h-full rounded-full transition-all duration-700 ease-out shadow-lg"
                style={{ width: `${completionRate}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-3 mb-8 bg-black/20 backdrop-blur-xl p-2 rounded-3xl overflow-x-auto border border-white/10 shadow-2xl">
          <button
            onClick={() => setView("today")}
            className={`flex-1 py-4 px-6 rounded-2xl font-bold transition-all whitespace-nowrap transform hover:scale-105 ${
              view === "today"
                ? "bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white shadow-2xl shadow-purple-500/50 scale-105"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-6 h-6" />
              <span>Hoje</span>
            </div>
          </button>
          <button
            onClick={() => setView("progress")}
            className={`flex-1 py-4 px-6 rounded-2xl font-bold transition-all whitespace-nowrap transform hover:scale-105 ${
              view === "progress"
                ? "bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white shadow-2xl shadow-purple-500/50 scale-105"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <LineChart className="w-6 h-6" />
              <span>Progresso</span>
            </div>
          </button>
          <button
            onClick={() => setView("stats")}
            className={`flex-1 py-4 px-6 rounded-2xl font-bold transition-all whitespace-nowrap transform hover:scale-105 ${
              view === "stats"
                ? "bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white shadow-2xl shadow-purple-500/50 scale-105"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <BarChart3 className="w-6 h-6" />
              <span>Stats</span>
            </div>
          </button>
          <button
            onClick={() => setView("calendar")}
            className={`flex-1 py-4 px-6 rounded-2xl font-bold transition-all whitespace-nowrap transform hover:scale-105 ${
              view === "calendar"
                ? "bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white shadow-2xl shadow-purple-500/50 scale-105"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Calendar className="w-6 h-6" />
              <span>Calendário</span>
            </div>
          </button>
        </div>

        {/* Today View */}
        {view === "today" && (
          <div className="space-y-4">
            {habits.map((habit) => {
              const isCompleted = habit.completed_dates.includes(today);
              return (
                <div
                  key={habit.id}
                  className={`relative group bg-black/20 backdrop-blur-xl rounded-3xl p-6 border transition-all hover:scale-[1.02] transform shadow-xl ${
                    isCompleted
                      ? "border-emerald-500/50 bg-emerald-500/10 shadow-emerald-500/20"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-5">
                    <button
                      onClick={() => toggleHabit(habit.id)}
                      className={`relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all transform hover:scale-110 ${
                        isCompleted
                          ? "bg-gradient-to-br from-emerald-500 to-teal-500 shadow-2xl shadow-emerald-500/50"
                          : "bg-white/5 hover:bg-white/10 border-2 border-white/20"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-9 h-9 text-white" />
                      ) : (
                        <Circle className="w-9 h-9 text-gray-400" />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">{habit.icon}</span>
                        <h3 className="font-bold text-xl text-white">{habit.name}</h3>
                        {habit.reminder_enabled && (
                          <div className="p-1.5 bg-purple-500/20 rounded-lg">
                            <Bell className="w-4 h-4 text-purple-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 bg-orange-500/20 px-3 py-1.5 rounded-xl">
                          <Flame className="w-4 h-4 text-orange-400" />
                          <span className="font-semibold text-orange-300">{habit.streak} dias</span>
                        </div>
                        <div className="flex items-center gap-2 bg-blue-500/20 px-3 py-1.5 rounded-xl">
                          <Target className="w-4 h-4 text-blue-400" />
                          <span className="font-semibold text-blue-300">Melhor: {habit.best_streak}</span>
                        </div>
                        {habit.reminder_time && (
                          <div className="flex items-center gap-2 bg-purple-500/20 px-3 py-1.5 rounded-xl">
                            <Clock className="w-4 h-4 text-purple-400" />
                            <span className="font-semibold text-purple-300">{habit.reminder_time}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setEditingHabit(habit);
                        setShowEditModal(true);
                      }}
                      className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10 hover:border-white/20 hover:scale-110 transform"
                    >
                      <Edit2 className="w-5 h-5 text-gray-300" />
                    </button>
                  </div>
                </div>
              );
            })}

            {habits.length === 0 && (
              <div className="text-center py-20">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-2xl opacity-40"></div>
                  <div className="relative w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center backdrop-blur-xl border border-white/10">
                    <Target className="w-16 h-16 text-purple-400" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Nenhum hábito ainda
                </h3>
                <p className="text-gray-400 text-lg mb-8">
                  Comece sua jornada criando seu primeiro hábito!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Progress View */}
        {view === "progress" && (
          <div className="space-y-6">
            {/* Period Selector */}
            <div className="flex gap-3 bg-black/20 backdrop-blur-xl p-2 rounded-3xl border border-white/10">
              <button
                onClick={() => setProgressPeriod("week")}
                className={`flex-1 py-3 px-6 rounded-2xl font-bold transition-all transform hover:scale-105 ${
                  progressPeriod === "week"
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xl"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                7 Dias
              </button>
              <button
                onClick={() => setProgressPeriod("month")}
                className={`flex-1 py-3 px-6 rounded-2xl font-bold transition-all transform hover:scale-105 ${
                  progressPeriod === "month"
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xl"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                30 Dias
              </button>
              <button
                onClick={() => setProgressPeriod("all")}
                className={`flex-1 py-3 px-6 rounded-2xl font-bold transition-all transform hover:scale-105 ${
                  progressPeriod === "all"
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xl"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                90 Dias
              </button>
            </div>

            {/* Insights Cards */}
            {insights.length > 0 && (
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl p-8 border border-white/10 shadow-2xl">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <Zap className="w-7 h-7" />
                    </div>
                    Insights Automáticos
                  </h3>
                  <div className="space-y-3">
                    {insights.map((insight, i) => (
                      <div key={i} className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all">
                        <p className="text-base font-medium">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Progress Chart */}
            <div className="bg-black/20 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-xl">
                  <LineChart className="w-7 h-7 text-purple-400" />
                </div>
                Gráfico de Progresso
              </h3>
              <div className="space-y-3">
                {progressData.map((day, i) => {
                  const date = new Date(day.date);
                  const label = progressPeriod === "week"
                    ? weekDays[date.getDay()]
                    : `${date.getDate()}/${date.getMonth() + 1}`;

                  return (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-16 text-sm font-semibold text-gray-300">{label}</div>
                      <div className="flex-1 bg-white/5 rounded-full h-10 overflow-hidden border border-white/10">
                        <div
                          className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 h-full rounded-full flex items-center justify-end pr-4 transition-all duration-700 shadow-lg"
                          style={{ width: `${day.percentage}%` }}
                        >
                          {day.percentage > 15 && (
                            <span className="text-sm font-bold text-white drop-shadow-lg">
                              {day.percentage.toFixed(0)}%
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="w-20 text-sm font-semibold text-gray-300 text-right">
                        {day.completed}/{day.total}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Weekday Analysis */}
            <div className="bg-black/20 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-xl">
                  <Activity className="w-7 h-7 text-emerald-400" />
                </div>
                Análise por Dia da Semana
              </h3>
              <div className="grid grid-cols-7 gap-3">
                {weekdayAnalysis.map((day, i) => {
                  const maxPercentage = Math.max(...weekdayAnalysis.map(d => d.percentage));
                  const isBest = day.percentage === maxPercentage && maxPercentage > 0;

                  return (
                    <div key={i} className="text-center">
                      <div className="text-sm font-semibold text-gray-300 mb-3">{day.day}</div>
                      <div className={`relative h-32 rounded-2xl flex items-end justify-center p-3 overflow-hidden transition-all hover:scale-105 transform ${
                        isBest
                          ? "bg-gradient-to-t from-emerald-500 to-emerald-600 shadow-2xl shadow-emerald-500/50"
                          : "bg-white/5 border border-white/10"
                      }`}>
                        <div
                          className={`w-full rounded-t-xl transition-all ${
                            isBest ? "bg-white/30" : "bg-gradient-to-t from-purple-500 to-pink-500"
                          }`}
                          style={{ height: `${day.percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-base font-bold mt-3 text-white">
                        {day.percentage.toFixed(0)}%
                      </div>
                      {isBest && (
                        <div className="text-2xl mt-2">🏆</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Habit Comparison */}
            <div className="bg-black/20 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-xl">
                  <Trophy className="w-7 h-7 text-yellow-400" />
                </div>
                Comparação de Hábitos
              </h3>
              <div className="space-y-4">
                {habitComparison.map((habit, i) => (
                  <div key={habit.id} className="flex items-center gap-4 bg-white/5 rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-all">
                    <div className="w-12 text-center">
                      {i === 0 && habit.percentageInPeriod > 0 ? (
                        <span className="text-4xl">🥇</span>
                      ) : i === 1 && habit.percentageInPeriod > 0 ? (
                        <span className="text-4xl">🥈</span>
                      ) : i === 2 && habit.percentageInPeriod > 0 ? (
                        <span className="text-4xl">🥉</span>
                      ) : (
                        <span className="text-gray-500 text-lg font-bold">{i + 1}</span>
                      )}
                    </div>
                    <span className="text-3xl">{habit.icon}</span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <span className="font-bold text-white">{habit.name}</span>
                        <span className="text-sm text-gray-400 font-semibold">
                          {habit.completedInPeriod}/{habit.totalInPeriod}
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden border border-white/10">
                        <div
                          className={`bg-gradient-to-r ${habit.color} h-full rounded-full transition-all duration-700 shadow-lg`}
                          style={{ width: `${habit.percentageInPeriod}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-20 text-right">
                      <span className={`text-2xl font-black drop-shadow-lg ${
                        habit.percentageInPeriod >= 80 ? "text-emerald-400" :
                        habit.percentageInPeriod >= 50 ? "text-yellow-400" :
                        "text-red-400"
                      }`}>
                        {habit.percentageInPeriod.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Stats View */}
        {view === "stats" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-purple-700 rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-purple-600 to-purple-700 rounded-3xl p-8 shadow-2xl border border-white/10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-white/20 rounded-2xl">
                      <Award className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <div className="text-5xl font-black text-white drop-shadow-2xl">{stats?.level || 1}</div>
                      <div className="text-white/90 text-base font-semibold">Nível Atual</div>
                    </div>
                  </div>
                  <div className="relative w-full bg-white/20 rounded-full h-3 mt-4 overflow-hidden">
                    <div
                      className="bg-white h-full rounded-full shadow-lg transition-all duration-700"
                      style={{
                        width: `${((stats?.total_points || 0) % 500) / 500 * 100}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-sm text-white/80 mt-3 font-medium">
                    {500 - ((stats?.total_points || 0) % 500)} pts para próximo nível
                  </p>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-red-600 rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-orange-600 to-red-600 rounded-3xl p-8 shadow-2xl border border-white/10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-white/20 rounded-2xl">
                      <Flame className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <div className="text-5xl font-black text-white drop-shadow-2xl">{stats?.longest_streak || 0}</div>
                      <div className="text-white/90 text-base font-semibold">Melhor Streak</div>
                    </div>
                  </div>
                  <p className="text-sm text-white/80 mt-7 font-medium">
                    Continue assim! Você está indo muito bem! 🔥
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-black/20 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-xl">
                  <TrendingUp className="w-7 h-7 text-emerald-400" />
                </div>
                Estatísticas Gerais
              </h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10">
                  <span className="text-gray-300 font-semibold">Total de Hábitos</span>
                  <span className="text-3xl font-black text-white">{stats?.total_habits || 0}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10">
                  <span className="text-gray-300 font-semibold">Pontos Totais</span>
                  <span className="text-3xl font-black text-purple-400">
                    {stats?.total_points || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10">
                  <span className="text-gray-300 font-semibold">Completados Hoje</span>
                  <span className="text-3xl font-black text-emerald-400">
                    {stats?.completed_today || 0}/{stats?.total_habits || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10">
                  <span className="text-gray-300 font-semibold">Taxa de Conclusão</span>
                  <span className="text-3xl font-black text-blue-400">
                    {completionRate}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-black/20 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
              <h3 className="text-2xl font-bold mb-6">Hábitos por Categoria</h3>
              <div className="space-y-4">
                {Object.entries(
                  habits.reduce((acc, habit) => {
                    acc[habit.category] = (acc[habit.category] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([category, count]) => (
                  <div key={category} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                    <span className="text-4xl">
                      {categoryIcons[category as Habit["category"]]}
                    </span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <span className="capitalize font-bold text-white">{category}</span>
                        <span className="text-gray-400 font-semibold">{count}</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-3 border border-white/10">
                        <div
                          className={`bg-gradient-to-r ${
                            categoryColors[category as Habit["category"]]
                          } h-full rounded-full shadow-lg transition-all duration-700`}
                          style={{
                            width: `${(count / habits.length) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Calendar View */}
        {view === "calendar" && (
          <div className="space-y-6">
            {habits.map((habit) => (
              <div
                key={habit.id}
                className="bg-black/20 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl"
              >
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-4xl">{habit.icon}</span>
                  <div>
                    <h3 className="font-bold text-2xl text-white">{habit.name}</h3>
                    <p className="text-base text-gray-400 font-medium">
                      {habit.completed_dates.length} dias completados
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-3">
                  {Array.from({ length: 28 }, (_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - (27 - i));
                    const dateStr = date.toISOString().split("T")[0];
                    const isCompleted = habit.completed_dates.includes(dateStr);
                    const isToday = dateStr === today;

                    return (
                      <div
                        key={i}
                        className={`aspect-square rounded-2xl flex items-center justify-center text-sm font-bold transition-all hover:scale-110 transform ${
                          isCompleted
                            ? `bg-gradient-to-br ${habit.color} text-white shadow-2xl`
                            : isToday
                            ? "bg-white/10 border-2 border-purple-500 text-white"
                            : "bg-white/5 text-gray-500 border border-white/10"
                        }`}
                      >
                        {date.getDate()}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Add Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-2xl opacity-60 group-hover:opacity-100 transition-opacity animate-pulse"></div>
          <button
            onClick={() => setShowAddModal(true)}
            className="relative w-20 h-20 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform border-4 border-white/20"
          >
            <Plus className="w-10 h-10 text-white" />
          </button>
        </div>
      </div>

      {/* Add Habit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 max-w-md w-full border border-white/10 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Novo Hábito</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10 hover:scale-110 transform"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold mb-3 text-gray-300">
                  Nome do Hábito
                </label>
                <input
                  type="text"
                  value={newHabit.name}
                  onChange={(e) =>
                    setNewHabit({ ...newHabit, name: e.target.value })
                  }
                  placeholder="Ex: Ler 30 minutos"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-purple-500 transition-all text-white placeholder-gray-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-3 text-gray-300">
                  Categoria
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(categoryIcons).map(([cat, icon]) => (
                    <button
                      key={cat}
                      onClick={() =>
                        setNewHabit({
                          ...newHabit,
                          category: cat as Habit["category"],
                        })
                      }
                      className={`p-5 rounded-2xl border-2 transition-all transform hover:scale-105 ${
                        newHabit.category === cat
                          ? `border-purple-500 bg-gradient-to-br ${
                              categoryColors[cat as Habit["category"]]
                            } shadow-2xl`
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <div className="text-4xl mb-2">{icon}</div>
                      <div className="text-xs capitalize font-semibold">{cat}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-bold text-gray-300">
                    Lembrete Diário
                  </label>
                  <button
                    onClick={() =>
                      setNewHabit({
                        ...newHabit,
                        reminderEnabled: !newHabit.reminderEnabled,
                      })
                    }
                    className={`relative w-14 h-7 rounded-full transition-all ${
                      newHabit.reminderEnabled
                        ? "bg-gradient-to-r from-purple-500 to-pink-500"
                        : "bg-gray-600"
                    }`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform shadow-lg ${
                        newHabit.reminderEnabled ? "translate-x-7" : ""
                      }`}
                    ></div>
                  </button>
                </div>
                {newHabit.reminderEnabled && (
                  <input
                    type="time"
                    value={newHabit.reminderTime}
                    onChange={(e) =>
                      setNewHabit({ ...newHabit, reminderTime: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-purple-500 transition-all text-white font-medium"
                  />
                )}
              </div>

              <button
                onClick={handleAddHabit}
                className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white py-5 rounded-2xl font-bold hover:scale-105 transition-transform shadow-2xl text-lg"
              >
                Criar Hábito
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Habit Modal */}
      {showEditModal && editingHabit && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 max-w-md w-full border border-white/10 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Editar Hábito</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingHabit(null);
                }}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10 hover:scale-110 transform"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold mb-3 text-gray-300">
                  Nome do Hábito
                </label>
                <input
                  type="text"
                  value={editingHabit.name}
                  onChange={(e) =>
                    setEditingHabit({ ...editingHabit, name: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-purple-500 transition-all text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-3 text-gray-300">
                  Categoria
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(categoryIcons).map(([cat, icon]) => (
                    <button
                      key={cat}
                      onClick={() =>
                        setEditingHabit({
                          ...editingHabit,
                          category: cat as Habit["category"],
                          color: categoryColors[cat as Habit["category"]],
                          icon: categoryIcons[cat as Habit["category"]],
                        })
                      }
                      className={`p-5 rounded-2xl border-2 transition-all transform hover:scale-105 ${
                        editingHabit.category === cat
                          ? `border-purple-500 bg-gradient-to-br ${
                              categoryColors[cat as Habit["category"]]
                            } shadow-2xl`
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <div className="text-4xl mb-2">{icon}</div>
                      <div className="text-xs capitalize font-semibold">{cat}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-bold text-gray-300">
                    Lembrete Diário
                  </label>
                  <button
                    onClick={() =>
                      setEditingHabit({
                        ...editingHabit,
                        reminder_enabled: !editingHabit.reminder_enabled,
                      })
                    }
                    className={`relative w-14 h-7 rounded-full transition-all ${
                      editingHabit.reminder_enabled
                        ? "bg-gradient-to-r from-purple-500 to-pink-500"
                        : "bg-gray-600"
                    }`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform shadow-lg ${
                        editingHabit.reminder_enabled ? "translate-x-7" : ""
                      }`}
                    ></div>
                  </button>
                </div>
                {editingHabit.reminder_enabled && (
                  <input
                    type="time"
                    value={editingHabit.reminder_time || ""}
                    onChange={(e) =>
                      setEditingHabit({
                        ...editingHabit,
                        reminder_time: e.target.value,
                      })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-purple-500 transition-all text-white font-medium"
                  />
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleUpdateHabit}
                  className="flex-1 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white py-5 rounded-2xl font-bold hover:scale-105 transition-transform shadow-2xl"
                >
                  Salvar
                </button>
                <button
                  onClick={() => handleDeleteHabit(editingHabit.id)}
                  className="px-8 bg-red-500/20 text-red-400 py-5 rounded-2xl font-bold hover:bg-red-500/30 transition-all border-2 border-red-500/50 hover:scale-105 transform"
                >
                  <Trash2 className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 max-w-md w-full border border-white/10 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Configurações</h2>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10 hover:scale-110 transform"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-xl">
                    <Bell className="w-6 h-6 text-purple-400" />
                  </div>
                  Notificações
                </h3>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div>
                      <p className="font-bold text-white">Notificações Ativadas</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Receba lembretes dos seus hábitos
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        if (!notificationSettings?.enabled && notificationPermission !== "granted") {
                          requestNotificationPermission();
                        } else {
                          updateSettings({ enabled: !notificationSettings?.enabled });
                        }
                      }}
                      className={`relative w-14 h-7 rounded-full transition-all ${
                        notificationSettings?.enabled
                          ? "bg-gradient-to-r from-purple-500 to-pink-500"
                          : "bg-gray-600"
                      }`}
                    >
                      <div
                        className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform shadow-lg ${
                          notificationSettings?.enabled ? "translate-x-7" : ""
                        }`}
                      ></div>
                    </button>
                  </div>

                  {notificationSettings?.enabled && (
                    <>
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                        <div>
                          <p className="font-bold text-white">Lembrete Diário</p>
                          <p className="text-sm text-gray-400 mt-1">
                            Receba um resumo diário
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            updateSettings({ daily_reminder: !notificationSettings?.daily_reminder })
                          }
                          className={`relative w-14 h-7 rounded-full transition-all ${
                            notificationSettings?.daily_reminder
                              ? "bg-gradient-to-r from-purple-500 to-pink-500"
                              : "bg-gray-600"
                          }`}
                        >
                          <div
                            className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform shadow-lg ${
                              notificationSettings?.daily_reminder
                                ? "translate-x-7"
                                : ""
                            }`}
                          ></div>
                        </button>
                      </div>

                      {notificationSettings?.daily_reminder && (
                        <div>
                          <label className="block text-sm font-bold mb-3 text-gray-300">
                            Horário do Lembrete Diário
                          </label>
                          <input
                            type="time"
                            value={notificationSettings?.daily_reminder_time || ""}
                            onChange={(e) =>
                              updateSettings({ daily_reminder_time: e.target.value })
                            }
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-purple-500 transition-all text-white font-medium"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                        <div>
                          <p className="font-bold text-white">Som de Notificação</p>
                          <p className="text-sm text-gray-400 mt-1">
                            Reproduzir som ao receber notificações
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            updateSettings({ sound_enabled: !notificationSettings?.sound_enabled })
                          }
                          className={`relative w-14 h-7 rounded-full transition-all ${
                            notificationSettings?.sound_enabled
                              ? "bg-gradient-to-r from-purple-500 to-pink-500"
                              : "bg-gray-600"
                          }`}
                        >
                          <div
                            className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform shadow-lg ${
                              notificationSettings?.sound_enabled
                                ? "translate-x-7"
                                : ""
                            }`}
                          ></div>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={saveNotificationSettings}
                className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white py-5 rounded-2xl font-bold hover:scale-105 transition-transform shadow-2xl text-lg"
              >
                Salvar Configurações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}