import { useState, useEffect, useRef } from "react";
import { Search, Loader2, RotateCcw } from "lucide-react";
import { Button } from "../ui";
import CardGrid from "./CardGrid";
import usePokemonTCG from "../../hooks/usePokemonTCG";

const CardSearchTab = ({
  selectedCards,
  onCardToggle,
  showSidebar = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    set: "",
    type: "",
    rarity: "",
  });
  const [searchResults, setSearchResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [lastSearchParams, setLastSearchParams] = useState(null);
  const [sets, setSets] = useState([]);
  const [types, setTypes] = useState([]);
  const [rarities, setRarities] = useState([]);

  // Cache for search results - 24 hour cache for all Pokemon data
  const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours for all cache

  const { loading, error, searchCards, getSets, getTypes, getRarities } =
    usePokemonTCG();

  // Load filter options on mount with localStorage caching
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        // Check localStorage cache first for filter data
        const cachedSets = localStorage.getItem("pokemon-sets");
        const cachedTypes = localStorage.getItem("pokemon-types");
        const cachedRarities = localStorage.getItem("pokemon-rarities");

        const now = Date.now();
        let setsData, typesData, raritiesData;

        // Check if cached data is still valid (24 hours)
        if (cachedSets) {
          const parsedSets = JSON.parse(cachedSets);
          if (now - parsedSets.timestamp < CACHE_DURATION) {
            setSets(parsedSets.data);
            setsData = { sets: parsedSets.data };
          }
        }

        if (cachedTypes) {
          const parsedTypes = JSON.parse(cachedTypes);
          if (now - parsedTypes.timestamp < CACHE_DURATION) {
            setTypes(parsedTypes.data);
            typesData = parsedTypes.data;
          }
        }

        if (cachedRarities) {
          const parsedRarities = JSON.parse(cachedRarities);
          if (now - parsedRarities.timestamp < CACHE_DURATION) {
            setRarities(parsedRarities.data);
            raritiesData = parsedRarities.data;
          }
        }

        // Fetch any missing data
        const promises = [];
        if (!setsData) promises.push(getSets({ pageSize: 100 }));
        if (!typesData) promises.push(getTypes());
        if (!raritiesData) promises.push(getRarities());

        if (promises.length > 0) {
          const results = await Promise.all(promises);
          let resultIndex = 0;

          if (!setsData) {
            setsData = results[resultIndex++];
            setSets(setsData.sets);
            // Cache in localStorage
            localStorage.setItem(
              "pokemon-sets",
              JSON.stringify({
                data: setsData.sets,
                timestamp: now,
              })
            );
          }

          if (!typesData) {
            typesData = results[resultIndex++];
            setTypes(typesData);
            localStorage.setItem(
              "pokemon-types",
              JSON.stringify({
                data: typesData,
                timestamp: now,
              })
            );
          }

          if (!raritiesData) {
            raritiesData = results[resultIndex++];
            setRarities(raritiesData);
            localStorage.setItem(
              "pokemon-rarities",
              JSON.stringify({
                data: raritiesData,
                timestamp: now,
              })
            );
          }
        }
      } catch (err) {
        console.error("Failed to load filter options:", err);
      }
    };

    loadFilterOptions();
  }, [getSets, getTypes, getRarities]);

  // Clear cache when search parameters change significantly
  useEffect(() => {
    const currentParams = {
      query: searchQuery,
      set: filters.set,
      type: filters.type,
      rarity: filters.rarity,
    };

    if (
      lastSearchParams &&
      (lastSearchParams.query !== currentParams.query ||
        lastSearchParams.set !== currentParams.set ||
        lastSearchParams.type !== currentParams.type ||
        lastSearchParams.rarity !== currentParams.rarity)
    ) {
      // Clear search cache when parameters change
      clearSearchCache();
    }
  }, [searchQuery, filters, lastSearchParams]);

  // Clear all search cache
  const clearSearchCache = () => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith("pokemon-search-")) {
          localStorage.removeItem(key);
        }
      });
    } catch (err) {
      console.error("Error clearing search cache:", err);
    }
  };

  // Generate cache key for search results
  const getCacheKey = (params) => {
    return `search-${params.query}-${params.set}-${params.type}-${params.rarity}-${params.page}`;
  };

  // Check if cached result is still valid in localStorage
  const getCachedSearchResult = (cacheKey) => {
    try {
      const cached = localStorage.getItem(`pokemon-search-${cacheKey}`);
      if (cached) {
        const parsedCache = JSON.parse(cached);
        if (Date.now() - parsedCache.timestamp < CACHE_DURATION) {
          return parsedCache.data;
        } else {
          // Remove expired cache
          localStorage.removeItem(`pokemon-search-${cacheKey}`);
        }
      }
    } catch (err) {
      console.error("Error reading search cache:", err);
    }
    return null;
  };

  // Save search result to localStorage cache
  const setCachedSearchResult = (cacheKey, data) => {
    try {
      localStorage.setItem(
        `pokemon-search-${cacheKey}`,
        JSON.stringify({
          data,
          timestamp: Date.now(),
        })
      );
    } catch (err) {
      console.error("Error saving search cache:", err);
    }
  };

  const handleSearch = async (page = 1) => {
    const searchParams = {
      query: searchQuery,
      set: filters.set,
      type: filters.type,
      rarity: filters.rarity,
      page,
      pageSize: 20,
    };

    const cacheKey = getCacheKey(searchParams);
    const cachedResult = getCachedSearchResult(cacheKey);

    // Check cache first
    if (cachedResult) {
      console.log("Using cached search results for:", cacheKey);
      setSearchResults(cachedResult.cards);
      setCurrentPage(cachedResult.page);
      setTotalPages(cachedResult.totalPages);
      setHasSearched(true);
      setLastSearchParams({
        query: searchQuery,
        set: filters.set,
        type: filters.type,
        rarity: filters.rarity,
      });
      return;
    }

    try {
      console.log("Fetching fresh search results for:", cacheKey);
      const results = await searchCards(searchParams);

      // Cache the results in localStorage
      setCachedSearchResult(cacheKey, results);

      setSearchResults(results.cards);
      setCurrentPage(results.page);
      setTotalPages(results.totalPages);
      setHasSearched(true);
      setLastSearchParams({
        query: searchQuery,
        set: filters.set,
        type: filters.type,
        rarity: filters.rarity,
      });
    } catch (err) {
      console.error("Search failed:", err);
      setSearchResults([]);
      setHasSearched(true);
    }
  };

  const handlePageChange = (page) => {
    handleSearch(page);
  };

  const handleManualSearch = () => {
    setCurrentPage(1);
    handleSearch(1);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleManualSearch();
    }
  };

  const clearFilters = () => {
    setFilters({
      set: "",
      type: "",
      rarity: "",
    });
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
    setLastSearchParams(null);
    clearSearchCache();
  };

  const hasActiveFilters =
    searchQuery || filters.set || filters.type || filters.rarity;
  const isSearchEnabled =
    searchQuery.trim() || filters.set || filters.type || filters.rarity;

  return (
    <div className="flex h-full">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Search Bar */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Pokemon Cards
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name, artist, or number... (try 'Pikachu', 'Ken Sugimori', 'Pikachu #SWSH039')"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                />
              </div>
            </div>
            <button
              onClick={handleManualSearch}
              disabled={!isSearchEnabled || loading}
              className="h-[48px] px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>Search</span>
            </button>
          </div>

          {/* Search Examples */}
          <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium">Examples: </span>
            <span className="space-x-4">
              <button
                onClick={() => setSearchQuery("Pikachu")}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                "Pikachu"
              </button>
              <button
                onClick={() => setSearchQuery("Ken Sugimori")}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                "Ken Sugimori"
              </button>
              <button
                onClick={() => setSearchQuery("Charizard #6")}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                "Charizard #6"
              </button>
              <button
                onClick={() => setSearchQuery("Pikachu #SWSH039")}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                "Pikachu #SWSH039"
              </button>
              <button
                onClick={() => setSearchQuery("artist:Mitsuhiro Arita")}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                "artist:Mitsuhiro Arita"
              </button>
            </span>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-hidden">
          {!hasSearched ? (
            <div className="flex items-center justify-center h-full p-8">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-3xl flex items-center justify-center">
                  <Search className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Search Pokemon Cards
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                  Search by card name, artist name, or card number (including
                  promo cards). Use the filters on the right to refine your
                  results, then click Search.
                </p>
                <div className="text-sm text-gray-400 dark:text-gray-500">
                  <p>💡 Use "artist:Name" for specific artist searches</p>
                  <p>🎯 Supports promo cards like "#SWSH039", "#XY-P", etc.</p>
                  <p>
                    🚀 Results are cached for 24 hours for faster navigation
                  </p>
                </div>
              </div>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex items-center space-x-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="text-lg text-gray-600 dark:text-gray-400">
                  Searching cards...
                </span>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-red-500 dark:text-red-400 mb-3 text-lg font-semibold">
                  Search failed
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                  {error}
                </p>
                <Button
                  onClick={handleManualSearch}
                  variant="outline"
                  size="sm"
                  className="mt-3"
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : (
            <CardGrid
              cards={searchResults}
              selectedCards={selectedCards}
              onCardToggle={onCardToggle}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              emptyMessage="No cards found. Try adjusting your search or filters."
            />
          )}
        </div>
      </div>

      {/* Filters Sidebar */}
      <div className="w-72 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Filters
            </h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Refine your search results
          </p>
        </div>

        {/* Filter Options */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Set Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Pokemon Set
            </label>
            <select
              value={filters.set}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, set: e.target.value }))
              }
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            >
              <option value="">All Sets</option>
              {sets.map((set) => (
                <option key={set.id} value={set.id}>
                  {set.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Pokemon Type
            </label>
            <select
              value={filters.type}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, type: e.target.value }))
              }
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            >
              <option value="">All Types</option>
              {types.map((type, index) => (
                <option key={type || `type-${index}`} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Rarity Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Card Rarity
            </label>
            <select
              value={filters.rarity}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, rarity: e.target.value }))
              }
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            >
              <option value="">All Rarities</option>
              {rarities.map((rarity, index) => (
                <option key={rarity || `rarity-${index}`} value={rarity}>
                  {rarity}
                </option>
              ))}
            </select>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Active Filters
              </h4>
              <div className="space-y-2">
                {searchQuery && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Search:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white truncate ml-2">
                      "{searchQuery}"
                    </span>
                  </div>
                )}
                {filters.set && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Set:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white truncate ml-2">
                      {sets.find((s) => s.id === filters.set)?.name ||
                        filters.set}
                    </span>
                  </div>
                )}
                {filters.type && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Type:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {filters.type}
                    </span>
                  </div>
                )}
                {filters.rarity && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Rarity:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {filters.rarity}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardSearchTab;
