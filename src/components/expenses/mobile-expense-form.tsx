"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, 
  Calendar, 
  DollarSign, 
  FileText, 
  Tag, 
  Clock, 
  Check, 
  X, 
  Camera, 
  MapPin,
  Calculator,
  Zap
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Category, Expense, CreateExpenseData } from "@/types/expense";

interface MobileExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateExpenseData) => Promise<void>;
  editingExpense?: Expense | null;
  categories: Category[];
}

interface QuickAmount {
  value: number;
  label: string;
}

const QUICK_AMOUNTS: QuickAmount[] = [
  { value: 5, label: "$5" },
  { value: 10, label: "$10" },
  { value: 15, label: "$15" },
  { value: 25, label: "$25" },
  { value: 50, label: "$50" },
  { value: 100, label: "$100" },
];

const COMMON_DESCRIPTIONS = [
  "Coffee", "Lunch", "Dinner", "Groceries", "Gas", "Uber", 
  "Parking", "Shopping", "Movies", "Drinks", "Snacks", "Fast Food"
];

export function MobileExpenseForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingExpense, 
  categories 
}: MobileExpenseFormProps) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<CreateExpenseData>({
    amount: 0,
    description: "",
    category_id: 0,
    date: format(new Date(), "yyyy-MM-dd"),
    time: format(new Date(), "HH:mm:ss"),
    notes: ""
  });
  const [loading, setLoading] = useState(false);
  const [calculatorMode, setCalculatorMode] = useState(false);
  const [calculatorDisplay, setCalculatorDisplay] = useState("0");

  const steps = [
    { id: 'amount', title: 'Amount', icon: DollarSign },
    { id: 'description', title: 'Description', icon: FileText },
    { id: 'category', title: 'Category', icon: Tag },
    { id: 'details', title: 'Details', icon: Calendar },
    { id: 'review', title: 'Review', icon: Check }
  ];

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      if (editingExpense) {
        setFormData({
          amount: editingExpense.amount,
          description: editingExpense.description,
          category_id: Number(editingExpense.category.id),
          date: editingExpense.date,
          time: editingExpense.time,
          notes: editingExpense.notes || ""
        });
      } else {
        const now = new Date();
        setFormData({
          amount: 0,
          description: "",
          category_id: 0,
          date: format(now, "yyyy-MM-dd"),
          time: format(now, "HH:mm:ss"),
          notes: ""
        });
      }
      setStep(0);
      setCalculatorMode(false);
    }
  }, [isOpen, editingExpense]);

  const handleInputChange = (field: keyof CreateExpenseData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (isFormValid()) {
      setLoading(true);
      try {
        await onSubmit(formData);
        onClose();
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const isFormValid = () => {
    return formData.amount > 0 && 
           formData.description.trim() !== '' && 
           formData.category_id > 0;
  };

  const canProceed = () => {
    switch (step) {
      case 0: return formData.amount > 0;
      case 1: return formData.description.trim() !== '';
      case 2: return formData.category_id > 0;
      default: return true;
    }
  };

  // Calculator functions
  const handleCalculatorInput = (input: string) => {
    if (input === '=') {
      try {
        const result = eval(calculatorDisplay);
        setCalculatorDisplay(result.toString());
        setFormData(prev => ({ ...prev, amount: parseFloat(result) }));
      } catch {
        setCalculatorDisplay("Error");
      }
    } else if (input === 'C') {
      setCalculatorDisplay("0");
    } else if (input === '⌫') {
      setCalculatorDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : "0");
    } else {
      setCalculatorDisplay(prev => prev === "0" ? input : prev + input);
    }
  };

  const renderAmountStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">How much did you spend?</h3>
        <div className="flex items-center justify-center gap-2">
          <span className="text-3xl font-bold text-green-600">$</span>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={formData.amount || ""}
            onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
            className="text-3xl font-bold text-center border-none bg-transparent"
            placeholder="0.00"
            autoFocus
          />
        </div>
      </div>

      {/* Quick Amount Buttons */}
      <div className="grid grid-cols-3 gap-2">
        {QUICK_AMOUNTS.map(amount => (
          <Button
            key={amount.value}
            variant={formData.amount === amount.value ? "default" : "outline"}
            size="sm"
            onClick={() => handleInputChange('amount', amount.value)}
            className="h-12"
          >
            {amount.label}
          </Button>
        ))}
      </div>

      {/* Calculator Toggle */}
      <div className="flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCalculatorMode(!calculatorMode)}
          className="gap-2"
        >
          <Calculator className="h-4 w-4" />
          {calculatorMode ? "Hide Calculator" : "Show Calculator"}
        </Button>
      </div>

      {/* Calculator */}
      {calculatorMode && (
        <Card className="p-4">
          <div className="space-y-3">
            <div className="text-right text-xl font-mono p-2 bg-gray-100 rounded">
              {calculatorDisplay}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {['C', '⌫', '/', '*'].map(btn => (
                <Button
                  key={btn}
                  variant="outline"
                  onClick={() => handleCalculatorInput(btn)}
                  className="h-12"
                >
                  {btn}
                </Button>
              ))}
              {['7', '8', '9', '-'].map(btn => (
                <Button
                  key={btn}
                  variant="outline"
                  onClick={() => handleCalculatorInput(btn)}
                  className="h-12"
                >
                  {btn}
                </Button>
              ))}
              {['4', '5', '6', '+'].map(btn => (
                <Button
                  key={btn}
                  variant="outline"
                  onClick={() => handleCalculatorInput(btn)}
                  className="h-12"
                >
                  {btn}
                </Button>
              ))}
              {['1', '2', '3'].map(btn => (
                <Button
                  key={btn}
                  variant="outline"
                  onClick={() => handleCalculatorInput(btn)}
                  className="h-12"
                >
                  {btn}
                </Button>
              ))}
              <Button
                variant="default"
                onClick={() => handleCalculatorInput('=')}
                className="h-12"
              >
                =
              </Button>
              <Button
                variant="outline"
                onClick={() => handleCalculatorInput('0')}
                className="h-12 col-span-2"
              >
                0
              </Button>
              <Button
                variant="outline"
                onClick={() => handleCalculatorInput('.')}
                className="h-12"
              >
                .
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );

  const renderDescriptionStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">What did you buy?</h3>
        <Input
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="e.g., Coffee and pastry"
          className="text-lg text-center"
          autoFocus
        />
      </div>

      {/* Common Descriptions */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Quick suggestions:</Label>
        <div className="flex flex-wrap gap-2">
          {COMMON_DESCRIPTIONS.map(desc => (
            <Badge
              key={desc}
              variant={formData.description === desc ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => handleInputChange('description', desc)}
            >
              {desc}
            </Badge>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" size="sm" className="gap-2">
          <Camera className="h-4 w-4" />
          Take Photo
        </Button>
        <Button variant="outline" size="sm" className="gap-2">
          <MapPin className="h-4 w-4" />
          Add Location
        </Button>
      </div>
    </div>
  );

  const renderCategoryStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Choose a category</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {categories.map(category => (
          <Button
            key={category.id}
            variant={formData.category_id === Number(category.id) ? "default" : "outline"}
            className="h-16 flex flex-col gap-1"
            onClick={() => handleInputChange('category_id', Number(category.id))}
          >
            <span className="text-lg">{category.icon}</span>
            <span className="text-sm">{category.name}</span>
          </Button>
        ))}
      </div>
    </div>
  );

  const renderDetailsStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">When did this happen?</h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            className="text-lg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="time">Time</Label>
          <Input
            id="time"
            type="time"
            value={formData.time?.slice(0, 5) || ""}
            onChange={(e) => handleInputChange('time', e.target.value + ":00")}
            className="text-lg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea
            id="notes"
            placeholder="Any additional notes..."
            value={formData.notes || ""}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
            className="text-lg"
          />
        </div>
      </div>
    </div>
  );

  const renderReviewStep = () => {
    const selectedCategory = categories.find(c => c.id === formData.category_id);
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Review your expense</h3>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Amount</span>
              <span className="text-2xl font-bold text-green-600">
                ${formData.amount.toFixed(2)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Description</span>
              <span className="font-medium">{formData.description}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Category</span>
              <div className="flex items-center gap-2">
                <span>{selectedCategory?.icon}</span>
                <span className="font-medium">{selectedCategory?.name}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Date</span>
              <span className="font-medium">
                {format(new Date(formData.date), "MMM dd, yyyy")}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Time</span>
              <span className="font-medium">{formData.time?.slice(0, 5)}</span>
            </div>
            
            {formData.notes && (
              <div className="space-y-2">
                <span className="text-gray-600">Notes</span>
                <p className="text-sm text-gray-800">{formData.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (step) {
      case 0: return renderAmountStep();
      case 1: return renderDescriptionStep();
      case 2: return renderCategoryStep();
      case 3: return renderDetailsStep();
      case 4: return renderReviewStep();
      default: return null;
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="h-[85vh]">
        <DrawerHeader className="border-b">
          <DrawerTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {editingExpense ? 'Edit Expense' : 'Add Expense'}
          </DrawerTitle>
          <DrawerDescription>
            Step {step + 1} of {steps.length}
          </DrawerDescription>
        </DrawerHeader>

        {/* Progress bar */}
        <div className="px-4 py-2 border-b">
          <div className="flex items-center justify-between mb-2">
            {steps.map((stepItem, index) => (
              <div
                key={stepItem.id}
                className={cn(
                  "flex items-center gap-2 text-sm",
                  index === step ? "text-blue-600 font-medium" : "text-gray-400"
                )}
              >
                <stepItem.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{stepItem.title}</span>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <ScrollArea className="flex-1 px-4 py-6">
          {renderCurrentStep()}
        </ScrollArea>

        <DrawerFooter className="border-t">
          <div className="flex gap-2">
            {step > 0 && (
              <Button
                variant="outline"
                onClick={prevStep}
                className="flex-1"
              >
                Previous
              </Button>
            )}
            
            {step < steps.length - 1 ? (
              <Button
                onClick={nextStep}
                disabled={!canProceed()}
                className="flex-1"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!isFormValid() || loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Zap className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    {editingExpense ? 'Update' : 'Save'} Expense
                  </>
                )}
              </Button>
            )}
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}