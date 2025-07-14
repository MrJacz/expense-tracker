"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle, 
  Eye,
  Download,
  X,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

interface Account {
  id: string;
  name: string;
  type: string;
}

interface CSVImportDialogProps {
  children: React.ReactNode;
  accounts: Account[];
  onImportComplete: () => void;
}

interface ImportResult {
  success: boolean;
  result?: {
    imported: number;
    total: number;
    errors: string[];
    warnings: string[];
  };
  error?: string;
}

const CSV_PRESETS = {
  default: {
    name: "Default",
    dateFormat: "auto",
    delimiter: ",",
    hasHeader: true,
    columnMapping: {
      date: "Date",
      description: "Description",
      amount: "Amount",
      category: "Category"
    }
  },
  bank_statement: {
    name: "Bank Statement",
    dateFormat: "DD/MM/YYYY",
    delimiter: ",",
    hasHeader: true,
    columnMapping: {
      date: "Date",
      description: "Description",
      amount: "Amount",
      category: ""
    }
  },
  expense_report: {
    name: "Expense Report",
    dateFormat: "YYYY-MM-DD",
    delimiter: ",",
    hasHeader: true,
    columnMapping: {
      date: "Date",
      description: "Description",
      amount: "Amount",
      category: "Category"
    }
  }
};

export function CSVImportDialog({ children, accounts, onImportComplete }: CSVImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'upload' | 'configure' | 'preview' | 'importing' | 'results'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<string>("");
  const [previewData, setPreviewData] = useState<string[][]>([]);
  const [config, setConfig] = useState({
    accountId: "",
    columnMapping: {
      date: "",
      description: "",
      amount: "",
      category: ""
    },
    dateFormat: "auto",
    hasHeader: true,
    delimiter: ","
  });
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        toast.error("Invalid file type. Please select a CSV file");
        return;
      }

      setFile(selectedFile);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setCsvData(text);
        parseCSVPreview(text);
      };
      reader.readAsText(selectedFile);
    }
  };

  const parseCSVPreview = (csvText: string) => {
    const lines = csvText.trim().split('\n');
    const preview = lines.slice(0, 5).map(line => {
      // Simple CSV parsing - could be improved with proper CSV parser
      return line.split(config.delimiter).map(cell => cell.trim().replace(/^"(.*)"$/, '$1'));
    });
    setPreviewData(preview);
  };

  const applyPreset = (presetKey: keyof typeof CSV_PRESETS) => {
    const preset = CSV_PRESETS[presetKey];
    setConfig(prev => ({
      ...prev,
      dateFormat: preset.dateFormat,
      delimiter: preset.delimiter,
      hasHeader: preset.hasHeader,
      columnMapping: preset.columnMapping
    }));
    if (csvData) {
      parseCSVPreview(csvData);
    }
  };

  const handleNext = () => {
    switch (step) {
      case 'upload':
        if (!file || !csvData) {
          toast.error("No file selected. Please select a CSV file first");
          return;
        }
        setStep('configure');
        break;
      case 'configure':
        if (!config.accountId) {
          toast.error("Account required. Please select an account for the import");
          return;
        }
        if (!config.columnMapping.date || !config.columnMapping.description || !config.columnMapping.amount) {
          toast.error("Required columns missing. Please map the date, description, and amount columns");
          return;
        }
        setStep('preview');
        break;
      case 'preview':
        handleImport();
        break;
    }
  };

  const handleImport = async () => {
    if (!csvData || !config.accountId) return;

    setStep('importing');
    setIsImporting(true);
    setImportProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setImportProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/integrations/csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          csvData,
          config
        })
      });

      clearInterval(progressInterval);
      setImportProgress(100);

      const result = await response.json();

      if (response.ok) {
        setImportResult({
          success: true,
          result: result.result
        });
        toast({
          title: "Import successful",
          description: `Imported ${result.result.imported} transactions successfully`
        });
        onImportComplete();
      } else {
        setImportResult({
          success: false,
          error: result.error || "Import failed"
        });
        toast({
          title: "Import failed",
          description: result.error || "An error occurred during import",
          variant: "destructive"
        });
      }
    } catch (error) {
      setImportResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      });
      toast({
        title: "Import failed",
        description: "An error occurred during import",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
      setStep('results');
    }
  };

  const handleClose = () => {
    setOpen(false);
    setStep('upload');
    setFile(null);
    setCsvData("");
    setPreviewData([]);
    setConfig({
      accountId: "",
      columnMapping: {
        date: "",
        description: "",
        amount: "",
        category: ""
      },
      dateFormat: "auto",
      hasHeader: true,
      delimiter: ","
    });
    setImportResult(null);
    setImportProgress(0);
  };

  const getAvailableColumns = () => {
    if (previewData.length === 0) return [];
    const headerRow = config.hasHeader ? previewData[0] : previewData[0].map((_, i) => `Column ${i + 1}`);
    return headerRow;
  };

  const renderUploadStep = () => (
    <div className="space-y-4">
      <div className="text-center">
        <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Upload CSV File</h3>
        <p className="text-muted-foreground mb-4">
          Select a CSV file containing your transaction data
        </p>
      </div>
      
      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
        <div className="text-center">
          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <Label htmlFor="csv-file" className="cursor-pointer">
            <span className="text-sm font-medium">Choose CSV file</span>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </Label>
          <p className="text-xs text-muted-foreground mt-1">
            Supported format: CSV files only
          </p>
        </div>
      </div>

      {file && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            File selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
          </AlertDescription>
        </Alert>
      )}
    </div>
  );

  const renderConfigureStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Configure Import Settings</h3>
        <p className="text-muted-foreground mb-4">
          Map your CSV columns to transaction fields
        </p>
      </div>

      {/* Account Selection */}
      <div>
        <Label htmlFor="account">Import to Account</Label>
        <Select value={config.accountId} onValueChange={(value) => setConfig(prev => ({ ...prev, accountId: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select account" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name} ({account.type})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Quick Presets */}
      <div>
        <Label>Quick Presets</Label>
        <div className="flex gap-2 mt-2">
          {Object.entries(CSV_PRESETS).map(([key, preset]) => (
            <Button
              key={key}
              variant="outline"
              size="sm"
              onClick={() => applyPreset(key as keyof typeof CSV_PRESETS)}
            >
              {preset.name}
            </Button>
          ))}
        </div>
      </div>

      {/* CSV Settings */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="delimiter">Delimiter</Label>
          <Select value={config.delimiter} onValueChange={(value) => setConfig(prev => ({ ...prev, delimiter: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=",">Comma (,)</SelectItem>
              <SelectItem value=";">Semicolon (;)</SelectItem>
              <SelectItem value="\t">Tab</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="dateFormat">Date Format</Label>
          <Select value={config.dateFormat} onValueChange={(value) => setConfig(prev => ({ ...prev, dateFormat: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto-detect</SelectItem>
              <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
              <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
              <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="hasHeader"
          checked={config.hasHeader}
          onCheckedChange={(checked) => setConfig(prev => ({ ...prev, hasHeader: checked as boolean }))}
        />
        <Label htmlFor="hasHeader">First row contains headers</Label>
      </div>

      {/* Column Mapping */}
      <div>
        <Label>Column Mapping</Label>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <Label htmlFor="date-column">Date Column *</Label>
            <Select value={config.columnMapping.date} onValueChange={(value) => setConfig(prev => ({ ...prev, columnMapping: { ...prev.columnMapping, date: value } }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select date column" />
              </SelectTrigger>
              <SelectContent>
                {getAvailableColumns().map((col, index) => (
                  <SelectItem key={index} value={col}>
                    {col}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="description-column">Description Column *</Label>
            <Select value={config.columnMapping.description} onValueChange={(value) => setConfig(prev => ({ ...prev, columnMapping: { ...prev.columnMapping, description: value } }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select description column" />
              </SelectTrigger>
              <SelectContent>
                {getAvailableColumns().map((col, index) => (
                  <SelectItem key={index} value={col}>
                    {col}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="amount-column">Amount Column *</Label>
            <Select value={config.columnMapping.amount} onValueChange={(value) => setConfig(prev => ({ ...prev, columnMapping: { ...prev.columnMapping, amount: value } }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select amount column" />
              </SelectTrigger>
              <SelectContent>
                {getAvailableColumns().map((col, index) => (
                  <SelectItem key={index} value={col}>
                    {col}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="category-column">Category Column (optional)</Label>
            <Select value={config.columnMapping.category} onValueChange={(value) => setConfig(prev => ({ ...prev, columnMapping: { ...prev.columnMapping, category: value } }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select category column" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {getAvailableColumns().map((col, index) => (
                  <SelectItem key={index} value={col}>
                    {col}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Preview */}
      {previewData.length > 0 && (
        <div>
          <Label>Preview</Label>
          <div className="mt-2 rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  {getAvailableColumns().map((col, index) => (
                    <th key={index} className="p-2 text-left font-medium">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.slice(config.hasHeader ? 1 : 0, config.hasHeader ? 4 : 3).map((row, index) => (
                  <tr key={index} className="border-b">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="p-2">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderPreviewStep = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Review Import Settings</h3>
        <p className="text-muted-foreground mb-4">
          Please review your settings before importing
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Account</Label>
            <div className="text-sm font-medium">
              {accounts.find(a => a.id === config.accountId)?.name}
            </div>
          </div>
          <div>
            <Label>File</Label>
            <div className="text-sm font-medium">{file?.name}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Date Format</Label>
            <div className="text-sm font-medium">{config.dateFormat}</div>
          </div>
          <div>
            <Label>Delimiter</Label>
            <div className="text-sm font-medium">
              {config.delimiter === ',' ? 'Comma' : config.delimiter === ';' ? 'Semicolon' : 'Tab'}
            </div>
          </div>
        </div>

        <div>
          <Label>Column Mapping</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="text-sm">
              <span className="font-medium">Date:</span> {config.columnMapping.date}
            </div>
            <div className="text-sm">
              <span className="font-medium">Description:</span> {config.columnMapping.description}
            </div>
            <div className="text-sm">
              <span className="font-medium">Amount:</span> {config.columnMapping.amount}
            </div>
            <div className="text-sm">
              <span className="font-medium">Category:</span> {config.columnMapping.category || 'None'}
            </div>
          </div>
        </div>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          This will import transactions into your account. Duplicate transactions will be skipped.
        </AlertDescription>
      </Alert>
    </div>
  );

  const renderImportingStep = () => (
    <div className="space-y-6 text-center">
      <div>
        <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary mb-4" />
        <h3 className="text-lg font-semibold mb-2">Importing Transactions</h3>
        <p className="text-muted-foreground">
          Please wait while we process your CSV file...
        </p>
      </div>
      
      <div className="space-y-2">
        <Progress value={importProgress} className="w-full" />
        <p className="text-sm text-muted-foreground">
          {importProgress}% complete
        </p>
      </div>
    </div>
  );

  const renderResultsStep = () => (
    <div className="space-y-4">
      <div className="text-center">
        {importResult?.success ? (
          <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
        ) : (
          <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
        )}
        <h3 className="text-lg font-semibold mb-2">
          {importResult?.success ? "Import Successful" : "Import Failed"}
        </h3>
      </div>

      {importResult?.success && importResult.result && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {importResult.result.imported}
              </div>
              <div className="text-sm text-muted-foreground">
                Transactions Imported
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {importResult.result.total}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Processed
              </div>
            </div>
          </div>

          {importResult.result.warnings.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-2">Warnings:</div>
                <ul className="list-disc list-inside space-y-1">
                  {importResult.result.warnings.map((warning, index) => (
                    <li key={index} className="text-sm">{warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {importResult.result.errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-2">Errors:</div>
                <ul className="list-disc list-inside space-y-1">
                  {importResult.result.errors.map((error, index) => (
                    <li key={index} className="text-sm">{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {!importResult?.success && importResult?.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {importResult.error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import CSV Transactions
          </DialogTitle>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center justify-between mb-6">
          {['upload', 'configure', 'preview', 'importing', 'results'].map((stepName, index) => (
            <div key={stepName} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === stepName ? 'bg-primary text-primary-foreground' :
                ['upload', 'configure', 'preview', 'importing', 'results'].indexOf(step) > index ? 'bg-green-500 text-white' :
                'bg-muted text-muted-foreground'
              }`}>
                {index + 1}
              </div>
              {index < 4 && (
                <div className={`w-12 h-0.5 mx-2 ${
                  ['upload', 'configure', 'preview', 'importing', 'results'].indexOf(step) > index ? 'bg-green-500' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        {step === 'upload' && renderUploadStep()}
        {step === 'configure' && renderConfigureStep()}
        {step === 'preview' && renderPreviewStep()}
        {step === 'importing' && renderImportingStep()}
        {step === 'results' && renderResultsStep()}

        {/* Action buttons */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => {
              if (step === 'configure') setStep('upload');
              else if (step === 'preview') setStep('configure');
              else if (step === 'results') handleClose();
            }}
            disabled={step === 'upload' || step === 'importing'}
          >
            {step === 'results' ? 'Close' : 'Back'}
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={step === 'importing' || step === 'results'}
          >
            {step === 'upload' ? 'Next' : 
             step === 'configure' ? 'Next' : 
             step === 'preview' ? 'Import' : 'Next'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}