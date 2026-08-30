import { SignupForm } from "./signup-form";

export const metadata = { title: "Sign up — Resume to Portfolio" };

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/20 p-6">
      <SignupForm />
    </div>
  );
}
