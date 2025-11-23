import { useState } from "react";
import { Search, Filter, Clock, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGlobalSearch, useRecentSearches, type SearchResult } from "@/hooks/useGlobalSearch";
import { useNavigate } from "react-router-dom";
import { Calendar, Building2, CheckSquare, Users, File, FileText } from "lucide-react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();
  
  const { data: results = [], isLoading } = useGlobalSearch(query, {
    types: selectedTypes.length > 0 ? selectedTypes : undefined
  });
  
  const { getRecentSearches, addRecentSearch, clearRecentSearches } = useRecentSearches();
  const recentSearches = getRecentSearches();

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
    if (query) addRecentSearch(query);
    navigate(result.url);
  };

  const handleRecentSearchClick = (recentQuery: string) => {
    setQuery(recentQuery);
  };

  const filteredResults = activeTab === "all" 
    ? results 
    : results.filter(result => result.type === activeTab);

  const resultsByType = results.reduce((acc, result) => {
    acc[result.type] = (acc[result.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center space-x-2">
          <Search className="h-6 w-6 text-primary" />
          <span>Search</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Search across meetings, committees, actions, members, and documents
        </p>
      </div>

      {/* Search Input */}
      <Card>
        <CardContent className="p-6">
          <div className="flex space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search everything..."
                className="pl-10 text-lg h-12"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="h-12 px-6">
              <Sliders className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Type Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
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
                onClick={() => {
                  setSelectedTypes(prev => 
                    prev.includes(id) 
                      ? prev.filter(t => t !== id)
                      : [...prev, id]
                  );
                }}
              >
                <Icon className="h-3 w-3 mr-1" />
                {label}
                {resultsByType[id] && query && (
                  <Badge variant="secondary" className="ml-2">
                    {resultsByType[id]}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Searches */}
      {!query && recentSearches.length > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Recent Searches</span>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearRecentSearches}
              >
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {recentSearches.slice(0, 10).map((recent, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleRecentSearchClick(recent)}
                  className="h-8"
                >
                  {recent}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {query.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Search Results</span>
              {!isLoading && (
                <Badge variant="outline">
                  {results.length} result{results.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <Search className="h-8 w-8 mx-auto mb-4 animate-pulse text-muted-foreground" />
                <div className="text-muted-foreground">Searching...</div>
              </div>
            ) : results.length > 0 ? (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="all">
                    All ({results.length})
                  </TabsTrigger>
                  {Object.entries(resultsByType).map(([type, count]) => (
                    <TabsTrigger key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}s ({count})
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value={activeTab}>
                  <div className="space-y-4">
                    {filteredResults.map((result, index) => {
                      const Icon = getTypeIcon(result.type);
                      return (
                        <Card 
                          key={`${result.type}-${result.id}-${index}`}
                          className="hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => handleResultClick(result)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 mt-1">
                                <Icon className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h3 className="text-lg font-semibold truncate">{result.title}</h3>
                                  <Badge className={getTypeColor(result.type)}>
                                    {result.type}
                                  </Badge>
                                </div>
                                {result.description && (
                                  <p className="text-muted-foreground mb-2">
                                    {result.description}
                                  </p>
                                )}
                                {result.metadata && (
                                  <div className="flex items-center space-x-2">
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
                                    {result.metadata.committee && (
                                      <span className="text-xs text-muted-foreground">
                                        {result.metadata.committee}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-12">
                <Search className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                <div className="text-muted-foreground mb-2">No results found for "{query}"</div>
                <div className="text-sm text-muted-foreground">
                  Try adjusting your search terms or check your spelling
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      {!query && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-20 flex-col space-y-2"
                onClick={() => navigate('/meetings/upcoming')}
              >
                <Calendar className="h-6 w-6" />
                <span>Upcoming Meetings</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col space-y-2"
                onClick={() => navigate('/committees')}
              >
                <Building2 className="h-6 w-6" />
                <span>All Committees</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col space-y-2"
                onClick={() => navigate('/actions')}
              >
                <CheckSquare className="h-6 w-6" />
                <span>Action Items</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col space-y-2"
                onClick={() => navigate('/members')}
              >
                <Users className="h-6 w-6" />
                <span>Members</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}