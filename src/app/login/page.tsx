import { LoginForm } from "./login-form";

export const metadata = { title: "Log in — Resume to Portfolio" };

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/20 p-6">
      <LoginForm />
    </div>
  );
}
