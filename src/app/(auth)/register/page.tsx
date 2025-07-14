"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Prevent static generation to avoid pre-render issues with client components
// ...existing code...
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Eye, EyeOff, ArrowLeft, Mail, Lock, User, AlertCircle, CheckCircle, Loader2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordRequirement {
	label: string;
	test: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
	{ label: "At least 6 characters", test: (pwd) => pwd.length >= 6 },
	{ label: "Contains a number", test: (pwd) => /\d/.test(pwd) },
	{ label: "Contains uppercase letter", test: (pwd) => /[A-Z]/.test(pwd) },
	{ label: "Contains lowercase letter", test: (pwd) => /[a-z]/.test(pwd) }
];

export default function RegisterPage() {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
		acceptTerms: false,
		receiveUpdates: true
	});

	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

	const router = useRouter();

	const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
		setFormData((prev) => ({ ...prev, [field]: value }));

		// Clear errors when user starts typing
		if (error) setError("");
		if (fieldErrors[field]) {
			setFieldErrors((prev) => ({ ...prev, [field]: "" }));
		}
	};

	// Real-time validation
	const validateField = (field: string, value: string) => {
		switch (field) {
			case "name":
				return value.trim().length < 2 ? "Name must be at least 2 characters" : "";
			case "email":
				return !value.includes("@") ? "Please enter a valid email address" : "";
			case "password":
				return value.length < 6 ? "Password must be at least 6 characters" : "";
			case "confirmPassword":
				return value !== formData.password ? "Passwords do not match" : "";
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

	const getPasswordStrength = () => {
		const requirements = passwordRequirements.map((req) => req.test(formData.password));
		const score = requirements.filter(Boolean).length;
		return {
			score,
			percentage: (score / passwordRequirements.length) * 100,
			label: score === 0 ? "Weak" : score <= 2 ? "Fair" : score === 3 ? "Good" : "Strong",
			color: score === 0 ? "bg-red-500" : score <= 2 ? "bg-yellow-500" : score === 3 ? "bg-blue-500" : "bg-green-500"
		};
	};

	const validateForm = () => {
		const errors: Record<string, string> = {};

		if (!formData.name.trim()) errors.name = "Name is required";
		else if (formData.name.trim().length < 2) errors.name = "Name must be at least 2 characters";

		if (!formData.email.trim()) errors.email = "Email is required";
		else if (!formData.email.includes("@")) errors.email = "Please enter a valid email address";

		if (!formData.password) errors.password = "Password is required";
		else if (formData.password.length < 6) errors.password = "Password must be at least 6 characters";

		if (!formData.confirmPassword) errors.confirmPassword = "Please confirm your password";
		else if (formData.password !== formData.confirmPassword) errors.confirmPassword = "Passwords do not match";

		if (!formData.acceptTerms) errors.acceptTerms = "You must accept the terms and conditions";

		setFieldErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) return;

		setLoading(true);
		setError("");

		try {
			const response = await fetch("/api/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: formData.name,
					email: formData.email,
					password: formData.password
				})
			});

			const data = await response.json();

			if (response.ok) {
				// Registration successful
				router.push("/auth/login?message=Registration successful");
			} else {
				setError(data.error || "Registration failed. Please try again.");
			}
		} catch (error) {
			console.error("Registration error:", error);
			setError("An unexpected error occurred. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const passwordStrength = getPasswordStrength();

	return (
		<div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
			{/* Background decoration */}
			<div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]"></div>

			<div className="relative flex min-h-screen">
				{/* Left side - Hero/Features */}
				<div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-12 xl:px-16 bg-gradient-to-br from-green-600 to-blue-700 text-white">
					<div className="space-y-8">
						<div className="space-y-4">
							<h2 className="text-4xl font-bold">Start your financial journey</h2>
							<p className="text-xl text-green-100">
								Join thousands of users who have taken control of their spending with our beautiful, intuitive expense tracker.
							</p>
						</div>

						<div className="space-y-6">
							<div className="flex items-start space-x-4">
								<div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
									<CheckCircle className="h-5 w-5" />
								</div>
								<div>
									<h3 className="font-semibold">Free Forever</h3>
									<p className="text-green-100">No hidden fees, no premium tiers. All features included.</p>
								</div>
							</div>

							<div className="flex items-start space-x-4">
								<div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
									<CheckCircle className="h-5 w-5" />
								</div>
								<div>
									<h3 className="font-semibold">Beautiful Analytics</h3>
									<p className="text-green-100">Visualize your spending with charts and insights</p>
								</div>
							</div>

							<div className="flex items-start space-x-4">
								<div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
									<CheckCircle className="h-5 w-5" />
								</div>
								<div>
									<h3 className="font-semibold">2-Minute Setup</h3>
									<p className="text-green-100">Get started immediately with our quick setup process</p>
								</div>
							</div>
						</div>

						{/* Testimonial */}
						<div className="relative">
							<div className="absolute -inset-4 bg-gradient-to-r from-green-400 to-blue-400 rounded-lg blur opacity-20"></div>
							<div className="relative bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6">
								<div className="space-y-4">
									<div className="flex space-x-1">
										{[...Array(5)].map((_, i) => (
											<CheckCircle key={i} className="h-5 w-5 text-yellow-400" />
										))}
									</div>
									<p className="text-green-100">
										&quot;ExpenseTracker helped me save $500 in my first month by showing exactly where my money was going.&quot;
									</p>
									<div className="font-semibold">Sarah M.</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Right side - Form */}
				<div className="flex-1 flex items-center justify-center p-8">
					<div className="w-full max-w-md space-y-8">
						{/* Back to home link */}
						<Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to home
						</Link>

						{/* Header */}
						<div className="text-center space-y-2">
							<div className="flex justify-center">
								<div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
									<span className="text-2xl">💰</span>
								</div>
							</div>
							<h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
							<p className="text-muted-foreground">Start tracking your expenses and take control of your finances</p>
						</div>

						{/* Error Message */}
						{error && (
							<Alert variant="destructive">
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}

						{/* Registration Form */}
						<Card className="border-0 shadow-lg">
							<CardHeader className="space-y-1 pb-4">
								<CardTitle className="text-xl">Sign up</CardTitle>
								<CardDescription>Enter your information to create your account</CardDescription>
							</CardHeader>
							<CardContent>
								<form onSubmit={handleSubmit} className="space-y-4">
									{/* Name Field */}
									<div className="space-y-2">
										<Label htmlFor="name">Full name</Label>
										<div className="relative">
											<User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
											<Input
												id="name"
												type="text"
												placeholder="Enter your full name"
												value={formData.name}
												onChange={(e) => handleInputChange("name", e.target.value)}
												onBlur={(e) => handleFieldBlur("name", e.target.value)}
												className={cn("pl-10", fieldErrors.name && "border-red-500")}
												disabled={loading}
											/>
										</div>
										{fieldErrors.name && (
											<p className="text-sm text-red-500 flex items-center gap-1">
												<X className="h-3 w-3" />
												{fieldErrors.name}
											</p>
										)}
									</div>

									{/* Email Field */}
									<div className="space-y-2">
										<Label htmlFor="email">Email address</Label>
										<div className="relative">
											<Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
											<Input
												id="email"
												type="email"
												placeholder="Enter your email"
												value={formData.email}
												onChange={(e) => handleInputChange("email", e.target.value)}
												onBlur={(e) => handleFieldBlur("email", e.target.value)}
												className={cn("pl-10", fieldErrors.email && "border-red-500")}
												disabled={loading}
											/>
										</div>
										{fieldErrors.email && (
											<p className="text-sm text-red-500 flex items-center gap-1">
												<X className="h-3 w-3" />
												{fieldErrors.email}
											</p>
										)}
									</div>

									{/* Password Field */}
									<div className="space-y-2">
										<Label htmlFor="password">Password</Label>
										<div className="relative">
											<Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
											<Input
												id="password"
												type={showPassword ? "text" : "password"}
												placeholder="Create a password"
												value={formData.password}
												onChange={(e) => handleInputChange("password", e.target.value)}
												onBlur={(e) => handleFieldBlur("password", e.target.value)}
												className={cn("pl-10 pr-10", fieldErrors.password && "border-red-500")}
												disabled={loading}
											/>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
												onClick={() => setShowPassword(!showPassword)}
												disabled={loading}
											>
												{showPassword ? (
													<EyeOff className="h-4 w-4 text-muted-foreground" />
												) : (
													<Eye className="h-4 w-4 text-muted-foreground" />
												)}
											</Button>
										</div>

										{/* Password Strength Indicator */}
										{formData.password && (
											<div className="space-y-2">
												<div className="flex items-center gap-2">
													<Progress value={passwordStrength.percentage} className="flex-1 h-2" />
													<span className="text-sm font-medium">{passwordStrength.label}</span>
												</div>
												<div className="space-y-1">
													{passwordRequirements.map((req, index) => {
														const isMet = req.test(formData.password);
														return (
															<div key={index} className="flex items-center gap-2 text-xs">
																{isMet ? (
																	<Check className="h-3 w-3 text-green-500" />
																) : (
																	<X className="h-3 w-3 text-gray-400" />
																)}
																<span className={isMet ? "text-green-600" : "text-gray-500"}>{req.label}</span>
															</div>
														);
													})}
												</div>
											</div>
										)}

										{fieldErrors.password && (
											<p className="text-sm text-red-500 flex items-center gap-1">
												<X className="h-3 w-3" />
												{fieldErrors.password}
											</p>
										)}
									</div>

									{/* Confirm Password Field */}
									<div className="space-y-2">
										<Label htmlFor="confirmPassword">Confirm password</Label>
										<div className="relative">
											<Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
											<Input
												id="confirmPassword"
												type={showConfirmPassword ? "text" : "password"}
												placeholder="Confirm your password"
												value={formData.confirmPassword}
												onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
												onBlur={(e) => handleFieldBlur("confirmPassword", e.target.value)}
												className={cn("pl-10 pr-10", fieldErrors.confirmPassword && "border-red-500")}
												disabled={loading}
											/>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
												onClick={() => setShowConfirmPassword(!showConfirmPassword)}
												disabled={loading}
											>
												{showConfirmPassword ? (
													<EyeOff className="h-4 w-4 text-muted-foreground" />
												) : (
													<Eye className="h-4 w-4 text-muted-foreground" />
												)}
											</Button>
										</div>
										{fieldErrors.confirmPassword && (
											<p className="text-sm text-red-500 flex items-center gap-1">
												<X className="h-3 w-3" />
												{fieldErrors.confirmPassword}
											</p>
										)}
									</div>

									{/* Terms and Updates */}
									<div className="space-y-3">
										<div className="flex items-start space-x-2">
											<Checkbox
												id="acceptTerms"
												checked={formData.acceptTerms}
												onCheckedChange={(checked) => handleInputChange("acceptTerms", checked === true)}
												disabled={loading}
												className={fieldErrors.acceptTerms ? "border-red-500" : ""}
											/>
											<Label htmlFor="acceptTerms" className="text-sm leading-relaxed cursor-pointer">
												I agree to the{" "}
												<Link href="/terms" className="text-blue-600 hover:text-blue-500">
													Terms of Service
												</Link>{" "}
												and{" "}
												<Link href="/privacy" className="text-blue-600 hover:text-blue-500">
													Privacy Policy
												</Link>
											</Label>
										</div>
										{fieldErrors.acceptTerms && (
											<p className="text-sm text-red-500 flex items-center gap-1 ml-6">
												<X className="h-3 w-3" />
												{fieldErrors.acceptTerms}
											</p>
										)}

										<div className="flex items-start space-x-2">
											<Checkbox
												id="receiveUpdates"
												checked={formData.receiveUpdates}
												onCheckedChange={(checked) => handleInputChange("receiveUpdates", checked === true)}
												disabled={loading}
											/>
											<Label htmlFor="receiveUpdates" className="text-sm leading-relaxed cursor-pointer text-muted-foreground">
												Send me product updates and tips via email (optional)
											</Label>
										</div>
									</div>

									{/* Submit Button */}
									<Button type="submit" className="w-full" size="lg" disabled={loading}>
										{loading ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Creating account...
											</>
										) : (
											"Create account"
										)}
									</Button>

									{/* Divider */}
									<div className="relative">
										<div className="absolute inset-0 flex items-center">
											<span className="w-full border-t" />
										</div>
										<div className="relative flex justify-center text-xs uppercase">
											<span className="bg-background px-2 text-muted-foreground">Or sign up with</span>
										</div>
									</div>

									{/* Social Login Buttons (Placeholder) */}
									<div className="grid grid-cols-2 gap-4">
										<Button variant="outline" disabled>
											<svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
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
										<Button variant="outline" disabled>
											<svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
												<path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
											</svg>
											Twitter
										</Button>
									</div>
								</form>
							</CardContent>
						</Card>

						{/* Sign in link */}
						<div className="text-center">
							<p className="text-sm text-muted-foreground">
								Already have an account?{" "}
								<Link href="/auth/login" className="font-medium text-green-600 hover:text-green-500 transition-colors">
									Sign in
								</Link>
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
