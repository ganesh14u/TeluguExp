import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
    Bell,
    User as UserIcon,
    Settings,
    HelpCircle,
    Check
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const NOTIFICATION_SOUND = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"; // Simple bell sound

export function AdminHeader() {
    const { data: session } = useSession();
    const [notifications, setNotifications] = useState<any[]>([]);
    const lastCheckedRef = useRef<Date>(new Date());
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        audioRef.current = new Audio(NOTIFICATION_SOUND);

        // Initial set of lastChecked
        lastCheckedRef.current = new Date();

        const checkNewOrders = async () => {
            try {
                const res = await fetch(`/api/orders?after=${lastCheckedRef.current.toISOString()}`);
                const newOrders = await res.json();

                if (Array.isArray(newOrders) && newOrders.length > 0) {
                    const newNotifications = newOrders.map((order: any) => ({
                        id: order._id,
                        title: `New Order: ₹${order.totalPrice}`,
                        desc: `From ${order.shippingAddress?.name || 'Guest'}`,
                        time: new Date(order.createdAt),
                        read: false
                    }));

                    setNotifications(prev => [...newNotifications, ...prev]);
                    lastCheckedRef.current = new Date(); // Update timestamp ref

                    // Play sound
                    audioRef.current?.play().catch(e => console.log("Audio play failed", e));
                    toast.success("New Order Received!");
                }
            } catch (error) {
                console.error("Failed to check notifications", error);
            }
        };

        const intervalId = setInterval(checkNewOrders, 30000); // Check every 30s
        return () => clearInterval(intervalId);
    }, []);

    const clearNotifications = () => {
        setNotifications([]);
    };

    return (
        <header className="h-16 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 flex items-center justify-between px-8 sticky top-0 z-40">
            <div className="flex items-center gap-4">
                {/* Search removed */}
            </div>

            <div className="flex items-center gap-4">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full relative">
                            <Bell className="h-5 w-5" />
                            {notifications.length > 0 && (
                                <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-background animate-pulse" />
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 rounded-2xl p-0 overflow-hidden border-2" align="end">
                        <div className="bg-muted/50 p-4 border-b flex items-center justify-between">
                            <span className="font-black text-xs uppercase tracking-widest text-muted-foreground">Notifications</span>
                            {notifications.length > 0 && (
                                <Button onClick={clearNotifications} variant="ghost" className="h-6 px-2 text-[10px] font-bold text-primary hover:bg-primary/10">
                                    Clear All
                                </Button>
                            )}
                        </div>
                        <div className="max-h-[300px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground text-xs font-bold uppercase tracking-wide">
                                    No new notifications
                                </div>
                            ) : (
                                notifications.map((notif: any) => (
                                    <div key={notif.id} className="p-4 border-b last:border-0 hover:bg-muted/30 transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-bold text-sm">{notif.title}</span>
                                            <span className="text-[10px] text-muted-foreground font-medium">{format(notif.time, 'HH:mm')}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{notif.desc}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </PopoverContent>
                </Popover>

                <Button variant="ghost" size="icon" className="rounded-full hidden sm:flex">
                    <HelpCircle className="h-5 w-5" />
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                            <Avatar className="h-10 w-10 border-2 border-primary/20">
                                <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                                <AvatarFallback className="font-bold bg-primary/10 text-primary">
                                    {session?.user?.name?.substring(0, 2).toUpperCase() || "AD"}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-bold leading-none">{session?.user?.name || "Admin User"}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {session?.user?.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 cursor-pointer">
                            <UserIcon className="h-4 w-4" /> Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 cursor-pointer">
                            <Settings className="h-4 w-4" /> Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 cursor-pointer text-destructive">
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
