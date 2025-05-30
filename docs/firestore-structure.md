# Firestore Database Structure - Pokemon Binder

## 🗂️ Collection Structure

### 1. Users Collection

```
/users/{userId}
```

**Document Fields:**

- `displayName` (string) - User's display name
- `email` (string) - User's email address
- `photoURL` (string, optional) - Profile picture URL
- `createdAt` (timestamp) - Account creation date
- `lastLoginAt` (timestamp) - Last login timestamp
- `totalCards` (number) - Total number of cards owned
- `totalValue` (number) - Estimated total collection value
- `settings` (object) - User preferences
  - `theme` (string) - 'light' | 'dark'
  - `currency` (string) - 'USD', 'EUR', etc.
  - `publicProfile` (boolean) - Whether profile is public

### 2. User Cards Subcollection

```
/users/{userId}/cards/{cardId}
```

**Document Fields:**

- `name` (string) - Pokemon card name
- `set` (string) - Card set/series name
- `setNumber` (string) - Card number in set (e.g., "025/102")
- `rarity` (string) - 'Common', 'Uncommon', 'Rare', 'Ultra Rare', etc.
- `condition` (string) - 'Mint', 'Near Mint', 'Excellent', 'Good', 'Poor'
- `language` (string) - Card language
- `foil` (boolean) - Whether card is foil/holographic
- `purchasePrice` (number) - Original purchase price
- `purchaseDate` (timestamp) - When card was acquired
- `currentValue` (number) - Current estimated value
- `imageUrl` (string) - Card image URL
- `notes` (string, optional) - Personal notes about the card
- `isFavorite` (boolean) - Whether user marked as favorite
- `addedAt` (timestamp) - When added to collection
- `updatedAt` (timestamp) - Last updated

### 3. Collections/Binders Subcollection

```
/users/{userId}/collections/{collectionId}
```

**Document Fields:**

- `name` (string) - Collection name (e.g., "Base Set", "Favorites")
- `description` (string, optional) - Collection description
- `color` (string) - Color theme for collection
- `isDefault` (boolean) - Whether this is the default collection
- `cardCount` (number) - Number of cards in collection
- `totalValue` (number) - Total value of cards in collection
- `createdAt` (timestamp) - Creation date
- `updatedAt` (timestamp) - Last updated

### 4. Collection Cards Subcollection

```
/users/{userId}/collections/{collectionId}/cards/{cardId}
```

**Document Fields:**

- `cardRef` (reference) - Reference to `/users/{userId}/cards/{cardId}`
- `addedAt` (timestamp) - When added to this collection
- `position` (number) - Order position in collection

### 5. Wishlist Subcollection

```
/users/{userId}/wishlist/{cardId}
```

**Document Fields:**

- `name` (string) - Card name
- `set` (string) - Card set
- `setNumber` (string) - Card number
- `rarity` (string) - Card rarity
- `maxPrice` (number, optional) - Maximum willing to pay
- `priority` (string) - 'High', 'Medium', 'Low'
- `notes` (string, optional) - Notes about why wanted
- `addedAt` (timestamp) - When added to wishlist

### 6. Activity Subcollection

```
/users/{userId}/activity/{activityId}
```

**Document Fields:**

- `type` (string) - 'card_added', 'card_sold', 'card_traded', 'collection_created'
- `description` (string) - Human-readable description
- `cardRef` (reference, optional) - Reference to related card
- `collectionRef` (reference, optional) - Reference to related collection
- `metadata` (object) - Additional activity-specific data
- `timestamp` (timestamp) - When activity occurred

## 📋 **Data Relationships**

1. **User → Cards**: One-to-Many (User owns multiple cards)
2. **User → Collections**: One-to-Many (User has multiple collections)
3. **Collection → Cards**: Many-to-Many (Cards can be in multiple collections)
4. **User → Wishlist**: One-to-Many (User has multiple wishlist items)
5. **User → Activity**: One-to-Many (User has multiple activities)

## 🔍 **Common Queries**

1. Get all user's cards: `/users/{userId}/cards`
2. Get cards in collection: `/users/{userId}/collections/{collectionId}/cards`
3. Get user's wishlist: `/users/{userId}/wishlist`
4. Get recent activity: `/users/{userId}/activity` (ordered by timestamp)
5. Get favorite cards: `/users/{userId}/cards` where `isFavorite == true`
6. Get cards by rarity: `/users/{userId}/cards` where `rarity == 'Ultra Rare'`

## 💾 **Storage Considerations**

- **Images**: Store in Firebase Storage at `/users/{userId}/cards/{cardId}/images/`
- **Backups**: Use Firebase Functions for automated backups
- **Indexing**: Create composite indexes for common query patterns
- **Pagination**: Implement for large collections (limit 20-50 cards per page)
