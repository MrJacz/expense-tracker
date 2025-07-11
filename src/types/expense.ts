export interface Category {
	id: string;
	name: string;
	color: string;
	icon: string;
	is_default?: boolean;
}

export interface Expense {
	id: string;
	amount: number;
	description: string;
	date: string; // YYYY-MM-DD
	time: string; // HH:MM:SS
	notes?: string;
	created_at: string;
	updated_at: string;
	category: Category;
}

export interface CreateExpenseData {
	amount: number;
	description: string;
	category_id: number;
	date: string;
	time?: string;
	notes?: string;
}

export interface UpdateExpenseData extends CreateExpenseData {
	id: number;
}
