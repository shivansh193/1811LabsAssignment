"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignInForm } from "@/components/auth/sign-in-form";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { Card, CardContent } from "@/components/ui/card";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

// Create a client component that uses useSearchParams
function AuthContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="relative h-20 w-20 overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 p-2">
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 4v10.54a4 4 0 1 1-4-4h4" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            NoteGenius
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your AI-powered notes application
          </p>
        </div>

        <Card className="border-none shadow-lg">
          <CardContent className="pt-6">
            <Tabs defaultValue={tab === 'signup' ? 'signup' : 'signin'} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="signin">
                <SignInForm redirectTo={redirectTo} />
              </TabsContent>
              <TabsContent value="signup">
                <SignUpForm redirectTo={redirectTo} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function AuthPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <AuthContent />
    </Suspense>
  );
}

