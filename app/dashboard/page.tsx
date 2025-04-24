"use client";

import { NoteList } from "@/components/notes/note-list";

export default function DashboardPage() {
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
