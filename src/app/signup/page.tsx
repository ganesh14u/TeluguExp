"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function SignupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || "Failed to register");
            } else {
                toast.success("Account created! Signing you in...");

                // Automatically sign in after registration
                const loginRes = await signIn("credentials", {
                    redirect: false,
                    email,
                    password,
                });

                if (loginRes?.error) {
                    router.push("/login");
                } else {
                    router.push("/account");
                    router.refresh();
                }
            }
        } catch (error) {
            toast.error("An error occurred during signup");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = () => {
        signIn("google", { callbackUrl: "/account" });
    };

    return (
        <div className="container mx-auto px-4 py-12 flex justify-center items-center">
            <Card className="w-full max-w-md shadow-2xl rounded-3xl overflow-hidden border-2">
                <CardHeader className="text-center bg-primary/5 pb-8 pt-8">
                    <CardTitle className="text-3xl font-black italic uppercase tracking-tighter">Create <span className="text-primary NOT-italic">Account</span></CardTitle>
                    <CardDescription className="font-bold">Join our community today</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                            <Input
                                placeholder="Ganesh .."
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="h-12 rounded-xl bg-muted/30 border-none font-bold"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                            <Input
                                type="email"
                                placeholder="name@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-12 rounded-xl bg-muted/30 border-none font-bold"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Password</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="h-12 rounded-xl bg-muted/30 border-none font-bold"
                            />
                        </div>
                        <Button type="submit" className="w-full h-12 rounded-xl text-lg font-black uppercase tracking-widest shadow-xl shadow-primary/20" disabled={loading}>
                            {loading ? "Creating..." : "Register Now"}
                        </Button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
                            <span className="bg-background px-4 text-muted-foreground">Or Connect With</span>
                        </div>
                    </div>

                    <Button variant="outline" className="w-full h-12 rounded-xl font-black gap-3 border-2" onClick={handleGoogleSignIn}>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="h-5 w-5" />
                        Google
                    </Button>

                    <p className="mt-6 text-center text-sm text-muted-foreground font-bold">
                        Already have an account?{" "}
                        <Link href="/login" className="text-primary font-black hover:underline uppercase tracking-tighter">
                            Sign In
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
