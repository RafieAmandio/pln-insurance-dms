'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Server, Database, Plug, Settings, RotateCcw,
  Activity, Clock, Shield, Bell, HardDrive, Wifi,
  Globe, Zap, AlertTriangle, CheckCircle2, Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs';

// --- Static data matching lofi ---

const SERVICES = [
  { name: 'OCR Engine', icon: 'Zap', status: 'running', uptime: '99.98%', latency: '1.2s' },
  { name: 'Document Storage', icon: 'HardDrive', status: 'running', uptime: '99.99%', latency: '0.3s' },
  { name: 'Search Index', icon: 'Database', status: 'warning', uptime: '99.85%', latency: '0.8s' },
  { name: 'Core System API', icon: 'Globe', status: 'running', uptime: '99.97%', latency: '0.5s' },
  { name: 'Authentication', icon: 'Shield', status: 'running', uptime: '100%', latency: '0.2s' },
  { name: 'Notification Service', icon: 'Bell', status: 'stopped', uptime: '98.50%', latency: '-' },
];

const ICON_MAP: Record<string, React.ElementType> = {
  Zap, HardDrive, Database, Globe, Shield, Bell,
};

const STORAGE_TYPES = [
  { type: 'Fire Insurance', size: '1.8 TB', count: 12500, pct: 32 },
  { type: 'Marine Cargo', size: '1.2 TB', count: 8200, pct: 21 },
  { type: 'Motor Vehicle', size: '1.1 TB', count: 7600, pct: 19 },
  { type: 'Property All Risk', size: '0.9 TB', count: 6100, pct: 16 },
  { type: 'Liability', size: '0.7 TB', count: 4800, pct: 12 },
  { type: 'Other', size: '0.7 TB', count: 3300, pct: 12 },
];

const API_LOGS = [
  { time: '14:32:15', endpoint: 'POST /api/documents/upload', status: 200, duration: '234ms' },
  { time: '14:31:58', endpoint: 'GET /api/documents/search', status: 200, duration: '89ms' },
  { time: '14:31:42', endpoint: 'POST /api/ocr/process', status: 200, duration: '1,245ms' },
  { time: '14:31:20', endpoint: 'GET /api/users/profile', status: 404, duration: '12ms' },
  { time: '14:30:55', endpoint: 'PUT /api/documents/meta', status: 200, duration: '156ms' },
  { time: '14:30:33', endpoint: 'POST /api/auth/refresh', status: 500, duration: '5,002ms' },
];

function statusColor(s: string) {
  if (s === 'running') return 'bg-green-500';
  if (s === 'warning') return 'bg-yellow-500';
  return 'bg-red-500';
}

function statusBadge(s: string) {
  if (s === 'running') return <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100">Running</Badge>;
  if (s === 'warning') return <Badge variant="default" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Warning</Badge>;
  return <Badge variant="destructive">Stopped</Badge>;
}

function httpBadge(code: number) {
  if (code >= 200 && code < 300) return <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100">{code}</Badge>;
  if (code >= 400 && code < 500) return <Badge variant="default" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">{code}</Badge>;
  return <Badge variant="destructive">{code}</Badge>;
}

function toast(msg: string) {
  if (typeof window !== 'undefined') {
    const el = document.createElement('div');
    el.className = 'fixed bottom-4 right-4 z-50 rounded-lg bg-gray-900 px-4 py-3 text-sm text-white shadow-lg transition-opacity';
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 2500);
  }
}

export function AdminConsoleClient() {
  // Settings state
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [autoOcr, setAutoOcr] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [watermark, setWatermark] = useState(false);
  const [apiUrl, setApiUrl] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [ocrEndpoint, setOcrEndpoint] = useState('');
  const [maxRetry, setMaxRetry] = useState('3');

  const [loadingSettings, setLoadingSettings] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingIntegration, setSavingIntegration] = useState(false);

  // Load settings from DB on mount
  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (!res.ok) return;
      const { data } = await res.json();
      if (!data) return;

      if (data.maintenance_mode !== undefined) setMaintenanceMode(data.maintenance_mode);
      if (data.auto_ocr !== undefined) setAutoOcr(data.auto_ocr);
      if (data.email_notifications !== undefined) setEmailNotifications(data.email_notifications);
      if (data.download_watermark !== undefined) setWatermark(data.download_watermark);
      if (data.core_api_url !== undefined) setApiUrl(data.core_api_url);
      if (data.webhook_url !== undefined) setWebhookUrl(data.webhook_url);
      if (data.ocr_endpoint !== undefined) setOcrEndpoint(data.ocr_endpoint);
      if (data.max_retry !== undefined) setMaxRetry(String(data.max_retry));
    } catch {
      // silently fail - use defaults
    } finally {
      setLoadingSettings(false);
    }
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  // Save a single toggle immediately
  async function saveToggle(key: string, value: boolean) {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      });
      if (res.ok) {
        toast(`${key.replace(/_/g, ' ')} ${value ? 'enabled' : 'disabled'}`);
      } else {
        const data = await res.json();
        toast(data.error || 'Failed to save');
      }
    } catch {
      toast('Network error');
    }
  }

  // Save all system config toggles
  async function handleSaveAll() {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maintenance_mode: maintenanceMode,
          auto_ocr: autoOcr,
          email_notifications: emailNotifications,
          download_watermark: watermark,
          core_api_url: apiUrl,
          webhook_url: webhookUrl,
          ocr_endpoint: ocrEndpoint,
          max_retry: parseInt(maxRetry) || 3,
        }),
      });
      if (res.ok) {
        toast('All settings saved');
      } else {
        const data = await res.json();
        toast(data.error || 'Failed to save');
      }
    } catch {
      toast('Network error');
    } finally {
      setSaving(false);
    }
  }

  // Save integration settings
  async function handleSaveIntegration() {
    setSavingIntegration(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          core_api_url: apiUrl,
          webhook_url: webhookUrl,
          ocr_endpoint: ocrEndpoint,
          max_retry: parseInt(maxRetry) || 3,
        }),
      });
      if (res.ok) {
        toast('Integration settings saved');
      } else {
        const data = await res.json();
        toast(data.error || 'Failed to save');
      }
    } catch {
      toast('Network error');
    } finally {
      setSavingIntegration(false);
    }
  }

  return (
    <Tabs defaultValue="services" className="space-y-4">
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="services" className="gap-1.5">
            <Server className="h-4 w-4" /> Services
          </TabsTrigger>
          <TabsTrigger value="storage" className="gap-1.5">
            <HardDrive className="h-4 w-4" /> Storage
          </TabsTrigger>
          <TabsTrigger value="integration" className="gap-1.5">
            <Plug className="h-4 w-4" /> Integration
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-1.5">
            <Settings className="h-4 w-4" /> Settings
          </TabsTrigger>
        </TabsList>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast('Cache cleared successfully')}>
            Clear Cache
          </Button>
          <Button size="sm" onClick={handleSaveAll} disabled={saving}>
            {saving && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {/* ---- SERVICES TAB ---- */}
      <TabsContent value="services" className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <Activity className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Services Running</p>
                  <p className="text-2xl font-bold">4/6</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Response Time</p>
                  <p className="text-2xl font-bold">0.85s</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                  <CheckCircle2 className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">System Uptime</p>
                  <p className="text-2xl font-bold">99.94%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>System Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {SERVICES.map((svc) => {
                const Icon = ICON_MAP[svc.icon] ?? Server;
                return (
                  <div key={svc.name} className="flex items-center gap-4 rounded-lg border p-4">
                    <div className={`h-2.5 w-2.5 rounded-full ${statusColor(svc.status)}`} />
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{svc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Uptime: {svc.uptime} &middot; Latency: {svc.latency}
                      </p>
                    </div>
                    {statusBadge(svc.status)}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast(`${svc.name} restarted`)}
                    >
                      <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Restart
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* ---- STORAGE TAB ---- */}
      <TabsContent value="storage" className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            { label: 'Total Storage', value: '6.4 TB' },
            { label: 'Used', value: '5.7 TB' },
            { label: 'Available', value: '0.7 TB' },
            { label: 'Usage', value: '89%' },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Storage by Document Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Document Type</th>
                    <th className="pb-2 font-medium">Size</th>
                    <th className="pb-2 font-medium">Documents</th>
                    <th className="pb-2 font-medium w-48">Usage</th>
                    <th className="pb-2 font-medium text-right">%</th>
                  </tr>
                </thead>
                <tbody>
                  {STORAGE_TYPES.map((st) => (
                    <tr key={st.type} className="border-b last:border-0">
                      <td className="py-3 font-medium">{st.type}</td>
                      <td className="py-3">{st.size}</td>
                      <td className="py-3">{st.count.toLocaleString()}</td>
                      <td className="py-3">
                        <Progress value={st.pct} className="h-2" />
                      </td>
                      <td className="py-3 text-right">{st.pct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* ---- INTEGRATION TAB ---- */}
      <TabsContent value="integration" className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <Wifi className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">API Calls Today</p>
                  <p className="text-2xl font-bold">8,432</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">97.8%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Failed Requests</p>
                  <p className="text-2xl font-bold">186</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Core System API Logs</CardTitle>
              <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100">Live</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Time</th>
                    <th className="pb-2 font-medium">Endpoint</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium text-right">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {API_LOGS.map((log, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-3 font-mono text-xs">{log.time}</td>
                      <td className="py-3 font-mono text-xs">{log.endpoint}</td>
                      <td className="py-3">{httpBadge(log.status)}</td>
                      <td className="py-3 text-right text-xs">{log.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* ---- SETTINGS TAB ---- */}
      <TabsContent value="settings" className="space-y-4">
        {loadingSettings ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading settings...</span>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* System Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Maintenance Mode</Label>
                    <p className="text-xs text-muted-foreground">Disable user access during maintenance</p>
                  </div>
                  <Switch
                    checked={maintenanceMode}
                    onCheckedChange={(v) => {
                      setMaintenanceMode(v);
                      saveToggle('maintenance_mode', v);
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Auto OCR Processing</Label>
                    <p className="text-xs text-muted-foreground">Automatically process uploaded documents</p>
                  </div>
                  <Switch
                    checked={autoOcr}
                    onCheckedChange={(v) => {
                      setAutoOcr(v);
                      saveToggle('auto_ocr', v);
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Email Notifications</Label>
                    <p className="text-xs text-muted-foreground">Send alerts for failed OCR and system events</p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={(v) => {
                      setEmailNotifications(v);
                      saveToggle('email_notifications', v);
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Download Watermark</Label>
                    <p className="text-xs text-muted-foreground">Apply watermark on downloaded documents</p>
                  </div>
                  <Switch
                    checked={watermark}
                    onCheckedChange={(v) => {
                      setWatermark(v);
                      saveToggle('download_watermark', v);
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Integration Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Integration Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiUrl">Core System API URL</Label>
                  <Input id="apiUrl" value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">Webhook Callback URL</Label>
                  <Input id="webhookUrl" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ocrEndpoint">OCR Engine Endpoint</Label>
                  <Input id="ocrEndpoint" value={ocrEndpoint} onChange={(e) => setOcrEndpoint(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxRetry">Max Retry Attempts</Label>
                  <Input id="maxRetry" type="number" value={maxRetry} onChange={(e) => setMaxRetry(e.target.value)} />
                </div>
                <Button className="w-full" onClick={handleSaveIntegration} disabled={savingIntegration}>
                  {savingIntegration && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                  {savingIntegration ? 'Saving...' : 'Save Integration Settings'}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
