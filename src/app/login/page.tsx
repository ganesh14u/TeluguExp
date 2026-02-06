"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await signIn("credentials", {
                redirect: false,
                email,
                password,
            });

            if (res?.error) {
                toast.error("Invalid credentials");
            } else {
                toast.success("Logged in successfully");
                router.push("/account");
                router.refresh();
            }
        } catch (error) {
            toast.error("An error occurred");
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
                <CardHeader className="text-center bg-muted/50 pb-6 pt-8">
                    <CardTitle className="text-3xl font-black">Welcome Back</CardTitle>
                    <CardDescription>Enter your credentials to access your account</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-wider">Email Address</label>
                            <Input
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-12 rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-wider">Password</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="h-12 rounded-xl"
                            />
                        </div>
                        <Button type="submit" className="w-full h-12 rounded-xl text-lg font-bold" disabled={loading}>
                            {loading ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground font-bold">Or continue with</span>
                        </div>
                    </div>

                    <Button variant="outline" className="w-full h-12 rounded-xl font-bold gap-3" onClick={handleGoogleSignIn}>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="h-5 w-5" />
                        Google
                    </Button>

                    <p className="mt-6 text-center text-sm text-muted-foreground font-medium">
                        Don't have an account?{" "}
                        <Link href="/signup" className="text-primary font-bold hover:underline">
                            Sign Up
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
