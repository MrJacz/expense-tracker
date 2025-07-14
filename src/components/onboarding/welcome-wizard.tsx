"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Sparkles, 
  Target,
  CreditCard,
  BarChart3,
  Shield,
  Plus,
  Zap
} from "lucide-react";
import { CreateExpenseData } from "@/types/expense";

interface WelcomeWizardProps {
  isOpen: boolean;
  onComplete: () => void;
  categories: any[];
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

export function WelcomeWizard({ isOpen, onComplete, categories }: WelcomeWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [preferences, setPreferences] = useState({
    budgetGoal: "",
    preferredCategories: [] as string[],
    notificationSettings: {
      budgetAlerts: true,
      weeklyReports: true,
      monthlyReports: true,
    },
    currency: "USD",
    sampleExpense: {
      amount: 12.50,
      description: "Coffee and pastry",
      category_id: 1,
      date: new Date().toISOString().split('T')[0],
      time: "09:30:00"
    }
  });

  const router = useRouter();

  const steps: OnboardingStep[] = [
    {
      id: "welcome",
      title: "Welcome to ExpenseTracker!",
      description: "Let's get you set up in just a few minutes",
      icon: <Sparkles className="h-8 w-8 text-blue-500" />,
      component: <WelcomeStep />
    },
    {
      id: "budget",
      title: "Set Your Budget Goal",
      description: "Help us help you stay on track",
      icon: <Target className="h-8 w-8 text-green-500" />,
      component: <BudgetStep />
    },
    {
      id: "categories",
      title: "Choose Your Categories",
      description: "Select the categories you use most",
      icon: <BarChart3 className="h-8 w-8 text-purple-500" />,
      component: <CategoriesStep />
    },
    {
      id: "sample",
      title: "Add Your First Expense",
      description: "Let's try adding an expense together",
      icon: <Plus className="h-8 w-8 text-orange-500" />,
      component: <SampleExpenseStep />
    },
    {
      id: "integrations",
      title: "Connect Your Bank",
      description: "Automatically import transactions (optional)",
      icon: <CreditCard className="h-8 w-8 text-indigo-500" />,
      component: <IntegrationsStep />
    },
    {
      id: "notifications",
      title: "Notification Preferences",
      description: "Stay informed about your spending",
      icon: <Shield className="h-8 w-8 text-teal-500" />,
      component: <NotificationsStep />
    },
    {
      id: "complete",
      title: "You're All Set!",
      description: "Start tracking your expenses",
      icon: <Check className="h-8 w-8 text-green-600" />,
      component: <CompletionStep />
    }
  ];

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps([...completedSteps, currentStepData.id]);
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      // Save preferences
      await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budgetGoal: preferences.budgetGoal,
          preferredCategories: preferences.preferredCategories,
          notificationSettings: preferences.notificationSettings,
          currency: preferences.currency,
          onboardingCompleted: true
        })
      });

      // If they added a sample expense, save it
      if (preferences.sampleExpense.amount > 0) {
        await fetch('/api/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(preferences.sampleExpense)
        });
      }

      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  function WelcomeStep() {
    return (
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <div className="text-6xl">🎉</div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Welcome to your financial journey!</h2>
            <p className="text-gray-600">
              ExpenseTracker will help you understand your spending patterns, 
              set budgets, and achieve your financial goals.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 text-left">
          <div className="p-4 bg-blue-50 rounded-lg">
            <BarChart3 className="h-8 w-8 text-blue-600 mb-2" />
            <h3 className="font-semibold">Smart Analytics</h3>
            <p className="text-sm text-gray-600">Beautiful charts and insights</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <Target className="h-8 w-8 text-green-600 mb-2" />
            <h3 className="font-semibold">Budget Goals</h3>
            <p className="text-sm text-gray-600">Stay on track with alerts</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <Zap className="h-8 w-8 text-purple-600 mb-2" />
            <h3 className="font-semibold">Bank Integration</h3>
            <p className="text-sm text-gray-600">Automatic transaction import</p>
          </div>
        </div>

        <p className="text-sm text-gray-500">
          This setup will take about 3 minutes. You can skip any step and configure later.
        </p>
      </div>
    );
  }

  function BudgetStep() {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <Target className="h-12 w-12 text-green-500 mx-auto" />
          <h3 className="text-lg font-semibold">What's your monthly budget goal?</h3>
          <p className="text-gray-600">This helps us provide personalized insights and alerts</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="budget">Monthly Budget (USD)</Label>
            <Input
              id="budget"
              type="number"
              placeholder="e.g., 2500"
              value={preferences.budgetGoal}
              onChange={(e) => setPreferences({...preferences, budgetGoal: e.target.value})}
              className="text-lg"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[1000, 2500, 5000].map(amount => (
              <Button
                key={amount}
                variant="outline"
                onClick={() => setPreferences({...preferences, budgetGoal: amount.toString()})}
                className="text-sm"
              >
                ${amount}
              </Button>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900">💡 Pro Tip</h4>
          <p className="text-sm text-blue-800">
            Start with your current spending level, then gradually reduce it. 
            You can always adjust this later in settings.
          </p>
        </div>
      </div>
    );
  }

  function CategoriesStep() {
    const handleCategoryToggle = (categoryId: string) => {
      const newSelected = preferences.preferredCategories.includes(categoryId)
        ? preferences.preferredCategories.filter(id => id !== categoryId)
        : [...preferences.preferredCategories, categoryId];
      
      setPreferences({...preferences, preferredCategories: newSelected});
    };

    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <BarChart3 className="h-12 w-12 text-purple-500 mx-auto" />
          <h3 className="text-lg font-semibold">Choose your main spending categories</h3>
          <p className="text-gray-600">Select the categories you use most often</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {categories.slice(0, 12).map(category => (
            <div
              key={category.id}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                preferences.preferredCategories.includes(category.id.toString())
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleCategoryToggle(category.id.toString())}
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">{category.icon}</span>
                <span className="text-sm font-medium">{category.name}</span>
              </div>
              {preferences.preferredCategories.includes(category.id.toString()) && (
                <Check className="h-4 w-4 text-blue-600 mt-1" />
              )}
            </div>
          ))}
        </div>

        <p className="text-sm text-gray-500 text-center">
          Selected: {preferences.preferredCategories.length} categories
        </p>
      </div>
    );
  }

  function SampleExpenseStep() {
    const handleSampleExpenseChange = (field: keyof CreateExpenseData, value: any) => {
      setPreferences({
        ...preferences,
        sampleExpense: {
          ...preferences.sampleExpense,
          [field]: value
        }
      });
    };

    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <Plus className="h-12 w-12 text-orange-500 mx-auto" />
          <h3 className="text-lg font-semibold">Let's add your first expense</h3>
          <p className="text-gray-600">Practice with a sample expense to get familiar</p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={preferences.sampleExpense.amount}
                onChange={(e) => handleSampleExpenseChange('amount', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={preferences.sampleExpense.category_id?.toString()}
                onValueChange={(value) => handleSampleExpenseChange('category_id', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      <div className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="What did you spend on?"
              value={preferences.sampleExpense.description}
              onChange={(e) => handleSampleExpenseChange('description', e.target.value)}
            />
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold text-green-900">✨ Great!</h4>
          <p className="text-sm text-green-800">
            This expense will be saved to your account. You can edit or delete it later.
          </p>
        </div>
      </div>
    );
  }

  function IntegrationsStep() {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <CreditCard className="h-12 w-12 text-indigo-500 mx-auto" />
          <h3 className="text-lg font-semibold">Connect your bank account</h3>
          <p className="text-gray-600">Automatically import transactions to save time</p>
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-orange-600 font-bold">UP</span>
                </div>
                <div>
                  <h4 className="font-semibold">UP Bank</h4>
                  <p className="text-sm text-gray-600">Automatic transaction import</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Connect
              </Button>
            </div>
          </Card>

          <div className="text-center">
            <Button variant="ghost" size="sm">
              Skip for now - I'll add manually
            </Button>
          </div>
        </div>

        <div className="bg-indigo-50 p-4 rounded-lg">
          <h4 className="font-semibold text-indigo-900">🔒 Security</h4>
          <p className="text-sm text-indigo-800">
            We use bank-level security and read-only access. We never store your banking credentials.
          </p>
        </div>
      </div>
    );
  }

  function NotificationsStep() {
    const toggleNotification = (key: keyof typeof preferences.notificationSettings) => {
      setPreferences({
        ...preferences,
        notificationSettings: {
          ...preferences.notificationSettings,
          [key]: !preferences.notificationSettings[key]
        }
      });
    };

    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <Shield className="h-12 w-12 text-teal-500 mx-auto" />
          <h3 className="text-lg font-semibold">Stay informed</h3>
          <p className="text-gray-600">Choose when you'd like to receive notifications</p>
        </div>

        <div className="space-y-4">
          {[
            { key: 'budgetAlerts', label: 'Budget Alerts', description: 'When you\'re close to your budget limit' },
            { key: 'weeklyReports', label: 'Weekly Reports', description: 'Summary of your spending each week' },
            { key: 'monthlyReports', label: 'Monthly Reports', description: 'Detailed monthly analysis' }
          ].map(notification => (
            <div key={notification.key} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-semibold">{notification.label}</h4>
                <p className="text-sm text-gray-600">{notification.description}</p>
              </div>
              <Checkbox
                checked={preferences.notificationSettings[notification.key as keyof typeof preferences.notificationSettings]}
                onCheckedChange={() => toggleNotification(notification.key as keyof typeof preferences.notificationSettings)}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  function CompletionStep() {
    return (
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <div className="text-6xl">🎉</div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">You're all set!</h2>
            <p className="text-gray-600">
              Your ExpenseTracker account is ready. Here's what you can do next:
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 text-left">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <Plus className="h-8 w-8 text-blue-600 mb-2" />
            <h3 className="font-semibold">Add More Expenses</h3>
            <p className="text-sm text-gray-600">Start tracking your daily spending</p>
          </div>
          <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg">
            <BarChart3 className="h-8 w-8 text-green-600 mb-2" />
            <h3 className="font-semibold">View Analytics</h3>
            <p className="text-sm text-gray-600">See your spending patterns</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg">
          <p className="text-sm">
            💡 <strong>Pro tip:</strong> Add expenses as they happen for the most accurate insights!
          </p>
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              {currentStepData.icon}
              <div>
                <h1 className="text-xl font-bold">{currentStepData.title}</h1>
                <p className="text-gray-600">{currentStepData.description}</p>
              </div>
            </div>
            <Badge variant="secondary" className="ml-auto">
              {currentStep + 1} of {steps.length}
            </Badge>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Content */}
          <div className="mb-8">
            {currentStepData.component}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentStep === steps.length - 1 ? (
              <Button onClick={handleComplete} className="bg-gradient-to-r from-blue-500 to-purple-600">
                Get Started
                <Sparkles className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={nextStep}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>

          {/* Skip option */}
          {currentStep > 0 && currentStep < steps.length - 1 && (
            <div className="text-center mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep(steps.length - 1)}
              >
                Skip to finish
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}