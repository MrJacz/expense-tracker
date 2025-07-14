// UP Bank API TypeScript definitions
// Based on the official UP Bank OpenAPI specification: https://github.com/up-banking/api

export interface UpBankApiResponse<T> {
  data: T;
  links?: {
    prev?: string;
    next?: string;
  };
  meta?: {
    totalPages?: number;
    totalRecords?: number;
  };
}

export interface MoneyObject {
  currencyCode: string;
  value: string;
  valueInBaseUnits: number;
}

export interface HoldInfoObject {
  amount: MoneyObject;
  foreignAmount: MoneyObject | null;
}

export interface RoundUpObject {
  amount: MoneyObject;
  boostPortion: MoneyObject | null;
}

export interface CashbackObject {
  amount: MoneyObject;
  description: string;
}

export interface CardPurchaseMethodObject {
  method: "CARD_PIN" | "CARD_DETAILS" | "CARD_ON_FILE" | "ECOMMERCE" | "MAGNETIC_STRIPE" | "CONTACTLESS";
  cardNumberSuffix: string | null;
}

export interface NoteObject {
  content: string;
}

export interface CustomerObject {
  displayName: string;
}

export type AccountTypeEnum = "SAVER" | "TRANSACTIONAL" | "HOME_LOAN";
export type OwnershipTypeEnum = "INDIVIDUAL" | "JOINT";
export type TransactionStatusEnum = "HELD" | "SETTLED";

export interface AccountResource {
  type: "accounts";
  id: string;
  attributes: {
    displayName: string;
    accountType: AccountTypeEnum;
    ownershipType: OwnershipTypeEnum;
    balance: MoneyObject;
    createdAt: string;
  };
  relationships: {
    transactions: {
      links: {
        related: string;
      };
    };
  };
  links: {
    self: string;
  };
}

export interface TransactionResource {
  type: "transactions";
  id: string;
  attributes: {
    status: TransactionStatusEnum;
    rawText: string | null;
    description: string;
    message: string | null;
    isCategorizable: boolean;
    holdInfo: HoldInfoObject | null;
    roundUp: RoundUpObject | null;
    cashback: CashbackObject | null;
    amount: MoneyObject;
    foreignAmount: MoneyObject | null;
    cardPurchaseMethod: CardPurchaseMethodObject | null;
    settledAt: string | null;
    createdAt: string;
    transactionType: string | null;
    note: NoteObject | null;
    performingCustomer: CustomerObject | null;
  };
  relationships: {
    account: {
      data: {
        type: "accounts";
        id: string;
      };
      links: {
        related: string;
      };
    };
    transferAccount: {
      data: {
        type: "accounts";
        id: string;
      } | null;
      links?: {
        related: string;
      };
    };
    category: {
      data: {
        type: "categories";
        id: string;
      } | null;
      links?: {
        related: string;
      };
    };
    parentCategory: {
      data: {
        type: "categories";
        id: string;
      } | null;
      links?: {
        related: string;
      };
    };
    tags: {
      data: Array<{
        type: "tags";
        id: string;
      }>;
      links?: {
        related: string;
      };
    };
  };
  links: {
    self: string;
  };
}

export interface CategoryResource {
  type: "categories";
  id: string;
  attributes: {
    name: string;
  };
  relationships: {
    parent: {
      data: {
        type: "categories";
        id: string;
      } | null;
      links?: {
        related: string;
      };
    };
    children: {
      data: Array<{
        type: "categories";
        id: string;
      }>;
      links?: {
        related: string;
      };
    };
  };
  links: {
    self: string;
  };
}

export interface TagResource {
  type: "tags";
  id: string;
  attributes: {
    label: string;
  };
  relationships: {
    transactions: {
      links?: {
        related: string;
      };
    };
  };
  links: {
    self: string;
  };
}

export interface WebhookResource {
  type: "webhooks";
  id: string;
  attributes: {
    url: string;
    description: string | null;
    secretKey: string;
    createdAt: string;
  };
  relationships: {
    logs: {
      links?: {
        related: string;
      };
    };
  };
  links: {
    self: string;
  };
}

export interface WebhookEventResource {
  type: "webhook-events";
  id: string;
  attributes: {
    eventType: "TRANSACTION_CREATED" | "TRANSACTION_SETTLED" | "TRANSACTION_DELETED" | "PING";
    createdAt: string;
  };
  relationships: {
    webhook: {
      data: {
        type: "webhooks";
        id: string;
      };
      links?: {
        related: string;
      };
    };
    transaction?: {
      data: {
        type: "transactions";
        id: string;
      } | null;
      links?: {
        related: string;
      };
    };
  };
  links: {
    self: string;
  };
}

// Aliases for backwards compatibility and convenience
export type UpBankAccount = AccountResource;
export type UpBankTransaction = TransactionResource;
export type UpBankCategory = CategoryResource;
export type UpBankTag = TagResource;
export type UpBankWebhook = WebhookResource;
export type UpBankWebhookEvent = WebhookEventResource;
export type UpBankMoney = MoneyObject;

// Response types for specific endpoints
export type UpBankAccountsResponse = UpBankApiResponse<AccountResource[]>;
export type UpBankAccountResponse = UpBankApiResponse<AccountResource>;
export type UpBankTransactionsResponse = UpBankApiResponse<TransactionResource[]>;
export type UpBankTransactionResponse = UpBankApiResponse<TransactionResource>;
export type UpBankCategoriesResponse = UpBankApiResponse<CategoryResource[]>;
export type UpBankCategoryResponse = UpBankApiResponse<CategoryResource>;
export type UpBankTagsResponse = UpBankApiResponse<TagResource[]>;
export type UpBankWebhooksResponse = UpBankApiResponse<WebhookResource[]>;
export type UpBankWebhookResponse = UpBankApiResponse<WebhookResource>;

// Utility endpoint responses
export interface UpBankPingResponse {
  meta: {
    id: string;
    statusEmoji: string;
  };
}

// Error response type
export interface UpBankErrorResponse {
  errors: Array<{
    status: string;
    title: string;
    detail: string;
    source?: {
      parameter?: string;
      pointer?: string;
    };
  }>;
}

// Query parameters for transactions endpoint
export interface UpBankTransactionQuery {
  "page[size]"?: number;
  "page[after]"?: string;
  "page[before]"?: string;
  "filter[status]"?: TransactionStatusEnum;
  "filter[since]"?: string; // ISO 8601 datetime
  "filter[until]"?: string; // ISO 8601 datetime
  "filter[category]"?: string;
  "filter[tag]"?: string;
}

// Query parameters for accounts endpoint
export interface UpBankAccountQuery {
  "page[size]"?: number;
  "filter[accountType]"?: AccountTypeEnum;
  "filter[ownershipType]"?: OwnershipTypeEnum;
}