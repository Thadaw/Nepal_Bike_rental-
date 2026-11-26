import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/common/Logo";
import { PendingNotice } from "@/components/common/PendingNotice";
import { DEMO_PASSWORD, useAdminAuth } from "@/store/adminStore";

const loginSchema = z.object({ password: z.string().min(1, "Enter your password.") });
type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const { authed, login } = useAdminAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { password: "" },
  });

  if (authed) return <Navigate to="/admin" replace />;

  const onSubmit = handleSubmit(({ password }) => {
    if (login(password)) navigate("/admin");
    else setError("password", { type: "manual", message: "Incorrect password." });
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-charcoal p-5">
      <form onSubmit={onSubmit} noValidate className="w-full max-w-sm space-y-5 rounded-2xl bg-card p-8" aria-label="Admin login">
        <Logo />
        <h1 className="text-2xl font-extrabold">Admin sign in</h1>
        <div className="space-y-1.5">
          <Label htmlFor="pw">Password</Label>
          <Input id="pw" type="password" autoComplete="current-password" {...register("password")} aria-invalid={errors.password ? true : undefined} />
          {errors.password && <p role="alert" className="text-xs text-destructive">{errors.password.message}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>Sign in</Button>
        <PendingNotice>Demo login only. It runs in the browser and is not secure. Demo password: <strong>{DEMO_PASSWORD}</strong>. Real authentication requires the backend.</PendingNotice>
      </form>
    </div>
  );
}
