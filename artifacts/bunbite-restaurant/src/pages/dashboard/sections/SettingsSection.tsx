import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import PageHeader from '../components/PageHeader';
import { useToast } from '@/hooks/use-toast';

export default function SettingsSection() {
  const { toast } = useToast();
  const [prefs, setPrefs] = useState({
    orderAlerts: true,
    reservationAlerts: true,
    marketingEmails: false,
    lowStockAlerts: true,
  });

  const save = () => toast({ title: 'Settings saved', description: 'Your preferences have been updated.' });

  return (
    <div>
      <PageHeader title="Settings" description="Manage your restaurant profile, hours, and notification preferences." />

      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general" data-testid="tab-general">General</TabsTrigger>
          <TabsTrigger value="hours" data-testid="tab-hours">Hours</TabsTrigger>
          <TabsTrigger value="notifications" data-testid="tab-notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="rounded-2xl border-card-border mt-4">
            <CardHeader>
              <CardTitle className="font-display text-base font-normal">Restaurant Profile</CardTitle>
              <CardDescription>Basic information shown to customers.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="rname">Restaurant Name</Label>
                <Input id="rname" defaultValue="BunBite" data-testid="input-restaurant-name" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rphone">Phone</Label>
                <Input id="rphone" defaultValue="(555) 010-2200" data-testid="input-restaurant-phone" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="raddr">Address</Label>
                <Input id="raddr" defaultValue="128 Flame Street, Los Angeles, CA" data-testid="input-restaurant-address" />
              </div>
              <div className="sm:col-span-2">
                <Button onClick={save} data-testid="button-save-general">Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hours">
          <Card className="rounded-2xl border-card-border mt-4">
            <CardHeader>
              <CardTitle className="font-display text-base font-normal">Opening Hours</CardTitle>
              <CardDescription>Customers see these hours on the website.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                ['Mon – Thu', '11:00 AM – 10:00 PM'],
                ['Fri – Sat', '11:00 AM – 12:00 AM'],
                ['Sunday', '12:00 PM – 9:00 PM'],
              ].map(([day, hours]) => (
                <div key={day} className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
                  <span className="text-sm font-medium">{day}</span>
                  <span className="text-sm text-muted-foreground">{hours}</span>
                </div>
              ))}
              <Button onClick={save} data-testid="button-save-hours">Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="rounded-2xl border-card-border mt-4">
            <CardHeader>
              <CardTitle className="font-display text-base font-normal">Notification Preferences</CardTitle>
              <CardDescription>Choose what the management team gets alerted about.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {([
                ['orderAlerts', 'New order alerts', 'Get notified the moment a new order comes in.'],
                ['reservationAlerts', 'Reservation alerts', 'Get notified for new and cancelled table bookings.'],
                ['lowStockAlerts', 'Low stock alerts', 'Get notified when inventory drops below par level.'],
                ['marketingEmails', 'Marketing emails', 'Occasional tips and product updates from BunBite.'],
              ] as const).map(([key, label, desc]) => (
                <div key={key} className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <Switch
                    checked={prefs[key]}
                    onCheckedChange={(v) => setPrefs((p) => ({ ...p, [key]: v }))}
                    data-testid={`switch-${key}`}
                  />
                </div>
              ))}
              <Button onClick={save} data-testid="button-save-notifications">Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
