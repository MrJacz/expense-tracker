// User Settings Types

export interface UserSettings {
	id: number;
	user_id: number;
	
	// Core preferences
	currency: string;
	timezone: string;
	theme: 'light' | 'dark' | 'system';
	language: string;
	
	// Notification preferences
	email_notifications: boolean;
	push_notifications: boolean;
	weekly_reports: boolean;
	budget_alerts: boolean;
	
	// App preferences
	default_category_id?: number;
	expense_reminder_enabled: boolean;
	expense_reminder_time: string;
	
	// Flexible settings
	advanced_settings: Record<string, unknown>;
	
	created_at: string;
	updated_at: string;
}

export interface UserBankIntegration {
	id: number;
	user_id: number;
	bank_provider: string;
	bank_name?: string;
	
	// Credentials (handled server-side only)
	access_token_encrypted?: string;
	refresh_token_encrypted?: string;
	
	// Status
	is_active: boolean;
	is_verified: boolean;
	last_sync_at?: string;
	last_sync_status: 'success' | 'error' | 'pending';
	last_error_message?: string;
	
	// Import settings
	auto_import: boolean;
	import_frequency: 'realtime' | 'hourly' | 'daily' | 'manual';
	
	// Bank-specific settings
	bank_settings: Record<string, unknown>;
	
	created_at: string;
	updated_at: string;
}

export interface ImportedTransaction {
	id: number;
	user_id: number;
	bank_integration_id: number;
	
	// Bank transaction details
	external_transaction_id: string;
	external_account_id?: string;
	expense_id?: number;
	
	// Transaction data
	amount: number;
	description?: string;
	merchant_name?: string;
	transaction_date: string;
	
	// Processing status
	import_status: 'pending' | 'imported' | 'ignored' | 'error';
	auto_categorized: boolean;
	category_confidence?: number;
	
	// Raw data
	raw_transaction_data?: Record<string, unknown>;
	
	created_at: string;
	updated_at: string;
}

export interface SettingCategory {
	id: number;
	name: string;
	display_name: string;
	description?: string;
	icon?: string;
	sort_order: number;
	is_active: boolean;
}

export interface SettingDefinition {
	id: number;
	category_id?: number;
	key: string;
	display_name: string;
	description?: string;
	data_type: 'string' | 'number' | 'boolean' | 'json' | 'select';
	default_value?: string;
	validation_rules: Record<string, unknown>;
	is_required: boolean;
	is_user_configurable: boolean;
	sort_order: number;
	is_active: boolean;
}

// API Types
export interface CreateBankIntegrationRequest {
	bank_provider: string;
	bank_name: string;
	access_token: string;
	auto_import?: boolean;
	import_frequency?: string;
}

export interface UpdateUserSettingsRequest {
	currency?: string;
	timezone?: string;
	theme?: 'light' | 'dark' | 'system';
	language?: string;
	email_notifications?: boolean;
	push_notifications?: boolean;
	weekly_reports?: boolean;
	budget_alerts?: boolean;
	default_category_id?: number;
	expense_reminder_enabled?: boolean;
	expense_reminder_time?: string;
	advanced_settings?: Record<string, unknown>;
}

export interface UpdateBankIntegrationRequest {
	is_active?: boolean;
	auto_import?: boolean;
	import_frequency?: 'realtime' | 'hourly' | 'daily' | 'manual';
	bank_settings?: Record<string, unknown>;
}

// UP Bank specific types
export interface UPBankAccount {
	type: 'accounts';
	id: string;
	attributes: {
		displayName: string;
		accountType: 'SAVER' | 'TRANSACTIONAL';
		balance: {
			currencyCode: string;
			value: string;
			valueInBaseUnits: number;
		};
		createdAt: string;
	};
}

export interface UPBankTransaction {
	type: 'transactions';
	id: string;
	attributes: {
		status: 'HELD' | 'SETTLED';
		rawText: string;
		description: string;
		message?: string;
		holdInfo?: {
			amount: {
				currencyCode: string;
				value: string;
				valueInBaseUnits: number;
			};
			foreignAmount?: {
				currencyCode: string;
				value: string;
				valueInBaseUnits: number;
			};
		};
		roundUp?: {
			amount: {
				currencyCode: string;
				value: string;
				valueInBaseUnits: number;
			};
			boostPortion?: {
				currencyCode: string;
				value: string;
				valueInBaseUnits: number;
			};
		};
		cashback?: {
			amount: {
				currencyCode: string;
				value: string;
				valueInBaseUnits: number;
			};
			description: string;
		};
		amount: {
			currencyCode: string;
			value: string;
			valueInBaseUnits: number;
		};
		foreignAmount?: {
			currencyCode: string;
			value: string;
			valueInBaseUnits: number;
		};
		settledAt?: string;
		createdAt: string;
	};
	relationships: {
		account: {
			data: {
				type: 'accounts';
				id: string;
			};
		};
		category?: {
			data: {
				type: 'categories';
				id: string;
			};
		};
		parentCategory?: {
			data: {
				type: 'categories';
				id: string;
			};
		};
	};
}

export interface UPBankCategory {
	type: 'categories';
	id: string;
	attributes: {
		name: string;
	};
	relationships: {
		parent?: {
			data: {
				type: 'categories';
				id: string;
			};
		};
		children?: {
			data: Array<{
				type: 'categories';
				id: string;
			}>;
		};
	};
}