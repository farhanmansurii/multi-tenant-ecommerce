import React from "react";
import { Heart } from "lucide-react";

export const DashboardFooter = () => {
  return (
    <footer className="mt-auto py-6 border-t border-border/40 bg-background/50 backdrop-blur-sm">
      <div className="w-full px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <span>© {new Date().getFullYear()} Sell Your Stuff. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-foreground transition-colors">Terms</a>
            <a href="/help" className="hover:text-foreground transition-colors">Help</a>
            <div className="flex items-center gap-1 ml-2">
              <span>Made with</span>
              <Heart className="h-3 w-3 text-red-500 fill-red-500" />
              <span>by the Team</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
