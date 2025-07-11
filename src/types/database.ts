export interface User {
	id: number;
	email: string;
	password: string;
	name: string;
	email_verified: boolean;
	email_verification_token?: string;
	email_verification_expires?: Date;
	created_at: Date;
	updated_at: Date;
}

export interface Category {
	id: number;
	name: string;
	color: string;
	icon: string;
	is_default: boolean;
	user_id?: number;
	created_at: Date;
}

export interface Expense {
	id: number;
	user_id: number;
	category_id: number;
	amount: number;
	description: string;
	date: string; // YYYY-MM-DD format
	time: string; // HH:MM:SS format
	notes?: string;
	created_at: Date;
	updated_at: Date;
	// When joined with category
	category?: Category;
}
