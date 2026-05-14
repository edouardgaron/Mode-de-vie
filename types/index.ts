export interface DailyCheckin {
  id: string;
  date: string; // YYYY-MM-DD
  // Health habits (boolean)
  slept7h: boolean;
  walked45min: boolean;
  didWorkout: boolean;
  drankWater: boolean;
  reducedVaping: boolean;
  // Business habits (boolean)
  did3Tasks: boolean;
  avoidedDispersal: boolean;
  // Integrity (boolean)
  toldTruth: boolean;
  // Health actions
  didHealthAction: boolean;
  // Finance actions
  didFinanceAction: boolean;
  // Social
  socialContact: boolean;
  // Scales 1-10
  energyLevel: number;
  stressLevel: number;
  confidenceLevel: number;
  integrityScore: number;
  // Journal
  avoidedToday: string;
  proudOf: string;
  truthToAccept: string;
  // Computed
  dailyScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'health' | 'business' | 'finance' | 'personal' | 'social';
  targetDate: string;
  active: boolean;
  progress: number; // 0-100
  createdAt: string;
  updatedAt: string;
}

export interface BusinessFocus {
  id: string;
  date: string; // YYYY-MM (month)
  mainBusiness: string;
  monthlyObjective: string;
  weeklyPriorities: string[];
  dailyTasks: string[];
  ideasNotToStart: string[];
  activeProjects: Project[];
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  createdAt: string;
}

export interface HealthEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weight?: number;
  workoutDone: boolean;
  workoutType?: string;
  workoutDuration?: number; // minutes
  workoutIntensity?: number; // 1-10
  musclesWorked?: string[];
  walkDone: boolean;
  walkDuration?: number; // minutes
  sleepHours?: number;
  vapingLevel: number; // 0-10, 0 = none
  energyLevel: number; // 1-10
  stressLevel: number; // 1-10
  notes?: string;
  createdAt: string;
}

export interface FinanceEntry {
  id: string;
  month: string; // YYYY-MM
  // Income
  paintingRevenue: number;
  prefabRevenue: number;
  realEstateRevenue: number;
  otherRevenue: number;
  // Expenses
  personalExpenses: number;
  businessExpenses: number;
  // Savings & Investments
  savings: number;
  investments: number;
  debt: number;
  cashAvailable: number;
  notes?: string;
  updatedAt: string;
}

export interface FinancialGoal {
  id: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  description: string;
  updatedAt: string;
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  plannedActions: string;
  actualActions: string;
  exaggerationsOrAvoidances: string;
  tomorrowCorrection: string;
  wasReliable: boolean;
  integrityScore: number; // 1-10
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyReview {
  id: string;
  weekStart: string; // YYYY-MM-DD (Monday)
  weekEnd: string; // YYYY-MM-DD (Sunday)
  wentWell: string;
  avoided: string;
  habitsSucceeded: string[];
  habitsFailed: string[];
  reasonsFailed: string;
  whatToKeep: string;
  whatToChange: string;
  nextWeekPriority: string;
  nextWeekObjectives: string[];
  overallScore: number; // 1-10
  createdAt: string;
  updatedAt: string;
}

export interface AppData {
  version: string;
  exportedAt: string;
  checkins: DailyCheckin[];
  goals: Goal[];
  businessFocus: BusinessFocus[];
  healthEntries: HealthEntry[];
  financeEntries: FinanceEntry[];
  financialGoal: FinancialGoal;
  journalEntries: JournalEntry[];
  weeklyReviews: WeeklyReview[];
}

export interface AppSettings {
  email: string;
  firstName: string;
  dailyReminderTime: string;
  enableDailyReminder: boolean;
  enableWeeklySummary: boolean;
  enablePushNotifications: boolean;
  pushSubscription: PushSubscriptionJSON | null;
  appUrl: string;
}
