import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils";

interface RecentActivityProps {
  data: {
    id: string;
    customerName: string;
    customerEmail: string;
    amount: number;
    status: string;
    createdAt: Date;
  }[];
  currency?: string;
}

export function RecentActivity({ data, currency = "INR" }: RecentActivityProps) {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Recent Sales</CardTitle>
        <CardDescription>
          You made {data.length} sales recently.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {data.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No recent sales</p>
          ) : (
            data.map((item) => (
              <div key={item.id} className="flex items-center">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>{item.customerName.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">{item.customerName}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.customerEmail}
                  </p>
                </div>
                <div className="ml-auto font-medium">
                  {formatCurrency(item.amount, currency)}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
