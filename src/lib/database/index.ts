import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
	log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"]
});


export * from "./BaseDataService";
export * from "./UserDataService";
export * from "./FinancialAccountDataService";
export * from "./TransactionDataService";
export * from "./CategoryDataService";
export * from "./BudgetDataService";
export * from "./GoalDataService";
export * from "./DebtDataService";
export * from "./AnalyticsDataService";