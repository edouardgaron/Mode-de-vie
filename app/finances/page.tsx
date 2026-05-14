"use client";
import { useEffect, useState } from "react";
import { storage } from "@/lib/storage";
import { getMonthString, formatCurrency, formatMonthFrench } from "@/lib/utils";
import { FinanceEntry, FinancialGoal } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/toaster";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function FinancesPage() {
  const month = getMonthString();
  const { toast } = useToast();
  const [entries, setEntries] = useState<FinanceEntry[]>([]);
  const [financialGoal, setFinancialGoal] = useState<FinancialGoal | null>(null);
  const [current, setCurrent] = useState<Partial<FinanceEntry>>({
    paintingRevenue: 0,
    prefabRevenue: 0,
    realEstateRevenue: 0,
    otherRevenue: 0,
    personalExpenses: 0,
    businessExpenses: 0,
    savings: 0,
    investments: 0,
    debt: 0,
    cashAvailable: 0,
  });

  useEffect(() => {
    const all = storage.getFinanceEntries();
    setEntries(all);
    const existing = all.find(f => f.month === month);
    if (existing) {
      setCurrent(existing);
    }
    const goal = storage.getFinancialGoal();
    setFinancialGoal(goal);
  }, []);

  const handleUpdate = (key: keyof FinanceEntry, value: number) => {
    setCurrent({ ...current, [key]: value });
  };

  const handleSave = () => {
    const newEntry: FinanceEntry = {
      id: current.id || Date.now().toString(),
      month,
      paintingRevenue: current.paintingRevenue || 0,
      prefabRevenue: current.prefabRevenue || 0,
      realEstateRevenue: current.realEstateRevenue || 0,
      otherRevenue: current.otherRevenue || 0,
      personalExpenses: current.personalExpenses || 0,
      businessExpenses: current.businessExpenses || 0,
      savings: current.savings || 0,
      investments: current.investments || 0,
      debt: current.debt || 0,
      cashAvailable: current.cashAvailable || 0,
      notes: current.notes || "",
      updatedAt: new Date().toISOString(),
    };
    storage.upsertFinanceEntry(newEntry);
    setEntries(prev => {
      const updated = prev.filter(e => e.month !== month);
      return [...updated, newEntry];
    });
    toast({ title: "Finances enregistrées" });
  };

  const handleUpdateGoal = () => {
    if (financialGoal) {
      storage.saveFinancialGoal(financialGoal);
      toast({ title: "Objectif financier mis à jour" });
    }
  };

  const totalIncome = (current.paintingRevenue || 0) + (current.prefabRevenue || 0) + (current.realEstateRevenue || 0) + (current.otherRevenue || 0);
  const totalExpenses = (current.personalExpenses || 0) + (current.businessExpenses || 0);
  const netProfit = totalIncome - totalExpenses;
  const goalProgress = financialGoal ? (financialGoal.currentAmount / financialGoal.targetAmount) * 100 : 0;
  const savingsRate = totalIncome > 0 ? Math.round(((current.savings || 0) / totalIncome) * 100) : 0;
  const netWorth = (current.cashAvailable || 0) + (current.investments || 0) - (current.debt || 0);

  // Last 3 months chart data
  const last3MonthsData = entries
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-3)
    .map(e => {
      const inc = e.paintingRevenue + e.prefabRevenue + e.realEstateRevenue + e.otherRevenue;
      const exp = e.personalExpenses + e.businessExpenses;
      return {
        month: formatMonthFrench(e.month).slice(0, 7),
        Revenus: inc,
        Dépenses: exp,
        Épargne: e.savings,
      };
    });

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-4xl font-bold mb-1">Finances</h1>
        <p className="text-muted-foreground">Suivi de vos revenus, dépenses et épargne</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{formatMonthFrench(month)}</CardTitle>
          <CardDescription>Entrées et sorties du mois</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-4 text-sm">Revenus</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Peinture</Label>
                <Input type="number" value={current.paintingRevenue || 0} onChange={(e) => handleUpdate('paintingRevenue', Number(e.target.value))} className="mt-1" />
              </div>
              <div>
                <Label>Préfab</Label>
                <Input type="number" value={current.prefabRevenue || 0} onChange={(e) => handleUpdate('prefabRevenue', Number(e.target.value))} className="mt-1" />
              </div>
              <div>
                <Label>Immobilier</Label>
                <Input type="number" value={current.realEstateRevenue || 0} onChange={(e) => handleUpdate('realEstateRevenue', Number(e.target.value))} className="mt-1" />
              </div>
              <div>
                <Label>Autres</Label>
                <Input type="number" value={current.otherRevenue || 0} onChange={(e) => handleUpdate('otherRevenue', Number(e.target.value))} className="mt-1" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sm">Dépenses</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Personnelles</Label>
                <Input type="number" value={current.personalExpenses || 0} onChange={(e) => handleUpdate('personalExpenses', Number(e.target.value))} className="mt-1" />
              </div>
              <div>
                <Label>Business</Label>
                <Input type="number" value={current.businessExpenses || 0} onChange={(e) => handleUpdate('businessExpenses', Number(e.target.value))} className="mt-1" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sm">Gestion</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Épargne</Label>
                <Input type="number" value={current.savings || 0} onChange={(e) => handleUpdate('savings', Number(e.target.value))} className="mt-1" />
              </div>
              <div>
                <Label>Investissements</Label>
                <Input type="number" value={current.investments || 0} onChange={(e) => handleUpdate('investments', Number(e.target.value))} className="mt-1" />
              </div>
              <div>
                <Label>Cash disponible</Label>
                <Input type="number" value={current.cashAvailable || 0} onChange={(e) => handleUpdate('cashAvailable', Number(e.target.value))} className="mt-1" />
              </div>
            </div>
          </div>

          <Button onClick={handleSave} size="lg" className="w-full">
            Enregistrer les finances
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Revenu total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{formatCurrency(totalIncome)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Dépenses totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{formatCurrency(totalExpenses)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Profit net</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(netProfit)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Taux d'épargne</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${savingsRate >= 20 ? 'text-green-400' : savingsRate >= 10 ? 'text-yellow-400' : 'text-red-400'}`}>{savingsRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Net worth */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Valeur nette estimée</CardTitle>
          <CardDescription>Cash + investissements - dettes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${netWorth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatCurrency(netWorth)}
          </div>
          <div className="flex gap-6 mt-3 text-sm text-muted-foreground">
            <span>Cash: <span className="text-foreground">{formatCurrency(current.cashAvailable || 0)}</span></span>
            <span>Invest.: <span className="text-foreground">{formatCurrency(current.investments || 0)}</span></span>
            <span>Dettes: <span className="text-red-400">-{formatCurrency(current.debt || 0)}</span></span>
          </div>
        </CardContent>
      </Card>

      {/* Monthly comparison chart */}
      {last3MonthsData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Comparaison mensuelle</CardTitle>
            <CardDescription>3 derniers mois — revenus vs dépenses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={last3MonthsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 14.9%)" />
                <XAxis dataKey="month" stroke="hsl(0 0% 40%)" tick={{ fill: 'hsl(0 0% 40%)', fontSize: 11 }} />
                <YAxis stroke="hsl(0 0% 40%)" tick={{ fill: 'hsl(0 0% 40%)', fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: '#111', border: '1px solid #222', color: '#fff' }} formatter={(v: number) => formatCurrency(v)} />
                <Legend />
                <Bar dataKey="Revenus" fill="#22c55e" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Dépenses" fill="#ef4444" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Épargne" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {financialGoal && (
        <Card>
          <CardHeader>
            <CardTitle>Liberté financière</CardTitle>
            <CardDescription>{financialGoal.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Montant actuel</Label>
                <Input
                  type="number"
                  value={financialGoal.currentAmount}
                  onChange={(e) => setFinancialGoal({ ...financialGoal, currentAmount: Number(e.target.value) })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Montant cible</Label>
                <Input
                  type="number"
                  value={financialGoal.targetAmount}
                  onChange={(e) => setFinancialGoal({ ...financialGoal, targetAmount: Number(e.target.value) })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Date cible</Label>
                <Input
                  type="date"
                  value={financialGoal.targetDate}
                  onChange={(e) => setFinancialGoal({ ...financialGoal, targetDate: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Progrès</span>
                <span className="text-sm font-semibold">{formatCurrency(financialGoal.currentAmount)} / {formatCurrency(financialGoal.targetAmount)}</span>
              </div>
              <Progress value={Math.min(100, goalProgress)} />
              <p className="text-xs text-muted-foreground mt-2">{Math.round(goalProgress)}% complété</p>
            </div>

            <Button onClick={handleUpdateGoal} className="w-full">
              Mettre à jour l'objectif
            </Button>
          </CardContent>
        </Card>
      )}

      {entries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historique</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2">Mois</th>
                    <th className="text-right py-2 px-2">Revenu</th>
                    <th className="text-right py-2 px-2">Dépenses</th>
                    <th className="text-right py-2 px-2">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {entries
                    .sort((a, b) => b.month.localeCompare(a.month))
                    .slice(0, 12)
                    .map(entry => {
                      const income = entry.paintingRevenue + entry.prefabRevenue + entry.realEstateRevenue + entry.otherRevenue;
                      const expenses = entry.personalExpenses + entry.businessExpenses;
                      const profit = income - expenses;
                      return (
                        <tr key={entry.id} className="border-b border-border/50">
                          <td className="py-2 px-2">{formatMonthFrench(entry.month)}</td>
                          <td className="text-right py-2 px-2 text-green-400">{formatCurrency(income)}</td>
                          <td className="text-right py-2 px-2 text-red-400">{formatCurrency(expenses)}</td>
                          <td className={`text-right py-2 px-2 ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(profit)}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
