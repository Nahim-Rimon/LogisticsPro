"use client";


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Truck, Warehouse, Globe, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { fetchWithAuth } from "@/lib/api";

export default function DashboardPage() {
  const [stats, setStats] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [upcomingMilestones, setUpcomingMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { getToken, isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setLoading(false);
      return;
    }

    async function loadStats() {
      try {
        const token = await getToken();
        const [shipments, warehouses, carriers] = await Promise.all([
          fetchWithAuth('/shipments', token),
          fetchWithAuth('/warehouses', token),
          fetchWithAuth('/carriers', token)
        ]);

        setStats([
          { name: 'Total Shipments', value: shipments.length, icon: Package, color: 'text-blue-600' },
          { name: 'In Transit', value: shipments.filter((s: any) => s.status === 'In Transit').length, icon: Truck, color: 'text-orange-600' },
          { name: 'Active Hubs', value: warehouses.length, icon: Warehouse, color: 'text-accent' },
          { name: 'Global Carriers', value: carriers.length, icon: Globe, color: 'text-emerald-600' },
        ]);

        const sortedShipments = [...shipments].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setRecentActivity(sortedShipments.slice(0, 5));

        const pendingOrTransit = shipments.filter((s: any) => s.status === 'In Transit' || s.status === 'Pending').slice(0, 5);
        setUpcomingMilestones(pendingOrTransit);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [getToken]);

  return (
    <>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Logistics Overview</h1>
          <p className="text-text-muted mt-2 font-medium">Welcome back! Here&apos;s what&apos;s happening with your supply chain today.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.name} className="hover:-translate-y-1 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                    {stat.name}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.color} bg-current/10`}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Network Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>
              ) : recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={activity.id || index} className="flex gap-4 items-start">
                      <div className="mt-1.5 w-2 h-2 rounded-full bg-accent" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Shipment <span className="font-semibold text-accent">{activity.tracking_number}</span> was created</p>
                        <p className="text-xs text-text-muted">{new Date(activity.created_at).toLocaleDateString()} - Status: {activity.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-muted italic">No recent activity.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>
              ) : upcomingMilestones.length > 0 ? (
                <div className="space-y-4">
                  {upcomingMilestones.map((milestone, index) => (
                    <div key={milestone.id || index} className="flex gap-4 items-center p-3 border border-border rounded-lg bg-surface/50">
                      <Package className="h-5 w-5 text-accent" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{milestone.tracking_number}</p>
                        <p className="text-xs text-text-muted">{milestone.origin?.name || "Origin"} ➔ {milestone.destination?.name || "Destination"}</p>
                      </div>
                      <div className={`text-xs font-semibold px-2 py-1 rounded ${milestone.status === 'In Transit' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {milestone.status}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center border border-dashed border-border rounded-2xl bg-surface/50">
                  <p className="text-sm text-text-muted italic">No upcoming deliveries scheduled.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
