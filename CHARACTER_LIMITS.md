# Character Limits & Input Validation

## 📝 **Frontend Input Field Limits**

This document outlines all character limits implemented across the application to ensure consistency between client-side UX and server-side validation.

---

## 🔒 **Authentication Fields**

### **Email Fields**

- **Limit**: `maxLength={100}`
- **Locations**:
  - Login form (`src/components/auth/LoginForm.jsx`)
  - Signup form (`src/components/auth/SignupForm.jsx`)
  - Forgot password modal (`src/components/auth/LoginForm.jsx`)
- **Server Validation**: ✅ Email format validation
- **Reasoning**: Standard email length limit, prevents excessively long emails

### **Password Fields**

- **Limit**: `maxLength={128}`
- **Locations**:
  - Login form (`src/components/auth/LoginForm.jsx`)
  - Password change forms
- **Server Validation**: ✅ Strong password requirements
- **Reasoning**: Allows for very secure passwords while preventing abuse

### **Display Name Fields**

- **Limit**: `maxLength={50}`
- **Locations**:
  - Signup form (`src/components/auth/SignupForm.jsx`)
  - Profile sections (`src/components/profile/AccountSection.jsx`)
  - Account information (`src/components/profile/AccountInformation.jsx`)
- **Server Validation**: ✅ 2-50 characters, pattern validation
- **Reasoning**: Reasonable display name length, prevents UI layout issues

---

## 📚 **Binder Management Fields**

### **Binder Name**

- **Limit**: `maxLength={100}`
- **Locations**:
  - Binder creation wizard (`src/pages/BinderCreationWizard.jsx`)
  - Sidebar header editing (`src/components/workspace/sidebar/SidebarHeader.jsx`)
- **Server Validation**: ✅ 1-100 characters, string validation
- **Reasoning**: Descriptive enough for organization, prevents database bloat

### **Binder Description**

- **Limit**: `maxLength={500}`
- **Locations**:
  - Binder creation wizard (`src/pages/BinderCreationWizard.jsx`)
- **Server Validation**: ✅ 0-500 characters, string validation
- **Reasoning**: Allows detailed descriptions without excessive storage

---

## 🃏 **Card Management Fields**

### **Missing Card Numbers**

- **Limit**: `maxLength={5}`
- **Locations**:
  - Collection management section (`src/components/workspace/sidebar/CollectionManagementSection.jsx`)
- **Server Validation**: ✅ Numeric validation
- **Reasoning**: Pokémon card numbers rarely exceed 5 digits (e.g., 99999)

### **Card Names** (Future Implementation)

- **Planned Limit**: `maxLength={100}`
- **Server Validation**: ✅ Already implemented
- **Reasoning**: Pokémon card names are typically short, allows for special characters

---

## 👤 **Profile & User Data Fields**

### **Bio/Description Fields**

- **Limit**: `maxLength={500}`
- **Server Validation**: ✅ String validation
- **Reasoning**: Adequate for personal descriptions

### **Website URLs**

- **No character limit** (browser handles URL length)
- **Server Validation**: ✅ URL format validation
- **Reasoning**: URLs can vary significantly in length

---

## 🔧 **Implementation Standards**

### **Frontend Implementation Pattern**:

```jsx
<Input
  value={value}
  onChange={onChange}
  maxLength={100} // Always include maxLength
  placeholder="Enter value"
  className="..."
/>
```

### **Server-Side Validation Alignment**:

All frontend `maxLength` values **exactly match** server-side validation limits in `src/services/firestore.js`:

- `validateBinderData()` - 100 chars for names, 500 for descriptions
- `validateUserProfileData()` - 50 chars for display names, 500 for bios
- `validateCardData()` - 100 chars for card names

### **Benefits**:

1. **Better UX**: Users can't type more than allowed
2. **Immediate Feedback**: Visual indication when approaching limits
3. **Security**: Prevents client-side data that would fail server validation
4. **Consistency**: Same limits across all input methods
5. **Performance**: Prevents excessive DOM updates and memory usage

---

## 📊 **Character Limit Reference Table**

| Field Type         | Limit | Locations            | Server Validation    |
| ------------------ | ----- | -------------------- | -------------------- |
| Email              | 100   | Auth forms, profiles | ✅ Format + length   |
| Password           | 128   | Auth forms           | ✅ Strength + length |
| Display Name       | 50    | Auth, profiles       | ✅ Pattern + length  |
| Binder Name        | 100   | Creation, editing    | ✅ Required + length |
| Binder Description | 500   | Creation forms       | ✅ Optional + length |
| Card Numbers       | 5     | Missing cards        | ✅ Numeric + length  |
| Bio/Description    | 500   | Profile fields       | ✅ Optional + length |
| Website URL        | None  | Profile fields       | ✅ Format validation |

---

## 🚀 **Future Considerations**

### **Additional Fields to Consider**:

- Collection names and descriptions
- Comment/note fields on cards
- Search query limits
- Import/export filename limits

### **Advanced Features**:

- **Character counters**: Show remaining characters
- **Warning indicators**: Alert when approaching limits
- **Auto-truncation**: Option to auto-trim excess characters
- **Rich text**: HTML content with length limits

---

## 🔍 **Testing Recommendations**

### **Test Cases**:

1. **Boundary Testing**: Test at exact character limits
2. **Exceeding Limits**: Verify inputs stop at maxLength
3. **Paste Handling**: Test pasting text longer than limits
4. **Unicode Characters**: Test with emojis and special characters
5. **Server Sync**: Verify frontend limits match server validation

### **Accessibility**:

- Ensure screen readers announce character limits
- Provide clear error messages for exceeded limits
- Maintain keyboard navigation functionality
