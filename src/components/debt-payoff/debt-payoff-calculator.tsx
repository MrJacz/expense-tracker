"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calculator, 
  Plus, 
  Trash2, 
  TrendingUp,
  DollarSign,
  Calendar,
  Percent,
  Target,
  AlertCircle,
  CheckCircle,
  Snowflake,
  Mountain
} from "lucide-react";
import { useDebtPayoff } from "@/hooks/use-debt-payoff";
import { DebtPayoffInput, PAYOFF_STRATEGY_CONFIG } from "@/types/debt-payoff";

export function DebtPayoffCalculator() {
  const {
    debts,
    extra_payment,
    comparison,
    isCalculating,
    error,
    setExtraPayment,
    calculatePayoff,
    addDebt,
    updateDebt,
    removeDebt,
    getTotalDebt,
    getTotalMinimumPayments,
    getAverageInterestRate
  } = useDebtPayoff();

  const [newDebt, setNewDebt] = useState({
    name: "",
    current_balance: "",
    interest_rate: "",
    minimum_payment: ""
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount);
  };

  const formatPercentage = (rate: number) => {
    return `${rate.toFixed(2)}%`;
  };

  const handleAddDebt = () => {
    if (!newDebt.name || !newDebt.current_balance || !newDebt.interest_rate || !newDebt.minimum_payment) {
      return;
    }

    addDebt({
      name: newDebt.name,
      current_balance: parseFloat(newDebt.current_balance),
      interest_rate: parseFloat(newDebt.interest_rate),
      minimum_payment: parseFloat(newDebt.minimum_payment)
    });

    setNewDebt({
      name: "",
      current_balance: "",
      interest_rate: "",
      minimum_payment: ""
    });
  };


  const handleCalculate = (strategy: 'snowball' | 'avalanche' | 'comparison' = 'comparison') => {
    calculatePayoff(strategy);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calculator className="h-8 w-8" />
            Debt Payoff Calculator
          </h1>
          <p className="text-muted-foreground mt-2">
            Compare debt payoff strategies and find the best approach for your situation
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Input */}
        <div className="lg:col-span-1 space-y-6">
          {/* Add Debt Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add Debt
              </CardTitle>
              <CardDescription>
                Enter your debt information to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="debt-name">Debt Name</Label>
                <Input
                  id="debt-name"
                  placeholder="e.g., Credit Card, Student Loan"
                  value={newDebt.name}
                  onChange={(e) => setNewDebt(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="current-balance">Current Balance</Label>
                <Input
                  id="current-balance"
                  type="number"
                  placeholder="10000"
                  value={newDebt.current_balance}
                  onChange={(e) => setNewDebt(prev => ({ ...prev, current_balance: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="interest-rate">Interest Rate (%)</Label>
                <Input
                  id="interest-rate"
                  type="number"
                  step="0.01"
                  placeholder="18.5"
                  value={newDebt.interest_rate}
                  onChange={(e) => setNewDebt(prev => ({ ...prev, interest_rate: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="minimum-payment">Minimum Payment</Label>
                <Input
                  id="minimum-payment"
                  type="number"
                  placeholder="250"
                  value={newDebt.minimum_payment}
                  onChange={(e) => setNewDebt(prev => ({ ...prev, minimum_payment: e.target.value }))}
                />
              </div>
              
              <Button onClick={handleAddDebt} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Debt
              </Button>
            </CardContent>
          </Card>

          {/* Current Debts */}
          {debts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Your Debts</CardTitle>
                <CardDescription>
                  {debts.length} debt{debts.length !== 1 ? 's' : ''} • {formatCurrency(getTotalDebt())} total
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {debts.map((debt) => (
                  <div key={debt.debt_id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{debt.name}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDebt(debt.debt_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Balance:</span>
                        <div className="font-medium">{formatCurrency(debt.current_balance)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Rate:</span>
                        <div className="font-medium">{formatPercentage(debt.interest_rate)}</div>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Min Payment:</span>
                        <div className="font-medium">{formatCurrency(debt.minimum_payment)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Extra Payment */}
          {debts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Extra Payment
                </CardTitle>
                <CardDescription>
                  Additional amount to pay beyond minimums
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="extra-payment">Monthly Extra Payment</Label>
                  <Input
                    id="extra-payment"
                    type="number"
                    placeholder="200"
                    value={extra_payment}
                    onChange={(e) => setExtraPayment(parseFloat(e.target.value) || 0)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Total monthly payment: {formatCurrency(getTotalMinimumPayments() + extra_payment)}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Results */}
        <div className="lg:col-span-2 space-y-6">
          {debts.length > 0 && (
            <>
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Total Debt</span>
                    </div>
                    <div className="text-2xl font-bold">{formatCurrency(getTotalDebt())}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Min Payments</span>
                    </div>
                    <div className="text-2xl font-bold">{formatCurrency(getTotalMinimumPayments())}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Percent className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Avg Rate</span>
                    </div>
                    <div className="text-2xl font-bold">{formatPercentage(getAverageInterestRate())}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Extra Payment</span>
                    </div>
                    <div className="text-2xl font-bold">{formatCurrency(extra_payment)}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Calculate Button */}
              <Card>
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-semibold">Ready to see your payoff strategies?</h3>
                    <div className="flex gap-3 justify-center">
                      <Button 
                        onClick={() => handleCalculate('comparison')}
                        disabled={isCalculating}
                        size="lg"
                      >
                        {isCalculating ? (
                          "Calculating..."
                        ) : (
                          <>
                            <Calculator className="h-4 w-4 mr-2" />
                            Compare Strategies
                          </>
                        )}
                      </Button>
                      
                      <Button 
                        variant="outline"
                        onClick={() => handleCalculate('snowball')}
                        disabled={isCalculating}
                      >
                        <Snowflake className="h-4 w-4 mr-2" />
                        Snowball Only
                      </Button>
                      
                      <Button 
                        variant="outline"
                        onClick={() => handleCalculate('avalanche')}
                        disabled={isCalculating}
                      >
                        <Mountain className="h-4 w-4 mr-2" />
                        Avalanche Only
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Results */}
              {comparison && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Strategy Comparison
                    </CardTitle>
                    <CardDescription>
                      Compare different debt payoff approaches
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="overview" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="snowball">Snowball</TabsTrigger>
                        <TabsTrigger value="avalanche">Avalanche</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="overview" className="space-y-4">
                        {/* Recommendation */}
                        <Alert>
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Recommended: {PAYOFF_STRATEGY_CONFIG[comparison.recommended_strategy].name}</strong>
                            <br />
                            {comparison.recommendation_reason}
                          </AlertDescription>
                        </Alert>

                        {/* Comparison Table */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card className={comparison.recommended_strategy === 'snowball' ? 'border-primary' : ''}>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Snowflake className="h-5 w-5" />
                                Debt Snowball
                                {comparison.recommended_strategy === 'snowball' && (
                                  <Badge>Recommended</Badge>
                                )}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <div className="flex justify-between">
                                <span>Total Time:</span>
                                <span className="font-medium">{comparison.strategies.snowball.total_months} months</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Total Interest:</span>
                                <span className="font-medium">{formatCurrency(comparison.strategies.snowball.total_interest_paid)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Total Paid:</span>
                                <span className="font-medium">{formatCurrency(comparison.strategies.snowball.total_amount_paid)}</span>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className={comparison.recommended_strategy === 'avalanche' ? 'border-primary' : ''}>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Mountain className="h-5 w-5" />
                                Debt Avalanche
                                {comparison.recommended_strategy === 'avalanche' && (
                                  <Badge>Recommended</Badge>
                                )}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <div className="flex justify-between">
                                <span>Total Time:</span>
                                <span className="font-medium">{comparison.strategies.avalanche.total_months} months</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Total Interest:</span>
                                <span className="font-medium">{formatCurrency(comparison.strategies.avalanche.total_interest_paid)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Total Paid:</span>
                                <span className="font-medium">{formatCurrency(comparison.strategies.avalanche.total_amount_paid)}</span>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Savings Breakdown */}
                        <Card>
                          <CardHeader>
                            <CardTitle>Potential Savings vs. Minimum Payments</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <h4 className="font-medium">With Snowball Strategy:</h4>
                                <div className="text-sm space-y-1">
                                  <div className="flex justify-between">
                                    <span>Time Saved:</span>
                                    <span>{comparison.strategies.snowball.savings_vs_minimum.months_saved} months</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Interest Saved:</span>
                                    <span className="text-green-600">
                                      {formatCurrency(comparison.strategies.snowball.savings_vs_minimum.interest_saved)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <h4 className="font-medium">With Avalanche Strategy:</h4>
                                <div className="text-sm space-y-1">
                                  <div className="flex justify-between">
                                    <span>Time Saved:</span>
                                    <span>{comparison.strategies.avalanche.savings_vs_minimum.months_saved} months</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Interest Saved:</span>
                                    <span className="text-green-600">
                                      {formatCurrency(comparison.strategies.avalanche.savings_vs_minimum.interest_saved)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                      
                      <TabsContent value="snowball" className="space-y-4">
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-lg font-semibold mb-2">Snowball Strategy Details</h3>
                            <p className="text-muted-foreground">
                              {PAYOFF_STRATEGY_CONFIG.snowball.description}
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-green-600">Pros:</h4>
                              <ul className="text-sm space-y-1 mt-1">
                                {PAYOFF_STRATEGY_CONFIG.snowball.pros.map((pro, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <CheckCircle className="h-3 w-3 mt-1 text-green-600" />
                                    {pro}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-red-600">Cons:</h4>
                              <ul className="text-sm space-y-1 mt-1">
                                {PAYOFF_STRATEGY_CONFIG.snowball.cons.map((con, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <AlertCircle className="h-3 w-3 mt-1 text-red-600" />
                                    {con}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <Card>
                            <CardHeader>
                              <CardTitle>Payoff Order</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                {comparison.strategies.snowball.debt_payoff_order.map((debtId, index) => {
                                  const debt = debts.find(d => d.debt_id === debtId);
                                  return debt ? (
                                    <div key={debtId} className="flex items-center justify-between p-2 border rounded">
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline">{index + 1}</Badge>
                                        <span>{debt.name}</span>
                                      </div>
                                      <span className="text-sm text-muted-foreground">
                                        {formatCurrency(debt.current_balance)}
                                      </span>
                                    </div>
                                  ) : null;
                                })}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="avalanche" className="space-y-4">
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-lg font-semibold mb-2">Avalanche Strategy Details</h3>
                            <p className="text-muted-foreground">
                              {PAYOFF_STRATEGY_CONFIG.avalanche.description}
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-green-600">Pros:</h4>
                              <ul className="text-sm space-y-1 mt-1">
                                {PAYOFF_STRATEGY_CONFIG.avalanche.pros.map((pro, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <CheckCircle className="h-3 w-3 mt-1 text-green-600" />
                                    {pro}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-red-600">Cons:</h4>
                              <ul className="text-sm space-y-1 mt-1">
                                {PAYOFF_STRATEGY_CONFIG.avalanche.cons.map((con, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <AlertCircle className="h-3 w-3 mt-1 text-red-600" />
                                    {con}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <Card>
                            <CardHeader>
                              <CardTitle>Payoff Order</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                {comparison.strategies.avalanche.debt_payoff_order.map((debtId, index) => {
                                  const debt = debts.find(d => d.debt_id === debtId);
                                  return debt ? (
                                    <div key={debtId} className="flex items-center justify-between p-2 border rounded">
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline">{index + 1}</Badge>
                                        <span>{debt.name}</span>
                                      </div>
                                      <div className="text-right text-sm">
                                        <div>{formatPercentage(debt.interest_rate)}</div>
                                        <div className="text-muted-foreground">
                                          {formatCurrency(debt.current_balance)}
                                        </div>
                                      </div>
                                    </div>
                                  ) : null;
                                })}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Empty State */}
          {debts.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Debts Added Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add your debts to get started with payoff calculations
                </p>
                <p className="text-sm text-muted-foreground">
                  You&apos;ll be able to compare snowball vs. avalanche strategies and see exactly 
                  how much time and money you can save with extra payments.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}