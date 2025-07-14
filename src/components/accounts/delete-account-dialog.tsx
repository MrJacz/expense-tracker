"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Trash2 } from "lucide-react";
import { AccountType, AssetType } from "@prisma/client";

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  account: {
    id: string;
    name: string;
    type: AccountType;
    balance: { toNumber: () => number };
    isAsset: boolean;
    assetType?: AssetType | null;
    apiSource?: string | null;
  } | null;
}

export function DeleteAccountDialog({ open, onOpenChange, onConfirm, account }: DeleteAccountDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!account) return;

    setIsDeleting(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error("Error deleting account:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount);
  };

  const formatAccountType = (type: AccountType) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatAssetType = (type: AssetType) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (!account) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            Delete Account
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This action cannot be undone. This will permanently delete the account and all associated data.
            </AlertDescription>
          </Alert>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Account Name:</span>
              <span>{account.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Type:</span>
              <span>
                {account.isAsset && account.assetType
                  ? formatAssetType(account.assetType)
                  : formatAccountType(account.type)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Current Balance:</span>
              <span className={`font-semibold ${
                account.isAsset || account.balance.toNumber() >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(account.balance.toNumber())}
              </span>
            </div>
            {account.apiSource && (
              <div className="flex justify-between">
                <span className="font-medium">Connected to:</span>
                <span>{account.apiSource}</span>
              </div>
            )}
          </div>

          {account.apiSource && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This account is connected to {account.apiSource}. Deleting it will remove the connection 
                and you may need to reconnect to import future transactions.
              </AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-muted-foreground">
            <p>Before deleting this account, please ensure:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>You have recorded or transferred any important transactions</li>
              <li>You understand this will affect your net worth calculations</li>
              <li>You have backup records if needed for tax purposes</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete Account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}