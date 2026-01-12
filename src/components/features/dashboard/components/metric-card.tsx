import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  description?: string;
  className?: string;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
  className,
}: MetricCardProps) {
  const isPositive = trend?.startsWith('+');
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          {trend && (
            <div className={cn(
              "flex items-center",
              isPositive ? "text-green-600" : "text-red-600"
            )}>
              <TrendIcon className="h-3 w-3 mr-1" />
              {trend}
            </div>
          )}
          {description && (
            <span>{description}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
