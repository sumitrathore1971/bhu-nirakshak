# Admin Dashboard Draw Plugin

The admin dashboard now includes a comprehensive drawing plugin that allows administrators to create, edit, and manage geographic features on the map.

## Features

### Drawing Tools

- **Draw Mode Toggle**: Single button to enter/exit drawing mode
- **Built-in Tools**: Access to polygon, line, and point drawing through the left-side map controls
- **Selection Tool**: Click to select and edit existing features

### Controls

- **Enter/Exit Draw Mode**: Toggle between drawing and selection modes
- **Save Drawings**: Export all drawn features as GeoJSON with custom tag names
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
3. The file will be saved as `[your-tag-name]-drawings.json`
4. Use descriptive names like "Indore-City-Center" or "Rajwada-Boundary"
5. Press Enter to save or Escape to cancel

### Editing Features

1. Click on any drawn feature to select it
2. Drag the feature to move it
3. Use the corner handles to resize/modify
4. Use the trash tool to delete individual features

### Managing Features

- **Save**: Export all features as a GeoJSON file with custom naming
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

### Color Scheme

The draw plugin buttons now use a consistent color scheme that matches the website theme:

- **Primary Button**: Uses the website's primary color for the main draw mode toggle
- **Save Button**: Emerald green for saving features
- **Clear Button**: Rose red for clearing all drawings
- **Navigation Buttons**: Blue and emerald for map navigation

### File Structure

- **Dashboard.jsx**: Main implementation with draw controls
- **CSS**: Styling for draw controls and feature display
- **State Management**: React state for draw mode and features

### Data Format

All drawn features are stored as GeoJSON and can be exported for:

- Further analysis in GIS software
- Integration with other systems
- Backup and restoration
- Sharing with other users

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
6. **Smart Naming**: Use descriptive tag names for better file organization
7. **Quick Save**: Press Enter in the save dialog to quickly save your drawings
8. **Cancel Save**: Press Escape to cancel the save operation
9. **Enhanced JSON**: Exported files include metadata with tag name, date, and feature counts
10. **Data Preservation**: Tag names are embedded in the JSON for future reference

## Browser Compatibility

The draw plugin works in all modern browsers that support:

- ES6+ JavaScript features
- Canvas rendering
- Touch events (for mobile devices)

## Troubleshooting

- **Features not appearing**: Check browser console for errors
- **Drawing tools missing**: Ensure Mapbox token is properly configured
- **Performance issues**: Limit the number of complex features on large maps
- **Export failures**: Check browser download settings and permissions
