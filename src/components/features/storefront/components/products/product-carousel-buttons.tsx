import { Button } from '@/components/ui/button';
import { useCarousel } from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';

type Props = {
  size?: 'icon' | 'default' | 'sm' | 'lg' | null;
  variant?: 'default' | 'ghost' | 'link' | 'destructive' | 'outline' | 'secondary' | null;
  className?: string | null;
};

const CarouselButtons = (props: Props) => {
  const { size = 'icon', variant = 'ghost', className = '' } = props;
  const { scrollPrev, canScrollPrev, scrollNext, canScrollNext } = useCarousel();
  return (
    <div className={cn('flex', className)}>
      <Button
        disabled={!canScrollPrev}
        onClick={() => scrollPrev()}
        size={size || 'icon'}
        variant={variant}
      >
        <ChevronLeft />
      </Button>
      <Button
        disabled={!canScrollNext}
        onClick={() => scrollNext()}
        size="icon"
        variant="ghost"
      >
        <ChevronRight />
      </Button>
    </div>
  );
};

export const ProductCarouselButtons = CarouselButtons;
