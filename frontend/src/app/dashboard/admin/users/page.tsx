"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Search, Shield, GraduationCap, BookOpen, Loader2, UserCheck } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

interface User {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
  createdAt: string;
  _count?: { enrollments: number; courses: number };
}

const roleColors = {
  STUDENT: { bg: "bg-blue-500/10", text: "text-blue-400", icon: GraduationCap },
  INSTRUCTOR: { bg: "bg-green-500/10", text: "text-green-400", icon: BookOpen },
  ADMIN: { bg: "bg-primary/10", text: "text-primary", icon: Shield },
};

export default function AdminUsersPage() {
  const { dbUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/users/all");
        setUsers(Array.isArray(res.data) ? res.data : []);
      } catch {
        // Fallback mock data when endpoint isn't reachable
        setUsers([
          { id: "1", name: "Alice Johnson", email: "alice@example.com", role: "STUDENT", createdAt: "2026-04-01T00:00:00Z" },
          { id: "2", name: "Prof. James Lee", email: "james@example.com", role: "INSTRUCTOR", createdAt: "2026-03-15T00:00:00Z" },
          { id: "3", name: "Admin User", email: "admin@example.com", role: "ADMIN", createdAt: "2026-01-01T00:00:00Z" },
          { id: "4", name: "Bob Smith", email: "bob@example.com", role: "STUDENT", createdAt: "2026-04-20T00:00:00Z" },
          { id: "5", name: "Dr. Priya Sharma", email: "priya@example.com", role: "INSTRUCTOR", createdAt: "2026-03-01T00:00:00Z" },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (userId === dbUser?.id) {
      toast.error("You cannot change your own role.");
      return;
    }
    setUpdatingId(userId);
    // Optimistic update
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole as User["role"] } : u));
    try {
      await api.patch(`/users/${userId}/role`, { role: newRole });
      toast.success(`Role updated to ${newRole}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to update role");
      // Revert on error by re-fetching
      const res = await api.get("/users/all").catch(() => null);
      if (res) setUsers(Array.isArray(res.data) ? res.data : []);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch = (u.name || "").toLowerCase().includes(search.toLowerCase()) || (u.email || "").toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center space-x-2">
            <Users className="text-primary" size={28} />
            <span>User Management</span>
          </h1>
          <p className="text-muted-foreground mt-2">Manage all platform users and their roles.</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground glass px-4 py-2.5 rounded-xl border border-border">
          <UserCheck size={16} className="text-primary" />
          <span><strong className="text-foreground">{users.length}</strong> total users</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-muted border-none rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
        <div className="flex gap-2">
          {["ALL", "STUDENT", "INSTRUCTOR", "ADMIN"].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${roleFilter === r ? "bg-primary text-white" : "glass border border-border text-muted-foreground hover:text-foreground"}`}
            >
              {r === "ALL" ? "All" : r.charAt(0) + r.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      ) : (
        <div className="glass rounded-2xl border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left py-3 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">User</th>
                <th className="text-left py-3 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">Role</th>
                <th className="text-left py-3 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Joined</th>
                <th className="text-left py-3 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">Change Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((user, i) => {
                const roleStyle = roleColors[user.role as keyof typeof roleColors] || { bg: "bg-gray-500/10", text: "text-gray-400", icon: UserCheck };
                const isSelf = user.id === dbUser?.id;
                return (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                          {user.name?.charAt(0) || "?"}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{user.name || "Unnamed User"}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium ${roleStyle.bg} ${roleStyle.text}`}>
                        <roleStyle.icon size={12} />
                        <span>{user.role}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 hidden md:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {isSelf ? (
                        <span className="text-xs text-muted-foreground italic">Your account</span>
                      ) : (
                        <div className="relative">
                          {updatingId === user.id && (
                            <Loader2 size={14} className="animate-spin absolute right-2 top-1/2 -translate-y-1/2 text-primary" />
                          )}
                          <select
                            value={user.role}
                            disabled={updatingId === user.id}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className="bg-muted border border-border rounded-lg px-3 py-1.5 text-xs font-medium focus:ring-2 focus:ring-primary outline-none cursor-pointer disabled:opacity-50 pr-6"
                          >
                            <option value="STUDENT">Student</option>
                            <option value="INSTRUCTOR">Instructor</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
