"use client";

import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DangerZoneProps {
  onDelete: () => void;
  isDeleting: boolean;
}

export const DangerZone = ({ onDelete, isDeleting }: DangerZoneProps) => (
  <Card className="border-red-200">
    <CardContent>
      <Button
        variant="destructive"
        className="w-full justify-center"
        onClick={onDelete}
        disabled={isDeleting}
      >
        {isDeleting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Deleting Product...
          </>
        ) : (
          <>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Product
          </>
        )}
      </Button>
    </CardContent>
  </Card>
);
