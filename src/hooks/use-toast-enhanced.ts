import { toast as sonnerToast } from "sonner";

interface ToastOptions {
	title?: string;
	description?: string;
	duration?: number;
}

export const toast = {
	success: ({ title = "Success", description, duration = 4000 }: ToastOptions) => {
		return sonnerToast.success(title, {
			description,
			duration,
		});
	},

	error: ({ title = "Error", description, duration = 6000 }: ToastOptions) => {
		return sonnerToast.error(title, {
			description,
			duration,
		});
	},

	warning: ({ title = "Warning", description, duration = 5000 }: ToastOptions) => {
		return sonnerToast.warning(title, {
			description,
			duration,
		});
	},

	info: ({ title = "Info", description, duration = 4000 }: ToastOptions) => {
		return sonnerToast.info(title, {
			description,
			duration,
		});
	},

	loading: ({ title = "Loading...", description }: Omit<ToastOptions, "duration">) => {
		return sonnerToast.loading(title, {
			description,
		});
	},

	promise: async <T>(
		promise: Promise<T>,
		{
			loading = "Loading...",
			success = "Success!",
			error = "Something went wrong"
		}: {
			loading?: string;
			success?: string | ((data: T) => string);
			error?: string | ((error: unknown) => string);
		}
	) => {
		return sonnerToast.promise(promise, {
			loading,
			success: (data: T) => typeof success === "function" ? success(data) : success,
			error: (err: unknown) => typeof error === "function" ? error(err) : error,
		});
	}
};
