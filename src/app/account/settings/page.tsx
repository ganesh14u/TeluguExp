"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [loading, setLoading] = useState(false);

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
