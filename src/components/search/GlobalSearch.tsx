import { useState, useEffect, useRef } from "react";
import { Search, Clock, Filter, X, FileText, Users, Calendar, CheckSquare, Building2, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGlobalSearch, useRecentSearches, type SearchResult } from "@/hooks/useGlobalSearch";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  
  const { data: results = [], isLoading } = useGlobalSearch(query, {
    types: selectedTypes.length > 0 ? selectedTypes : undefined
  });
  
  const { getRecentSearches, addRecentSearch, clearRecentSearches } = useRecentSearches();
  const recentSearches = getRecentSearches();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'meeting': return Calendar;
      case 'committee': return Building2;
      case 'action': return CheckSquare;
      case 'member': return Users;
      case 'document': return File;
      default: return FileText;
    }
  };

  const getTypeColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'meeting': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'committee': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'action': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'member': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'document': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const handleResultClick = (result: SearchResult) => {
    addRecentSearch(query);
    navigate(result.url);
    onClose();
  };

  const handleRecentSearchClick = (recentQuery: string) => {
    setQuery(recentQuery);
    addRecentSearch(recentQuery);
  };

  const handleTypeFilterChange = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed inset-x-4 top-4 mx-auto max-w-2xl">
        <Card className="shadow-lg border-2">
          <CardContent className="p-0">
            {/* Search Input */}
            <div className="flex items-center p-4 border-b">
              <Search className="h-5 w-5 text-muted-foreground mr-3" />
              <Input
                ref={inputRef}
                type="text"
                placeholder="Search meetings, committees, actions, members..."
                className="border-0 bg-transparent text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="flex items-center space-x-2 ml-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn("h-8 px-2", showFilters && "bg-muted")}
                >
                  <Filter className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="p-4 border-b bg-muted/50">
                <div className="space-y-3">
                  <div className="text-sm font-medium">Filter by type:</div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'meeting', label: 'Meetings', icon: Calendar },
                      { id: 'committee', label: 'Committees', icon: Building2 },
                      { id: 'action', label: 'Actions', icon: CheckSquare },
                      { id: 'member', label: 'Members', icon: Users },
                      { id: 'document', label: 'Documents', icon: File },
                    ].map(({ id, label, icon: Icon }) => (
                      <Button
                        key={id}
                        variant={selectedTypes.includes(id) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleTypeFilterChange(id)}
                        className="h-8 text-xs"
                      >
                        <Icon className="h-3 w-3 mr-1" />
                        {label}
                      </Button>
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      {selectedTypes.length > 0 ? `${selectedTypes.length} filter(s) active` : 'All types'}
                    </span>
                    {selectedTypes.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTypes([])}
                        className="h-6 text-xs"
                      >
                        Clear filters
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Search Results */}
            <div className="max-h-96 overflow-y-auto">
              {query.length >= 2 ? (
                <>
                  {isLoading ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <Search className="h-8 w-8 mx-auto mb-2 animate-pulse" />
                      <div>Searching...</div>
                    </div>
                  ) : results.length > 0 ? (
                    <div className="p-2">
                      {results.map((result, index) => {
                        const Icon = getTypeIcon(result.type);
                        return (
                          <div
                            key={`${result.type}-${result.id}`}
                            className="p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                            onClick={() => handleResultClick(result)}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 mt-1">
                                <Icon className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h4 className="text-sm font-medium truncate">{result.title}</h4>
                                  <Badge variant="outline" className={cn("text-xs", getTypeColor(result.type))}>
                                    {result.type}
                                  </Badge>
                                </div>
                                {result.description && (
                                  <p className="text-xs text-muted-foreground truncate">
                                    {result.description}
                                  </p>
                                )}
                                {result.metadata && (
                                  <div className="flex items-center space-x-2 mt-1">
                                    {result.metadata.status && (
                                      <Badge variant="outline" className="text-xs">
                                        {result.metadata.status}
                                      </Badge>
                                    )}
                                    {result.metadata.date && (
                                      <span className="text-xs text-muted-foreground">
                                        {new Date(result.metadata.date).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      <Search className="h-8 w-8 mx-auto mb-2" />
                      <div>No results found for "{query}"</div>
                      <div className="text-xs mt-1">Try adjusting your search terms or filters</div>
                    </div>
                  )}
                </>
              ) : (
                // Recent searches and suggestions
                <div className="p-4">
                  {recentSearches.length > 0 && (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Recent searches</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearRecentSearches}
                          className="h-6 text-xs"
                        >
                          Clear
                        </Button>
                      </div>
                      <div className="space-y-1 mb-4">
                        {recentSearches.slice(0, 5).map((recent, index) => (
                          <div
                            key={index}
                            className="p-2 rounded hover:bg-muted cursor-pointer text-sm"
                            onClick={() => handleRecentSearchClick(recent)}
                          >
                            {recent}
                          </div>
                        ))}
                      </div>
                      <Separator />
                    </>
                  )}
                  
                  <div className="mt-4">
                    <div className="text-sm font-medium mb-3">Quick actions</div>
                    <div className="space-y-1">
                      <div 
                        className="p-2 rounded hover:bg-muted cursor-pointer text-sm flex items-center space-x-2"
                        onClick={() => {
                          navigate('/meetings/upcoming');
                          onClose();
                        }}
                      >
                        <Calendar className="h-4 w-4" />
                        <span>View upcoming meetings</span>
                      </div>
                      <div 
                        className="p-2 rounded hover:bg-muted cursor-pointer text-sm flex items-center space-x-2"
                        onClick={() => {
                          navigate('/committees');
                          onClose();
                        }}
                      >
                        <Building2 className="h-4 w-4" />
                        <span>Browse committees</span>
                      </div>
                      <div 
                        className="p-2 rounded hover:bg-muted cursor-pointer text-sm flex items-center space-x-2"
                        onClick={() => {
                          navigate('/actions');
                          onClose();
                        }}
                      >
                        <CheckSquare className="h-4 w-4" />
                        <span>View action items</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t bg-muted/30 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Press Escape to close</span>
                <span>Use filters to narrow results</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}