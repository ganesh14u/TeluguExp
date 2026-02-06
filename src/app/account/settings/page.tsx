"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Settings, User, Phone, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

export default function SettingsPage() {
    const { data: session, update } = useSession();
    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [profile, setProfile] = useState({ name: "", phone: "" });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/users/profile', { cache: 'no-store' });
                const data = await res.json();
                if (!data.error) {
                    setProfile({
                        name: data.name || "",
                        phone: data.phone || ""
                    });
                }
            } catch (error) {
                console.error("Failed to fetch profile", error);
            }
        };
        fetchProfile();
    }, []);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/users/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile),
            });
            const data = await res.json();
            if (data.error) {
                toast.error(data.error);
            } else {
                await update({ name: profile.name });
                toast.success("Profile Updated!", { description: "Your personal details have been saved." });
            }
        } catch (err) {
            toast.error("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/users/password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwords.currentPassword,
                    newPassword: passwords.newPassword
                }),
            });
            const data = await res.json();

            if (data.error) {
                toast.error(data.error);
            } else {
                toast.success("Password Updated!", {
                    description: "Your account is now more secure."
                });
                setPasswords({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                });
            }
        } catch (err) {
            toast.error("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <section className="bg-white p-8 rounded-[2rem] border-2">
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic pr-4">Account <span className="text-primary NOT-italic">Settings</span></h1>
                <p className="text-muted-foreground font-bold text-sm uppercase tracking-widest mt-2">Update your security and preferences</p>
            </section>

            <div className="grid grid-cols-1 gap-8">
                {/* Personal Details Section */}
                <Card className="rounded-[2rem] border-2 overflow-hidden bg-white">
                    <CardHeader className="border-b border-dashed p-8 bg-muted/10 flex flex-row items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-2xl">
                            <Edit2 className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-xl font-black uppercase tracking-tighter italic">Personal <span className="text-primary NOT-italic">Details</span></CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form onSubmit={handleProfileUpdate} className="max-w-md space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                                <Input
                                    required
                                    value={profile.name}
                                    onChange={e => setProfile({ ...profile, name: e.target.value })}
                                    className="h-14 rounded-2xl border-2 italic font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="+91..."
                                        value={profile.phone}
                                        onChange={e => setProfile({ ...profile, phone: e.target.value.replace(/[^0-9+]/g, '') })}
                                        className="h-14 rounded-2xl border-2 pl-12 font-bold"
                                    />
                                </div>
                            </div>
                            <Button disabled={loading} type="submit" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest italic shadow-lg shadow-primary/20">
                                {loading ? "Saving Changes..." : "Save Personal Details"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Password Change Section */}
                <Card className="rounded-[2rem] border-2 overflow-hidden bg-white">
                    <CardHeader className="border-b border-dashed p-8 bg-muted/10 flex flex-row items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-2xl">
                            <Lock className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-xl font-black uppercase tracking-tighter italic">Security & <span className="text-primary NOT-italic">Password</span></CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form onSubmit={handlePasswordChange} className="max-w-md space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Current Password</label>
                                <Input
                                    required
                                    type="password"
                                    placeholder="••••••••"
                                    className="h-14 rounded-2xl border-2"
                                    value={passwords.currentPassword}
                                    onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">New Password</label>
                                <Input
                                    required
                                    type="password"
                                    placeholder="••••••••"
                                    className="h-14 rounded-2xl border-2"
                                    value={passwords.newPassword}
                                    onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Confirm New Password</label>
                                <Input
                                    required
                                    type="password"
                                    placeholder="••••••••"
                                    className="h-14 rounded-2xl border-2"
                                    value={passwords.confirmPassword}
                                    onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                />
                            </div>
                            <Button disabled={loading} type="submit" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest italic shadow-lg shadow-primary/20">
                                {loading ? "Updating..." : "Update Password"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Account Preferences */}
                <Card className="rounded-[2rem] border-2 overflow-hidden bg-white">
                    <CardHeader className="border-b border-dashed p-8 bg-muted/10 flex flex-row items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-2xl">
                            <Settings className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-xl font-black uppercase tracking-tighter italic">General <span className="text-primary NOT-italic">Preferences</span></CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 rounded-2xl border-2 bg-muted/5">
                                <div>
                                    <p className="font-black uppercase tracking-tight text-sm italic">Email Notifications</p>
                                    <p className="text-xs text-muted-foreground font-bold">Receive order updates via email</p>
                                </div>
                                <div className="h-6 w-11 bg-primary rounded-full relative">
                                    <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-2xl border-2 bg-muted/5 opacity-50">
                                <div>
                                    <p className="font-black uppercase tracking-tight text-sm italic">SMS Notifications</p>
                                    <p className="text-xs text-muted-foreground font-bold">Receive order updates via phone</p>
                                </div>
                                <div className="h-6 w-11 bg-slate-300 rounded-full relative">
                                    <div className="absolute left-1 top-1 h-4 w-4 bg-white rounded-full" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
