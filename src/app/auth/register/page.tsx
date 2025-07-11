"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: ""
	});
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		if (formData.password !== formData.confirmPassword) {
			setError("Passwords do not match");
			setLoading(false);
			return;
		}

		try {
			const response = await fetch("/api/auth/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
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
				setError(data.error || "Registration failed");
			}
		} catch (error) {
			console.error("Registration error:", error);
			setError("An unexpected error occurred");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="max-w-md w-full space-y-8">
				<div>
					<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
				</div>
				<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
					{error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

					<div className="space-y-4">
						<div>
							<label htmlFor="name" className="block text-sm font-medium text-gray-700">
								Full Name
							</label>
							<input
								id="name"
								name="name"
								type="text"
								required
								className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
								value={formData.name}
								onChange={handleChange}
							/>
						</div>

						<div>
							<label htmlFor="email" className="block text-sm font-medium text-gray-700">
								Email address
							</label>
							<input
								id="email"
								name="email"
								type="email"
								autoComplete="email"
								required
								className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
								value={formData.email}
								onChange={handleChange}
							/>
						</div>

						<div>
							<label htmlFor="password" className="block text-sm font-medium text-gray-700">
								Password
							</label>
							<input
								id="password"
								name="password"
								type="password"
								required
								className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
								value={formData.password}
								onChange={handleChange}
							/>
						</div>

						<div>
							<label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
								Confirm Password
							</label>
							<input
								id="confirmPassword"
								name="confirmPassword"
								type="password"
								required
								className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
								value={formData.confirmPassword}
								onChange={handleChange}
							/>
						</div>
					</div>

					<div>
						<button
							type="submit"
							disabled={loading}
							className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
						>
							{loading ? "Creating account..." : "Sign up"}
						</button>
					</div>

					<div className="text-center">
						<p className="text-sm text-gray-600">
							Already have an account?{" "}
							<Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
								Sign in
							</Link>
						</p>
					</div>
				</form>
			</div>
		</div>
	);
}
