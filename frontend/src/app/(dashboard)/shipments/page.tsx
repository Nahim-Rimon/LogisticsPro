"use client";


import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Plus, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { fetchWithAuth } from "@/lib/api";

const statusColors: Record<string, string> = {
  'In Transit': 'bg-blue-100 text-blue-700 border-blue-200',
  'Delivered': 'bg-green-100 text-green-700 border-green-200',
  'Pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Exception': 'bg-red-100 text-red-700 border-red-200',
};

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<any | null>(null);
  const [newShipment, setNewShipment] = useState({ tracking_number: "", status: "Pending" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { getToken } = useAuth();

  useEffect(() => {
    async function loadShipments() {
      try {
        const token = await getToken();
        const data = await fetchWithAuth('/shipments', token);
        setShipments(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadShipments();
  }, [getToken]);

  const handleAddShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = await getToken();
      const addedShipment = await fetchWithAuth('/shipments', token, {
        method: 'POST',
        body: JSON.stringify(newShipment),
      });
      setShipments([...shipments, addedShipment]);
      setIsAddOpen(false);
      setNewShipment({ tracking_number: "", status: "Pending" });
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Shipments</h1>
            <p className="text-text-muted mt-1 font-medium">Manage and track all shipments across your network.</p>
          </div>
          <Button className="flex items-center gap-2" onClick={() => setIsAddOpen(true)}>
            <Plus className="h-4 w-4" />
            New Shipment
          </Button>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogContent>
              <form onSubmit={handleAddShipment}>
                <DialogHeader>
                  <DialogTitle>Create New Shipment</DialogTitle>
                  <DialogDescription>
                    Enter the shipment's tracking details to add it to the system.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="tracking">Tracking Number</Label>
                    <Input 
                      id="tracking" 
                      value={newShipment.tracking_number} 
                      onChange={(e) => setNewShipment({...newShipment, tracking_number: e.target.value})}
                      required 
                      placeholder="e.g. TRK-123456789"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Shipment"}
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
             <p className="font-semibold">Failed to load shipments</p>
             <p className="text-sm opacity-80">{error}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-text-muted">
                Showing {shipments.length > 0 ? ((currentPage - 1) * rowsPerPage) + 1 : 0} to {Math.min(currentPage * rowsPerPage, shipments.length)} of {shipments.length} entries
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
                  <TableHead>Tracking Number</TableHead>
                  <TableHead>Origin</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Carrier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Delay Risk</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shipments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-text-muted italic">
                      No shipments found in your network.
                    </TableCell>
                  </TableRow>
                ) : shipments.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage).map((shipment) => (
                  <TableRow key={shipment.id} className="hover:bg-bg transition-colors">
                    <TableCell className="font-semibold">{shipment.tracking_number}</TableCell>
                    <TableCell className="text-sm text-text-muted">{shipment.origin?.name || "Unassigned"}</TableCell>
                    <TableCell className="text-sm text-text-muted">{shipment.destination?.name || "Unassigned"}</TableCell>
                    <TableCell className="text-sm text-text-muted">{shipment.carrier?.name || "Unassigned"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[shipment.status] || 'bg-gray-100'}>
                        {shipment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {shipment.delay_risk === 'High' ? (
                        <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">High Risk</Badge>
                      ) : shipment.delay_risk === 'Medium' ? (
                        <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200">Medium Risk</Badge>
                      ) : shipment.delay_risk === 'Low' ? (
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">Low Risk</Badge>
                      ) : (
                        <span className="text-text-muted text-xs italic">Evaluating...</span>
                      )}
                    </TableCell>
                    <TableCell className="text-text-muted text-sm">
                      {new Date(shipment.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          setSelectedShipment(shipment);
                          setIsDetailsOpen(true);
                        }}
                      >
                        View Details
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
            <span className="text-sm px-2">Page {currentPage} of {Math.max(1, Math.ceil(shipments.length / rowsPerPage))}</span>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(Math.ceil(shipments.length / rowsPerPage), p + 1))} disabled={currentPage === Math.max(1, Math.ceil(shipments.length / rowsPerPage)) || shipments.length === 0}>
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
        )}
      </div>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Shipment Details</DialogTitle>
            <DialogDescription>
              Information for Tracking Number: <span className="font-semibold text-foreground">{selectedShipment?.tracking_number}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-text-muted font-medium">Status</p>
                <Badge variant="outline" className={statusColors[selectedShipment?.status] || 'bg-gray-100'}>
                  {selectedShipment?.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-text-muted font-medium">Created At</p>
                <p className="font-medium">
                  {selectedShipment?.created_at ? new Date(selectedShipment.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-text-muted font-medium">Origin</p>
                <p className="font-medium">{selectedShipment?.origin?.name || "Unassigned"}</p>
              </div>
              <div>
                <p className="text-sm text-text-muted font-medium">Destination</p>
                <p className="font-medium">{selectedShipment?.destination?.name || "Unassigned"}</p>
              </div>
              <div>
                <p className="text-sm text-text-muted font-medium">Carrier</p>
                <p className="font-medium">{selectedShipment?.carrier?.name || "Unassigned"}</p>
              </div>
              <div className="col-span-2 mt-2">
                <p className="text-sm text-text-muted font-medium">Predictive Delay Forecast</p>
                <div className="p-3 mt-1 bg-surface border border-border rounded-lg">
                  {selectedShipment?.delay_risk ? (
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={selectedShipment.delay_risk === 'High' ? 'bg-red-100 text-red-700' : selectedShipment.delay_risk === 'Medium' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}>
                          {selectedShipment.delay_risk} Risk
                        </Badge>
                      </div>
                      <p className="text-sm">{selectedShipment.delay_reason}</p>
                    </>
                  ) : (
                    <p className="text-sm text-text-muted italic">Delay risk evaluation pending...</p>
                  )}
                </div>
              </div>
              <div className="col-span-2 mt-2">
                <p className="text-sm text-text-muted font-medium">Shipment ID</p>
                <p className="font-mono text-xs text-muted-foreground">{selectedShipment?.id}</p>
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
