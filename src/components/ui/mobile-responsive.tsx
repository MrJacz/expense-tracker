import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Menu, X, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export function MobileMenu({ isOpen, onToggle, children }: MobileMenuProps) {
  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        className="md:hidden"
        onClick={onToggle}
        aria-label="Toggle mobile menu"
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Mobile menu content */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-80 bg-white border-l shadow-lg z-50 transition-transform duration-300 md:hidden",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Menu</h2>
            <Button variant="ghost" size="sm" onClick={onToggle}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          {children}
        </div>
      </div>
    </>
  );
}

interface CollapsibleCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  badge?: string;
}

export function CollapsibleCard({
  title,
  description,
  children,
  defaultExpanded = true,
  badge
}: CollapsibleCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <Card className="touch-manipulation">
      <CardHeader className="pb-3">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">{title}</CardTitle>
              {badge && (
                <Badge variant="secondary" className="text-xs">
                  {badge}
                </Badge>
              )}
            </div>
            {description && (
              <CardDescription className="text-sm mt-1">
                {description}
              </CardDescription>
            )}
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          {children}
        </CardContent>
      )}
    </Card>
  );
}

interface MobileActionButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  className?: string;
}

export function MobileActionButton({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  className
}: MobileActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-12 text-base font-medium touch-manipulation",
        variant === "primary" && "bg-blue-600 hover:bg-blue-700",
        variant === "secondary" && "bg-gray-100 hover:bg-gray-200 text-gray-900",
        className
      )}
    >
      {children}
    </Button>
  );
}

interface MobileStatsGridProps {
  children: React.ReactNode;
}

export function MobileStatsGrid({ children }: MobileStatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-4">
      {children}
    </div>
  );
}

interface MobileStatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export function MobileStatCard({
  title,
  value,
  subtitle,
  icon,
  trend
}: MobileStatCardProps) {
  return (
    <Card className="touch-manipulation">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-medium text-gray-600 truncate">
            {title}
          </div>
          {icon && <div className="flex-shrink-0">{icon}</div>}
        </div>
        <div className="text-lg font-bold text-gray-900 mb-1">
          {value}
        </div>
        {subtitle && (
          <div className="text-xs text-gray-500">
            {subtitle}
          </div>
        )}
        {trend && (
          <div className={cn(
            "text-xs font-medium mt-1",
            trend.isPositive ? "text-green-600" : "text-red-600"
          )}>
            {trend.value}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface SwipeToActionProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: {
    label: string;
    color: string;
    icon: React.ReactNode;
  };
  rightAction?: {
    label: string;
    color: string;
    icon: React.ReactNode;
  };
}

export function SwipeToAction({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction
}: SwipeToActionProps) {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isSwipeActive, setIsSwipeActive] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsSwipeActive(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwipeActive) return;
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!isSwipeActive) return;
    
    const diffX = currentX - startX;
    const threshold = 100;

    if (diffX > threshold && onSwipeRight) {
      onSwipeRight();
    } else if (diffX < -threshold && onSwipeLeft) {
      onSwipeLeft();
    }

    setIsSwipeActive(false);
    setCurrentX(0);
    setStartX(0);
  };

  const swipeOffset = isSwipeActive ? currentX - startX : 0;

  return (
    <div className="relative overflow-hidden">
      {/* Background actions */}
      {leftAction && (
        <div className="absolute left-0 top-0 h-full w-24 bg-red-500 flex items-center justify-center">
          <div className="text-white">
            {leftAction.icon}
          </div>
        </div>
      )}
      {rightAction && (
        <div className="absolute right-0 top-0 h-full w-24 bg-green-500 flex items-center justify-center">
          <div className="text-white">
            {rightAction.icon}
          </div>
        </div>
      )}

      {/* Main content */}
      <div
        className="transition-transform duration-200 ease-out"
        style={{
          transform: `translateX(${Math.max(-100, Math.min(100, swipeOffset))}px)`
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}