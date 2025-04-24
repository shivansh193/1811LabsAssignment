"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center px-4 lg:px-6 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2">
          <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500">
            <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
              N
            </div>
          </div>
          <span className="font-bold text-xl">NoteGenius</span>
        </div>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            href="/auth"
            className="text-sm font-medium underline-offset-4 hover:underline text-muted-foreground hover:text-foreground"
          >
            Sign In
          </Link>
          <Link
            href="/auth?tab=signup"
            className="text-sm font-medium underline-offset-4 hover:underline text-muted-foreground hover:text-foreground"
          >
            Sign Up
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <motion.h1 
                    className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-cyan-600 dark:from-indigo-400 dark:to-cyan-400"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    Capture Your Thoughts with AI-Powered Intelligence
                  </motion.h1>
                  <motion.p 
                    className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    NoteGenius helps you organize your ideas with powerful AI summarization. Create, edit, and manage your notes with a beautiful interface.
                  </motion.p>
                </div>
                <motion.div 
                  className="flex flex-col gap-2 min-[400px]:flex-row"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Link href="/auth">
                    <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white">
                      Get Started
                    </Button>
                  </Link>
                  <Link href="#features">
                    <Button size="lg" variant="outline">
                      Learn More
                    </Button>
                  </Link>
                </motion.div>
              </div>
              <motion.div 
                className="flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                <div className="relative h-[350px] w-full overflow-hidden rounded-xl border bg-background shadow-xl md:h-[420px] lg:h-[650px]">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-cyan-100 dark:from-indigo-950/30 dark:to-cyan-950/30 p-4 sm:p-6">
                    <div className="flex flex-col space-y-4">
                      <div className="h-6 w-24 rounded-md bg-indigo-200/80 dark:bg-indigo-800/30"></div>
                      <div className="h-4 w-full rounded-md bg-indigo-200/50 dark:bg-indigo-800/20"></div>
                      <div className="h-4 w-full rounded-md bg-indigo-200/50 dark:bg-indigo-800/20"></div>
                      <div className="h-4 w-3/4 rounded-md bg-indigo-200/50 dark:bg-indigo-800/20"></div>
                      <div className="mt-4 h-6 w-32 rounded-md bg-cyan-200/80 dark:bg-cyan-800/30"></div>
                      <div className="h-4 w-full rounded-md bg-cyan-200/50 dark:bg-cyan-800/20"></div>
                      <div className="h-4 w-full rounded-md bg-cyan-200/50 dark:bg-cyan-800/20"></div>
                      <div className="h-4 w-2/3 rounded-md bg-cyan-200/50 dark:bg-cyan-800/20"></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-950">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800">
                  Key Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Everything You Need for Note-Taking</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  NoteGenius combines powerful features with a beautiful interface to make note-taking a breeze.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
              <motion.div 
                className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="rounded-full bg-indigo-100 p-3 dark:bg-indigo-900">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-indigo-600 dark:text-indigo-400"
                  >
                    <path d="M14 4v10.54a4 4 0 1 1-4-4h4"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Beautiful UI</h3>
                <p className="text-sm text-gray-500 text-center dark:text-gray-400">
                  Enjoy a clean, intuitive interface built with Shadcn UI components and TailwindCSS.  
                </p>
              </motion.div>
              <motion.div 
                className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <div className="rounded-full bg-cyan-100 p-3 dark:bg-cyan-900">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-cyan-600 dark:text-cyan-400"
                  >
                    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-5 0v-15A2.5 2.5 0 0 1 9.5 2Z"></path>
                    <path d="M14.5 8A2.5 2.5 0 0 1 17 10.5v9a2.5 2.5 0 0 1-5 0v-9A2.5 2.5 0 0 1 14.5 8Z"></path>
                    <path d="M19.5 14a2.5 2.5 0 0 1 2.5 2.5v3a2.5 2.5 0 0 1-5 0v-3a2.5 2.5 0 0 1 2.5-2.5Z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold">AI Summarization</h3>
                <p className="text-sm text-gray-500 text-center dark:text-gray-400">
                  Generate concise summaries of your notes using advanced AI technology.  
                </p>
              </motion.div>
              <motion.div 
                className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="rounded-full bg-indigo-100 p-3 dark:bg-indigo-900">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-indigo-600 dark:text-indigo-400"
                  >
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                    <path d="m9 12 2 2 4-4"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Secure Authentication</h3>
                <p className="text-sm text-gray-500 text-center dark:text-gray-400">
                  Sign in with email/password or Google authentication powered by Supabase.  
                </p>
              </motion.div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Ready to Get Started?</h2>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Join NoteGenius today and transform the way you take notes.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/auth">
                  <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white">
                    Sign Up for Free
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2025 NoteGenius. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
