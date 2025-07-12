import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/database";

export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const startDate = searchParams.get("startDate");
		const endDate = searchParams.get("endDate");
		const type = searchParams.get("type"); // category, daily, weekly, monthly

		let dateFilter = "";
		const queryParams = [session.user.id];
		let paramCount = 1;

		if (startDate) {
			paramCount++;
			dateFilter += ` AND e.date >= $${paramCount}`;
			queryParams.push(startDate);
		}

		if (endDate) {
			paramCount++;
			dateFilter += ` AND e.date <= $${paramCount}`;
			queryParams.push(endDate);
		}

		const analytics: Record<string, unknown> = {};

		// Category breakdown
		if (!type || type === "category") {
			const categoryQuery = `
        SELECT
          c.id,
          c.name,
          c.color,
          c.icon,
          COUNT(e.id) as transaction_count,
          SUM(e.amount) as total_amount,
          AVG(e.amount) as avg_amount,
          ROUND((SUM(e.amount) * 100.0 / (
            SELECT SUM(amount) FROM expenses
            WHERE user_id = $1 ${dateFilter}
          )), 2) as percentage
        FROM categories c
        LEFT JOIN expenses e ON c.id = e.category_id AND e.user_id = $1 ${dateFilter}
        WHERE (c.is_default = true OR c.user_id = $1)
        GROUP BY c.id, c.name, c.color, c.icon
        HAVING COUNT(e.id) > 0
        ORDER BY total_amount DESC
      `;

			const categoryResult = await query(categoryQuery, queryParams);
			analytics.categoryBreakdown = categoryResult.rows.map((row) => ({
				id: row.id,
				name: row.name,
				color: row.color,
				icon: row.icon,
				value: parseFloat(row.total_amount),
				count: parseInt(row.transaction_count),
				average: parseFloat(row.avg_amount),
				percentage: parseFloat(row.percentage) || 0
			}));
		}

		// Daily spending trend
		if (!type || type === "daily") {
			const dailyQuery = `
        SELECT
          e.date,
          SUM(e.amount) as total_amount,
          COUNT(e.id) as transaction_count,
          AVG(e.amount) as avg_amount
        FROM expenses e
        WHERE e.user_id = $1 ${dateFilter}
        GROUP BY e.date
        ORDER BY e.date ASC
      `;

			const dailyResult = await query(dailyQuery, queryParams);
			analytics.dailyTrend = dailyResult.rows.map((row) => ({
				date: row.date,
				amount: parseFloat(row.total_amount),
				count: parseInt(row.transaction_count),
				average: parseFloat(row.avg_amount),
				formattedDate: new Date(row.date).toLocaleDateString("en-US", {
					month: "short",
					day: "numeric"
				})
			}));
		}

		// Weekly spending trend
		if (!type || type === "weekly") {
			const weeklyQuery = `
        SELECT
          DATE_TRUNC('week', e.date) as week_start,
          SUM(e.amount) as total_amount,
          COUNT(e.id) as transaction_count,
          AVG(e.amount) as avg_amount
        FROM expenses e
        WHERE e.user_id = $1 ${dateFilter}
        GROUP BY DATE_TRUNC('week', e.date)
        ORDER BY week_start ASC
      `;

			const weeklyResult = await query(weeklyQuery, queryParams);
			analytics.weeklyTrend = weeklyResult.rows.map((row) => ({
				week: row.week_start,
				amount: parseFloat(row.total_amount),
				count: parseInt(row.transaction_count),
				average: parseFloat(row.avg_amount),
				formattedWeek: new Date(row.week_start).toLocaleDateString("en-US", {
					month: "short",
					day: "numeric"
				})
			}));
		}

		// Monthly comparison
		if (!type || type === "monthly") {
			const monthlyQuery = `
        SELECT
          DATE_TRUNC('month', e.date) as month_start,
          EXTRACT(YEAR FROM e.date) as year,
          EXTRACT(MONTH FROM e.date) as month,
          SUM(e.amount) as total_amount,
          COUNT(e.id) as transaction_count,
          AVG(e.amount) as avg_amount
        FROM expenses e
        WHERE e.user_id = $1 ${dateFilter}
        GROUP BY DATE_TRUNC('month', e.date), EXTRACT(YEAR FROM e.date), EXTRACT(MONTH FROM e.date)
        ORDER BY month_start ASC
      `;

			const monthlyResult = await query(monthlyQuery, queryParams);
			analytics.monthlyTrend = monthlyResult.rows.map((row) => ({
				month: row.month_start,
				year: parseInt(row.year),
				monthNumber: parseInt(row.month),
				amount: parseFloat(row.total_amount),
				count: parseInt(row.transaction_count),
				average: parseFloat(row.avg_amount),
				formattedMonth: new Date(row.month_start).toLocaleDateString("en-US", {
					year: "numeric",
					month: "short"
				})
			}));
		}

		// Top spending days
		if (!type || type === "top-days") {
			const topDaysQuery = `
        SELECT
          e.date,
          SUM(e.amount) as total_amount,
          COUNT(e.id) as transaction_count,
          ARRAY_AGG(DISTINCT c.name) as categories
        FROM expenses e
        JOIN categories c ON e.category_id = c.id
        WHERE e.user_id = $1 ${dateFilter}
        GROUP BY e.date
        ORDER BY total_amount DESC
        LIMIT 10
      `;

			const topDaysResult = await query(topDaysQuery, queryParams);
			analytics.topSpendingDays = topDaysResult.rows.map((row) => ({
				date: row.date,
				amount: parseFloat(row.total_amount),
				count: parseInt(row.transaction_count),
				categories: row.categories,
				formattedDate: new Date(row.date).toLocaleDateString("en-US", {
					weekday: "short",
					month: "short",
					day: "numeric"
				})
			}));
		}

		// Spending patterns by day of week
		if (!type || type === "day-patterns") {
			const dayPatternQuery = `
        SELECT
          EXTRACT(DOW FROM e.date) as day_of_week,
          CASE EXTRACT(DOW FROM e.date)
            WHEN 0 THEN 'Sunday'
            WHEN 1 THEN 'Monday'
            WHEN 2 THEN 'Tuesday'
            WHEN 3 THEN 'Wednesday'
            WHEN 4 THEN 'Thursday'
            WHEN 5 THEN 'Friday'
            WHEN 6 THEN 'Saturday'
          END as day_name,
          SUM(e.amount) as total_amount,
          COUNT(e.id) as transaction_count,
          AVG(e.amount) as avg_amount
        FROM expenses e
        WHERE e.user_id = $1 ${dateFilter}
        GROUP BY EXTRACT(DOW FROM e.date)
        ORDER BY day_of_week
      `;

			const dayPatternResult = await query(dayPatternQuery, queryParams);
			analytics.dayPatterns = dayPatternResult.rows.map((row) => ({
				dayOfWeek: parseInt(row.day_of_week),
				dayName: row.day_name,
				amount: parseFloat(row.total_amount),
				count: parseInt(row.transaction_count),
				average: parseFloat(row.avg_amount)
			}));
		}

		// Summary statistics
		const summaryQuery = `
      SELECT
        COUNT(*) as total_transactions,
        SUM(amount) as total_amount,
        AVG(amount) as avg_transaction,
        MIN(amount) as min_transaction,
        MAX(amount) as max_transaction,
        COUNT(DISTINCT category_id) as unique_categories,
        COUNT(DISTINCT date) as unique_days
      FROM expenses e
      WHERE e.user_id = $1 ${dateFilter}
    `;

		const summaryResult = await query(summaryQuery, queryParams);
		if (summaryResult.rows.length > 0) {
			const summary = summaryResult.rows[0];
			analytics.summary = {
				totalTransactions: parseInt(summary.total_transactions),
				totalAmount: parseFloat(summary.total_amount) || 0,
				avgTransaction: parseFloat(summary.avg_transaction) || 0,
				minTransaction: parseFloat(summary.min_transaction) || 0,
				maxTransaction: parseFloat(summary.max_transaction) || 0,
				uniqueCategories: parseInt(summary.unique_categories),
				uniqueDays: parseInt(summary.unique_days)
			};
		}

		return NextResponse.json({ analytics });
	} catch (error) {
		console.error("Error fetching analytics:", error);
		return NextResponse.json({ error: "Failed to fetch analytics data" }, { status: 500 });
	}
}
