# Radix UI Components Usage Examples

## Basic Components

### Button

```jsx
import { Button } from '../ui';

// Basic usage
<Button>Click me</Button>

// With variants
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>

// With loading state
<Button loading>Loading...</Button>

// As a different element (using Slot)
<Button asChild>
  <a href="/link">Link Button</a>
</Button>
```

### Card

```jsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description goes here</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// With variants
<Card variant="elevated">Elevated card</Card>
<Card variant="glass">Glass effect card</Card>
```

### Input with Form Components

```jsx
import { Input, Label, FormField, FormMessage, FormDescription } from "../ui";

<FormField>
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="Enter your email" />
  <FormDescription>We'll never share your email.</FormDescription>
  <FormMessage>Error message goes here</FormMessage>
</FormField>;
```

### Select

```jsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Label,
  FormField,
} from "../ui";

<FormField>
  <Label>Choose an option</Label>
  <Select value={selectedValue} onValueChange={setSelectedValue}>
    <SelectTrigger>
      <SelectValue placeholder="Select an option..." />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="option1">Option 1</SelectItem>
      <SelectItem value="option2">Option 2</SelectItem>
      <SelectItem value="option3">Option 3</SelectItem>
    </SelectContent>
  </Select>
</FormField>;
```

### Alert

```jsx
import {
  Alert,
  AlertTitle,
  AlertDescription,
  AlertIcon,
  AlertContent,
} from "../ui";
import { CheckCircle } from "lucide-react";

// New composition approach
<Alert variant="success">
  <AlertContent>
    <AlertIcon>
      <CheckCircle className="h-4 w-4" />
    </AlertIcon>
    <div>
      <AlertTitle>Success!</AlertTitle>
      <AlertDescription>
        Your action was completed successfully.
      </AlertDescription>
    </div>
  </AlertContent>
</Alert>;

// Legacy approach (backward compatible)
import { LegacyAlert } from "../ui";
<LegacyAlert alert={{ type: "success", message: "Success message" }} />;
```

## Advanced Components

### Dialog

```jsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
} from "../ui";

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>This is a dialog description.</DialogDescription>
    </DialogHeader>
    <div className="py-4">
      <p>Dialog content goes here.</p>
    </div>
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>;
```

### AlertDialog

```jsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
} from "../ui";

<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="danger">Delete Item</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone. This will permanently delete the item.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction>Yes, delete item</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>;
```

### Dropdown Menu

```jsx
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  Button,
} from "../ui";

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Open Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Logout</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>;
```

### Tooltip

```jsx
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Button,
} from "../ui";

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="outline">Hover me</Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>This is a tooltip</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>;
```

### Theme Toggle

```jsx
import { ThemeToggle } from '../ui';

// Basic usage
<ThemeToggle />

// With different sizes
<ThemeToggle size="sm" />
<ThemeToggle size="lg" />
```

## Real-World Form Example

Here's how to build a modern form with validation:

```jsx
import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  FormField,
  Label,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
  FormMessage,
  FormDescription,
  Alert,
  AlertDescription,
} from "../ui";

const ModernForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Real-time validation
  useEffect(() => {
    const newErrors = {};

    if (touched.name && !formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (touched.email && formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Invalid email format";
      }
    }

    setErrors(newErrors);
  }, [formData, touched]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <FormMessage>{errors.name}</FormMessage>}
          </FormField>

          <FormField>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
              className={errors.email ? "border-red-500" : ""}
            />
            <FormDescription>We'll never share your email</FormDescription>
            {errors.email && <FormMessage>{errors.email}</FormMessage>}
          </FormField>

          <FormField>
            <Label>Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, role: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrator</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <Button type="submit" className="w-full">
            Save Information
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
```

## Migration Tips

1. **Button**: The `asChild` prop allows you to render the button as a different element while keeping the styling.

2. **Card**: Now uses composition pattern - wrap content in `CardHeader`, `CardContent`, etc. for better structure.

3. **Input**: Separated into individual components for better composition. Use `FormField` to wrap form elements.

4. **Select**: Replace native `<select>` elements with Radix UI Select for better accessibility and styling.

5. **AlertDialog**: Use instead of `window.confirm()` for better UX and consistency.

6. **Forms**: Use `FormField`, `Label`, `FormMessage`, and `FormDescription` for consistent form layouts.

## Best Practices

1. Always wrap your app with `TooltipProvider` if using tooltips.
2. Use the `asChild` prop when you need to change the underlying element.
3. Leverage the composition pattern for complex components like Cards and Alerts.
4. Use real-time validation with proper error states.
5. Implement proper loading and disabled states for better UX.
6. Use the exported constants from the index file for cleaner imports.
