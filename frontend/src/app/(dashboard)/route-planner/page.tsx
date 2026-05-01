"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { fetchWithAuth } from "@/lib/api";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Route, MapPin, Navigation, Clock } from "lucide-react";

export default function RoutePlannerPage() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<any>(null);

  const { getToken } = useAuth();

  useEffect(() => {
    async function loadShipments() {
      try {
        const token = await getToken();
        const data = await fetchWithAuth('/shipments', token);
        // Only show shipments that actually need routing (e.g. not Delivered)
        const active = data.filter((s: any) => s.status !== 'Delivered');
        setShipments(active);
      } catch (err: any) {
        console.error("Failed to load shipments:", err);
      } finally {
        setLoading(false);
      }
    }
    loadShipments();
  }, [getToken]);

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleAll = () => {
    if (selectedIds.size === shipments.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(shipments.map(s => s.id)));
    }
  };

  const handleOptimize = async () => {
    if (selectedIds.size === 0) return;
    setIsOptimizing(true);
    setOptimizationResult(null);
    try {
      const token = await getToken();
      const payload = { shipment_ids: Array.from(selectedIds) };
      const response = await fetchWithAuth('/shipments/optimize-route', token, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setOptimizationResult(response);
    } catch (err: any) {
      console.error(err);
      alert("Failed to optimize route. " + err.message);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Smart Route Planner</h1>
        <p className="text-text-muted mt-1 font-medium">Select multiple shipments to generate the most efficient multi-stop delivery route.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Shipment Selection */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Active Shipments</CardTitle>
              <CardDescription>Select 2 or more shipments to batch together.</CardDescription>
            </div>
            <Button 
              onClick={handleOptimize} 
              disabled={selectedIds.size < 2 || isOptimizing}
              className="gap-2"
            >
              {isOptimizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Route className="h-4 w-4" />}
              {isOptimizing ? "Optimizing..." : "Optimize Selected Routes"}
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>
            ) : shipments.length === 0 ? (
              <div className="text-center py-10 text-text-muted italic">No active shipments available for routing.</div>
            ) : (
              <div className="border border-border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px] text-center">
                        <Checkbox 
                          checked={selectedIds.size > 0 && selectedIds.size === shipments.length} 
                          onCheckedChange={toggleAll} 
                        />
                      </TableHead>
                      <TableHead>Tracking #</TableHead>
                      <TableHead>Origin ➔ Destination</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shipments.map(s => (
                      <TableRow key={s.id} className="cursor-pointer hover:bg-bg/50" onClick={() => toggleSelection(s.id)}>
                        <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                          <Checkbox 
                            checked={selectedIds.has(s.id)} 
                            onCheckedChange={() => toggleSelection(s.id)} 
                          />
                        </TableCell>
                        <TableCell className="font-medium text-accent">{s.tracking_number}</TableCell>
                        <TableCell className="text-sm">
                          {s.origin?.name || 'Unknown'} ➔ {s.destination?.name || 'Unknown'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-surface border-border">
                            {s.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column - Results */}
        <Card className="flex flex-col h-[600px] overflow-hidden">
          <CardHeader className="bg-surface border-b border-border pb-4">
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-accent" />
              Optimization Results
            </CardTitle>
            <CardDescription>AI-generated sequence for minimal travel time.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0">
            {!isOptimizing && !optimizationResult && (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                  <Route className="h-8 w-8 text-accent/50" />
                </div>
                <p className="text-text-muted text-sm">Select shipments and click optimize to see the route here.</p>
              </div>
            )}

            {isOptimizing && (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-accent" />
                <p className="text-text-muted text-sm animate-pulse">Running advanced TSP algorithms via Gemini AI...</p>
              </div>
            )}

            {optimizationResult && !isOptimizing && (
              <div className="p-6 space-y-6">
                <div className="bg-accent/10 p-4 rounded-xl border border-accent/20">
                  <div className="flex items-center gap-2 text-accent font-semibold mb-1">
                    <Clock className="h-4 w-4" />
                    Total Est. Time: {optimizationResult.total_estimated_time}
                  </div>
                  <p className="text-sm text-text-muted">{optimizationResult.reasoning}</p>
                </div>

                <div className="relative pl-6 space-y-6 before:absolute before:inset-0 before:ml-8 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                  {optimizationResult.optimized_route.map((waypoint: any, index: number) => (
                    <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-accent bg-surface shrink-0 z-10 font-bold text-[10px] text-accent absolute left-0 md:left-1/2 -translate-x-1/2">
                        {index + 1}
                      </div>
                      <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-lg border border-border bg-surface shadow-sm ml-4 md:ml-0">
                        <div className="flex flex-col space-y-1">
                          <span className="font-semibold text-sm flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-accent" />
                            {waypoint.location}
                          </span>
                          <span className="text-xs text-text-muted">{waypoint.action}</span>
                          <span className="text-[10px] uppercase font-bold text-accent/80 pt-1 mt-1 border-t border-border/50">
                            {waypoint.estimated_arrival}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
