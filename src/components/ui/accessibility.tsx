import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SkipLinkProps {
  targetId: string;
  children: React.ReactNode;
}

export function SkipLink({ targetId, children }: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      {children}
    </a>
  );
}

interface ScreenReaderOnlyProps {
  children: React.ReactNode;
}

export function ScreenReaderOnly({ children }: ScreenReaderOnlyProps) {
  return <span className="sr-only">{children}</span>;
}

interface LiveRegionProps {
  children: React.ReactNode;
  priority?: "polite" | "assertive";
  atomic?: boolean;
}

export function LiveRegion({ children, priority = "polite", atomic = false }: LiveRegionProps) {
  return (
    <div
      aria-live={priority}
      aria-atomic={atomic}
      className="sr-only"
    >
      {children}
    </div>
  );
}

interface FocusTrapProps {
  children: React.ReactNode;
  isActive: boolean;
  onEscape?: () => void;
}

export function FocusTrap({ children, isActive, onEscape }: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLElement | null>(null);
  const lastFocusableRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    firstFocusableRef.current = focusableElements[0] as HTMLElement;
    lastFocusableRef.current = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onEscape) {
        onEscape();
        return;
      }

      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusableRef.current) {
            e.preventDefault();
            lastFocusableRef.current?.focus();
          }
        } else {
          if (document.activeElement === lastFocusableRef.current) {
            e.preventDefault();
            firstFocusableRef.current?.focus();
          }
        }
      }
    };

    // Focus first element
    firstFocusableRef.current?.focus();

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isActive, onEscape]);

  return (
    <div ref={containerRef}>
      {children}
    </div>
  );
}

interface AccessibleButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  ariaLabel?: string;
  ariaDescription?: string;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function AccessibleButton({
  children,
  onClick,
  ariaLabel,
  ariaDescription,
  disabled = false,
  variant = "primary",
  size = "md",
  className
}: AccessibleButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescription}
      className={cn(
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
        variant === "primary" && "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
        variant === "secondary" && "bg-gray-200 hover:bg-gray-300 focus:ring-gray-500",
        variant === "ghost" && "hover:bg-gray-100 focus:ring-gray-500",
        size === "sm" && "px-3 py-1.5 text-sm",
        size === "md" && "px-4 py-2 text-base",
        size === "lg" && "px-6 py-3 text-lg",
        className
      )}
    >
      {children}
    </Button>
  );
}

interface AccessibleFormFieldProps {
  id: string;
  label: string;
  children: React.ReactNode;
  error?: string;
  description?: string;
  required?: boolean;
}

export function AccessibleFormField({
  id,
  label,
  children,
  error,
  description,
  required = false
}: AccessibleFormFieldProps) {
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;

  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>
      
      {description && (
        <p id={descriptionId} className="text-sm text-gray-500">
          {description}
        </p>
      )}
      
      <div
        {...(description && { "aria-describedby": descriptionId })}
        {...(error && { "aria-describedby": errorId })}
      >
        {children}
      </div>
      
      {error && (
        <div
          id={errorId}
          className="text-sm text-red-600 flex items-center gap-1"
          role="alert"
          aria-live="polite"
        >
          <XCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
}

interface AccessibleStatusProps {
  type: "info" | "success" | "warning" | "error";
  title: string;
  message?: string;
  className?: string;
}

export function AccessibleStatus({
  type,
  title,
  message,
  className
}: AccessibleStatusProps) {
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getAlertProps = () => {
    switch (type) {
      case "error":
        return { variant: "destructive" as const, role: "alert" };
      case "warning":
        return { variant: "default" as const, role: "alert" };
      default:
        return { variant: "default" as const, role: "status" };
    }
  };

  return (
    <Alert {...getAlertProps()} className={className}>
      {getIcon()}
      <AlertDescription>
        <div className="font-medium">{title}</div>
        {message && <div className="mt-1">{message}</div>}
      </AlertDescription>
    </Alert>
  );
}

interface KeyboardShortcutProps {
  keys: string[];
  description: string;
  onActivate: () => void;
}

export function useKeyboardShortcut({ keys, description, onActivate }: KeyboardShortcutProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyCombo = keys.join("+").toLowerCase();
      const pressedKeys = [];
      
      if (e.ctrlKey || e.metaKey) pressedKeys.push("ctrl");
      if (e.shiftKey) pressedKeys.push("shift");
      if (e.altKey) pressedKeys.push("alt");
      if (e.key !== "Control" && e.key !== "Shift" && e.key !== "Alt" && e.key !== "Meta") {
        pressedKeys.push(e.key.toLowerCase());
      }
      
      if (pressedKeys.join("+") === keyCombo) {
        e.preventDefault();
        onActivate();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [keys, onActivate]);
}

interface AccessibleTableProps {
  caption: string;
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

export function AccessibleTable({
  caption,
  headers,
  children,
  className
}: AccessibleTableProps) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full border-collapse border border-gray-200">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="bg-gray-50">
            {headers.map((header, index) => (
              <th
                key={index}
                scope="col"
                className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-200"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {children}
        </tbody>
      </table>
    </div>
  );
}