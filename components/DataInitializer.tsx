"use client";
import { useEffect } from "react";
import { storage } from "@/lib/storage";
import { generateDefaultGoals, generateDefaultBusinessFocus } from "@/lib/seed";

export function DataInitializer() {
  useEffect(() => {
    if (!storage.isInitialized()) {
      const goals = generateDefaultGoals();
      storage.saveGoals(goals);
      const business = generateDefaultBusinessFocus();
      storage.upsertBusinessFocus(business);
      storage.saveFinancialGoal({
        id: '1',
        targetAmount: 500000,
        currentAmount: 50000,
        targetDate: '2030-12-31',
        description: 'Liberté financière - 500k$ net',
        updatedAt: new Date().toISOString(),
      });
      storage.setInitialized();
    }
  }, []);
  return null;
}
