import { cn } from "@/lib/utils";
import { LoaderIcon } from "lucide-react";
import type { HTMLAttributes } from "react";

export type LoaderProps = HTMLAttributes<HTMLDivElement> & {
  size?: number;
  text?: string;
};

export const Loader = ({
  className,
  size = 16,
  text = "Loading",
  ...props
}: LoaderProps) => (
  <div
    className={cn(
      "inline-flex items-center justify-center flex-col gap-2  w-full h-full aspect-video",
      className
    )}
    {...props}
  >
    <LoaderIcon className='animate-spin duration-75 ' size={size} />
    {text}
  </div>
);
