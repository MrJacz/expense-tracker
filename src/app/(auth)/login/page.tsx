"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, ArrowLeft, Mail, Lock, AlertCircle, CheckCircle, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
		rememberMe: false
	});
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState("");
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

	const router = useRouter();
	const searchParams = useSearchParams();

	// Check for success messages from registration
	useEffect(() => {
		const message = searchParams.get("message");
		if (message === "Registration successful") {
			setSuccess("Account created successfully! Please sign in.");
		}
	}, [searchParams]);

	const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		if (error) setError(""); // Clear errors when user starts typing
		if (fieldErrors[field]) {
			setFieldErrors((prev) => ({ ...prev, [field]: "" }));
		}
	};

	const validateField = (field: string, value: string) => {
		switch (field) {
			case "email":
				if (!value.trim()) return "Email is required";
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				return !emailRegex.test(value.trim()) ? "Please enter a valid email address" : "";
			case "password":
				if (!value) return "Password is required";
				return value.length < 6 ? "Password must be at least 6 characters" : "";
			default:
				return "";
		}
	};

	const handleFieldBlur = (field: string, value: string) => {
		const error = validateField(field, value);
		if (error) {
			setFieldErrors((prev) => ({ ...prev, [field]: error }));
		}
	};

	const validateForm = () => {
		if (!formData.email.trim()) {
			setError("Email is required");
			return false;
		}
		
		// More robust email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(formData.email.trim())) {
			setError("Please enter a valid email address");
			return false;
		}
		
		if (!formData.password) {
			setError("Password is required");
			return false;
		}
		if (formData.password.length < 6) {
			setError("Password must be at least 6 characters");
			return false;
		}
		return true;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) return;

		setLoading(true);
		setError("");

		try {
			const result = await signIn("credentials", {
				email: formData.email,
				password: formData.password,
				redirect: false
			});

			if (result?.error) {
				setError("Invalid email or password. Please try again.");
			} else {
				// Successful login
				setSuccess("Login successful! Redirecting...");
				setTimeout(() => {
					router.push("/dashboard");
				}, 1000);
			}
		} catch (error) {
			console.error("Login error:", error);
			setError("An unexpected error occurred. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
			{/* Background decoration */}
			<div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]"></div>

			<div className="relative flex min-h-screen">
				{/* Left side - Form */}
				<div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12">
					<div className="w-full max-w-md lg:max-w-lg xl:max-w-xl space-y-6">
						{/* Back to home link */}
						<Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to home
						</Link>

						{/* Header */}
						<div className="text-center space-y-3">
							<div className="flex justify-center">
								<div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
									<span className="text-2xl">💰</span>
								</div>
							</div>
							<div className="space-y-2">
								<h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Welcome back</h1>
								<p className="text-muted-foreground text-sm">Sign in to your account to continue tracking your expenses</p>
							</div>
						</div>

						{/* Success Message */}
						{success && (
							<Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
								<CheckCircle className="h-4 w-4" />
								<AlertDescription>{success}</AlertDescription>
							</Alert>
						)}

						{/* Error Message */}
						{error && (
							<Alert variant="destructive">
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}

						{/* Login Form */}
						<Card className="border border-gray-200 dark:border-gray-800 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
							<CardHeader className="space-y-2 pb-8 px-6 lg:px-8 pt-8">
								<CardTitle className="text-2xl lg:text-3xl font-semibold text-center">Sign in</CardTitle>
								<CardDescription className="text-center text-muted-foreground text-base">
									Enter your email and password to access your account
								</CardDescription>
							</CardHeader>
							<CardContent className="pb-8 px-6 lg:px-8">
								<form onSubmit={handleSubmit} className="space-y-6">
									{/* Email Field */}
									<div className="space-y-3">
										<Label htmlFor="email" className="text-sm font-medium">Email address</Label>
										<div className="relative">
											<Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
											<Input
												id="email"
												type="email"
												placeholder="Enter your email"
												value={formData.email}
												onChange={(e) => handleInputChange("email", e.target.value)}
												onBlur={(e) => handleFieldBlur("email", e.target.value)}
												className={cn(
													"pl-12 h-12 lg:h-14 text-base transition-colors", 
													fieldErrors.email && "border-red-500 focus:border-red-500"
												)}
												disabled={loading}
											/>
										</div>
										{fieldErrors.email && (
											<p className="text-sm text-red-500 flex items-center gap-1 mt-1">
												<X className="h-3 w-3" />
												{fieldErrors.email}
											</p>
										)}
									</div>

									{/* Password Field */}
									<div className="space-y-3">
										<Label htmlFor="password" className="text-sm font-medium">Password</Label>
										<div className="relative">
											<Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
											<Input
												id="password"
												type={showPassword ? "text" : "password"}
												placeholder="Enter your password"
												value={formData.password}
												onChange={(e) => handleInputChange("password", e.target.value)}
												onBlur={(e) => handleFieldBlur("password", e.target.value)}
												className={cn(
													"pl-12 pr-12 h-12 lg:h-14 text-base transition-colors", 
													fieldErrors.password && "border-red-500 focus:border-red-500"
												)}
												disabled={loading}
											/>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="absolute right-0 top-0 h-12 lg:h-14 px-4 hover:bg-transparent"
												onClick={() => setShowPassword(!showPassword)}
												disabled={loading}
											>
												{showPassword ? (
													<EyeOff className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
												) : (
													<Eye className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
												)}
											</Button>
										</div>
										{fieldErrors.password && (
											<p className="text-sm text-red-500 flex items-center gap-1 mt-1">
												<X className="h-3 w-3" />
												{fieldErrors.password}
											</p>
										)}
									</div>

									{/* Remember Me & Forgot Password */}
									<div className="flex items-center justify-between pt-1">
										<div className="flex items-center space-x-2">
											<Checkbox
												id="rememberMe"
												checked={formData.rememberMe}
												onCheckedChange={(checked) => handleInputChange("rememberMe", checked === true)}
												disabled={loading}
											/>
											<Label htmlFor="rememberMe" className="text-sm font-normal cursor-pointer text-muted-foreground">
												Remember me
											</Label>
										</div>
										<Link href="#" className="text-sm text-blue-600 hover:text-blue-500 transition-colors font-medium">
											Forgot password?
										</Link>
									</div>

									{/* Submit Button */}
									<Button 
										type="submit" 
										className="w-full h-12 lg:h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-medium text-base lg:text-lg" 
										disabled={loading}
									>
										{loading ? (
											<>
												<Loader2 className="mr-2 h-5 w-5 animate-spin" />
												Signing in...
											</>
										) : (
											"Sign in"
										)}
									</Button>

									{/* Divider */}
									<div className="relative my-6">
										<div className="absolute inset-0 flex items-center">
											<span className="w-full border-t border-gray-300 dark:border-gray-600" />
										</div>
										<div className="relative flex justify-center text-xs uppercase">
											<span className="bg-white dark:bg-gray-900 px-3 text-muted-foreground font-medium">Or continue with</span>
										</div>
									</div>

									{/* Social Login Buttons (Placeholder) */}
									<div className="grid grid-cols-2 gap-4">
										<Button variant="outline" disabled className="h-12 lg:h-14 border-gray-300 dark:border-gray-600 text-base">
											<svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
												<path
													d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
													fill="#4285F4"
												/>
												<path
													d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
													fill="#34A853"
												/>
												<path
													d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
													fill="#FBBC05"
												/>
												<path
													d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
													fill="#EA4335"
												/>
											</svg>
											Google
										</Button>
										<Button variant="outline" disabled className="h-12 lg:h-14 border-gray-300 dark:border-gray-600 text-base">
											<svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
												<path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
											</svg>
											Twitter
										</Button>
									</div>
								</form>
							</CardContent>
						</Card>

						{/* Sign up link */}
						<div className="text-center space-y-4">
							<p className="text-sm text-muted-foreground">
								Don&apos;t have an account?{" "}
								<Link href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
									Sign up for free
								</Link>
							</p>
							<p className="text-xs text-muted-foreground">
								By signing in, you agree to our{" "}
								<Link href="/terms" className="underline hover:no-underline">Terms</Link> and{" "}
								<Link href="/privacy" className="underline hover:no-underline">Privacy Policy</Link>
							</p>
						</div>
					</div>
				</div>

				{/* Right side - Hero/Features */}
				<div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-12 xl:px-16 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white relative overflow-hidden">
					{/* Background decoration */}
					<div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20"></div>
					<div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
					<div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>
					
					<div className="relative space-y-10">
						<div className="space-y-6">
							<h2 className="text-4xl font-bold leading-tight">Welcome back to ExpenseTracker</h2>
							<p className="text-xl text-blue-100 leading-relaxed">
								Continue your journey to financial clarity with beautiful analytics and smart insights.
							</p>
						</div>

						<div className="space-y-8">
							<div className="flex items-start space-x-4">
								<div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 border border-white/20">
									<CheckCircle className="h-5 w-5" />
								</div>
								<div>
									<h3 className="font-semibold text-lg">Smart Analytics</h3>
									<p className="text-blue-100/90 leading-relaxed">Visualize spending patterns with beautiful charts and insights</p>
								</div>
							</div>

							<div className="flex items-start space-x-4">
								<div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 border border-white/20">
									<CheckCircle className="h-5 w-5" />
								</div>
								<div>
									<h3 className="font-semibold text-lg">Budget Management</h3>
									<p className="text-blue-100/90 leading-relaxed">Set goals and track progress automatically</p>
								</div>
							</div>

							<div className="flex items-start space-x-4">
								<div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 border border-white/20">
									<CheckCircle className="h-5 w-5" />
								</div>
								<div>
									<h3 className="font-semibold text-lg">Secure & Private</h3>
									<p className="text-blue-100/90 leading-relaxed">Your financial data is encrypted and protected</p>
								</div>
							</div>
						</div>

						{/* Decorative element */}
						<div className="relative">
							<div className="absolute -inset-4 bg-gradient-to-r from-white/10 to-purple-400/20 rounded-2xl blur-xl"></div>
							<div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
								<div className="text-center space-y-3">
									<div className="text-4xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">$47,892</div>
									<div className="text-blue-100/80 text-sm font-medium">Total expenses tracked by users</div>
									<div className="text-blue-200/60 text-xs">Join thousands managing their finances</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
