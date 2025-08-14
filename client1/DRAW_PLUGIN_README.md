# Admin Dashboard Draw Plugin

The admin dashboard now includes a comprehensive drawing plugin that allows administrators to create, edit, and manage geographic features on the map.

## Features

### Drawing Tools

- **Draw Mode Toggle**: Single button to enter/exit drawing mode
- **Built-in Tools**: Access to polygon, line, and point drawing through the left-side map controls
- **Selection Tool**: Click to select and edit existing features

### Controls

- **Enter/Exit Draw Mode**: Toggle between drawing and selection modes
- **Save Drawings**: Save drawings to PostGIS database with custom tag names
- **Saved Drawings**: View and manage all saved drawings
- **Clear All**: Remove all drawn features from the map
- **Feature Info Panel**: View details about selected features

### Drawing Modes

1. **Polygon Mode**: Click to place vertices, double-click to complete
2. **Line Mode**: Click to place points along the line, double-click to finish
3. **Point Mode**: Single click to place a point
4. **Selection Mode**: Click features to select, drag to move, use handles to resize

## Usage Instructions

### Basic Drawing

1. Click the "Enter Draw Mode" button to activate drawing
2. Use the drawing tools on the left side of the map (polygon, line, point)
3. Click on the map to place vertices/points
4. Double-click to complete the feature
5. Use the "Exit Draw Mode" button to return to selection mode

### Saving Drawings

1. Click the "Save" button after creating features
2. Enter a custom tag name for your drawing in the dialog
3. Click "Save to Database" to store in PostGIS
4. Use descriptive names like "Indore-City-Center" or "Rajwada-Boundary"
5. Press Enter to save or Escape to cancel

### Managing Saved Drawings

1. Click "Saved Drawings" button to view all saved drawings
2. Click on any drawing card to load it onto the map
3. Use the export button to download as JSON file
4. Use the delete button to remove drawings from database
5. Currently loaded drawing is highlighted with "Currently Loaded" indicator

### Editing Features

1. Click on any drawn feature to select it
2. Drag the feature to move it
3. Use the corner handles to resize/modify
4. Use the trash tool to delete individual features

### Managing Features

- **Save to Database**: Store drawings in PostGIS with metadata
- **Saved Drawings**: View, load, and manage all saved drawings
- **Clear All**: Remove all drawn features
- **Feature Count**: View total number of features and breakdown by type

### Feature Information

When a feature is selected, an info panel appears showing:

- Geometry type (Polygon, LineString, Point)
- Calculated area (for polygons)
- Calculated length (for lines)
- Number of coordinate points

## Technical Details

### Dependencies

- `@mapbox/mapbox-gl-draw`: Core drawing functionality
- `mapbox-gl`: Base mapping library
- `sequelize`: Database ORM for PostGIS integration
- `pg`: PostgreSQL driver for Node.js

### Color Scheme

The draw plugin buttons now use a consistent color scheme that matches the website theme:

- **Primary Button**: Uses the website's primary color for the main draw mode toggle
- **Save Button**: Emerald green for saving features
- **Clear Button**: Rose red for clearing all drawings
- **Navigation Buttons**: Blue and emerald for map navigation

### File Structure

- **Dashboard.jsx**: Main implementation with draw controls and saved drawings management
- **drawingService.js**: API service for backend communication
- **CSS**: Styling for draw controls and feature display
- **State Management**: React state for draw mode, features, and saved drawings

### Data Format

All drawn features are stored as GeoJSON in PostGIS and can be:

- **Persisted**: Automatically saved to database with metadata
- **Retrieved**: Loaded back onto the map for editing/viewing
- **Exported**: Downloaded as JSON files for external use
- **Shared**: Accessed by other users through the database
- **Backed Up**: Securely stored with version control

### File Naming Convention

- Files are saved with the format: `[tag-name]-drawings.json`
- Examples: `Indore-Center-2024.json`, `Rajwada-Boundary.json`, `City-Planning-Zones.json`
- Custom tags help organize and identify different drawing sessions
- Tags are case-sensitive and can include spaces and special characters

### Enhanced JSON Structure

The exported JSON now includes comprehensive metadata:

```json
{
  "metadata": {
    "tagName": "Indore-City-Center",
    "exportDate": "2024-08-14T10:30:00.000Z",
    "featureCount": 3,
    "featureTypes": {
      "polygons": 2,
      "lines": 1,
      "points": 0
    }
  },
  "features": [
    // ... GeoJSON features with calculated properties
  ]
}
```

**Metadata Benefits:**

- **tagName**: Preserves the user's custom naming
- **exportDate**: Tracks when the drawing was saved
- **featureCount**: Total number of features
- **featureTypes**: Breakdown by geometry type (polygons, lines, points)

## Tips

1. **Precise Drawing**: Use the drawing tools on the left side of the map for fine control
2. **Keyboard Shortcuts**: Use the built-in Mapbox Draw shortcuts for faster editing
3. **Feature Selection**: Click on features to see detailed information
4. **Area Calculation**: Polygon areas are automatically calculated in square kilometers
5. **Length Calculation**: Line lengths are automatically calculated in kilometers
6. **Smart Naming**: Use descriptive tag names for better database organization
7. **Quick Save**: Press Enter in the save dialog to quickly save to database
8. **Cancel Save**: Press Escape to cancel the save operation
9. **Database Storage**: All drawings are automatically saved to PostGIS with metadata
10. **Easy Retrieval**: Click on saved drawing cards to load them back onto the map
11. **Export Options**: Download drawings as JSON files for external use
12. **Collaboration**: Share drawings with team members through the database

## Browser Compatibility

The draw plugin works in all modern browsers that support:

- ES6+ JavaScript features
- Canvas rendering
- Touch events (for mobile devices)

## Backend Integration

### PostGIS Database

The system now integrates with PostGIS for persistent storage:

- **Automatic Sync**: Database tables are created automatically on startup
- **User Isolation**: Each user's drawings are stored separately
- **Soft Delete**: Drawings are marked as inactive rather than permanently removed
- **Metadata Storage**: Complete drawing information including coordinates and properties

### API Endpoints

- `GET /api/drawings` - Fetch all drawings for current user
- `GET /api/drawings/:id` - Get specific drawing by ID
- `POST /api/drawings` - Save new drawing to database
- `PUT /api/drawings/:id` - Update existing drawing
- `DELETE /api/drawings/:id` - Soft delete drawing
- `GET /api/drawings/stats/summary` - Get drawing statistics

### Environment Variables

Required backend environment variables:

```
PGUSER=postgres
PGHOST=localhost
PGDATABASE=postgres
PGPASSWORD=your_password
PGPORT=5432
```

## Troubleshooting

- **Features not appearing**: Check browser console for errors
- **Drawing tools missing**: Ensure Mapbox token is properly configured
- **Database connection issues**: Verify PostGIS credentials and connection
- **Save failures**: Check authentication token and backend connectivity
- **Performance issues**: Limit the number of complex features on large maps
- **Export failures**: Check browser download settings and permissions
