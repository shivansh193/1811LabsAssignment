"use client";

import { NoteList } from "@/components/notes/note-list";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { isLoading: isAuthLoading } = useAuth();

  // Show a loading state while authentication is being determined
  if (isAuthLoading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your AI-powered notes dashboard. Create, edit, and organize your notes with AI assistance.
        </p>
      </div>
      <div className="space-y-4">
        <NoteList />
      </div>
    </div>
  );
}
