# AuthNavbar Component

A responsive navigation bar component specifically designed for the Bhu-Nirakshak web app's authentication pages (login/signup).

## Features

### 🎯 **Core Functionality**
- **Brand Navigation**: Logo + "Bhu-Nirakshak" text that navigates to `/` (landing page)
- **Navigation Links**: Home, About, Contact, Help with active route highlighting
- **Sign Up Button**: Prominent blue button that navigates to `/signup`
- **Responsive Design**: Adapts seamlessly from desktop to mobile

### 📱 **Mobile Experience**
- **Hamburger Menu**: Clean icon toggle for mobile screens (<768px)
- **Animated Dropdown**: Smooth slide-in animation with Tailwind transitions
- **Touch-Friendly**: Optimized spacing and interactions for mobile devices

### 🎨 **Design & Styling**
- **Consistent Theme**: Matches existing Bhu-Nirakshak design system
- **Active States**: Current route highlighted with blue underline/border
- **Hover Effects**: Smooth color transitions on interactive elements
- **Shadow & Depth**: Subtle `shadow-md` for visual hierarchy

## Usage

### Basic Implementation

```jsx
import AuthNavbar from '@/components/AuthNavbar';

function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AuthNavbar />
      {/* Your page content here */}
    </div>
  );
}
```

### Integration with Existing Pages

The navbar has been integrated into:
- `LoginPage` (`/login`)
- `SignupPage` (`/signup`)

### Navigation Structure

```jsx
const navItems = [
  { name: "Home", link: "/" },
  { name: "About", link: "/about" },
  { name: "Contact", link: "/contact" },
  { name: "Help", link: "/help" },
];
```

## Technical Details

### Dependencies
- **React Router DOM**: For navigation and route detection
- **Tabler Icons**: For hamburger menu icons (`IconMenu2`, `IconX`)
- **TailwindCSS**: For styling and responsive utilities

### State Management
- **Mobile Menu**: `useState` for toggle functionality
- **Route Detection**: `useLocation` for active route highlighting

### Responsive Breakpoints
- **Desktop**: `md:` and above (≥768px)
- **Mobile**: Below `md:` (<768px)

## Styling Classes

### Core Layout
```css
bg-white shadow-md fixed top-0 inset-x-0 z-50
```

### Navigation Links
```css
text-gray-600 hover:text-blue-600 transition-colors duration-200
```

### Active Route
```css
border-b-2 border-blue-600
```

### Sign Up Button
```css
bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md
```

### Mobile Menu
```css
transition-all duration-300 ease-in-out overflow-hidden
```

## Demo & Testing

Visit `/demo` to see the navbar in action with:
- Feature showcase
- Navigation examples
- Responsive behavior demonstration

## Browser Support

- **Modern Browsers**: Full support
- **Mobile Browsers**: Optimized for touch interactions
- **Accessibility**: ARIA labels and semantic HTML

## Customization

### Modifying Navigation Items
Edit the `navItems` array in the component:

```jsx
const navItems = [
  { name: "Custom Link", link: "/custom" },
  // Add more items as needed
];
```

### Styling Adjustments
Modify Tailwind classes in the component to match your design requirements.

### Logo Integration
The component uses the existing `Logo` component from `@/components/logo`.

## File Structure

```
client1/
├── src/
│   ├── components/
│   │   ├── AuthNavbar.jsx          # Main navbar component
│   │   └── logo.jsx                # Logo component (existing)
│   └── pages/
│       ├── Auth/
│       │   ├── LoginPage.jsx       # Updated with navbar
│       │   └── SignupPage.jsx      # Updated with navbar
│       └── NavbarDemo.jsx          # Demo page
└── NAVBAR_README.md                # This documentation
```

## Performance

- **Lightweight**: Minimal bundle impact
- **Optimized**: Efficient state management
- **Smooth**: Hardware-accelerated animations
- **Responsive**: No layout shift on mobile

## Future Enhancements

Potential improvements:
- Dark mode support
- User authentication state integration
- Breadcrumb navigation
- Search functionality
- Language localization

---

**Built with ❤️ for Bhu-Nirakshak**
