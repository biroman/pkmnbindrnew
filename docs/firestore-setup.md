# Firestore Setup Instructions

## 🔥 **Deploy Security Rules**

1. **Install Firebase CLI** (if not already installed):

   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:

   ```bash
   firebase login
   ```

3. **Initialize Firebase in your project** (if not already done):

   ```bash
   firebase init firestore
   ```

   - Select your Firebase project
   - Use default database rules file (firestore.rules)
   - Use default indexes file (firestore.indexes.json)

4. **Deploy the security rules**:
   ```bash
   firebase deploy --only firestore:rules
   ```

## 📊 **Database Initialization**

The database will automatically create collections when users first interact with the app. However, you can set up some initial structure:

### Initialize User Profile (Automatic)

When a user signs up, their profile will be automatically created with:

```javascript
{
  displayName: "User Name",
  email: "user@example.com",
  totalCards: 0,
  totalValue: 0,
  createdAt: "2024-01-01T00:00:00Z",
  lastLoginAt: "2024-01-01T00:00:00Z",
  settings: {
    theme: "light",
    currency: "USD",
    publicProfile: false
  }
}
```

### Create Default Collection (Optional)

You can create a default "Main Collection" for new users:

```javascript
{
  name: "Main Collection",
  description: "My main Pokemon card collection",
  color: "#3b82f6",
  isDefault: true,
  cardCount: 0,
  totalValue: 0,
  createdAt: "2024-01-01T00:00:00Z"
}
```

## 🔒 **Security Rules Summary**

Our Firestore rules ensure:

- ✅ **User Isolation**: Users can only access their own data
- ✅ **Authentication Required**: All operations require valid Firebase Auth
- ✅ **Data Validation**: Strict validation on required fields and data types
- ✅ **Audit Trail**: Activity logs cannot be modified or deleted
- ✅ **Subcollection Protection**: All user subcollections are properly secured

## 📋 **Composite Indexes Needed**

Create these indexes in the Firebase Console for optimal query performance:

1. **User Cards by Rarity + Added Date**:

   - Collection: `users/{userId}/cards`
   - Fields: `rarity (Ascending)`, `addedAt (Descending)`

2. **User Cards by Favorite + Added Date**:

   - Collection: `users/{userId}/cards`
   - Fields: `isFavorite (Ascending)`, `addedAt (Descending)`

3. **User Activity by Timestamp**:

   - Collection: `users/{userId}/activity`
   - Fields: `timestamp (Descending)`

4. **User Collections by Created Date**:
   - Collection: `users/{userId}/collections`
   - Fields: `createdAt (Descending)`

## 🧪 **Testing Security Rules**

You can test the security rules using the Firebase Console Rules Playground:

1. Go to Firebase Console → Firestore Database → Rules
2. Click "Rules Playground"
3. Test scenarios like:
   - Authenticated user accessing their own data ✅
   - Authenticated user accessing another user's data ❌
   - Unauthenticated user accessing any data ❌
   - Invalid data structure submissions ❌

## 🔄 **Backup Strategy**

Set up automated backups:

1. **Daily Exports**: Use Firebase Functions to export data daily
2. **Version Control**: Keep security rules in version control
3. **Recovery Plan**: Document recovery procedures for data loss

## 📈 **Performance Monitoring**

Monitor your Firestore usage:

1. **Firebase Console → Firestore Database → Usage**
2. Watch for:
   - Read/Write operations count
   - Storage usage
   - Bandwidth usage
3. **Optimize queries** that show high costs

## 🛡️ **Security Best Practices**

- ✅ Never store sensitive data in Firestore
- ✅ Use Firebase Auth for all user authentication
- ✅ Regularly review and update security rules
- ✅ Monitor for unusual access patterns
- ✅ Keep Firebase SDK updated to latest version
