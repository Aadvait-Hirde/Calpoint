"use client";

import { useState, useRef } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const router = useRouter();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleDigitChange = (index: number, value: string) => {
    if (value.length === 6 && /^\d{6}$/.test(value)) {
      const chars = value.split("").slice(0, 6);
      setVerificationCode(chars);
      inputRefs.current[5]?.focus();
      return;
    }

    if (!/^[0-9]?$/.test(value)) return;
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleDigitPaste = (index: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").trim();

    if (/^\d{6}$/.test(paste)) {
      const chars = paste.split("");
      setVerificationCode(chars);
      inputRefs.current[5]?.focus();
    }
  };

  const handleOAuthSignUp = async (provider: "google" | "microsoft" | "apple") => {
    if (!isLoaded) return;

    setIsLoading(true);
    setError("");

    try {
      await signUp.authenticateWithRedirect({
        strategy: `oauth_${provider}`,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/onboarding",
      });
    } catch (err) {
      const error = err as { errors?: { message: string }[] };
      setError(error.errors?.[0]?.message || "An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await signUp.create({
        firstName,
        lastName,
        emailAddress: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/onboarding");
      } else if (result.status === "missing_requirements") {
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
        setError("");
        setPendingVerification(true);
      } else {
        setError("Sign up incomplete. Please try again.");
      }
    } catch (err: unknown) {
      const error = err as { errors?: { message: string; code: string }[] };
      const msg = error.errors?.[0]?.message;
      const code = error.errors?.[0]?.code;
      if (code === "form_identifier_exists") {
        setError("An account with this email already exists. Please sign in instead.");
      } else {
        setError(msg || "An error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode.join(""),
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/onboarding");
      } else {
        setError("The verification code is incorrect. Please check your email and try again.");
      }
    } catch (err: unknown) {
      const error = err as { errors?: { message: string; code?: string }[] };
      const errorMessage = error.errors?.[0]?.message;
      const errorCode = error.errors?.[0]?.code;

      if (errorCode === "form_code_incorrect" || errorMessage?.toLowerCase().includes("incorrect")) {
        setError("The verification code is incorrect. Please check your email and try again.");
      } else {
        setError(errorMessage || "The verification code is incorrect. Please check your email and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      {/* Dotted grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, hsl(210, 10%, 50%) 0.5px, transparent 0.5px)`,
          backgroundSize: "8px 8px",
          opacity: 0.15,
        }}
      />

      <div className="relative z-10 w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-light tracking-tight text-foreground font-instrument-serif">
            Calpoint
          </h1>
          <h2 className="text-2xl font-light tracking-tight text-foreground">
            {pendingVerification ? "Verify Your Email" : "Create Account"}
          </h2>
          <div className="text-muted-foreground tracking-tight">
            {pendingVerification ? (
              <div className="space-y-1">
                <p>{`We sent a verification code to ${email}`}</p>
                <p className="text-sm">Please check your spam folder too</p>
              </div>
            ) : (
              <p>Start your fitness journey today</p>
            )}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200">
            {error}
          </div>
        )}

        {/* Clerk's CAPTCHA widget - must be outside conditional render */}
        <div id="clerk-captcha" />

        {/* Sign up form */}
        <Card className="shadow-xl border">
          <CardContent className="pt-6">
            {!pendingVerification ? (
              <>
                {/* OAuth Providers */}
                <div className="flex gap-3 mb-6">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 justify-center p-0 aspect-square"
                    onClick={() => handleOAuthSignUp("google")}
                    disabled={isLoading || !isLoaded}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 justify-center p-0 aspect-square"
                    onClick={() => handleOAuthSignUp("microsoft")}
                    disabled={isLoading || !isLoaded}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 23 23">
                      <path fill="#f25022" d="M0 0h11v11H0z" />
                      <path fill="#00a4ef" d="M12 0h11v11H12z" />
                      <path fill="#7fba00" d="M0 12h11v11H0z" />
                      <path fill="#ffb900" d="M12 12h11v11H12z" />
                    </svg>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 justify-center p-0 aspect-square"
                    onClick={() => handleOAuthSignUp("apple")}
                    disabled={isLoading || !isLoaded}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                    </svg>
                  </Button>
                </div>

                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or continue with email
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                    <Input
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <Button type="submit" disabled={isLoading || !isLoaded} className="w-full">
                    {isLoading ? "Creating..." : "Create Account"}
                  </Button>
                </form>
              </>
            ) : (
              <form onSubmit={handleVerification} className="space-y-6">
                <label className="text-sm font-medium block text-foreground">
                  Enter the 6-digit code
                </label>
                <div className="flex justify-between gap-2">
                  {verificationCode.map((val, i) => (
                    <Input
                      key={i}
                      ref={(el) => {
                        inputRefs.current[i] = el;
                      }}
                      type="text"
                      maxLength={6}
                      value={val}
                      onChange={(e) => handleDigitChange(i, e.target.value)}
                      onKeyDown={(e) => handleDigitKeyDown(i, e)}
                      onPaste={(e) => handleDigitPaste(i, e)}
                      className="flex-1 h-14 text-center text-xl font-semibold"
                    />
                  ))}
                </div>
                <Button
                  type="submit"
                  disabled={isLoading || verificationCode.join("").length !== 6 || !isLoaded}
                  className="w-full"
                >
                  {isLoading ? "Verifying..." : "Verify Email"}
                </Button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setPendingVerification(false)}
                    className="text-sm text-muted-foreground hover:underline"
                  >
                    ← Back to sign up
                  </button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Sign in link */}
        {!pendingVerification && (
          <div className="text-center text-muted-foreground">
            Already have an account?{" "}
            <Link href="/sign-in" className="font-medium hover:underline text-foreground">
              Sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
