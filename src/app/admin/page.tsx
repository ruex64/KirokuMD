"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { 
  getAllUsers, 
  approveUser, 
  rejectUser, 
  updateUserRole,
  updateUserStatus,
} from "@/lib/users";
import { AppUser, UserRole } from "@/types/user";
import { 
  ArrowLeft,
  Sun, 
  Moon, 
  LogOut,
  Check,
  X,
  Shield,
  User,
  Users,
  UserCheck,
  UserX,
  Clock,
} from "lucide-react";

export default function AdminPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  const { user, appUser, isAdmin, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (appUser && !isAdmin) {
      router.push("/dashboard");
      return;
    }

    if (isAdmin) {
      fetchUsers();
    }
  }, [user, appUser, isAdmin, router]);

  const fetchUsers = async () => {
    try {
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (uid: string, role: UserRole = "owner") => {
    if (!user) return;
    setActionLoading(uid);
    try {
      await approveUser(uid, user.uid, role);
      await fetchUsers();
    } catch (error) {
      console.error("Error approving user:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (uid: string) => {
    setActionLoading(uid);
    try {
      await rejectUser(uid);
      await fetchUsers();
    } catch (error) {
      console.error("Error rejecting user:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRoleChange = async (uid: string, role: UserRole) => {
    setActionLoading(uid);
    try {
      await updateUserRole(uid, role);
      await fetchUsers();
    } catch (error) {
      console.error("Error updating role:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusChange = async (uid: string, status: "approved" | "pending" | "rejected") => {
    setActionLoading(uid);
    try {
      await updateUserStatus(uid, status);
      await fetchUsers();
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const filteredUsers = users.filter((u) => {
    if (filter === "all") return true;
    return u.status === filter;
  });

  const pendingCount = users.filter((u) => u.status === "pending").length;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "admin":
        return <Shield className="w-3.5 h-3.5" />;
      case "owner":
        return <User className="w-3.5 h-3.5" />;
      case "editor":
        return <Users className="w-3.5 h-3.5" />;
      case "viewer":
        return <User className="w-3.5 h-3.5" />;
      case "commenter":
        return <Users className="w-3.5 h-3.5" />;
      default:
        return <User className="w-3.5 h-3.5" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <UserCheck className="w-3.5 h-3.5" style={{ color: "#22c55e" }} />;
      case "rejected":
        return <UserX className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />;
      default:
        return <Clock className="w-3.5 h-3.5" style={{ color: "#eab308" }} />;
    }
  };

  if (loading || !isAdmin) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg-primary)" }}
      >
        <p style={{ color: "var(--text-muted)" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Header */}
      <header 
        className="sticky top-0 z-10 border-b"
        style={{ 
          background: "var(--bg-primary)", 
          borderColor: "var(--border-primary)" 
        }}
      >
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-1.5 transition-opacity hover:opacity-70"
              style={{ color: "var(--text-muted)" }}
              title="Back to dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 
              className="text-lg font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              Admin Panel
            </h1>
            {pendingCount > 0 && (
              <span 
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ 
                  background: "var(--accent)",
                  color: "var(--bg-primary)"
                }}
              >
                {pendingCount} pending
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 transition-opacity hover:opacity-70"
              style={{ color: "var(--text-muted)" }}
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={handleSignOut}
              className="p-2 transition-opacity hover:opacity-70"
              style={{ color: "var(--text-muted)" }}
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Filter Tabs */}
        <div 
          className="flex gap-1 mb-6 p-1 w-fit"
          style={{ background: "var(--bg-secondary)" }}
        >
          {(["all", "pending", "approved", "rejected"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className="px-3 py-1.5 text-sm capitalize transition-colors"
              style={{ 
                background: filter === tab ? "var(--bg-primary)" : "transparent",
                color: filter === tab ? "var(--text-primary)" : "var(--text-muted)"
              }}
            >
              {tab}
              {tab === "pending" && pendingCount > 0 && (
                <span className="ml-1.5 text-xs">({pendingCount})</span>
              )}
            </button>
          ))}
        </div>

        {/* Users Table */}
        {filteredUsers.length === 0 ? (
          <div 
            className="text-center py-16"
            style={{ color: "var(--text-muted)" }}
          >
            <Users 
              className="w-12 h-12 mx-auto mb-4"
              style={{ color: "var(--text-ghost)" }}
            />
            <p>No users found.</p>
          </div>
        ) : (
          <div 
            className="border overflow-hidden"
            style={{ borderColor: "var(--border-primary)" }}
          >
            <table className="w-full">
              <thead>
                <tr style={{ background: "var(--bg-secondary)" }}>
                  <th 
                    className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide"
                    style={{ color: "var(--text-muted)" }}
                  >
                    User
                  </th>
                  <th 
                    className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Status
                  </th>
                  <th 
                    className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Role
                  </th>
                  <th 
                    className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Joined
                  </th>
                  <th 
                    className="text-right px-4 py-3 text-xs font-medium uppercase tracking-wide"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr 
                    key={u.uid}
                    className="border-t"
                    style={{ borderColor: "var(--border-primary)" }}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p 
                          className="text-sm font-medium"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {u.displayName || "No name"}
                        </p>
                        <p 
                          className="text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {u.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {getStatusIcon(u.status)}
                        <span 
                          className="text-sm capitalize"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {u.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {u.status === "approved" ? (
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.uid, e.target.value as UserRole)}
                          disabled={actionLoading === u.uid || u.uid === user?.uid}
                          className="text-sm px-2 py-1 border outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ 
                            background: "var(--bg-secondary)",
                            borderColor: "var(--border-primary)",
                            color: "var(--text-primary)"
                          }}
                        >
                          <option value="admin">Admin</option>
                          <option value="owner">Owner</option>
                          <option value="editor">Editor</option>
                          <option value="viewer">Viewer</option>
                          <option value="commenter">Commenter</option>
                        </select>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          {getRoleIcon(u.role)}
                          <span 
                            className="text-sm capitalize"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {u.role}
                          </span>
                        </div>
                      )}
                    </td>
                    <td 
                      className="px-4 py-3 text-sm"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {u.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(u.uid)}
                              disabled={actionLoading === u.uid}
                              className="p-1.5 transition-opacity hover:opacity-70 disabled:opacity-50"
                              style={{ color: "#22c55e" }}
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(u.uid)}
                              disabled={actionLoading === u.uid}
                              className="p-1.5 transition-opacity hover:opacity-70 disabled:opacity-50"
                              style={{ color: "var(--accent)" }}
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {u.status === "approved" && u.uid !== user?.uid && (
                          <button
                            onClick={() => handleStatusChange(u.uid, "rejected")}
                            disabled={actionLoading === u.uid}
                            className="p-1.5 transition-opacity hover:opacity-70 disabled:opacity-50"
                            style={{ color: "var(--accent)" }}
                            title="Revoke access"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        )}
                        {u.status === "rejected" && (
                          <button
                            onClick={() => handleApprove(u.uid)}
                            disabled={actionLoading === u.uid}
                            className="p-1.5 transition-opacity hover:opacity-70 disabled:opacity-50"
                            style={{ color: "#22c55e" }}
                            title="Approve"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
