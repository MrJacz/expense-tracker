# Financial Management Application

A financial management application built with Next.js, TypeScript, and PostgreSQL.

## ToDo reminder

- Rewrite all database queries to use Prisma
- Eventually remove all any/unknown types
- Most of api routes are still using the old database queries, rewrite them to use Prisma and new Schema/Data Models

## Technical Architecture

### **Frontend Architecture**

- **Framework**: Next.js 15+ with React 18+
- **Language**: TypeScript
- **Styling**: Postcss & Tailwind CSS
- **State Management**: Redux Toolkit or Zustand
- **Routing**: Next.js App Router
- **Form Handling**: Unsure
- **Charts**: Recharts or Chart.js
- **UI Components**: Radix UI or Headless UI

### **Backend Architecture**

- **API**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **File Storage**: Unsure
- **Caching**: Redis (optional)

# Basic Idea about what this website should have

## Accounts

This feature of the application should allow users to see and manage their financial accounts from the point of view of this application. It should provide a way to track different types of accounts.
The idea is that users should be able to see all of their different accounts in one place and see the transactions under each accounts.

- Accounts to track different bank accounts, credit cards, and cash.
- Ability to add, edit, and delete accounts.
- View account balances and transaction history.
- While most of these accounts will have to be manually added, this app should gradually support bank integrations to automatically fetch transactions.

## Transactions

This feature should allow users to track their financial transactions, categorize them, and manage their spending effectively.
While this feature will be that the user can see all of their transactions in one place, the idea is that users would be able to categorize their transactions, split them, and manage recurring transactions but also be able to manage their transaction on a per-account basis.

- Transactions to track income, expenses, and transfers.
- Ability to add, edit, and delete transactions.
- Transactions can be categorized (e.g., groceries, utilities, entertainment).
- Support for recurring transactions (e.g., monthly subscriptions).
- Ability to split transactions (e.g., shared expenses).
- Support for attachments (e.g., receipts).

## Budgeting

This feature should allow users to set budgets for different categories and track their spending against those budgets.
The idea is that in the budgeting feature, users can set budgets for different categories, track their spending against those budgets, and get insights into their financial habits.

This feature should implement basic budgeting ideas such as 50/30/20 rule, envelope budgeting, and zero-based budgeting.
this would also co-exist sortof with the debt management feature, where users can set budgets for paying off debts and track their progress.

- Budgeting to set spending limits for different categories.
- Ability to create, edit, and delete budgets.
- Track spending against budgets.
- Alerts for overspending.

## Goals

This feature should allow users to set financial goals, such as saving up for a house deposit and track their progress towards these goals.
The idea is that users can set financial goals, track their progress towards these goals, and get insights on how to achieve them.

- Goals to set financial targets (e.g., saving for a vacation, paying off debt).
- Ability to create, edit, and delete goals.
- Track progress towards goals.
- Alerts for reaching goals.
- Ability to set target dates for goals.
- Use goal progress to adjust budgets and spending habits.

## Analytics

This feature should provide users with insights into their financial habits, spending patterns, and overall financial health.
The idea is that users can get insights into their financial habits, spending patterns, and overall financial health.

On the analytics page, users should be able to see everything from their spending habits, income vs expenses, net worth, and more.

- Analytics to visualize financial data (e.g., spending trends, income vs. expenses).
- Ability to generate reports (e.g., monthly spending summary, category breakdown).
- Charts and graphs to represent financial data.
- Insights into financial habits (e.g., spending patterns, income sources).
- Ability to compare spending across different periods.

## Debt Management

This feature should allow users to manage their debts, track payments, set goals for paying off debts, get insights on how to pay off debts faster, and more.
The idea behind the debt management feature is that users will be able to add/edit/delete debts whether they are current or past debts, debts should have the following information:

Below is a table of data points that we may need to track for each debt:

| Data Point                        | Description                                                                                   |
| :-------------------------------- | :-------------------------------------------------------------------------------------------- |
| **Account Number**                | The unique identifier for the debt, essential for payments and communication.                 |
| **Lender/Creditor**               | The name of the institution or person you owe (e.g., Westpac, Afterpay).                      |
| **Lender Contact Information**    | Phone number, website, and mailing address for the lender.                                    |
| **Debt Type**                     | The kind of debt (e.g., Credit Card, Personal Loan, Auto Loan, Student Loan).                 |
| **User-Defined Nickname**         | A custom name for easy reference (e.g., "Main Credit Card," "Car Loan").                      |
| **Original Principal Amount**     | The total amount you borrowed at the very beginning.                                          |
| **Current Balance**               | The exact amount you owe right now.                                                           |
| **Amount Paid Off**               | The total principal you have paid down to date.                                               |
| **Credit Limit**                  | For revolving debt (like credit cards), the maximum allowable balance.                        |
| **Credit Utilisation**            | The percentage of your credit limit being used (`Current Balance ÷ Credit Limit`).            |
| **Accrued Interest**              | Interest calculated but not yet added to the principal (capitalised).                         |
| **Interest Rate (APR)**           | The Annual Percentage Rate charged on the debt.                                               |
| **Interest Type**                 | Whether the rate is **Fixed** or **Variable**.                                                |
| **Promotional/Introductory Rate** | A temporary, lower rate, which may also require a **Promo End Date** and **Revert Rate**.     |
| **Interest Calculation Method**   | How interest is calculated (**Simple** or **Compound**).                                      |
| **Compounding Frequency**         | How often compound interest is calculated (e.g., Daily, Monthly).                             |
| **Origination Date**              | The date the loan was taken out.                                                              |
| **Original Term**                 | The intended length of the loan (e.g., 60 months).                                            |
| **Original Payoff Date**          | The date the loan would be paid off if only minimums were paid.                               |
| **Fees**                          | Any associated fees, such as **Annual Fee**, **Late Payment Fee**, or **Prepayment Penalty**. |
| **Minimum Payment**               | The required monthly payment (can be a fixed amount or a % of the balance).                   |
| **Payment Due Day**               | The day of the month the payment is due (e.g., the 15th).                                     |
| **Payment Frequency**             | How often payments are due (e.g., Monthly, Fortnightly, Weekly).                              |
| **Next Payment Due Date**         | The specific calendar date of the next upcoming payment.                                      |
| **Last Payment Date**             | The date you made your most recent payment.                                                   |
| **Last Payment Amount**           | The amount of your most recent payment.                                                       |
| **Status**                        | The current state of the debt (e.g., Active, Paid Off, In Default, In Collections).           |
| **Hardship/Forbearance Status**   | Notes if a special temporary payment arrangement has been made.                               |
| **Collection Agency Info**        | If in collections, the agency's name and contact details.                                     |
| **Associated Collateral**         | For a secured debt, the asset backing it (e.g., a car's VIN or a property's address).         |
| **Notes/Log**                     | A text field to log conversations, reference numbers, or other notes.                         |
| **Associated Documents**          | A place to link or upload loan agreements, statements, etc.                                   |

## Assets

## Subscription tracking

## Recurring Transactions which could also be apart of subscription tracking

### 📊 **Expense Management**

- **Basic CRUD Operations**
  - [ ] Add expenses with amount, category, description, date
  - [ ] Edit existing expenses
  - [ ] Delete expenses
  - [ ] View expense history
  - [ ] Bulk actions (select multiple, delete/categorize)

- **Advanced Expense Features**
  - [ ] Recurring expenses (monthly bills, subscriptions)
  - [ ] Split expenses (shared with others)
  - [ ] Expense receipts/attachments
  - [ ] Location-based expense tracking
  - [ ] Expense templates for common purchases
  - [ ] Tax-deductible expense marking

### 💰 **Income Management**

- **Income Tracking**
  - [ ] Multiple income sources
  - [ ] Salary/wage tracking
  - [ ] Freelance/project income
  - [ ] Investment returns
  - [ ] Passive income streams
  - [ ] Income forecasting

### 🏦 **Account Management**

- **Multiple Account Support**
  - [ ] Bank accounts (checking, savings)
  - [ ] Credit cards
  - [ ] Cash accounts
  - [ ] Investment accounts
  - [ ] Cryptocurrency wallets
  - [ ] PayPal/digital wallets

- **Account Features**
  - [ ] Account balances
  - [ ] Transaction synchronization
  - [ ] Account reconciliation
  - [ ] Account transfer tracking
  - [ ] Account history and statements

### 📈 **Budget Management**

- **Budget Creation & Tracking**
  - [ ] Monthly/yearly budgets
  - [ ] Category-based budgets
  - [ ] Zero-based budgeting
  - [ ] 50/30/20 rule budgeting
  - [ ] Envelope budgeting system
  - [ ] Budget rollover options

- **Budget Monitoring**
  - [ ] Budget vs actual spending
  - [ ] Budget alerts and notifications
  - [ ] Overspending warnings
  - [ ] Budget progress tracking
  - [ ] Budget adjustment recommendations

### 🎯 **Goals & Savings**

- **Financial Goals**
  - [ ] Emergency fund goals
  - [ ] Savings goals (vacation, house, etc.)
  - [ ] Debt payoff goals
  - [ ] Investment goals
  - [ ] Retirement planning
  - [ ] Goal progress tracking

- **Savings Features**
  - [ ] Automatic savings rules
  - [ ] Round-up savings
  - [ ] Savings challenges
  - [ ] Goal-based savings allocation

### 📊 **Analytics & Reporting**

- **Dashboard & Insights**
  - [ ] Financial health score
  - [ ] Net worth tracking
  - [ ] Monthly spending summary
  - [ ] Category breakdown charts
  - [ ] Spending trends over time
  - [ ] Income vs expense comparison

- **Advanced Analytics**
  - [ ] Cash flow analysis
  - [ ] Spending pattern recognition
  - [ ] Financial habit insights
  - [ ] Comparative spending analysis
  - [ ] Investment performance tracking
  - [ ] Tax year summaries

### 🔍 **Search & Filtering**

- **Data Organization**
  - [ ] Search by description, amount, category
  - [ ] Date range filtering
  - [ ] Category filtering
  - [ ] Account filtering
  - [ ] Tag-based organization
  - [ ] Advanced search with multiple criteria

### 📱 **User Experience**

- **Interface & Usability**
  - [ ] Responsive design (mobile-first)
  - [ ] Dark/light theme toggle
  - [ ] Customizable dashboard
  - [ ] Drag-and-drop functionality
  - [ ] Keyboard shortcuts
  - [ ] Accessibility features (WCAG compliance)

- **Navigation & Layout**
  - [ ] Intuitive menu structure
  - [ ] Quick action buttons
  - [ ] Breadcrumb navigation
  - [ ] Search bar in header
  - [ ] Contextual menus

### 🔐 **Security & Privacy**

- **Authentication & Authorization**
  - [ ] Secure user registration/login
  - [ ] Two-factor authentication (2FA)
  - [ ] Password reset functionality
  - [ ] Session management
  - [ ] OAuth integration (Google, GitHub, etc.)

- **Data Protection**
  - [ ] Data encryption at rest
  - [ ] Secure API endpoints
  - [ ] Rate limiting
  - [ ] Input validation & sanitization
  - [ ] GDPR compliance features

### 📤 **Data Management**

- **Import/Export**
  - [ ] CSV import/export
  - [ ] PDF report generation
  - [ ] Excel file support
  - [ ] QIF/OFX file import
  - [ ] Bank statement import
  - [ ] Backup and restore functionality

- **Data Synchronization**
  - [ ] Multi-device sync
  - [ ] Real-time updates
  - [ ] Offline mode support
  - [ ] Conflict resolution

### 🔔 **Notifications & Alerts**

- **Smart Notifications**
  - [ ] Budget limit alerts
  - [ ] Bill due reminders
  - [ ] Unusual spending alerts
  - [ ] Goal achievement notifications
  - [ ] Weekly/monthly summaries
  - [ ] Low balance warnings

- **Notification Preferences**
  - [ ] Email notifications
  - [ ] In-app notifications
  - [ ] Push notifications (if mobile)
  - [ ] Notification frequency settings

### 📋 **Categories & Tags**

- **Organization System**
  - [ ] Predefined categories
  - [ ] Custom category creation
  - [ ] Subcategories
  - [ ] Tag system
  - [ ] Category rules and automation
  - [ ] Category budgeting

### 🔄 **Automation**

- **Smart Features**
  - [ ] Automatic transaction categorization
  - [ ] Recurring transaction detection
  - [ ] Bill reminder automation
  - [ ] Savings rule automation
  - [ ] Budget adjustment suggestions

### 📱 **Advanced Features**

- **Integration & API**
  - [ ] Bank account integration (Plaid, Yodlee)
  - [ ] Credit card integration
  - [ ] Investment platform integration
  - [ ] Calendar integration
  - [ ] Third-party app connections

- **Machine Learning & AI**
  - [ ] Spending pattern analysis
  - [ ] Fraud detection
  - [ ] Smart categorization
  - [ ] Financial advice suggestions
  - [ ] Predictive budgeting

## Development Roadmap

### **Phase 1: Foundation (Weeks 1-2)**

- [ ] User authentication system
- [ ] Basic expense CRUD
- [ ] Simple dashboard
- [ ] Category management
- [ ] Database setup

### **Phase 2: Core Features (Weeks 3-4)**

- [ ] Budget management
- [ ] Basic analytics
- [ ] Search and filtering
- [ ] Data visualization
- [ ] Income tracking

### **Phase 3: Enhanced UX (Weeks 5-6)**

- [ ] Advanced dashboard
- [ ] Goal tracking
- [ ] Notifications system
- [ ] Import/export features
- [ ] Mobile responsiveness

### **Phase 4: Advanced Features (Weeks 7-8)**

- [ ] Automation features
- [ ] Advanced analytics
- [ ] Multi-account support
- [ ] Recurring transactions
- [ ] Performance optimization

### **Phase 5: Production Ready (Weeks 9-10)**

- [ ] Security hardening
- [ ] Testing suite
- [ ] Documentation
- [ ] Deployment pipeline
- [ ] Monitoring and logging

## Success Metrics

### **Technical Metrics**

- [ ] Page load time < 2 seconds
- [ ] 99.9% uptime
- [ ] Mobile responsiveness score > 95
- [ ] Lighthouse performance score > 90
- [ ] Zero security vulnerabilities

### **User Experience Metrics**

- [ ] User registration completion rate > 80%
- [ ] Daily active users growth
- [ ] Feature adoption rates
- [ ] User satisfaction score > 4.5/5
- [ ] Support ticket resolution time < 24 hours

## Future Enhancements

### **Advanced Features**

- [ ] Multi-currency support
- [ ] Investment portfolio tracking
- [ ] Cryptocurrency integration
- [ ] Financial advisor chat
- [ ] Tax preparation assistance
- [ ] Bill negotiation features
- [ ] Credit score monitoring
- [ ] Insurance tracking
- [ ] Retirement planning tools
- [ ] Business expense tracking

### **Integration Possibilities**

- [ ] Bank API integrations
- [ ] Investment platform APIs
- [ ] Credit card APIs
- [ ] Accounting software integration
- [ ] Tax software integration
- [ ] Calendar applications
- [ ] Email integration
- [ ] SMS notifications

## Documentation Requirements

### **Technical Documentation**

- [ ] API documentation
- [ ] Database schema documentation
- [ ] Deployment guide
- [ ] Contributing guidelines
- [ ] Code style guide
