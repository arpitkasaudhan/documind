"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  User, Lock, CreditCard, LogOut, Loader2, Check, ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/features/Navbar";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface UserData {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
  subscription: { plan: string; stripeCurrentPeriodEnd: string | null } | null;
  _count: { documents: number };
}

export default function SettingsPage() {
  const { data: sessionData } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const [nameForm, setNameForm] = useState({ name: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [savingName, setSavingName] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    fetch("/api/user").then((r) => r.json()).then((d) => {
      setUser(d.user);
      setNameForm({ name: d.user?.name ?? "" });
      setLoading(false);
    });
  }, []);

  const updateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingName(true);
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameForm.name }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Name updated");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setSavingName(false);
    }
  };

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPw(true);
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordForm),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Password updated");
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update password");
    } finally {
      setSavingPw(false);
    }
  };

  const manageBilling = async () => {
    const res = await fetch("/api/billing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "portal" }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else toast.error("Could not open billing portal");
  };

  const upgradeToPro = async () => {
    const res = await fetch("/api/billing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "checkout" }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else toast.error("Could not open checkout");
  };

  const plan = user?.subscription?.plan ?? "FREE";
  const docLimit = plan === "PRO" ? 100 : 3;

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar user={sessionData?.user} />
        <div className="max-w-2xl mx-auto px-4 py-10 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-neutral-200 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar user={sessionData?.user} />
      <main className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-1.5 text-neutral-500">
              <ChevronLeft className="w-4 h-4" />
              Dashboard
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-neutral-900">Settings</h1>
        </div>

        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-violet-600" />
              Profile
            </CardTitle>
            <CardDescription>Update your display name</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={updateName} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Email</label>
                <Input value={user?.email ?? ""} disabled className="bg-neutral-50" />
                <p className="text-xs text-neutral-400 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Full name</label>
                <Input
                  value={nameForm.name}
                  onChange={(e) => setNameForm({ name: e.target.value })}
                  placeholder="Your name"
                />
              </div>
              <Button type="submit" disabled={savingName} size="sm">
                {savingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Save name
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-violet-600" />
              Change Password
            </CardTitle>
            <CardDescription>Only available for email/password accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={updatePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Current password</label>
                <Input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">New password</label>
                <Input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                  placeholder="Min 6 characters"
                  minLength={6}
                />
              </div>
              <Button type="submit" disabled={savingPw} size="sm">
                {savingPw ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Update password
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-violet-600" />
              Subscription
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-neutral-900">Current plan</p>
                <p className="text-sm text-neutral-500">
                  {user?._count.documents}/{docLimit} documents used
                </p>
                {user?.subscription?.stripeCurrentPeriodEnd && (
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Renews {formatDate(user.subscription.stripeCurrentPeriodEnd)}
                  </p>
                )}
              </div>
              <Badge variant={plan === "PRO" ? "default" : "neutral"} className="text-sm px-3 py-1">
                {plan}
              </Badge>
            </div>

            {plan === "FREE" ? (
              <Button onClick={upgradeToPro} className="w-full">
                Upgrade to Pro — ₹799/mo
              </Button>
            ) : (
              <Button variant="outline" onClick={manageBilling} className="w-full">
                Manage billing
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Danger zone */}
        <Card className="border-red-100">
          <CardHeader>
            <CardTitle className="text-red-600">Danger zone</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign out of all sessions
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
