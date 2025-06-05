# Save Rate Limiting System

## Overview

The Save Rate Limiting system provides administrator-configurable rate limiting for save operations throughout the Pokemon Binder app. This prevents abuse and protects the Firebase backend from excessive write operations.

## Features

- 🔧 **Admin Configurable**: Full admin control over rate limits
- 👥 **User Type Based**: Different limits for guest vs registered users
- ⏱️ **Multi-Level Limiting**: Per-minute, per-hour, and cooldown controls
- 🎯 **Smart UI**: Automatic button state management with visual feedback
- 📊 **Real-time Stats**: Live usage tracking and remaining quota display
- 🛡️ **Server-side Enforcement**: Backend validation prevents API bypassing

## Admin Configuration

### Accessing Rate Limit Settings

1. Navigate to **Profile → System Configuration** (owner only)
2. Click the **"Rate Limits"** tab
3. Configure settings and click **"Save Changes"**

### Available Settings

#### Global Toggle

- **Enforce Save Rate Limits**: Master switch to enable/disable rate limiting

#### Guest User Limits

- **Saves per minute**: 1-20 (default: 3)
- **Saves per hour**: 5-100 (default: 15)

#### Registered User Limits

- **Saves per minute**: 5-50 (default: 10)
- **Saves per hour**: 20-500 (default: 60)

#### Global Settings

- **Cooldown between saves**: 0-10 seconds (default: 2)

## Usage in Components

### Basic SaveButton Usage

```jsx
import { SaveButton } from "../ui";

const MyComponent = () => {
  const handleSave = async () => {
    // Your save logic here
    const result = await updateSomething();
    return result; // Should return { success: boolean, error?: string }
  };

  return <SaveButton onClick={handleSave}>Save Changes</SaveButton>;
};
```

### Advanced SaveButton Usage

```jsx
import { SaveButton } from "../ui";

const AdvancedComponent = () => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await complexSaveOperation();
      return result;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SaveButton
      onClick={handleSave}
      loading={isSaving}
      variant="outline"
      size="sm"
      showStats={true} // Shows usage statistics in tooltip
      className="w-full"
    >
      Quick Save
    </SaveButton>
  );
};
```

### Manual Rate Limit Checking

```jsx
import { useSaveRateLimit } from "../../hooks/useSaveRateLimit";

const ManualComponent = () => {
  const { canSave, isRateLimited, rateLimitStatus, saveStats, performSave } =
    useSaveRateLimit();

  const handleManualSave = async () => {
    if (!canSave) {
      alert(rateLimitStatus.error);
      return;
    }

    // Option 1: Use performSave wrapper
    const result = await performSave(actualSaveFunction);

    // Option 2: Manual handling
    // const result = await actualSaveFunction();
    // await recordSaveOperation(userId);
  };

  return (
    <div>
      <button onClick={handleManualSave} disabled={!canSave}>
        {isRateLimited ? "Rate Limited" : "Save"}
      </button>

      <p>Remaining: {rateLimitStatus.remainingMinute}/min</p>
      <p>Recent saves: {saveStats.savesInLastMinute}</p>
    </div>
  );
};
```

## Backend Integration

The system automatically integrates with Firestore operations:

### updateBinder Function (Example)

```javascript
// In firestore.js - automatically includes rate limiting
export const updateBinder = async (userId, binderId, updates) => {
  try {
    // 1. SERVER-SIDE RATE LIMITING - Check if save is allowed
    const userType = userDoc.exists() ? "registered" : "guest";
    const rateLimitCheck = await checkSaveRateLimit(userId, userType);

    if (!rateLimitCheck.allowed) {
      return {
        success: false,
        error: rateLimitCheck.error,
        rateLimited: true,
      };
    }

    // 2. Perform the actual save operation
    await updateDoc(binderDocRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    // 3. Record the save operation for rate limiting
    await recordSaveOperation(userId);

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
```

## SaveButton Component Props

| Prop        | Type       | Default   | Description                  |
| ----------- | ---------- | --------- | ---------------------------- |
| `onClick`   | `function` | -         | Save function to execute     |
| `children`  | `string`   | "Save"    | Button text                  |
| `disabled`  | `boolean`  | `false`   | Additional disable condition |
| `loading`   | `boolean`  | `false`   | Loading state from parent    |
| `variant`   | `string`   | "default" | Button variant               |
| `size`      | `string`   | "default" | Button size                  |
| `showStats` | `boolean`  | `false`   | Show usage stats in tooltip  |
| `className` | `string`   | ""        | Additional CSS classes       |

## Visual States

### Normal State

- ✅ Green "Save" button with save icon
- Tooltip shows remaining quota

### Cooldown State

- ⏱️ "Wait Xs" with clock icon and progress bar
- Button disabled during cooldown

### Rate Limited State

- 🚫 "Rate limited" with secondary styling
- Shows specific limit type (minute/hour)

### Loading State

- 🔄 "Saving..." with spinning save icon
- Button disabled during operation

## Technical Details

### Rate Limiting Cache

- In-memory cache tracks user operations
- Automatically cleans expired entries
- 5-minute cache expiry for performance

### Database Schema

```javascript
// systemConfiguration/limits document
{
  guestSavesPerMinute: 3,
  guestSavesPerHour: 15,
  registeredSavesPerMinute: 10,
  registeredSavesPerHour: 60,
  saveCooldownSeconds: 2,
  enforceSaveRateLimits: false,
  // ... other system config
}
```

### Error Handling

- Network errors allow saves (fail-open approach)
- Firebase errors logged and reported
- Graceful degradation when rate limiting unavailable

## Testing

### Testing Rate Limits (Admin Only)

1. **Enable Rate Limiting**:

   - Go to System Configuration → Rate Limits
   - Enable "Enforce Save Rate Limits"
   - Set low limits (e.g., 2/minute for testing)

2. **Test Scenarios**:

   - Rapid save attempts should show cooldown
   - Exceeding minute limit shows "Rate limited"
   - Button states update in real-time

3. **Reset Testing**:
   - Disable enforcement to clear restrictions
   - Wait for cache expiry (5 minutes)

### Development Testing

```javascript
// In browser console (for testing)
// Force trigger rate limit
localStorage.setItem("testRateLimit", "true");

// Reset rate limit cache
localStorage.removeItem("testRateLimit");
```

## Security Considerations

- ✅ Server-side validation prevents API bypassing
- ✅ User type verification for appropriate limits
- ✅ Real-time configuration updates
- ✅ Automatic cache cleanup prevents memory leaks
- ✅ Fail-open approach maintains availability

## Performance Impact

- **Minimal**: In-memory caching with 5-minute cleanup
- **Network**: One additional Firestore read per save operation
- **UI**: Sub-100ms rate limit checking
- **Memory**: Automatic cleanup prevents accumulation

## Troubleshooting

### Common Issues

1. **"Rate limiting disabled" tooltip**:

   - Admin hasn't enabled rate limiting
   - Check System Configuration → Rate Limits

2. **Button always enabled despite limits**:

   - Rate limiting may be disabled
   - Check `enforceSaveRateLimits` setting

3. **Immediate rate limiting**:
   - Check if user type detection is correct
   - Verify guest vs registered user limits

### Debug Information

```javascript
// In component using useSaveRateLimit
const { rateLimitSettings, saveStats, userType, rateLimitStatus } =
  useSaveRateLimit();

console.log("Settings:", rateLimitSettings);
console.log("Stats:", saveStats);
console.log("User Type:", userType);
console.log("Status:", rateLimitStatus);
```

## Future Enhancements

- 📈 **Analytics Dashboard**: Usage patterns and trends
- 🔔 **Admin Alerts**: Notification of high usage
- 🎯 **Operation-Specific Limits**: Different limits per operation type
- 🌐 **Global Rate Limiting**: Cross-session rate limiting
- 📊 **Quota Management**: Daily/weekly quota systems
