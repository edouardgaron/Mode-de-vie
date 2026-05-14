import { AppData, DailyCheckin, Goal, BusinessFocus, HealthEntry, FinanceEntry, FinancialGoal, JournalEntry, WeeklyReview } from '@/types';

const KEYS = {
  CHECKINS: 'mdv_checkins',
  GOALS: 'mdv_goals',
  BUSINESS: 'mdv_business',
  HEALTH: 'mdv_health',
  FINANCE: 'mdv_finance',
  FINANCIAL_GOAL: 'mdv_financial_goal',
  JOURNAL: 'mdv_journal',
  REVIEWS: 'mdv_reviews',
  INITIALIZED: 'mdv_initialized',
} as const;

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.error('Failed to save to localStorage');
  }
}

export const storage = {
  // Checkins
  getCheckins: (): DailyCheckin[] => safeGet(KEYS.CHECKINS, []),
  saveCheckins: (checkins: DailyCheckin[]) => safeSet(KEYS.CHECKINS, checkins),
  getCheckinByDate: (date: string): DailyCheckin | undefined => {
    return safeGet<DailyCheckin[]>(KEYS.CHECKINS, []).find(c => c.date === date);
  },
  upsertCheckin: (checkin: DailyCheckin) => {
    const checkins = safeGet<DailyCheckin[]>(KEYS.CHECKINS, []);
    const idx = checkins.findIndex(c => c.date === checkin.date);
    if (idx >= 0) checkins[idx] = checkin;
    else checkins.push(checkin);
    safeSet(KEYS.CHECKINS, checkins);
  },

  // Goals
  getGoals: (): Goal[] => safeGet(KEYS.GOALS, []),
  saveGoals: (goals: Goal[]) => safeSet(KEYS.GOALS, goals),
  upsertGoal: (goal: Goal) => {
    const goals = safeGet<Goal[]>(KEYS.GOALS, []);
    const idx = goals.findIndex(g => g.id === goal.id);
    if (idx >= 0) goals[idx] = goal;
    else goals.push(goal);
    safeSet(KEYS.GOALS, goals);
  },
  deleteGoal: (id: string) => {
    const goals = safeGet<Goal[]>(KEYS.GOALS, []).filter(g => g.id !== id);
    safeSet(KEYS.GOALS, goals);
  },

  // Business Focus
  getBusinessFocus: (): BusinessFocus[] => safeGet(KEYS.BUSINESS, []),
  getCurrentBusinessFocus: (): BusinessFocus | undefined => {
    const month = new Date().toISOString().slice(0, 7);
    return safeGet<BusinessFocus[]>(KEYS.BUSINESS, []).find(b => b.date === month);
  },
  upsertBusinessFocus: (focus: BusinessFocus) => {
    const items = safeGet<BusinessFocus[]>(KEYS.BUSINESS, []);
    const idx = items.findIndex(b => b.date === focus.date);
    if (idx >= 0) items[idx] = focus;
    else items.push(focus);
    safeSet(KEYS.BUSINESS, items);
  },

  // Health
  getHealthEntries: (): HealthEntry[] => safeGet(KEYS.HEALTH, []),
  saveHealthEntries: (entries: HealthEntry[]) => safeSet(KEYS.HEALTH, entries),
  getHealthByDate: (date: string): HealthEntry | undefined => {
    return safeGet<HealthEntry[]>(KEYS.HEALTH, []).find(h => h.date === date);
  },
  upsertHealthEntry: (entry: HealthEntry) => {
    const entries = safeGet<HealthEntry[]>(KEYS.HEALTH, []);
    const idx = entries.findIndex(e => e.date === entry.date);
    if (idx >= 0) entries[idx] = entry;
    else entries.push(entry);
    safeSet(KEYS.HEALTH, entries);
  },

  // Finance
  getFinanceEntries: (): FinanceEntry[] => safeGet(KEYS.FINANCE, []),
  getCurrentFinanceEntry: (): FinanceEntry | undefined => {
    const month = new Date().toISOString().slice(0, 7);
    return safeGet<FinanceEntry[]>(KEYS.FINANCE, []).find(f => f.month === month);
  },
  upsertFinanceEntry: (entry: FinanceEntry) => {
    const entries = safeGet<FinanceEntry[]>(KEYS.FINANCE, []);
    const idx = entries.findIndex(e => e.month === entry.month);
    if (idx >= 0) entries[idx] = entry;
    else entries.push(entry);
    safeSet(KEYS.FINANCE, entries);
  },

  // Financial Goal
  getFinancialGoal: (): FinancialGoal => safeGet(KEYS.FINANCIAL_GOAL, {
    id: '1',
    targetAmount: 500000,
    currentAmount: 0,
    targetDate: '2030-12-31',
    description: 'Liberté financière',
    updatedAt: new Date().toISOString(),
  }),
  saveFinancialGoal: (goal: FinancialGoal) => safeSet(KEYS.FINANCIAL_GOAL, goal),

  // Journal
  getJournalEntries: (): JournalEntry[] => safeGet(KEYS.JOURNAL, []),
  getJournalByDate: (date: string): JournalEntry | undefined => {
    return safeGet<JournalEntry[]>(KEYS.JOURNAL, []).find(j => j.date === date);
  },
  upsertJournalEntry: (entry: JournalEntry) => {
    const entries = safeGet<JournalEntry[]>(KEYS.JOURNAL, []);
    const idx = entries.findIndex(e => e.date === entry.date);
    if (idx >= 0) entries[idx] = entry;
    else entries.push(entry);
    safeSet(KEYS.JOURNAL, entries);
  },

  // Weekly Reviews
  getWeeklyReviews: (): WeeklyReview[] => safeGet(KEYS.REVIEWS, []),
  upsertWeeklyReview: (review: WeeklyReview) => {
    const reviews = safeGet<WeeklyReview[]>(KEYS.REVIEWS, []);
    const idx = reviews.findIndex(r => r.id === review.id);
    if (idx >= 0) reviews[idx] = review;
    else reviews.push(review);
    safeSet(KEYS.REVIEWS, reviews);
  },

  // Export/Import
  exportAll: (): AppData => ({
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    checkins: safeGet(KEYS.CHECKINS, []),
    goals: safeGet(KEYS.GOALS, []),
    businessFocus: safeGet(KEYS.BUSINESS, []),
    healthEntries: safeGet(KEYS.HEALTH, []),
    financeEntries: safeGet(KEYS.FINANCE, []),
    financialGoal: safeGet(KEYS.FINANCIAL_GOAL, {} as FinancialGoal),
    journalEntries: safeGet(KEYS.JOURNAL, []),
    weeklyReviews: safeGet(KEYS.REVIEWS, []),
  }),
  importAll: (data: AppData) => {
    safeSet(KEYS.CHECKINS, data.checkins || []);
    safeSet(KEYS.GOALS, data.goals || []);
    safeSet(KEYS.BUSINESS, data.businessFocus || []);
    safeSet(KEYS.HEALTH, data.healthEntries || []);
    safeSet(KEYS.FINANCE, data.financeEntries || []);
    if (data.financialGoal) safeSet(KEYS.FINANCIAL_GOAL, data.financialGoal);
    safeSet(KEYS.JOURNAL, data.journalEntries || []);
    safeSet(KEYS.REVIEWS, data.weeklyReviews || []);
  },
  resetAll: () => {
    Object.values(KEYS).forEach(key => localStorage.removeItem(key));
  },
  isInitialized: (): boolean => safeGet(KEYS.INITIALIZED, false),
  setInitialized: () => safeSet(KEYS.INITIALIZED, true),
};
