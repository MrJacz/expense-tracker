import { PrismaClient } from '@prisma/client'
import { CATEGORIES } from '../src/lib/constants'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

// Sample data for seeding
const sampleData = {
  testUser: {
    name: 'Test User',
    email: 'test@financeapp.com',
    password: 'password123'
  },
  
  accounts: [
    { name: 'ANZ Everyday', type: 'checking' as const, balance: 2500.00, isAsset: true },
    { name: 'ANZ Savings', type: 'savings' as const, balance: 15000.00, isAsset: true },
    { name: 'Cash Wallet', type: 'cash' as const, balance: 120.00, isAsset: true }
  ],

  debts: [
    { 
      name: 'NAB Credit Card', 
      type: 'credit_card' as const, 
      balance: -850.00, 
      originalBalance: -5000.00,
      interestRate: 19.99,
      minimumPayment: 25.00,
      dueDayOfMonth: 15,
      // Extended debt information
      accountNumber: '4532-1234-5678-9012',
      lenderName: 'National Australia Bank',
      lenderContact: 'Phone: 13 22 65\nWebsite: nab.com.au\nAddress: 800 Bourke Street, Melbourne VIC 3000',
      creditLimit: 5000.00,
      interestType: 'variable',
      paymentFrequency: 'monthly',
      status: 'active',
      annualFee: 59.00,
      latePaymentFee: 25.00
    },
    { 
      name: 'Car Loan', 
      type: 'loan' as const, 
      balance: -18500.00, 
      originalBalance: -25000.00,
      interestRate: 6.99,
      minimumPayment: 520.00,
      dueDayOfMonth: 5,
      loanTermMonths: 60,
      // Extended debt information
      accountNumber: 'AL-2023-456789',
      lenderName: 'Toyota Finance Australia',
      lenderContact: 'Phone: 1800 869 682\nWebsite: toyotafinance.com.au\nAddress: Level 4, 601 Pacific Highway, St Leonards NSW 2065',
      interestType: 'fixed',
      paymentFrequency: 'monthly',
      status: 'active',
      collateralInfo: 'Vehicle: 2023 Toyota Camry, VIN: JTJBJRFR3N0123456',
      notes: 'Monthly payment includes comprehensive insurance'
    },
    { 
      name: 'Personal Loan', 
      type: 'loan' as const, 
      balance: -3200.00, 
      originalBalance: -8000.00,
      interestRate: 12.50,
      minimumPayment: 180.00,
      dueDayOfMonth: 20,
      loanTermMonths: 48,
      // Extended debt information
      accountNumber: 'PL-789123456',
      lenderName: 'ANZ Bank',
      lenderContact: 'Phone: 13 13 14\nWebsite: anz.com.au\nAddress: 833 Collins Street, Melbourne VIC 3000',
      interestType: 'fixed',
      paymentFrequency: 'monthly',
      status: 'active',
      notes: 'Used for home renovations and debt consolidation'
    }
  ],
  
  transactions: [
    { amount: 3.50, description: 'Morning coffee', category: 'RESTAURANTS_CAFES', account: 'Cash Wallet', daysAgo: 0, type: 'expense' as const },
    { amount: 89.45, description: 'Weekly groceries', category: 'GROCERIES', account: 'ANZ Everyday', daysAgo: 1, type: 'expense' as const },
    { amount: 45.20, description: 'Fuel for car', category: 'FUEL', account: 'ANZ Everyday', daysAgo: 2, type: 'expense' as const },
    { amount: 25.99, description: 'Netflix subscription', category: 'TV_MUSIC_STREAMING', account: 'ANZ Everyday', daysAgo: 3, type: 'expense' as const },
    { amount: 12.80, description: 'Lunch takeaway', category: 'TAKEAWAY', account: 'ANZ Everyday', daysAgo: 3, type: 'expense' as const },
    { amount: 150.00, description: 'Electricity bill', category: 'UTILITIES', account: 'ANZ Everyday', daysAgo: 5, type: 'expense' as const },
    { amount: 520.00, description: 'Car loan payment', category: 'LOAN_PAYMENT', account: 'ANZ Everyday', daysAgo: 5, type: 'expense' as const },
    { amount: 180.00, description: 'Personal loan payment', category: 'LOAN_PAYMENT', account: 'ANZ Everyday', daysAgo: 8, type: 'expense' as const },
    { amount: 25.00, description: 'Credit card minimum payment', category: 'CREDIT_CARD_PAYMENT', account: 'ANZ Everyday', daysAgo: 15, type: 'expense' as const },
    { amount: 2500.00, description: 'Salary payment', category: 'SALARY', account: 'ANZ Everyday', daysAgo: 14, type: 'income' as const }
  ],
  
  goals: [
    { name: 'Emergency Fund', amount: 10000.00, current: 5000.00, targetAccount: 'ANZ Savings' },
    { name: 'Holiday to Japan', amount: 5000.00, current: 1200.00, targetAccount: 'ANZ Savings' },
    { name: 'New Car Fund', amount: 25000.00, current: 3000.00, targetAccount: 'ANZ Savings' }
  ]
}

async function seedUser() {
  console.log('👤 Creating test user...')
  
  if (process.env.NODE_ENV === 'production') {
    console.log('⏭️  Skipping test user creation in production')
    return null
  }

  // Check if test user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: sampleData.testUser.email }
  })

  if (existingUser) {
    console.log('   User already exists, skipping...')
    return existingUser.id
  }

  // Hash password for authentication
  const hashedPassword = await hash(sampleData.testUser.password, 12)

  // Create test user with preferences and credentials
  const user = await prisma.user.create({
    data: {
      email: sampleData.testUser.email,
      name: sampleData.testUser.name,
      emailVerified: new Date(),
      preferences: {
        create: {
          defaultCurrency: 'AUD',
          theme: 'system'
        }
      },
      credentials: {
        create: {
          passwordHash: hashedPassword
        }
      }
    }
  })

  console.log(`   ✅ Test user created with ID: ${user.id}`)
  console.log(`   📧 Email: ${sampleData.testUser.email}`)
  console.log(`   🔑 Password: ${sampleData.testUser.password}`)

  return user.id
}

async function seedFinancialAccounts(userId: string) {
  console.log('🏦 Creating financial accounts...')
  
  const accountIds: Record<string, string> = {}

  // Create regular accounts
  for (const account of sampleData.accounts) {
    const result = await prisma.financialAccount.create({
      data: {
        userId,
        name: account.name,
        type: account.type,
        balance: account.balance,
        isAsset: account.isAsset
      }
    })
    
    accountIds[account.name] = result.id
    console.log(`   ✅ Created account: ${account.name} (${account.type})`)
  }

  // Create debt accounts
  for (const debt of sampleData.debts) {
    const result = await prisma.financialAccount.create({
      data: {
        userId,
        name: debt.name,
        type: debt.type,
        balance: debt.balance,
        isAsset: false
      }
    })
    
    accountIds[debt.name] = result.id
    console.log(`   ✅ Created debt account: ${debt.name} (${debt.type})`)
  }

  console.log(`   📊 Created ${sampleData.accounts.length + sampleData.debts.length} financial accounts`)
  return accountIds
}

async function seedCategories(userId: string) {
  console.log('📂 Creating categories...')
  
  const categoryIds: Record<string, string> = {}
  
  for (const [key, categoryData] of Object.entries(CATEGORIES)) {
    const category = await prisma.category.create({
      data: {
        userId,
        name: categoryData.name,
        isDefault: true
      }
    })
    
    categoryIds[key] = category.id
    console.log(`   ✅ Created category: ${categoryData.name}`)
  }
  
  return categoryIds
}

async function seedDebtDetails(accountIds: Record<string, string>) {
  console.log('💳 Creating debt details...')
  
  for (const debt of sampleData.debts) {
    const accountId = accountIds[debt.name]
    
    if (!accountId) {
      console.log(`   ⚠️  Account not found: ${debt.name}, skipping debt details`)
      continue
    }

    // Calculate payment dates
    const openedDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // One year ago
    const nextPaymentDue = new Date()
    nextPaymentDue.setDate(debt.dueDayOfMonth)
    if (nextPaymentDue.getDate() < new Date().getDate()) {
      nextPaymentDue.setMonth(nextPaymentDue.getMonth() + 1)
    }
    
    const lastPaymentDate = new Date(nextPaymentDue)
    lastPaymentDate.setMonth(lastPaymentDate.getMonth() - 1)

    await prisma.debtDetails.create({
      data: {
        financialAccountId: accountId,
        // Basic Information
        accountNumber: debt.accountNumber,
        lenderName: debt.lenderName,
        lenderContactInfo: debt.lenderContact,
        // Financial Details
        originalBalance: debt.originalBalance,
        creditLimit: debt.creditLimit || null,
        accruedInterest: debt.type === 'credit_card' ? 15.75 : 0.00,
        // Interest Information
        interestRateApr: debt.interestRate,
        interestType: debt.interestType as 'fixed' | 'variable',
        // Payment Information
        minimumPayment: debt.minimumPayment,
        paymentFrequency: debt.paymentFrequency as 'monthly',
        dueDateDayOfMonth: debt.dueDayOfMonth,
        nextPaymentDue: nextPaymentDue,
        lastPaymentDate: lastPaymentDate,
        lastPaymentAmount: debt.minimumPayment,
        // Loan Details
        loanTermMonths: debt.loanTermMonths || null,
        originalPayoffDate: debt.loanTermMonths ? new Date(openedDate.getTime() + debt.loanTermMonths * 30 * 24 * 60 * 60 * 1000) : null,
        // Status & Management
        status: debt.status as 'active',
        collateralInfo: debt.collateralInfo || null,
        notes: debt.notes || null,
        // Fees
        annualFee: debt.annualFee || 0.00,
        latePaymentFee: debt.latePaymentFee || 0.00,
        // Timestamps
        openedAt: openedDate
      }
    })

    console.log(`   ✅ Created debt details for: ${debt.name}`)
  }

  console.log(`   📊 Created ${sampleData.debts.length} debt detail records`)
}

async function seedTransactions(userId: string, accountIds: Record<string, string>, categoryIds: Record<string, string>) {
  console.log('💰 Creating sample transactions...')

  for (const transaction of sampleData.transactions) {
    const accountId = accountIds[transaction.account]
    const categoryId = categoryIds[transaction.category] || categoryIds['OTHER']
    
    if (!accountId) {
      console.log(`   ⚠️  Account not found: ${transaction.account}, skipping transaction`)
      continue
    }

    // Calculate transaction date
    const transactionDate = new Date()
    transactionDate.setDate(transactionDate.getDate() - transaction.daysAgo)

    // Create transaction with split
    await prisma.transaction.create({
      data: {
        userId,
        accountId,
        description: transaction.description,
        date: transactionDate,
        type: transaction.type,
        splits: {
          create: {
            categoryId,
            amount: transaction.amount,
            notes: null
          }
        }
      }
    })

    console.log(`   ✅ ${transaction.type}: $${transaction.amount} - ${transaction.description}`)
  }

  console.log(`   📊 Created ${sampleData.transactions.length} sample transactions`)
}

async function seedGoals(userId: string, accountIds: Record<string, string>) {
  console.log('🎯 Creating financial goals...')

  for (const goal of sampleData.goals) {
    const linkedAccountId = accountIds[goal.targetAccount]
    
    if (!linkedAccountId) {
      console.log(`   ⚠️  Target account not found: ${goal.targetAccount}, skipping goal`)
      continue
    }

    await prisma.goal.create({
      data: {
        userId,
        name: goal.name,
        targetAmount: goal.amount,
        currentAmount: goal.current,
        linkedAccountId
      }
    })

    console.log(`   ✅ Goal: ${goal.name} - $${goal.current}/$${goal.amount}`)
  }

  console.log(`   📊 Created ${sampleData.goals.length} financial goals`)
}

async function main() {
  try {
    console.log('🌱 Starting database seeding...\n')

    // Create test user
    const userId = await seedUser()
    if (!userId) {
      console.log('⏭️  No user to seed data for, exiting...')
      return
    }
    console.log('')

    // Create financial accounts
    const accountIds = await seedFinancialAccounts(userId)
    console.log('')

    // Create categories
    const categoryIds = await seedCategories(userId)
    console.log('')

    // Create debt details
    await seedDebtDetails(accountIds)
    console.log('')

    // Create sample transactions
    await seedTransactions(userId, accountIds, categoryIds)
    console.log('')

    // Create financial goals
    await seedGoals(userId, accountIds)
    console.log('')

    console.log('✅ Database seeding completed successfully!')
    console.log('\n📊 Seeded Data Summary:')
    console.log(`   - 1 test user with authentication`)
    console.log(`   - ${sampleData.accounts.length + sampleData.debts.length} financial accounts (including ${sampleData.debts.length} debt accounts)`)
    console.log(`   - ${sampleData.debts.length} debt details with interest rates and payment schedules`)
    console.log(`   - ${sampleData.transactions.length} sample transactions (including debt payments)`)
    console.log(`   - ${sampleData.goals.length} financial goals`)
    console.log('\n🎉 Ready for development and testing!')

  } catch (error) {
    console.error('\n❌ Database seeding failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()