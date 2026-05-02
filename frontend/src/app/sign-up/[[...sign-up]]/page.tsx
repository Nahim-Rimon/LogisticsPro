import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <SignUp 
        appearance={{
          elements: {
            formButtonPrimary: 'bg-accent hover:bg-accent-hover text-sm normal-case',
            card: 'shadow-none border border-border rounded-2xl',
          }
        }}
        signInUrl="/sign-in"
        fallbackRedirectUrl="/dashboard"
      />
    </div>
  );
}
