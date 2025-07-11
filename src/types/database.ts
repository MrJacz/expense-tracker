export interface User {
	id: number;
	name: string;
	email: string;
	emailVerified: number;
	image?: string;
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
	amount: string;
	description: string;
	date: Date;
	time: string;
	notes: string;
	created_at: Date;
	updated_at: Date;
}
