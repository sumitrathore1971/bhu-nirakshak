# Citizen Portal Sidebar System

A responsive, collapsible sidebar component for the Bhu-Nirakshak Citizen Portal, built with React.js and TailwindCSS.

## Features

### 🖥️ Desktop View
- **Fixed left sidebar** with collapsible functionality
- **Smooth animations** using Framer Motion
- **Icon-only mode** when collapsed (80px width)
- **Full width mode** when expanded (280px width)

### 📱 Mobile View
- **Slide-in sidebar** from the left
- **Backdrop overlay** for better UX
- **Hamburger menu** toggle button in top bar
- **Touch-friendly** interactions

### 🎨 Design Features
- **Active route highlighting** with blue background
- **Consistent styling** matching Admin/Enforcement patterns
- **Dark mode support** with neutral color scheme
- **Smooth transitions** and hover effects

## Components

### Core Components

#### 1. `Sidebar.jsx`
Main sidebar component with navigation menu and logout functionality.

**Props:**
- `isCollapsed` - Boolean for collapsed state
- `setIsCollapsed` - Function to toggle collapse
- `activePage` - Current active page ID
- `setActivePage` - Function to change active page
- `isMobileOpen` - Boolean for mobile sidebar state
- `setIsMobileOpen` - Function to toggle mobile sidebar

#### 2. `CitizenLayout.jsx`
Layout wrapper that integrates sidebar with main content.

**Props:**
- `children` - Page content to render
- `activePage` - Current active page ID
- `setActivePage` - Function to change active page

#### 3. `MobileSidebarToggle.jsx`
Hamburger menu button for mobile devices.

**Props:**
- `isOpen` - Boolean for mobile sidebar state
- `setIsOpen` - Function to toggle mobile sidebar

### Page Components

#### 1. `Dashboard.jsx`
Main dashboard with stats, quick actions, and recent activity.

#### 2. `HelpGuidelines.jsx`
Help topics, guidelines, contact information, and FAQ.

#### 3. `Profile.jsx`
User profile management with personal info and account actions.

#### 4. `TrackCase.jsx`
Case tracking with search functionality and case status management.

## Menu Items

The sidebar includes the following navigation items:

1. **Dashboard** → `/citizen-dashboard`
   - Icon: `LayoutDashboard`
   - Overview of user activity and stats

2. **Report Encroachment** → `/citizen-report`
   - Icon: `FileText`
   - Form to submit new land encroachment reports

3. **My Reports** → `/citizen-my-reports`
   - Icon: `FolderOpen`
   - View and manage submitted reports

4. **Track Case** → `/citizen-track`
   - Icon: `Search`
   - Monitor case progress and status

5. **Help & Guidelines** → `/citizen-help`
   - Icon: `HelpCircle`
   - Documentation and support resources

6. **Profile** → `/citizen-profile`
   - Icon: `User`
   - Account management and settings

7. **Logout** → Clears JWT & redirects to `/login`
   - Icon: `LogOut`
   - Secure logout functionality

## Installation & Usage

### 1. Import Components
```jsx
import Sidebar from '@/components/Citizen/Sidebar';
import CitizenLayout from '@/components/Citizen/CitizenLayout';
import { MobileSidebarToggle } from '@/components/Citizen/Sidebar';
```

### 2. Basic Usage
```jsx
import CitizenLayout from '@/components/Citizen/CitizenLayout';

function MyPage() {
  const [activePage, setActivePage] = useState('dashboard');
  
  return (
    <CitizenLayout activePage={activePage} setActivePage={setActivePage}>
      {/* Your page content here */}
      <div>Page Content</div>
    </CitizenLayout>
  );
}
```

### 3. Router Integration
```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CitizenPortal from '@/pages/CitizenPortal/CitizenPortal';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/citizen-dashboard" element={<CitizenPortal />} />
        <Route path="/citizen-report" element={<CitizenPortal />} />
        {/* Add other routes */}
      </Routes>
    </BrowserRouter>
  );
}
```

## Styling

### TailwindCSS Classes
The sidebar uses consistent TailwindCSS classes:
- **Background**: `bg-white dark:bg-neutral-950`
- **Borders**: `border-gray-200 dark:border-neutral-800`
- **Text**: `text-gray-900 dark:text-white`
- **Active State**: `bg-blue-600 text-white`
- **Hover States**: `hover:bg-gray-100 dark:hover:bg-neutral-800`

### Responsive Breakpoints
- **Mobile**: `< 1024px` - Slide-in sidebar
- **Desktop**: `≥ 1024px` - Fixed sidebar

## State Management

### Local State
```jsx
const [isCollapsed, setIsCollapsed] = useState(false);
const [isMobileOpen, setIsMobileOpen] = useState(false);
const [activePage, setActivePage] = useState('dashboard');
```

### JWT Logout
```jsx
const handleLogout = () => {
  localStorage.removeItem('jwt');
  navigate('/login');
};
```

## Customization

### Adding New Menu Items
```jsx
const menuItems = [
  // ... existing items
  { 
    id: 'new-page', 
    label: 'New Page', 
    icon: NewIcon, 
    path: '/citizen-new-page' 
  },
];
```

### Changing Colors
Modify the active state color in `Sidebar.jsx`:
```jsx
// Change from blue-600 to your preferred color
className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
  activePage === item.id
    ? 'bg-green-600 text-white shadow-md' // Changed from blue-600
    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-gray-900 dark:hover:text-white'
}`}
```

### Icon Changes
Replace Lucide React icons with your preferred icon library:
```jsx
import { YourIcon } from 'your-icon-library';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: YourIcon, path: '/citizen-dashboard' },
  // ... other items
];
```

## Dependencies

- **React** ≥ 18.0.0
- **Framer Motion** ≥ 10.0.0
- **Lucide React** ≥ 0.200.0
- **TailwindCSS** ≥ 3.0.0
- **React Router DOM** ≥ 6.0.0

## Browser Support

- Chrome ≥ 88
- Firefox ≥ 85
- Safari ≥ 14
- Edge ≥ 88

## Performance

- **Lazy loading** of page components
- **Optimized animations** with Framer Motion
- **Efficient re-renders** with React hooks
- **Minimal bundle size** impact

## Accessibility

- **ARIA labels** for screen readers
- **Keyboard navigation** support
- **Focus management** for mobile sidebar
- **Semantic HTML** structure

## Troubleshooting

### Common Issues

1. **Sidebar not showing**: Check if `CitizenLayout` is properly wrapping your content
2. **Mobile sidebar not working**: Ensure `MobileSidebarToggle` is included in your top bar
3. **Active state not updating**: Verify `activePage` state is being passed correctly
4. **Styling conflicts**: Check for conflicting CSS classes or TailwindCSS configuration

### Debug Tips

- Use React DevTools to inspect component state
- Check browser console for JavaScript errors
- Verify TailwindCSS classes are being applied
- Test responsive behavior in browser dev tools

## Contributing

When modifying the sidebar:
1. Maintain consistent styling patterns
2. Test on both mobile and desktop
3. Ensure accessibility compliance
4. Update documentation for new features
5. Follow existing component structure

## License

This component is part of the Bhu-Nirakshak project and follows the project's licensing terms.
