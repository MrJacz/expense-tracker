import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Plus, 
  Filter, 
  BarChart3, 
  Target,
  CheckCircle,
  Sparkles
} from "lucide-react";

interface WelcomeTourProps {
  isVisible: boolean;
  onComplete: () => void;
  onDismiss: () => void;
}

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action?: string;
  highlight?: string;
}

const tourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to ExpenseTracker! 🎉",
    description: "Let's take a quick tour to help you get started with managing your expenses effectively.",
    icon: Sparkles,
    action: "Start Tour"
  },
  {
    id: "dashboard",
    title: "Your Dashboard",
    description: "This is your main hub where you can see expense summaries, trends, and quick stats at a glance.",
    icon: BarChart3,
    highlight: "dashboard-cards"
  },
  {
    id: "add-expense",
    title: "Add New Expenses",
    description: "Click the 'Add Expense' button to quickly record your spending. You can categorize and add notes to each expense.",
    icon: Plus,
    highlight: "add-expense-btn"
  },
  {
    id: "filters",
    title: "Filter & Search",
    description: "Use the filter panel to find specific expenses by date, category, amount, or search terms.",
    icon: Filter,
    highlight: "filter-panel"
  },
  {
    id: "analytics",
    title: "Analytics & Insights",
    description: "Visit the Analytics page to see detailed charts and spending patterns to understand your financial habits.",
    icon: BarChart3,
    highlight: "analytics-nav"
  },
  {
    id: "complete",
    title: "You're All Set! ✨",
    description: "Start by adding your first expense or explore the demo data. You can always revisit this tour from the help menu.",
    icon: CheckCircle,
    action: "Get Started"
  }
];

export function WelcomeTour({ isVisible, onComplete, onDismiss }: WelcomeTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible_, setIsVisible] = useState(isVisible);

  useEffect(() => {
    setIsVisible(isVisible);
  }, [isVisible]);

  const currentTourStep = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    onComplete();
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss();
  };

  if (!isVisible_) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4 shadow-2xl border-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <currentTourStep.icon className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">{currentTourStep.title}</CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    Step {currentStep + 1} of {tourSteps.length}
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Progress value={progress} className="mt-3" />
        </CardHeader>
        
        <CardContent className="pb-6">
          <p className="text-gray-600 mb-6 leading-relaxed">
            {currentTourStep.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  className="flex items-center space-x-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </Button>
              )}
            </div>
            
            <div className="flex space-x-2">
              {currentStep < tourSteps.length - 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDismiss}
                >
                  Skip Tour
                </Button>
              )}
              
              <Button
                onClick={handleNext}
                className="flex items-center space-x-1"
                size="sm"
              >
                <span>
                  {currentTourStep.action || 
                    (currentStep === tourSteps.length - 1 ? "Finish" : "Next")}
                </span>
                {currentStep < tourSteps.length - 1 && (
                  <ChevronRight className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}