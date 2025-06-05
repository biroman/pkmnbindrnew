import { useState, useEffect, useRef, useCallback } from "react";
import { Package, ChevronRight, Loader2, Plus, Search, X } from "lucide-react";
import { Button } from "../ui";
import CardGrid from "./CardGrid";
import usePokemonTCG from "../../hooks/usePokemonTCG";

// SetIcon component to display set logos with fallback
const SetIcon = ({ set, className = "w-12 h-12" }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Get the best available set image (logo or symbol)
  const setImage = set.images?.logo || set.images?.symbol;

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  if (!setImage || imageError) {
    // Fallback to gradient Package icon
    return (
      <div
        className={`${className} bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center`}
      >
        <Package className="w-6 h-6 text-white" />
      </div>
    );
  }

  return (
    <div
      className={`${className} rounded-lg overflow-hidden bg-white dark:bg-gray-600 flex items-center justify-center relative`}
    >
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <img
        src={setImage}
        alt={`${set.name} logo`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        className={`w-full h-full object-contain transition-opacity duration-300 ${
          imageLoaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
};

// Virtual Set Item component with intersection observer
const VirtualSetItem = ({ set, onAddSet, isVisible, index, isAdding }) => {
  const [shouldRender, setShouldRender] = useState(isVisible);
  const itemRef = useRef(null);

  useEffect(() => {
    if (!itemRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShouldRender(
          entry.isIntersecting ||
            entry.boundingClientRect.top < window.innerHeight + 100
        );
      },
      {
        rootMargin: "100px 0px",
        threshold: 0.1,
      }
    );

    observer.observe(itemRef.current);

    return () => observer.disconnect();
  }, []);

  if (!shouldRender) {
    return (
      <div
        ref={itemRef}
        className="h-32 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse"
      />
    );
  }

  return (
    <div
      ref={itemRef}
      className="relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
    >
      {/* Content */}
      <div className="p-6">
        {/* Header with Set Icon and Info */}
        <div className="flex items-start space-x-4 mb-4">
          <div className="flex-shrink-0">
            <SetIcon set={set} className="w-14 h-14" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 truncate">
              {set.name}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              {set.series}
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
              <span className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                {set.total} cards
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                {set.releaseDate}
              </span>
            </div>
          </div>
        </div>

        {/* Add Set Button */}
        <button
          onClick={() => onAddSet(set)}
          disabled={isAdding}
          className={`
            w-full px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 
            flex items-center justify-center space-x-2 shadow-sm
            ${
              isAdding
                ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md hover:shadow-blue-200/50 dark:hover:shadow-blue-900/50 active:scale-[0.98]"
            }
          `}
        >
          {isAdding ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Adding {set.total} cards...</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Add Complete Set</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const SetBrowseTab = ({ selectedCards, onCardToggle, onBulkAddSet }) => {
  const [allSets, setAllSets] = useState([]);
  const [filteredSets, setFilteredSets] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingSets, setLoadingSets] = useState(true);
  const [hasLoadedAllSets, setHasLoadedAllSets] = useState(false);
  const [addingSetId, setAddingSetId] = useState(null);

  // Cache for set cards - 24 hour cache for all Pokemon data
  const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours for all cache

  const { getSets, getSetCards } = usePokemonTCG();

  // Generate cache key for set cards
  const getCacheKey = (setId, page) => {
    return `set-${setId}-page-${page}`;
  };

  // Check if cached result is still valid in localStorage
  const getCachedSetCards = (cacheKey) => {
    try {
      const cached = localStorage.getItem(`pokemon-setcards-${cacheKey}`);
      if (cached) {
        const parsedCache = JSON.parse(cached);
        if (Date.now() - parsedCache.timestamp < CACHE_DURATION) {
          return parsedCache.data;
        } else {
          // Remove expired cache
          localStorage.removeItem(`pokemon-setcards-${cacheKey}`);
        }
      }
    } catch (err) {
      console.error("Error reading set cards cache:", err);
    }
    return null;
  };

  // Save set cards result to localStorage cache
  const setCachedSetCards = (cacheKey, data) => {
    try {
      localStorage.setItem(
        `pokemon-setcards-${cacheKey}`,
        JSON.stringify({
          data,
          timestamp: Date.now(),
        })
      );
    } catch (err) {
      console.error("Error saving set cards cache:", err);
    }
  };

  // Load all sets with optimized strategy
  const loadAllSets = useCallback(async () => {
    if (hasLoadedAllSets) return;

    try {
      setLoadingSets(true);

      // Check localStorage cache first for sets list
      const cachedSets = localStorage.getItem("pokemon-all-sets");
      const now = Date.now();

      if (cachedSets) {
        const parsedSets = JSON.parse(cachedSets);
        if (now - parsedSets.timestamp < CACHE_DURATION) {
          console.log("Using cached Pokemon sets from localStorage");
          const sortedSets = parsedSets.data.sort(
            (a, b) => new Date(b.releaseDate) - new Date(a.releaseDate)
          );
          setAllSets(sortedSets);
          setFilteredSets(sortedSets);
          setLoadingSets(false);
          setHasLoadedAllSets(true);
          return;
        } else {
          // Remove expired cache
          localStorage.removeItem("pokemon-all-sets");
        }
      }

      // First, try to get a large batch to minimize requests
      console.log("Loading Pokemon sets from API...");
      const firstBatch = await getSets({ page: 1, pageSize: 250 });

      // Set initial results immediately for fast UI
      setAllSets(firstBatch.sets);
      setFilteredSets(firstBatch.sets);
      setLoadingSets(false); // Show results immediately

      // If there are more pages, load them in background
      if (firstBatch.totalPages > 1) {
        console.log(
          `Loading remaining ${
            firstBatch.totalPages - 1
          } pages in background...`
        );

        const allSetsData = [...firstBatch.sets];

        // Load remaining pages
        for (let page = 2; page <= firstBatch.totalPages; page++) {
          try {
            const setsData = await getSets({ page, pageSize: 250 });
            allSetsData.push(...setsData.sets);

            // Update UI with new sets as they load
            const sortedSets = allSetsData.sort(
              (a, b) => new Date(b.releaseDate) - new Date(a.releaseDate)
            );
            setAllSets([...sortedSets]);
            setFilteredSets(
              searchQuery
                ? sortedSets.filter(
                    (set) =>
                      set.name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      set.series
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
                  )
                : [...sortedSets]
            );
          } catch (err) {
            console.error(`Failed to load page ${page}:`, err);
            // Continue loading other pages even if one fails
          }
        }

        console.log(`Loaded ${allSetsData.length} Pokemon sets total`);

        // Cache the complete sets list in localStorage
        const finalSortedSets = allSetsData.sort(
          (a, b) => new Date(b.releaseDate) - new Date(a.releaseDate)
        );

        try {
          localStorage.setItem(
            "pokemon-all-sets",
            JSON.stringify({
              data: finalSortedSets,
              timestamp: now,
            })
          );
          console.log("Cached all Pokemon sets to localStorage");
        } catch (err) {
          console.error("Error caching sets to localStorage:", err);
        }
      } else {
        // Cache even single page results
        try {
          localStorage.setItem(
            "pokemon-all-sets",
            JSON.stringify({
              data: firstBatch.sets,
              timestamp: now,
            })
          );
          console.log("Cached Pokemon sets to localStorage");
        } catch (err) {
          console.error("Error caching sets to localStorage:", err);
        }
      }

      setHasLoadedAllSets(true);
    } catch (err) {
      console.error("Failed to load sets:", err);
      setLoadingSets(false);
    }
  }, [getSets, hasLoadedAllSets, searchQuery]);

  // Load sets on mount
  useEffect(() => {
    loadAllSets();
  }, [loadAllSets]);

  // Filter sets based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSets(allSets);
    } else {
      const filtered = allSets.filter(
        (set) =>
          set.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          set.series.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSets(filtered);
    }
  }, [searchQuery, allSets]);

  // Add complete set functionality
  const handleAddCompleteSet = async (set) => {
    setAddingSetId(set.id);
    try {
      console.log(`Adding complete set: ${set.name} (${set.total} cards)`);

      // Get all cards from the set
      const allCards = [];
      let currentPage = 1;
      let hasMorePages = true;

      while (hasMorePages) {
        const cacheKey = getCacheKey(set.id, currentPage);
        let pageData = getCachedSetCards(cacheKey);

        if (!pageData) {
          // Fetch from API if not cached
          pageData = await getSetCards(set.id, {
            page: currentPage,
            pageSize: 250,
          });
          setCachedSetCards(cacheKey, pageData);
        }

        allCards.push(...pageData.cards);

        // Check if there are more pages
        hasMorePages = currentPage < pageData.totalPages;
        currentPage++;
      }

      console.log(`Loaded ${allCards.length} cards from ${set.name}`);
      onBulkAddSet(allCards);
    } catch (err) {
      console.error("Failed to add complete set:", err);
    } finally {
      setAddingSetId(null);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="flex flex-col h-full bg-gray-50/30 dark:bg-gray-900/30">
      {/* Header with Search */}
      <div className="p-8 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Pokemon Sets Collection
          </h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Discover and add complete Pokemon sets to your collection. Each set
            contains all the cards from that specific release.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search Pokemon sets by name or series..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Results count */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {searchQuery ? (
              <span>
                <span className="text-blue-600 dark:text-blue-400">
                  {filteredSets.length}
                </span>{" "}
                sets found
              </span>
            ) : (
              <span>
                <span className="text-blue-600 dark:text-blue-400">
                  {allSets.length}
                </span>{" "}
                total sets available
              </span>
            )}
          </div>
          {!loadingSets && allSets.length > 0 && (
            <div className="text-xs text-gray-500 dark:text-gray-500">
              ✨ Results cached for faster loading
            </div>
          )}
        </div>
      </div>

      {/* Sets List */}
      <div className="flex-1 overflow-y-auto p-8">
        {loadingSets ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center space-x-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="text-lg text-gray-600 dark:text-gray-400 font-medium">
                Loading Pokemon sets...
              </span>
            </div>
          </div>
        ) : filteredSets.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center">
                <Search className="w-10 h-10 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                No sets found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                Try adjusting your search terms to find Pokemon sets
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {filteredSets.map((set, index) => (
              <VirtualSetItem
                key={set.id}
                set={set}
                onAddSet={handleAddCompleteSet}
                isVisible={index < 10} // Initially render first 10 items
                index={index}
                isAdding={addingSetId === set.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SetBrowseTab;
