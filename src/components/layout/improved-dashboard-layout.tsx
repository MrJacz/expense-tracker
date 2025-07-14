"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Home,
  BarChart3,
  CreditCard,
  Settings,
  Plus,
  Search,
  Menu,
  Bell,
  User,
  LogOut,
  ChevronDown,
  TrendingUp,
  Target,
  Calendar,
  Filter,
  Download,
  Upload,
  HelpCircle,
  Keyboard,
  Moon,
  Sun,
  Zap,
  PieChart,
  Wallet,
  Building,
  Receipt,
  Tags,
  Archive,
  Trash2,
  FileText,
  BookOpen,
  DollarSign,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  description?: string;
  shortcut?: string;
}

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  shortcut?: string;
}

export function ImprovedDashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'alert', message: 'You\'re 80% of your monthly budget', time: '2h ago' },
    { id: 2, type: 'success', message: 'Monthly report is ready', time: '1d ago' },
    { id: 3, type: 'info', message: 'New category suggestions available', time: '2d ago' }
  ]);
  const [quickStats, setQuickStats] = useState({
    thisMonth: { amount: 1847.50, change: 12.3, isIncrease: true },
    thisWeek: { amount: 423.80, change: -5.7, isIncrease: false },
    budgetRemaining: { amount: 1152.50, percentage: 62 }
  });

  // Navigation items
  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <Home className="h-4 w-4" />,
      description: "Overview of your expenses",
      shortcut: "D"
    },
    {
      title: "Analytics",
      href: "/analytics", 
      icon: <BarChart3 className="h-4 w-4" />,
      description: "Detailed spending insights",
      shortcut: "A"
    },
    {
      title: "Budget",
      href: "/budget",
      icon: <Target className="h-4 w-4" />,
      description: "Manage your budget goals",
      shortcut: "B"
    },
    {
      title: "Categories",
      href: "/categories",
      icon: <Tags className="h-4 w-4" />,
      description: "Organize your spending",
      shortcut: "C"
    },
    {
      title: "Integrations",
      href: "/integrations",
      icon: <CreditCard className="h-4 w-4" />,
      badge: "1",
      description: "Connect bank accounts",
      shortcut: "I"
    },
    {
      title: "Reports",
      href: "/reports",
      icon: <FileText className="h-4 w-4" />,
      description: "Monthly and custom reports",
      shortcut: "R"
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="h-4 w-4" />,
      description: "Account and preferences",
      shortcut: "S"
    }
  ];

  // Quick actions for command palette
  const quickActions: QuickAction[] = [
    {
      title: "Add Expense",
      description: "Quickly add a new expense",
      icon: <Plus className="h-4 w-4" />,
      action: () => {
        // This would open the expense form
        console.log("Opening expense form");
      },
      shortcut: "E"
    },
    {
      title: "View Analytics",
      description: "Open analytics dashboard",
      icon: <BarChart3 className="h-4 w-4" />,
      action: () => router.push('/analytics'),
      shortcut: "A"
    },
    {
      title: "Export Data",
      description: "Download your expense data",
      icon: <Download className="h-4 w-4" />,
      action: () => {
        // Export functionality
        console.log("Exporting data");
      },
      shortcut: "X"
    },
    {
      title: "Import Transactions",
      description: "Import from CSV or bank",
      icon: <Upload className="h-4 w-4" />,
      action: () => router.push('/import'),
      shortcut: "U"
    }
  ];

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault();
            setCommandOpen(true);
            break;
          case 'e':
            e.preventDefault();
            // Open expense form
            break;
          case 'a':
            e.preventDefault();
            router.push('/analytics');
            break;
          // Add more shortcuts as needed
        }
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [router]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const isCurrentPath = (path: string) => {
    return pathname === path || (path !== '/dashboard' && pathname.startsWith(path));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'alert': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'info': return <Clock className="h-4 w-4 text-blue-500" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
          {/* Mobile menu button */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isCurrentPath(item.href)
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="text-2xl">💰</div>
            <span className="hidden sm:inline text-lg font-bold">ExpenseTracker</span>
          </div>

          {/* Search / Command palette */}
          <div className="flex-1 max-w-md">
            <Popover open={commandOpen} onOpenChange={setCommandOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-muted-foreground"
                >
                  <Search className="h-4 w-4 mr-2" />
                  <span>Search or type a command...</span>
                  <div className="ml-auto flex items-center gap-1">
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                      <span className="text-xs">⌘</span>K
                    </kbd>
                  </div>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="start">
                <Command>
                  <CommandInput placeholder="Type a command or search..." />
                  <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Quick Actions">
                      {quickActions.map((action) => (
                        <CommandItem
                          key={action.title}
                          onSelect={() => {
                            action.action();
                            setCommandOpen(false);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            {action.icon}
                            <div>
                              <div className="font-medium">{action.title}</div>
                              <div className="text-xs text-muted-foreground">
                                {action.description}
                              </div>
                            </div>
                          </div>
                          {action.shortcut && (
                            <CommandShortcut>⌘{action.shortcut}</CommandShortcut>
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Navigation">
                      {navItems.map((item) => (
                        <CommandItem
                          key={item.href}
                          onSelect={() => {
                            router.push(item.href);
                            setCommandOpen(false);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            {item.icon}
                            <div>
                              <div className="font-medium">{item.title}</div>
                              {item.description && (
                                <div className="text-xs text-muted-foreground">
                                  {item.description}
                                </div>
                              )}
                            </div>
                          </div>
                          {item.shortcut && (
                            <CommandShortcut>⌘{item.shortcut}</CommandShortcut>
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Quick Stats */}
          <div className="hidden xl:flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-muted-foreground">This month:</span>
              <span className="font-medium">{formatCurrency(quickStats.thisMonth.amount)}</span>
              <div className={cn(
                "flex items-center gap-1 text-xs",
                quickStats.thisMonth.isIncrease ? "text-red-600" : "text-green-600"
              )}>
                {quickStats.thisMonth.isIncrease ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {Math.abs(quickStats.thisMonth.change)}%
              </div>
            </div>
          </div>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.map((notification) => (
                <DropdownMenuItem key={notification.id} className="p-3">
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-center">
                <Link href="/notifications" className="w-full">
                  View all notifications
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                  <AvatarFallback>{session?.user?.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session?.user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Help</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 h-[calc(100vh-4rem)]">
          <div className="p-4 border-b border-gray-200">
            <div className="space-y-3">
              {/* Quick budget overview */}
              <Card className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Monthly Budget</span>
                  <Target className="h-4 w-4 text-green-600" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Remaining</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(quickStats.budgetRemaining.amount)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${quickStats.budgetRemaining.percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {quickStats.budgetRemaining.percentage}% remaining
                  </div>
                </div>
              </Card>

              {/* Quick add button */}
              <Button className="w-full" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isCurrentPath(item.href)
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                {item.icon}
                <span>{item.title}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            ))}
          </nav>

          {/* Help section */}
          <div className="p-4 border-t border-gray-200">
            <Card className="p-3 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Need Help?</span>
              </div>
              <p className="text-xs text-gray-600 mb-3">
                Check out our guides and tutorials
              </p>
              <Button variant="outline" size="sm" className="w-full">
                <BookOpen className="h-4 w-4 mr-2" />
                View Guides
              </Button>
            </Card>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}