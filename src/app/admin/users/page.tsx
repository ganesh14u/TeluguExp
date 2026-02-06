"use client";

import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, User, MoreHorizontal, Mail, Loader2, RefreshCw, Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format } from "date-fns";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/users");
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setUsers(data);
        } catch (error: any) {
            toast.error("Failed to fetch users: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            const res = await fetch("/api/users", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: userId, role: newRole })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            toast.success(`User role updated to ${newRole}`);
            fetchUsers();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm("Are you sure? This will permanently delete the user account.")) return;
        try {
            const res = await fetch(`/api/users?id=${userId}`, { method: "DELETE" });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            toast.success("User deleted successfully");
            fetchUsers();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-10 p-2">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-5xl font-black tracking-tighter uppercase italic pr-4">Manage <span className="text-primary NOT-italic">Users</span></h1>
                    <p className="text-muted-foreground font-bold text-sm uppercase tracking-widest mt-2 italic opacity-70">View and manage all registered users.</p>
                </div>
                <Button variant="outline" size="icon" onClick={fetchUsers} disabled={loading} className="rounded-2xl h-14 w-14 border-2 shadow-sm">
                    <RefreshCw className={`h-5 w-5 ${loading && "animate-spin"}`} />
                </Button>
            </div>

            <div className="relative max-w-md group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                    placeholder="Search for a user..."
                    className="pl-14 h-16 rounded-[1.5rem] border-2 focus-visible:ring-primary shadow-sm text-lg font-bold bg-white"
                    value={search}
                    onChange={(e: any) => setSearch(e.target.value)}
                />
            </div>

            <div className="bg-background border-2 rounded-[3.5rem] overflow-hidden shadow-2xl shadow-black/5">
                <Table>
                    <TableHeader className="bg-muted/50 border-b-2">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="h-20 pl-10 font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground">User Name</TableHead>
                            <TableHead className="h-20 font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground">Role</TableHead>
                            <TableHead className="h-20 font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground">Joined Date</TableHead>
                            <TableHead className="h-20 text-right pr-10 font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-80 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20 mb-4" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Loading Users...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-80 text-center">
                                    <p className="text-muted-foreground font-black uppercase opacity-20 text-4xl italic tracking-tighter">No Users Found</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((u) => (
                                <TableRow key={u.email} className="group hover:bg-primary/2 border-muted/20 transition-colors">
                                    <TableCell className="pl-10 py-8">
                                        <div className="flex items-center gap-6">
                                            <div className="relative">
                                                <Avatar className="h-16 w-16 border-4 border-white shadow-xl">
                                                    <AvatarImage src={u.image} />
                                                    <AvatarFallback className="font-black bg-primary/10 text-primary text-xl">
                                                        {u.name?.substring(0, 2).toUpperCase() || "EX"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {u.role === 'admin' && (
                                                    <div className="absolute -bottom-1 -right-1 bg-purple-500 rounded-full p-1 border-2 border-white">
                                                        <Shield className="h-3 w-3 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="font-black text-xl tracking-tight group-hover:text-primary transition-colors">{u.name}</p>
                                                <p className="text-xs text-muted-foreground font-bold flex items-center gap-2 mt-1 uppercase tracking-widest opacity-60">
                                                    <Mail className="h-3 w-3" /> {u.email}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {u.role === 'admin' ? (
                                                <Badge className="bg-purple-600 text-white border-none gap-2 rounded-xl px-4 py-2 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-purple-500/20 italic">
                                                    <Shield className="h-3.5 w-3.5" /> System Admin
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="gap-2 rounded-xl px-4 py-2 font-black text-[10px] uppercase tracking-widest text-muted-foreground bg-muted border-2 italic">
                                                    <User className="h-3.5 w-3.5" /> Standard User
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm font-black text-muted-foreground italic">
                                        {u.createdAt ? format(new Date(u.createdAt), "MMM d, yyyy") : "ARCHIVE DATA"}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-green-600">Active</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-10">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-[1rem] hover:bg-primary/10 hover:text-primary border-2 border-transparent hover:border-primary/20 transition-all">
                                                    <MoreHorizontal className="h-6 w-6" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="rounded-[1.5rem] border-2 p-3 w-56 shadow-2xl">
                                                <DropdownMenuLabel className="font-black uppercase tracking-widest text-[10px] opacity-40 px-3 py-2">Account Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator className="my-2" />
                                                <DropdownMenuItem onClick={() => handleRoleChange(u._id, u.role === 'admin' ? 'user' : 'admin')} className="rounded-xl px-3 py-3 font-bold cursor-pointer hover:bg-primary/5">
                                                    <Shield className="mr-3 h-4 w-4 text-primary" />
                                                    {u.role === 'admin' ? 'Revoke Admin' : 'Grant Admin'}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDeleteUser(u._id)} className="rounded-xl px-3 py-3 font-bold cursor-pointer text-red-500 hover:bg-red-50 focus:bg-red-50 focus:text-red-600 mt-1">
                                                    <Trash2 className="mr-3 h-4 w-4" /> Terminate Access
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
