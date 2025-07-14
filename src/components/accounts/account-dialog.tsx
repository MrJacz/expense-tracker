"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { AccountType, AssetType } from "@prisma/client";

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => void;
  title: string;
  account?: {
    id: string;
    name: string;
    type: AccountType;
    balance: { toNumber: () => number };
    isAsset: boolean;
    assetType?: AssetType | null;
    apiSource?: string | null;
    apiIdentifier?: string | null;
  } | null;
}

export function AccountDialog({ open, onOpenChange, onSave, title, account }: AccountDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    type: AccountType.checking,
    balance: "0",
    isAsset: false,
    assetType: undefined as AssetType | undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name,
        type: account.type,
        balance: account.balance.toNumber().toString(),
        isAsset: account.isAsset,
        assetType: account.assetType || undefined,
      });
    } else {
      setFormData({
        name: "",
        type: AccountType.checking,
        balance: "0",
        isAsset: false,
        assetType: undefined,
      });
    }
    setErrors({});
  }, [account, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Account name is required";
    }

    if (!formData.type) {
      newErrors.type = "Account type is required";
    }

    const balanceNumber = parseFloat(formData.balance);
    if (isNaN(balanceNumber)) {
      newErrors.balance = "Balance must be a valid number";
    }

    if (formData.isAsset && !formData.assetType) {
      newErrors.assetType = "Asset type is required for assets";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        name: formData.name.trim(),
        type: formData.type,
        balance: parseFloat(formData.balance),
        isAsset: formData.isAsset,
        assetType: formData.isAsset ? formData.assetType : null,
      });
    } catch (error) {
      console.error("Error saving account:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTypeChange = (type: AccountType) => {
    setFormData(prev => ({
      ...prev,
      type,
      // Reset asset fields when switching to non-asset account types
      isAsset: type === AccountType.investment || type === AccountType.superannuation || prev.isAsset,
      assetType: type === AccountType.investment || type === AccountType.superannuation 
        ? (prev.assetType || AssetType.investment) 
        : prev.assetType,
    }));
  };

  const formatAccountType = (type: AccountType) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatAssetType = (type: AssetType) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Account Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Account Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Everyday Account"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.name}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Account Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Account Type</Label>
            <Select value={formData.type} onValueChange={handleTypeChange}>
              <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(AccountType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {formatAccountType(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.type}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Balance */}
          <div className="space-y-2">
            <Label htmlFor="balance">Current Balance</Label>
            <Input
              id="balance"
              type="number"
              step="0.01"
              value={formData.balance}
              onChange={(e) => setFormData(prev => ({ ...prev, balance: e.target.value }))}
              placeholder="0.00"
              className={errors.balance ? "border-red-500" : ""}
            />
            {errors.balance && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.balance}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Asset Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="isAsset"
              checked={formData.isAsset}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isAsset: checked }))}
            />
            <Label htmlFor="isAsset">This is an asset (counts toward net worth)</Label>
          </div>

          {/* Asset Type (conditional) */}
          {formData.isAsset && (
            <div className="space-y-2">
              <Label htmlFor="assetType">Asset Type</Label>
              <Select 
                value={formData.assetType} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, assetType: value as AssetType }))}
              >
                <SelectTrigger className={errors.assetType ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select asset type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(AssetType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {formatAssetType(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.assetType && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.assetType}</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* API Source info (for existing accounts) */}
          {account?.apiSource && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                This account is connected to {account.apiSource}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}