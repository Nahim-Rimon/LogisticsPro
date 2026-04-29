"use client";


import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, MapPin, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { fetchWithAuth } from "@/lib/api";

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<any | null>(null);
  const [newWarehouse, setNewWarehouse] = useState({ name: "", location: "", capacity: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [forecast, setForecast] = useState<any>(null);
  const [isForecasting, setIsForecasting] = useState(false);
  const { getToken } = useAuth();

  useEffect(() => {
    async function loadWarehouses() {
      try {
        const token = await getToken();
        const data = await fetchWithAuth('/warehouses', token);
        setWarehouses(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadWarehouses();
  }, [getToken]);

  const handleAddWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = await getToken();
      const addedWarehouse = await fetchWithAuth('/warehouses', token, {
        method: 'POST',
        body: JSON.stringify(newWarehouse),
      });
      setWarehouses([...warehouses, addedWarehouse]);
      setIsAddOpen(false);
      setNewWarehouse({ name: "", location: "", capacity: 0 });
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForecast = async () => {
    if (!selectedWarehouse) return;
    setIsForecasting(true);
    setForecast(null);
    try {
      const token = await getToken();
      const response = await fetchWithAuth(`/warehouses/${selectedWarehouse.id}/forecast`, token, {
        method: 'POST'
      });
      setForecast(response);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to generate AI forecast.");
    } finally {
      setIsForecasting(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Warehouses</h1>
            <p className="text-text-muted mt-1 font-medium">Monitor and manage your storage facilities.</p>
          </div>
          <Button className="flex items-center gap-2" onClick={() => setIsAddOpen(true)}>
            <Plus className="h-4 w-4" />
            New Warehouse
          </Button>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogContent>
              <form onSubmit={handleAddWarehouse}>
                <DialogHeader>
                  <DialogTitle>Add New Warehouse</DialogTitle>
                  <DialogDescription>
                    Enter the warehouse details to add it to your logistics network.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Warehouse Name</Label>
                    <Input
                      id="name"
                      value={newWarehouse.name}
                      onChange={(e) => setNewWarehouse({ ...newWarehouse, name: e.target.value })}
                      required
                      placeholder="e.g. Central Hub"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={newWarehouse.location}
                      onChange={(e) => setNewWarehouse({ ...newWarehouse, location: e.target.value })}
                      required
                      placeholder="e.g. New York, NY"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity (Units)</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={newWarehouse.capacity || ""}
                      onChange={(e) => setNewWarehouse({ ...newWarehouse, capacity: parseInt(e.target.value) || 0 })}
                      required
                      placeholder="e.g. 5000"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add Warehouse"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 p-6 rounded-2xl text-red-700 text-center">
            <p className="font-semibold">Failed to load warehouses</p>
            <p className="text-sm opacity-80">{error}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-text-muted">
                Showing {warehouses.length > 0 ? ((currentPage - 1) * rowsPerPage) + 1 : 0} to {Math.min(currentPage * rowsPerPage, warehouses.length)} of {warehouses.length} entries
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-text-muted">Show</span>
                <Select value={rowsPerPage.toString()} onValueChange={(val) => { setRowsPerPage(Number(val)); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[80px]">
                    <SelectValue placeholder="10" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-text-muted">entries</span>
              </div>
            </div>
            <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Warehouse Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {warehouses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10 text-text-muted italic">
                        No warehouses found in your facility network.
                      </TableCell>
                    </TableRow>
                  ) : warehouses.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage).map((warehouse) => (
                    <TableRow key={warehouse.id} className="hover:bg-bg transition-colors">
                      <TableCell className="font-semibold">{warehouse.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-text-muted">
                          <MapPin className="h-3.5 w-3.5 text-accent/60" />
                          {warehouse.location}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1.5 w-[140px]">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{warehouse.current_inventory || 0} / {warehouse.capacity || "N/A"}</span>
                            <span className="text-[10px] text-text-muted font-bold uppercase">Units</span>
                          </div>
                          {warehouse.capacity ? (
                            <Progress value={((warehouse.current_inventory || 0) / warehouse.capacity) * 100} className="h-1.5" />
                          ) : (
                            <Progress value={0} className="h-1.5" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedWarehouse(warehouse);
                            setForecast(null);
                            setIsDetailsOpen(true);
                          }}
                        >
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 mt-4">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <span className="text-sm px-2">Page {currentPage} of {Math.max(1, Math.ceil(warehouses.length / rowsPerPage))}</span>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(Math.ceil(warehouses.length / rowsPerPage), p + 1))} disabled={currentPage === Math.max(1, Math.ceil(warehouses.length / rowsPerPage)) || warehouses.length === 0}>
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Warehouse Details</DialogTitle>
            <DialogDescription>
              Information for Facility: <span className="font-semibold text-foreground">{selectedWarehouse?.name}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-text-muted font-medium">Location</p>
                <p className="font-medium flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-accent" />
                  {selectedWarehouse?.location}
                </p>
              </div>
              <div>
                <p className="text-sm text-text-muted font-medium mb-1">Capacity Utilization</p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{selectedWarehouse?.current_inventory || 0} / {selectedWarehouse?.capacity || "N/A"} Units</span>
                    <span className="text-xs text-text-muted">
                      {selectedWarehouse?.capacity ? Math.round(((selectedWarehouse?.current_inventory || 0) / selectedWarehouse?.capacity) * 100) : 0}% Full
                    </span>
                  </div>
                  <Progress value={selectedWarehouse?.capacity ? ((selectedWarehouse?.current_inventory || 0) / selectedWarehouse?.capacity) * 100 : 0} className="h-2" />
                </div>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-text-muted font-medium">Manager ID</p>
                <p className="font-mono text-xs text-muted-foreground">{selectedWarehouse?.manager_id || "Unassigned"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-text-muted font-medium">Warehouse ID</p>
                <p className="font-mono text-xs text-muted-foreground">{selectedWarehouse?.id}</p>
              </div>

              <div className="col-span-2 mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-foreground">Demand Forecast</p>
                  <Button size="sm" variant="outline" onClick={handleForecast} disabled={isForecasting}>
                    {isForecasting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Generate AI Forecast
                  </Button>
                </div>

                {forecast && (
                  <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-border shadow-sm">
                        <p className="text-xs text-text-muted uppercase tracking-wider font-semibold">Predicted Stockout</p>
                        <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">{forecast.predicted_stockout_days} Days</p>
                      </div>
                      <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-border shadow-sm">
                        <p className="text-xs text-text-muted uppercase tracking-wider font-semibold">Recommended Restock</p>
                        <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">{forecast.recommended_restock_amount} Units</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">AI Reasoning</p>
                      <p className="text-sm text-text-muted mt-1 leading-relaxed">{forecast.reasoning}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsDetailsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
