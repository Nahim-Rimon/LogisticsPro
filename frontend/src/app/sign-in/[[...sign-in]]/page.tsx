import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <SignIn 
        appearance={{
          elements: {
            formButtonPrimary: 'bg-accent hover:bg-accent-hover text-sm normal-case',
            card: 'shadow-none border border-border rounded-2xl',
          }
        }}
        signUpUrl="/sign-up" 
      />
    </div>
  );
}
