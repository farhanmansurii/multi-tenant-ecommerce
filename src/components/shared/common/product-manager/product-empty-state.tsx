"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Plus } from "lucide-react";

interface ProductEmptyStateProps {
  onCreateProduct: () => void;
}

const ProductEmptyState: React.FC<ProductEmptyStateProps> = ({ onCreateProduct }) => (
  <Card>
    <CardContent className="text-center py-12">
      <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-foreground mb-2">No products yet</h3>
      <p className="text-muted-foreground mb-6">Create your first product to start selling.</p>
      <Button onClick={onCreateProduct}>
        <Plus className="h-4 w-4 mr-2" />
        Create First Product
      </Button>
    </CardContent>
  </Card>
);

export default ProductEmptyState;
