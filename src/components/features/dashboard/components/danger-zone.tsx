"use client";

import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";


interface DangerZoneProps {
  onDelete: () => void;
  isDeleting: boolean;
}

export const DangerZone = ({ onDelete, isDeleting }: DangerZoneProps) => (
  <Button
    variant="destructive"
    className="justify-center"
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
);
