"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Plus, Loader2 } from "lucide-react";

export default function AddressesPage() {
    const { data: session } = useSession();
    const [addresses, setAddresses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        street: "",
        city: "",
        state: "",
        zipCode: "",
        isDefault: false
    });

    useEffect(() => {
        if (session?.user?.id) {
            fetch('/api/users/profile')
                .then(res => res.json())
                .then(data => {
                    if (!data.error) setAddresses(data.addresses || []);
                    setLoading(false);
                });
        }
    }, [session]);

    const handleOpenDialog = (address: any = null) => {
        if (address) {
            setEditingAddress(address);
            setFormData({
                name: address.name,
                phone: address.phone,
                street: address.street,
                city: address.city,
                state: address.state,
                zipCode: address.zipCode,
                isDefault: address.isDefault
            });
        } else {
            setEditingAddress(null);
            setFormData({
                name: "",
                phone: "",
                street: "",
                city: "",
                state: "",
                zipCode: "",
                isDefault: false
            });
        }
        setIsDialogOpen(true);
    };

    const handleDelete = async (addressId: string) => {
        if (!confirm("Are you sure you want to delete this address?")) return;

        try {
            const res = await fetch(`/api/users/addresses?addressId=${addressId}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (!data.error) {
                setAddresses(data);
                toast.success("Address deleted successfully");
            }
        } catch (err) {
            toast.error("Failed to delete address");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const method = editingAddress ? 'PUT' : 'POST';
        const body = editingAddress ? { ...formData, addressId: editingAddress._id } : formData;

        try {
            const res = await fetch('/api/users/addresses', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!data.error) {
                setAddresses(data);
                setIsDialogOpen(false);
                toast.success(editingAddress ? "Address updated" : "Address added");
            }
        } catch (err) {
            toast.error("Failed to save address");
        }
    };

    const [isLocating, setIsLocating] = useState(false);

    const handleUseLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                // Using OpenStreetMap Nominatim for Reverse Geocoding (Free, no key required for client-side usage)
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                const data = await response.json();

                if (data.address) {
                    setFormData(prev => ({
                        ...prev,
                        street: [data.address.house_number, data.address.road, data.address.suburb, data.address.neighbourhood].filter(Boolean).join(', '),
                        city: data.address.city || data.address.town || data.address.village || "",
                        state: data.address.state || "",
                        zipCode: data.address.postcode || ""
                    }));
                    toast.success("Location fetched successfully");
                }
            } catch (error) {
                console.error(error);
                toast.error("Failed to fetch address details");
            } finally {
                setIsLocating(false);
            }
        }, () => {
            toast.error("Unable to retrieve your location");
            setIsLocating(false);
        });
    };

    return (
        <div className="space-y-8">
            <section className="bg-white p-8 rounded-[2rem] border-2 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic pr-4">Saved <span className="text-primary NOT-italic">Addresses</span></h1>
                    <p className="text-muted-foreground font-bold text-sm uppercase tracking-widest mt-2">Manage your delivery locations</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="h-12 rounded-xl px-6 font-black uppercase tracking-widest text-[10px] gap-2">
                    <Plus className="h-4 w-4" /> Add New Address
                </Button>
            </section>

            {loading ? (
                <div className="flex justify-center py-20 italic font-bold text-muted-foreground">Loading addresses...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((address) => (
                        <Card key={address._id} className={`rounded-[2rem] border-2 p-8 relative overflow-hidden group ${address.isDefault ? 'border-primary bg-primary/5' : 'bg-white'}`}>
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                                <MapPin className={`h-16 w-16 ${address.isDefault ? 'text-primary' : 'text-muted-foreground'}`} />
                            </div>
                            <div className="space-y-4 relative z-10">
                                <div className="flex items-center gap-2">
                                    {address.isDefault && (
                                        <span className="bg-primary text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Default</span>
                                    )}
                                    <h3 className="font-black uppercase tracking-tight italic">{address.name}</h3>
                                </div>
                                <div className="space-y-1 text-sm font-bold text-muted-foreground">
                                    <p>{address.street}</p>
                                    <p>{address.city}, {address.state} - {address.zipCode}</p>
                                    <p>Phone: {address.phone}</p>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <Button onClick={() => handleOpenDialog(address)} variant="outline" className="h-10 rounded-lg text-[10px] font-black uppercase tracking-widest border-2">Edit</Button>
                                    <Button onClick={() => handleDelete(address._id)} variant="ghost" className="h-10 rounded-lg text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50">Remove</Button>
                                </div>
                            </div>
                        </Card>
                    ))}

                    <Card onClick={() => handleOpenDialog()} className="rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center p-8 hover:bg-muted/30 transition-colors cursor-pointer group min-h-[200px]">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Plus className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">Add Another Address</p>
                    </Card>
                </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="rounded-[2.5rem] border-2 p-8 max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">
                            {editingAddress ? 'Edit' : 'Add New'} <span className="text-primary NOT-italic">Address</span>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="mt-4">
                        <Button
                            onClick={handleUseLocation}
                            type="button"
                            variant="outline"
                            disabled={isLocating}
                            className="w-full mb-4 gap-2 rounded-xl border-dashed border-2 font-black uppercase tracking-widest text-[10px] h-12"
                        >
                            {isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                            {isLocating ? "Getting Location..." : "Use My Current Location"}
                        </Button>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Name</label>
                                    <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Home/Work" className="rounded-xl border-2" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Phone</label>
                                    <Input required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+91..." className="rounded-xl border-2" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Street Address</label>
                                <Input required value={formData.street} onChange={e => setFormData({ ...formData, street: e.target.value })} placeholder="House No, Area..." className="rounded-xl border-2" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">City</label>
                                    <Input required value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} placeholder="City" className="rounded-xl border-2" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pincode</label>
                                    <Input required value={formData.zipCode} onChange={e => setFormData({ ...formData, zipCode: e.target.value })} placeholder="520001" className="rounded-xl border-2" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">State</label>
                                <Input required value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} placeholder="State" className="rounded-xl border-2" />
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="isDefault"
                                    checked={formData.isDefault}
                                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label htmlFor="isDefault" className="text-xs font-bold uppercase tracking-widest cursor-pointer">Set as default address</label>
                            </div>
                            <Button type="submit" className="w-full h-12 rounded-xl font-black uppercase tracking-widest mt-4">
                                {editingAddress ? 'Update' : 'Save'} Address
                            </Button>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
