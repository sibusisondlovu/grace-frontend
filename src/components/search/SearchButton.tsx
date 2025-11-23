import { useState } from "react";
import { Search, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlobalSearch } from "./GlobalSearch";
import { cn } from "@/lib/utils";

interface SearchButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showText?: boolean;
  showShortcut?: boolean;
}

export function SearchButton({ 
  variant = "outline", 
  size = "default",
  className,
  showText = true,
  showShortcut = true
}: SearchButtonProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Global keyboard shortcut
  useState(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={cn(
          "relative",
          !showText && "w-10 h-10 p-0",
          className
        )}
        onClick={() => setIsSearchOpen(true)}
      >
        <Search className="h-4 w-4" />
        {showText && <span className="ml-2">Search</span>}
        {showShortcut && showText && (
          <div className="ml-auto flex items-center space-x-1 text-xs text-muted-foreground">
            <Command className="h-3 w-3" />
            <span>K</span>
          </div>
        )}
      </Button>

      <GlobalSearch 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </>
  );
}