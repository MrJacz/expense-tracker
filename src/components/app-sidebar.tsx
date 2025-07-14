"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import type { Session } from "next-auth"
import {
  BarChart3,
  Calculator,
  CreditCard,
  Home,
  Receipt,
  Repeat,
  Target,
  TrendingUp,
  Wallet,
  Tags,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import Link from "next/link"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// Financial management navigation data
const getNavData = (session: Session | null) => ({
  user: {
    name: session?.user?.name || "User",
    email: session?.user?.email || "user@example.com",
    avatar: "/avatars/user.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
      isActive: true,
      items: [
        {
          title: "Overview",
          url: "/dashboard",
        },
        {
          title: "Recent Activity",
          url: "/dashboard#recent",
        },
      ],
    },
    {
      title: "Accounts",
      url: "/dashboard/accounts",
      icon: Wallet,
      items: [
        {
          title: "View Accounts",
          url: "/dashboard/accounts",
        },
        {
          title: "Net Worth",
          url: "/dashboard/accounts#net-worth",
        },
      ],
    },
    {
      title: "Transactions",
      url: "/dashboard/transactions",
      icon: Receipt,
      items: [
        {
          title: "View Transactions",
          url: "/dashboard/transactions",
        },
        {
          title: "Add Transaction",
          url: "/dashboard/transactions#add",
        },
        {
          title: "Import Data",
          url: "/dashboard/transactions#import",
        },
      ],
    },
    {
      title: "Categories",
      url: "/dashboard/categories",
      icon: Tags,
      items: [
        {
          title: "View Categories",
          url: "/dashboard/categories",
        },
        {
          title: "Category Analytics",
          url: "/dashboard/categories#analytics",
        },
      ],
    },
    {
      title: "Budgets",
      url: "/dashboard/budgets",
      icon: Target,
      items: [
        {
          title: "View Budgets",
          url: "/dashboard/budgets",
        },
        {
          title: "Budget Progress",
          url: "/dashboard/budgets#progress",
        },
        {
          title: "50/30/20 Analysis",
          url: "/dashboard/budgets#analysis",
        },
      ],
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: BarChart3,
      items: [
        {
          title: "Spending Insights",
          url: "/dashboard/analytics",
        },
        {
          title: "Trends & Patterns",
          url: "/dashboard/analytics#trends",
        },
        {
          title: "Monthly Reports",
          url: "/dashboard/analytics#reports",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Debt Management",
      url: "/dashboard/debts",
      icon: Calculator,
    },
    {
      name: "Recurring Payments",
      url: "/dashboard/recurring-payments",
      icon: Repeat,
    },
    {
      name: "Financial Goals",
      url: "/dashboard/goals",
      icon: TrendingUp,
    },
    {
      name: "Bank Connections",
      url: "/dashboard/settings#banks",
      icon: CreditCard,
    },
  ],
})

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()
  const data = getNavData(session)
  
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2 px-4 py-3 hover:bg-sidebar-accent rounded-md transition-colors">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Wallet className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">ExpenseTracker</span>
            <span className="text-xs text-muted-foreground">Personal Finance</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
