"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Save,
    FileText,
    Home,
    Image as ImageIcon,
    CheckCircle2,
    Loader2,
    AlertCircle
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function AdminCMSPage() {
    const [content, setContent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchCMS = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/cms?key=homepage");
            const data = await res.json();
            if (data && data.content) {
                setContent(data.content);
            } else {
                // Default structure
                setContent({
                    heroTitle: "Explore the Science",
                    heroSubtitle: "Building tomorrow with today's experiments.",
                    showPromoBanner: true,
                    seasonalSaleText: "Summer Science Sale! ☀️"
                });
            }
        } catch (error) {
            toast.error("Failed to load CMS data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCMS();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/cms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key: "homepage", content })
            });
            if (res.ok) {
                toast.success("Homepage published to live server! 🚀");
            } else {
                throw new Error("Save collapsed.");
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="font-black text-xs uppercase tracking-widest text-muted-foreground">Synchronizing live content...</p>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase italic">Content <span className="text-primary NOT-italic">Nucleus</span></h1>
                    <p className="text-muted-foreground font-medium">Control the visual output of your laboratory storefront globally.</p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="gap-2 rounded-xl h-12 px-8 font-black text-lg shadow-xl shadow-primary/20"
                >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Publish Changes
                </Button>
            </div>

            <Tabs defaultValue="homepage" className="space-y-6">
                <TabsList className="bg-muted/50 p-1 rounded-2xl border-none h-14 w-fit">
                    <TabsTrigger value="homepage" className="rounded-xl px-8 font-black gap-2 data-[state=active]:bg-background data-[state=active]:shadow-lg">
                        <Home className="h-4 w-4" /> Homepage
                    </TabsTrigger>
                    <TabsTrigger value="pages" className="rounded-xl px-8 font-black gap-2 data-[state=active]:bg-background data-[state=active]:shadow-lg">
                        <FileText className="h-4 w-4" /> Static Pages
                    </TabsTrigger>
                    <TabsTrigger value="media" className="rounded-xl px-8 font-black gap-2 data-[state=active]:bg-background data-[state=active]:shadow-lg">
                        <ImageIcon className="h-4 w-4" /> Asset Bank
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="homepage" className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Card className="rounded-[2.5rem] border-2 shadow-sm overflow-hidden bg-card/50">
                            <CardHeader className="bg-muted/30 border-b">
                                <CardTitle className="uppercase font-black flex items-center gap-2 italic">
                                    <CheckCircle2 className="h-5 w-5 text-green-500" /> Hero Section
                                </CardTitle>
                                <CardDescription className="font-bold">Main branding text on the landing page.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 p-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Main Headline</label>
                                    <Input
                                        placeholder="Enter headline"
                                        className="h-14 rounded-2xl bg-muted/30 border-none font-bold text-lg"
                                        value={content.heroTitle}
                                        onChange={(e) => setContent({ ...content, heroTitle: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Supporting Text</label>
                                    <Input
                                        placeholder="Enter subtitle"
                                        className="h-14 rounded-2xl bg-muted/30 border-none font-medium text-muted-foreground"
                                        value={content.heroSubtitle}
                                        onChange={(e) => setContent({ ...content, heroSubtitle: e.target.value })}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-[2.5rem] border-2 shadow-sm overflow-hidden bg-card/50">
                            <CardHeader className="bg-muted/30 border-b">
                                <CardTitle className="uppercase font-black flex items-center gap-2 italic">
                                    <AlertCircle className="h-5 w-5 text-primary" /> Promo Engine
                                </CardTitle>
                                <CardDescription className="font-bold">Toggle seasonal alerts and banners.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 gap-6 p-8">
                                <div className="flex items-center justify-between p-6 rounded-3xl bg-muted/20 border-2 border-dashed border-primary/20">
                                    <div className="space-y-1">
                                        <p className="font-black uppercase text-sm">Sale Banner</p>
                                        <p className="text-xs text-muted-foreground font-bold italic">Currently: {content.showPromoBanner ? 'ACTIVE' : 'OFFLINE'}</p>
                                    </div>
                                    <Button
                                        variant={content.showPromoBanner ? "default" : "outline"}
                                        className="rounded-xl font-black italic shadow-lg"
                                        onClick={() => setContent({ ...content, showPromoBanner: !content.showPromoBanner })}
                                    >
                                        {content.showPromoBanner ? 'DEACTIVATE' : 'ACTIVATE'}
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Season Headline</label>
                                    <Input
                                        placeholder="e.g. Diwal Special"
                                        className="h-14 rounded-2xl bg-muted/30 border-none font-black italic text-lg text-primary"
                                        value={content.seasonalSaleText}
                                        onChange={(e) => setContent({ ...content, seasonalSaleText: e.target.value })}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="pages" className="h-[400px] flex items-center justify-center border-2 border-dashed rounded-[3rem]">
                    <div className="text-center grayscale opacity-20 transform hover:scale-105 transition-transform">
                        <FileText className="h-12 w-12 mx-auto mb-4" />
                        <h3 className="text-xl font-bold uppercase tracking-tighter italic">Pages are hardcoded for now</h3>
                        <p className="text-sm">Static routing is active for /about and /faq</p>
                    </div>
                </TabsContent>

                <TabsContent value="media" className="h-[400px] flex items-center justify-center border-2 border-dashed rounded-[3rem]">
                    <div className="text-center grayscale opacity-20 transform hover:scale-105 transition-transform">
                        <ImageIcon className="h-12 w-12 mx-auto mb-4" />
                        <h3 className="text-xl font-bold uppercase tracking-tighter italic">Cloudinary Connection Active</h3>
                        <p className="text-sm">Upload images directly in product editor</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
