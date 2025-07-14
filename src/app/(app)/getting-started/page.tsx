"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  TrendingUp, 
  Target, 
  CreditCard, 
  PiggyBank,
  Sparkles,
  DollarSign,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingData {
  step: number;
  preferences: {
    currency: string;
    monthlyIncome: string;
    primaryGoals: string[];
  };
  accounts: {
    hasChecking: boolean;
    hasSavings: boolean;
    hasCreditCard: boolean;
    hasInvestments: boolean;
  };
  categories: string[];
  setupComplete: boolean;
}

const CURRENCIES = [
  { value: "AUD", label: "Australian Dollar (AUD)" },
  { value: "USD", label: "US Dollar (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "GBP", label: "British Pound (GBP)" },
];

const FINANCIAL_GOALS = [
  "Track daily expenses",
  "Build an emergency fund", 
  "Pay off debt",
  "Save for a major purchase",
  "Plan for retirement",
  "Improve spending habits"
];

const DEFAULT_CATEGORIES = [
  "Food & Dining",
  "Transportation", 
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Travel",
  "Education",
  "Personal Care",
  "Groceries"
];

export default function GettingStartedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<OnboardingData>({
    step: 1,
    preferences: {
      currency: "AUD",
      monthlyIncome: "",
      primaryGoals: []
    },
    accounts: {
      hasChecking: false,
      hasSavings: false,
      hasCreditCard: false,
      hasInvestments: false
    },
    categories: DEFAULT_CATEGORIES.slice(0, 5),
    setupComplete: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/auth/login");
  }, [session, status, router]);

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (data.step < 4) {
      updateData({ step: data.step + 1 });
    }
  };

  const prevStep = () => {
    if (data.step > 1) {
      updateData({ step: data.step - 1 });
    }
  };

  const toggleGoal = (goal: string) => {
    const currentGoals = data.preferences.primaryGoals;
    const updatedGoals = currentGoals.includes(goal)
      ? currentGoals.filter(g => g !== goal)
      : [...currentGoals, goal];
    
    updateData({
      preferences: {
        ...data.preferences,
        primaryGoals: updatedGoals
      }
    });
  };

  const toggleCategory = (category: string) => {
    const currentCategories = data.categories;
    const updatedCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];
    
    updateData({ categories: updatedCategories });
  };

  const completeSetup = async () => {
    setLoading(true);
    setError("");

    try {
      // Save user preferences
      const response = await fetch("/api/settings/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          defaultCurrency: data.preferences.currency,
          monthlyIncome: parseFloat(data.preferences.monthlyIncome) || null,
          primaryGoals: data.preferences.primaryGoals,
          selectedCategories: data.categories,
          onboardingComplete: true
        })
      });

      if (response.ok) {
        updateData({ setupComplete: true });
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        throw new Error("Failed to save preferences");
      }
    } catch (error) {
      console.error("Setup error:", error);
      setError("Failed to complete setup. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getProgress = () => (data.step / 4) * 100;

  const canProceed = () => {
    switch (data.step) {
      case 1:
        return data.preferences.currency && data.preferences.primaryGoals.length > 0;
      case 2:
        return Object.values(data.accounts).some(Boolean);
      case 3:
        return data.categories.length >= 3;
      case 4:
        return true;
      default:
        return false;
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (data.setupComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All set!</h1>
            <p className="text-gray-600 mt-2">Welcome to your financial journey with ExpenseTracker.</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>Preferences configured</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>Categories selected</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>Ready to track expenses</span>
            </div>
          </div>
          <p className="text-sm text-gray-500">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-blue-600" />
            <h1 className="text-3xl font-bold">Welcome to ExpenseTracker!</h1>
          </div>
          <p className="text-muted-foreground">Let&apos;s get your account set up in just a few quick steps</p>
          <div className="mt-4">
            <Progress value={getProgress()} className="w-full h-2" />
            <p className="text-sm text-muted-foreground mt-2">Step {data.step} of 4</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: Preferences & Goals */}
        {data.step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Tell us about your goals
              </CardTitle>
              <CardDescription>
                This helps us personalize your experience and provide better insights.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currency">Preferred Currency</Label>
                <Select value={data.preferences.currency} onValueChange={(value) => 
                  updateData({ preferences: { ...data.preferences, currency: value } })
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map(currency => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="income">Monthly Income (Optional)</Label>
                <Input
                  id="income"
                  type="number"
                  placeholder="Enter your monthly income"
                  value={data.preferences.monthlyIncome}
                  onChange={(e) => updateData({ 
                    preferences: { ...data.preferences, monthlyIncome: e.target.value }
                  })}
                />
                <p className="text-sm text-muted-foreground">This helps us suggest budget allocations</p>
              </div>

              <div className="space-y-3">
                <Label>Primary Financial Goals (select all that apply)</Label>
                <div className="grid grid-cols-1 gap-2">
                  {FINANCIAL_GOALS.map(goal => (
                    <div key={goal} className="flex items-center space-x-2">
                      <Checkbox
                        id={goal}
                        checked={data.preferences.primaryGoals.includes(goal)}
                        onCheckedChange={() => toggleGoal(goal)}
                      />
                      <Label htmlFor={goal} className="flex-1 cursor-pointer">{goal}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Account Types */}
        {data.step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Account Types
              </CardTitle>
              <CardDescription>
                What types of accounts do you want to track? You can add specific accounts later.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div 
                  className={cn(
                    "p-4 border-2 rounded-lg cursor-pointer transition-all",
                    data.accounts.hasChecking 
                      ? "border-blue-500 bg-blue-50" 
                      : "border-gray-200 hover:border-gray-300"
                  )}
                  onClick={() => updateData({ 
                    accounts: { ...data.accounts, hasChecking: !data.accounts.hasChecking }
                  })}
                >
                  <div className="text-center space-y-2">
                    <DollarSign className="h-8 w-8 mx-auto text-blue-600" />
                    <h3 className="font-medium">Checking Account</h3>
                    <p className="text-sm text-muted-foreground">Daily spending</p>
                  </div>
                </div>

                <div 
                  className={cn(
                    "p-4 border-2 rounded-lg cursor-pointer transition-all",
                    data.accounts.hasSavings 
                      ? "border-green-500 bg-green-50" 
                      : "border-gray-200 hover:border-gray-300"
                  )}
                  onClick={() => updateData({ 
                    accounts: { ...data.accounts, hasSavings: !data.accounts.hasSavings }
                  })}
                >
                  <div className="text-center space-y-2">
                    <PiggyBank className="h-8 w-8 mx-auto text-green-600" />
                    <h3 className="font-medium">Savings Account</h3>
                    <p className="text-sm text-muted-foreground">Emergency fund</p>
                  </div>
                </div>

                <div 
                  className={cn(
                    "p-4 border-2 rounded-lg cursor-pointer transition-all",
                    data.accounts.hasCreditCard 
                      ? "border-purple-500 bg-purple-50" 
                      : "border-gray-200 hover:border-gray-300"
                  )}
                  onClick={() => updateData({ 
                    accounts: { ...data.accounts, hasCreditCard: !data.accounts.hasCreditCard }
                  })}
                >
                  <div className="text-center space-y-2">
                    <CreditCard className="h-8 w-8 mx-auto text-purple-600" />
                    <h3 className="font-medium">Credit Card</h3>
                    <p className="text-sm text-muted-foreground">Track spending</p>
                  </div>
                </div>

                <div 
                  className={cn(
                    "p-4 border-2 rounded-lg cursor-pointer transition-all",
                    data.accounts.hasInvestments 
                      ? "border-orange-500 bg-orange-50" 
                      : "border-gray-200 hover:border-gray-300"
                  )}
                  onClick={() => updateData({ 
                    accounts: { ...data.accounts, hasInvestments: !data.accounts.hasInvestments }
                  })}
                >
                  <div className="text-center space-y-2">
                    <TrendingUp className="h-8 w-8 mx-auto text-orange-600" />
                    <h3 className="font-medium">Investments</h3>
                    <p className="text-sm text-muted-foreground">Long-term wealth</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Categories */}
        {data.step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Expense Categories
              </CardTitle>
              <CardDescription>
                Choose the categories that best match your spending habits. You can customize these later.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Selected: {data.categories.length} categories (minimum 3 recommended)
              </div>
              <div className="grid grid-cols-2 gap-2">
                {DEFAULT_CATEGORIES.map(category => (
                  <Badge
                    key={category}
                    variant={data.categories.includes(category) ? "default" : "outline"}
                    className="cursor-pointer p-2 justify-center"
                    onClick={() => toggleCategory(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Ready to Go */}
        {data.step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                You&apos;re all set!
              </CardTitle>
              <CardDescription>
                Review your setup and start your financial journey.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Currency:</span>
                  <Badge variant="outline">{data.preferences.currency}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Primary Goals:</span>
                  <span className="text-sm text-muted-foreground">
                    {data.preferences.primaryGoals.length} selected
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Account Types:</span>
                  <span className="text-sm text-muted-foreground">
                    {Object.values(data.accounts).filter(Boolean).length} selected
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Categories:</span>
                  <span className="text-sm text-muted-foreground">
                    {data.categories.length} selected
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">What&apos;s next?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Add your first expense or income</li>
                  <li>• Set up your budget (optional)</li>
                  <li>• Connect bank accounts for automatic tracking</li>
                  <li>• Explore your analytics dashboard</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={data.step === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>

          {data.step < 4 ? (
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              className="flex items-center gap-2"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={completeSetup}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? "Setting up..." : "Complete Setup"}
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}