import { useState, useCallback } from "react";

const POKEMON_TCG_API_BASE = "https://api.pokemontcg.io/v2";

export const usePokemonTCG = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Generic API call function
  const apiCall = useCallback(async (endpoint, params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, value);
        }
      });

      const url = `${POKEMON_TCG_API_BASE}/${endpoint}${
        searchParams.toString() ? `?${searchParams.toString()}` : ""
      }`;

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Search cards
  const searchCards = useCallback(
    async ({
      query = "",
      set = "",
      type = "",
      rarity = "",
      page = 1,
      pageSize = 20,
    } = {}) => {
      const params = {
        pageSize,
        page,
      };

      // Build query string for Pokemon TCG API
      const queryParts = [];

      if (query) {
        // Check for artist search pattern (e.g., "artist:Ken Sugimori", "artist:Mitsuhiro Arita")
        const artistMatch = query.match(/^artist:\s*(.+)$/i);

        if (artistMatch) {
          // Artist search
          const artistName = artistMatch[1].trim();
          queryParts.push(`artist:"*${artistName}*"`);
        } else {
          // Check if query contains card number pattern (e.g., "pikachu #1", "charizard #25", "pikachu #SWSH039")
          const cardNumberMatch = query.match(/^(.+?)\s*#\s*([A-Z0-9-]+)$/i);

          if (cardNumberMatch) {
            // Extract name and number parts
            const cardName = cardNumberMatch[1].trim();
            const cardNumber = cardNumberMatch[2];

            // Search for both name and number
            queryParts.push(`name:"*${cardName}*"`);
            queryParts.push(`number:${cardNumber}`);
          } else {
            // Regular search - check both name and artist fields
            queryParts.push(`(name:"*${query}*" OR artist:"*${query}*")`);
          }
        }
      }

      if (set) {
        queryParts.push(`set.id:${set}`);
      }

      if (type) {
        queryParts.push(`types:${type}`);
      }

      if (rarity) {
        queryParts.push(`rarity:"${rarity}"`);
      }

      if (queryParts.length > 0) {
        params.q = queryParts.join(" ");
      }

      const data = await apiCall("cards", params);
      return {
        cards: data.data || [],
        totalCount: data.totalCount || 0,
        page: data.page || 1,
        pageSize: data.pageSize || 20,
        totalPages: Math.ceil((data.totalCount || 0) / (data.pageSize || 20)),
      };
    },
    [apiCall]
  );

  // Get sets
  const getSets = useCallback(
    async ({ page = 1, pageSize = 20 } = {}) => {
      const params = {
        pageSize,
        page,
        orderBy: "-releaseDate", // Most recent first
      };

      const data = await apiCall("sets", params);
      return {
        sets: data.data || [],
        totalCount: data.totalCount || 0,
        page: data.page || 1,
        pageSize: data.pageSize || 20,
        totalPages: Math.ceil((data.totalCount || 0) / (data.pageSize || 20)),
      };
    },
    [apiCall]
  );

  // Get cards from a specific set
  const getSetCards = useCallback(
    async (setId, { page = 1, pageSize = 250 } = {}) => {
      const params = {
        q: `set.id:${setId}`,
        pageSize,
        page,
        orderBy: "number",
      };

      const data = await apiCall("cards", params);
      return {
        cards: data.data || [],
        totalCount: data.totalCount || 0,
        page: data.page || 1,
        pageSize: data.pageSize || 250,
        totalPages: Math.ceil((data.totalCount || 0) / (data.pageSize || 250)),
      };
    },
    [apiCall]
  );

  // Get card details by ID
  const getCard = useCallback(
    async (cardId) => {
      const data = await apiCall(`cards/${cardId}`);
      return data.data;
    },
    [apiCall]
  );

  // Get rarities (for filters)
  const getRarities = useCallback(async () => {
    const data = await apiCall("rarities");
    return data.data || [];
  }, [apiCall]);

  // Get types (for filters)
  const getTypes = useCallback(async () => {
    const data = await apiCall("types");
    return data.data || [];
  }, [apiCall]);

  return {
    loading,
    error,
    searchCards,
    getSets,
    getSetCards,
    getCard,
    getRarities,
    getTypes,
  };
};

export default usePokemonTCG;
