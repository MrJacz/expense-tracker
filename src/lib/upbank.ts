// UP Bank API Service
import { mapUpBankCategory } from "@/lib/upbank-category-map";
import {
	TransactionResource,
	UpBankAccountsResponse,
	UpBankTransactionsResponse,
	UpBankCategoriesResponse,
	UpBankTransactionResponse,
	UpBankPingResponse
} from "@/types/upbank";

export class UPBankAPI {
	private accessToken: string;
	private baseURL = "https://api.up.com.au/api/v1";

	constructor(accessToken: string) {
		this.accessToken = accessToken;
	}

	private async makeRequest<T>(endpoint: string): Promise<T> {
		const response = await fetch(`${this.baseURL}${endpoint}`, {
			headers: {
				Authorization: `Bearer ${this.accessToken}`,
				"Content-Type": "application/json"
			}
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(`UP Bank API error (${response.status}): ${errorData.errors?.[0]?.detail || response.statusText}`);
		}

		return response.json();
	}

	// Test the connection
	async ping(): Promise<UpBankPingResponse> {
		return this.makeRequest("/util/ping");
	}

	// Get accounts
	async getAccounts(): Promise<UpBankAccountsResponse> {
		return this.makeRequest("/accounts");
	}

	// Get transactions with pagination
	async getTransactions(
		options: {
			accountId?: string;
			since?: string;
			until?: string;
			pageSize?: number;
			pageAfter?: string;
		} = {}
	): Promise<UpBankTransactionsResponse> {
		const params = new URLSearchParams();

		if (options.accountId) {
			params.append("filter[account]", options.accountId);
		}
		if (options.since) {
			params.append("filter[since]", options.since);
		}
		if (options.until) {
			params.append("filter[until]", options.until);
		}
		if (options.pageSize) {
			params.append("page[size]", options.pageSize.toString());
		}
		if (options.pageAfter) {
			params.append("page[after]", options.pageAfter);
		}

		const queryString = params.toString();
		const endpoint = `/transactions${queryString ? `?${queryString}` : ""}`;

		return this.makeRequest(endpoint);
	}

	// Get all transactions since a date (handles pagination automatically)
	async getAllTransactionsSince(since?: string, accountId?: string): Promise<TransactionResource[]> {
		const allTransactions: TransactionResource[] = [];
		let nextPageAfter: string | undefined;
		let hasMore = true;
		let pageCount = 0;

		console.log(`UP Bank API: Starting transaction sync${since ? ` since ${since}` : " (ALL TRANSACTIONS)"}`);
		if (since) {
			console.log(`UP Bank API: Filtering transactions since: ${since}`);
		} else {
			console.log(`UP Bank API: Fetching ALL historical transactions (no date filter)`);
		}

		while (hasMore) {
			pageCount++;
			console.log(`UP Bank API: Fetching page ${pageCount}...`);

			const response = await this.getTransactions({
				accountId,
				since,
				pageSize: 100, // Max allowed by UP Bank
				pageAfter: nextPageAfter
			});

			const pageTransactions = response.data || [];
			allTransactions.push(...pageTransactions);

			console.log(`UP Bank API: Page ${pageCount} returned ${pageTransactions.length} transactions`);

			// Log date range for this page
			if (pageTransactions.length > 0) {
				const firstDate = pageTransactions[0]?.attributes?.createdAt;
				const lastDate = pageTransactions[pageTransactions.length - 1]?.attributes?.createdAt;
				console.log(`UP Bank API: Page ${pageCount} date range: ${lastDate} to ${firstDate}`);
			}

			// Check if there's a next page
			if (response.links?.next) {
				// Extract the page[after] parameter from the next link
				const nextUrl = new URL(response.links.next);
				nextPageAfter = nextUrl.searchParams.get("page[after]") || undefined;
				console.log(`UP Bank API: Next page token: ${nextPageAfter}`);
			} else {
				hasMore = false;
				console.log(`UP Bank API: No more pages available`);
			}

			// Safety breaks to prevent infinite loops or excessive data
			if (allTransactions.length > 10000) {
				console.warn("UP Bank: Breaking pagination loop at 10,000 transactions");
				break;
			}
			if (pageCount > 100) {
				console.warn("UP Bank: Breaking pagination loop at 100 pages");
				break;
			}

			// If we got less than the page size, we're likely on the last page
			if (pageTransactions.length < 100) {
				console.log(`UP Bank API: Page ${pageCount} had less than 100 transactions, likely final page`);
			}
		}

		// Log overall date range
		if (allTransactions.length > 0) {
			const earliestDate = allTransactions[allTransactions.length - 1]?.attributes?.createdAt;
			const latestDate = allTransactions[0]?.attributes?.createdAt;
			console.log(`UP Bank API: Overall date range: ${earliestDate} to ${latestDate}`);

			// Count debits vs credits
			const debits = allTransactions.filter((t) => parseFloat(t.attributes.amount.value) < 0);
			const credits = allTransactions.filter((t) => parseFloat(t.attributes.amount.value) >= 0);
			console.log(`UP Bank API: Transaction breakdown: ${debits.length} debits (expenses), ${credits.length} credits`);
		}

		console.log(`UP Bank API: Completed sync - ${pageCount} pages, ${allTransactions.length} total transactions`);
		return allTransactions;
	}

	// Get categories
	async getCategories(): Promise<UpBankCategoriesResponse> {
		return this.makeRequest("/categories");
	}

	// Get specific transaction
	async getTransaction(transactionId: string): Promise<UpBankTransactionResponse> {
		return this.makeRequest(`/transactions/${transactionId}`);
	}

	// Utility: Convert UP Bank transaction to our expense format
	static convertToExpense(transaction: TransactionResource, userId: number) {
		const amount = Math.abs(parseFloat(transaction.attributes.amount.value));

		// Only convert debits (outgoing money) to expenses
		if (parseFloat(transaction.attributes.amount.value) >= 0) return null;

		// Map UP Bank category to our default category id
		const upCategoryId = transaction.relationships.category?.data?.id;
		const mappedCategoryId = mapUpBankCategory(upCategoryId || "other");

		return {
			user_id: userId,
			amount: amount,
			description: transaction.attributes.description || transaction.attributes.rawText,
			category_id: mappedCategoryId,
			date: new Date(transaction.attributes.createdAt),
			external_id: transaction.id,
			external_source: "up_bank",
			metadata: {
				up_transaction_id: transaction.id,
				up_raw_text: transaction.attributes.rawText,
				up_status: transaction.attributes.status,
				up_category_id: upCategoryId,
				original_amount: transaction.attributes.amount.value,
				currency: transaction.attributes.amount.currencyCode
			}
		};
	}

	// Utility: Get merchant name from transaction
	static getMerchantName(transaction: TransactionResource): string {
		// UP Bank puts merchant info in the rawText or description
		const rawText = transaction.attributes.rawText || "";
		const description = transaction.attributes.description || "";

		// Clean up common patterns in UP Bank transaction text
		return description || rawText.replace(/^(EFTPOS|PAYPAL|GOOGLE|APPLE PAY)\s*/i, "").trim();
	}

	// Utility: Check if transaction is likely a transfer or internal transaction
	static isTransferTransaction(transaction: TransactionResource): boolean {
		const description = transaction.attributes.description?.toLowerCase() || "";
		const rawText = transaction.attributes.rawText?.toLowerCase() || "";

		const transferKeywords = ["transfer", "round up", "boost", "interest", "fee refund", "cashback"];

		return transferKeywords.some((keyword) => description.includes(keyword) || rawText.includes(keyword));
	}
}

export default UPBankAPI;
