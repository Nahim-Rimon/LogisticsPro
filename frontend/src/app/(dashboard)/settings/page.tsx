
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Bell, 
  Shield, 
  Globe, 
  Mail,
  Save
} from "lucide-react";

export default function SettingsPage() {
  return (
    <>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your application preferences and system configuration.</p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                <CardTitle>General Settings</CardTitle>
              </div>
              <CardDescription>Update your company profile and regional preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input id="companyName" defaultValue="LogisticsPro Solutions" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Default Timezone</Label>
                  <Input id="timezone" defaultValue="UTC-5 (Eastern Time)" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-600" />
                <CardTitle>Notifications</CardTitle>
              </div>
              <CardDescription>Choose how you want to be notified about shipment updates.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="emailNotify" defaultChecked />
                <Label htmlFor="emailNotify" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Email notifications for delayed shipments
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="deliveryNotify" defaultChecked />
                <Label htmlFor="deliveryNotify" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Daily delivery summary reports
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="systemAlerts" />
                <Label htmlFor="systemAlerts" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Real-time system health alerts
                </Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <CardTitle>Security & API</CardTitle>
              </div>
              <CardDescription>Manage your API keys and security protocols.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">Webhook API Key</Label>
                <div className="flex gap-2">
                  <Input id="apiKey" type="password" value="••••••••••••••••••••••••" readOnly className="flex-1" />
                  <Button variant="outline">Rotate Key</Button>
                </div>
                <p className="text-xs text-gray-500">Last rotated 3 months ago.</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4">
            <Button className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
