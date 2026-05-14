"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/toaster";
import { storage } from "@/lib/storage";
import { AppSettings } from "@/types";
import { subscribeToPush, unsubscribeFromPush, checkNotificationPermission } from "@/lib/notifications";
import { getCheckinCalendarUrl, getWorkoutCalendarUrl, getWalkCalendarUrl, getWeeklyReviewCalendarUrl } from "@/lib/calendar";
import { sendEmail, buildDailyReminderHtml, buildWeeklySummaryHtml } from "@/lib/email";
import { Bell, Mail, Calendar, Smartphone, ExternalLink, Check, X, Send } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>({
    email: '',
    firstName: 'Édouard',
    dailyReminderTime: '07:00',
    enableDailyReminder: false,
    enableWeeklySummary: false,
    enablePushNotifications: false,
    pushSubscription: null,
    appUrl: '',
  });
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default');
  const [sendingTest, setSendingTest] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const s = storage.getSettings();
    setSettings(s);
    checkNotificationPermission().then(setNotifPermission);
  }, []);

  const save = (updates: Partial<AppSettings>) => {
    const updated = { ...settings, ...updates };
    setSettings(updated);
    storage.saveSettings(updated);
    toast({ title: 'Paramètres sauvegardés' });
  };

  const handleEnablePush = async () => {
    const permission = await Notification.requestPermission();
    setNotifPermission(permission);
    if (permission !== 'granted') {
      toast({ title: 'Permission refusée', variant: 'destructive' });
      return;
    }
    const sub = await subscribeToPush();
    if (sub) {
      save({ enablePushNotifications: true, pushSubscription: sub.toJSON() });
      toast({ title: 'Notifications activées !' });
    }
  };

  const handleDisablePush = async () => {
    await unsubscribeFromPush();
    save({ enablePushNotifications: false, pushSubscription: null });
    toast({ title: 'Notifications désactivées' });
  };

  const sendTestEmail = async () => {
    if (!settings.email) {
      toast({ title: "Entre ton courriel d'abord", variant: 'destructive' });
      return;
    }
    setSendingTest(true);
    const ok = await sendEmail({
      to: settings.email,
      subject: '✅ Test — Mode de Vie',
      html: buildDailyReminderHtml(settings.firstName),
    });
    setSendingTest(false);
    toast({ title: ok ? 'Courriel envoyé !' : 'Erreur — vérifie la clé API', variant: ok ? 'default' : 'destructive' });
  };

  const sendTestWeekly = async () => {
    if (!settings.email) {
      toast({ title: "Entre ton courriel d'abord", variant: 'destructive' });
      return;
    }
    setSendingTest(true);
    const ok = await sendEmail({
      to: settings.email,
      subject: '📊 Test résumé hebdo — Mode de Vie',
      html: buildWeeklySummaryHtml({ name: settings.firstName, weekScore: 72, habitsCompleted: 8, totalHabits: 11, streak: 5, topWin: '' }),
    });
    setSendingTest(false);
    toast({ title: ok ? 'Résumé hebdo envoyé !' : 'Erreur — vérifie la clé API', variant: ok ? 'default' : 'destructive' });
  };

  const calendarLinks = [
    { label: 'Check-in quotidien (7h00)', url: getCheckinCalendarUrl(), icon: '✅' },
    { label: 'Entraînement (6h00)', url: getWorkoutCalendarUrl(), icon: '💪' },
    { label: 'Marche 45 min (12h00)', url: getWalkCalendarUrl(), icon: '🚶' },
    { label: 'Revue hebdomadaire (dimanche 19h)', url: getWeeklyReviewCalendarUrl(), icon: '📊' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground mt-1">Courriels, notifications, calendrier</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Prénom</Label>
            <Input
              value={settings.firstName}
              onChange={e => setSettings(s => ({ ...s, firstName: e.target.value }))}
              placeholder="Édouard"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Courriel</Label>
            <Input
              type="email"
              value={settings.email}
              onChange={e => setSettings(s => ({ ...s, email: e.target.value }))}
              placeholder="garonedouard@gmail.com"
            />
          </div>
          <Button onClick={() => save({ firstName: settings.firstName, email: settings.email })}>
            Sauvegarder
          </Button>
        </CardContent>
      </Card>

      {/* Email reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Mail size={16} /> Rappels par courriel</CardTitle>
          <CardDescription>Nécessite une clé API Resend (gratuit — resend.com)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2">
            <p className="font-medium text-foreground">Comment configurer :</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Crée un compte gratuit sur <span className="text-primary">resend.com</span></li>
              <li>Obtiens ta clé API</li>
              <li>Dans Railway → Variables : ajoute <code className="bg-muted px-1 rounded text-xs">RESEND_API_KEY</code></li>
              <li>Ajoute aussi <code className="bg-muted px-1 rounded text-xs">USER_EMAIL=garonedouard@gmail.com</code></li>
              <li>Sur <span className="text-primary">cron-job.org</span> (gratuit) : crée 2 cron jobs qui appellent tes URLs Railway</li>
            </ol>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">URLs à configurer dans cron-job.org :</p>
            <div className="bg-muted/30 rounded p-3 text-xs font-mono space-y-1">
              <p className="text-green-400">Rappel quotidien (chaque jour 7h) :</p>
              <p className="text-muted-foreground break-all">GET /api/send-reminder?secret=TON_SECRET</p>
              <p className="text-blue-400 mt-2">Résumé hebdo (chaque dimanche 18h) :</p>
              <p className="text-muted-foreground break-all">GET /api/send-weekly?secret=TON_SECRET</p>
            </div>
          </div>

          <Separator />

          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={sendTestEmail} disabled={sendingTest} className="gap-1">
              <Send size={14} />
              Tester rappel quotidien
            </Button>
            <Button variant="outline" size="sm" onClick={sendTestWeekly} disabled={sendingTest} className="gap-1">
              <Send size={14} />
              Tester résumé hebdo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Push notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Bell size={16} /> Notifications push</CardTitle>
          <CardDescription>Reçois des rappels directement sur ton téléphone</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${notifPermission === 'granted' ? 'bg-green-400' : notifPermission === 'denied' ? 'bg-red-400' : 'bg-yellow-400'}`} />
            <span className="text-sm">
              {notifPermission === 'granted'
                ? 'Autorisées'
                : notifPermission === 'denied'
                  ? 'Bloquées (change dans les paramètres du navigateur)'
                  : 'Non demandées'}
            </span>
          </div>

          {settings.enablePushNotifications ? (
            <Button variant="outline" onClick={handleDisablePush} className="gap-1">
              <X size={14} /> Désactiver
            </Button>
          ) : (
            <Button onClick={handleEnablePush} disabled={notifPermission === 'denied'} className="gap-1">
              <Bell size={14} /> Activer les notifications
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Google Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Calendar size={16} /> Google Calendar</CardTitle>
          <CardDescription>Ajoute tes habitudes à ton calendrier en un clic</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {calendarLinks.map(({ label, url, icon }) => (
            <a
              key={label}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{icon}</span>
                <span className="text-sm font-medium">{label}</span>
              </div>
              <ExternalLink size={14} className="text-muted-foreground group-hover:text-primary" />
            </a>
          ))}
        </CardContent>
      </Card>

      {/* PWA Install */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Smartphone size={16} /> App mobile (PWA)</CardTitle>
          <CardDescription>Installer l'app sur ton téléphone</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground mb-1">iPhone (Safari) :</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Ouvre l'app dans Safari</li>
                <li>Appuie sur le bouton Partager ↑</li>
                <li>«Sur l'écran d'accueil»</li>
              </ol>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">Android (Chrome) :</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Ouvre l'app dans Chrome</li>
                <li>Menu ⋮ → «Ajouter à l'écran d'accueil»</li>
                <li>Ou attends la bannière d'installation</li>
              </ol>
            </div>
          </div>
          <Badge variant="success" className="gap-1"><Check size={12} /> PWA activée — app installable</Badge>
        </CardContent>
      </Card>
    </div>
  );
}
