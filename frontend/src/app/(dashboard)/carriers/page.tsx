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
import { Plus, Phone, Mail, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { fetchWithAuth } from "@/lib/api";

export function TestPage() {
  const { userId } = useAuth(); // If this throws, ClerkProvider isn't wrapping this page
  return <div>{userId}</div>;
}

export default function CarriersPage() {
  const [carriers, setCarriers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedCarrier, setSelectedCarrier] = useState<any | null>(null);
  const [newCarrier, setNewCarrier] = useState({ name: "", email: "", phone: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { getToken } = useAuth();

  useEffect(() => {
    async function loadCarriers() {
      try {
        const token = await getToken();
        const data = await fetchWithAuth('/carriers', token);
        setCarriers(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadCarriers();
  }, [getToken]);

  const handleAddCarrier = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = await getToken();
      const addedCarrier = await fetchWithAuth('/carriers', token, {
        method: 'POST',
        body: JSON.stringify(newCarrier),
      });
      setCarriers([...carriers, addedCarrier]);
      setIsAddOpen(false);
      setNewCarrier({ name: "", email: "", phone: "" });
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
            <h1 className="text-3xl font-bold tracking-tight">Carriers</h1>
            <p className="text-text-muted mt-1 font-medium">Manage your shipping partners and performance.</p>
          </div>
          <Button className="flex items-center gap-2" onClick={() => setIsAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Carrier
          </Button>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogContent>
              <form onSubmit={handleAddCarrier}>
                <DialogHeader>
                  <DialogTitle>Add New Carrier</DialogTitle>
                  <DialogDescription>
                    Enter the carrier's details below to register them in the system.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Carrier Name</Label>
                    <Input
                      id="name"
                      value={newCarrier.name}
                      onChange={(e) => setNewCarrier({ ...newCarrier, name: e.target.value })}
                      required
                      placeholder="e.g. FedEx, UPS"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newCarrier.email}
                      onChange={(e) => setNewCarrier({ ...newCarrier, email: e.target.value })}
                      placeholder="e.g. support@fasttrack.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={newCarrier.phone}
                      onChange={(e) => setNewCarrier({ ...newCarrier, phone: e.target.value })}
                      placeholder="e.g. +1-555-0101"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add Carrier"}
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
            <p className="font-semibold">Failed to load carriers</p>
            <p className="text-sm opacity-80">{error}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-text-muted">
                Showing {carriers.length > 0 ? ((currentPage - 1) * rowsPerPage) + 1 : 0} to {Math.min(currentPage * rowsPerPage, carriers.length)} of {carriers.length} entries
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
                    <TableHead>Carrier Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {carriers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10 text-text-muted italic">
                        No carriers registered in your system.
                      </TableCell>
                    </TableRow>
                  ) : carriers.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage).map((carrier) => (
                    <TableRow key={carrier.id} className="hover:bg-bg transition-colors">
                      <TableCell className="font-semibold">{carrier.name}</TableCell>
                      <TableCell>
                        {carrier.email ? (
                          <div className="flex items-center gap-1.5 text-sm text-text-muted">
                            <Mail className="h-3.5 w-3.5 text-accent" />
                            {carrier.email}
                          </div>
                        ) : (
                          <span className="text-sm text-text-muted/50 italic">Not provided</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {carrier.phone ? (
                          <div className="flex items-center gap-1.5 text-sm text-text-muted">
                            <Phone className="h-3.5 w-3.5 text-accent" />
                            {carrier.phone}
                          </div>
                        ) : (
                          <span className="text-sm text-text-muted/50 italic">Not provided</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedCarrier(carrier);
                            setIsDetailsOpen(true);
                          }}
                        >
                          Manage
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
              <span className="text-sm px-2">Page {currentPage} of {Math.max(1, Math.ceil(carriers.length / rowsPerPage))}</span>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(Math.ceil(carriers.length / rowsPerPage), p + 1))} disabled={currentPage === Math.max(1, Math.ceil(carriers.length / rowsPerPage)) || carriers.length === 0}>
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Carrier Details</DialogTitle>
            <DialogDescription>
              Information for Partner: <span className="font-semibold text-foreground">{selectedCarrier?.name}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-sm text-text-muted font-medium">Email Address</p>
                <p className="font-medium flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4 text-accent" />
                  {selectedCarrier?.email || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-text-muted font-medium">Phone Number</p>
                <p className="font-medium flex items-center gap-2 mt-1">
                  <Phone className="h-4 w-4 text-accent" />
                  {selectedCarrier?.phone || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-text-muted font-medium">Joined Network</p>
                <p className="font-medium">
                  {selectedCarrier?.created_at ? new Date(selectedCarrier.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-text-muted font-medium">Carrier ID</p>
                <p className="font-mono text-xs text-muted-foreground">{selectedCarrier?.id}</p>
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
