# Theme Mode Settings Component

## Overview

The Mode component provides a user-friendly interface for selecting the app's theme (appearance). It displays the current theme and allows users to switch between Light Mode, Dark Mode, and System Default through a modal interface.

## File Location

`/components/UserComponents/Settings/Mode/Mode.js`

## Features

- **Current Theme Display**: Shows the currently selected theme with appropriate icon
- **Theme Selection Modal**: Modal with theme options and descriptions
- **Visual Feedback**: Selected theme is highlighted with checkmark
- **System Integration**: Follows device system theme when set to "System Default"
- **Persistent Storage**: Theme choice is saved to AsyncStorage
- **Real-time Updates**: UI updates immediately after theme change

## Available Themes

### 1. Light Mode

- **Icon**: ☀️ `sunny`
- **Description**: Always use light theme
- **Colors**: Bright backgrounds, dark text
- **Use Case**: Daytime usage, better battery life on LCD screens

### 2. Dark Mode

- **Icon**: 🌙 `moon`
- **Description**: Always use dark theme
- **Colors**: Dark backgrounds, light text
- **Use Case**: Night usage, easier on eyes, battery savings on OLED

### 3. System Default

- **Icon**: 📱 `phone-portrait`
- **Description**: Follow system setting
- **Behavior**: Automatically switches based on device theme
- **Use Case**: User prefers device-wide consistency

## Component Structure

### Props

This component doesn't accept any props and manages its own state.

### State

- `modalVisible` - Controls the visibility of the theme selection modal

### Context Dependencies

- `useTheme()` - For theme management and styling
- `useI18n()` - For internationalized text labels

## Usage

```javascript
import Mode from "./Mode/Mode";

function Settings() {
  return (
    <View>
      <Mode />
    </View>
  );
}
```

## Functions

### `handleThemeSelect(themeValue)`

- **Purpose**: Changes the app theme and closes the modal
- **Parameters**:
  - `themeValue` (string) - The theme value ('light', 'dark', 'system')
- **Behavior**:
  - Calls `changeTheme()` from theme context
  - Closes the modal
  - Updates UI immediately

### `getCurrentThemeLabel()`

- **Purpose**: Gets the localized label of the current theme
- **Returns**: String - Localized theme name
- **Fallback**: Returns "System Default" if current theme not found

### `getCurrentThemeIcon()`

- **Purpose**: Gets the appropriate icon for the current theme
- **Returns**: String - Ionicon name
- **Fallback**: Returns "phone-portrait" if current theme not found

## Modal Structure

### Modal Content

1. **Header**: Title and close button
2. **Theme List**: List of available theme options
3. **Theme Options**: Each showing icon, name, and description
4. **Footer**: Current theme status indicator

### Modal Behavior

- Slides up from bottom
- Transparent overlay
- Tap outside to close
- Close button in header
- Visual feedback for selection

## Theme Options Details

### Option Structure

```javascript
{
  value: 'light',           // Theme identifier
  label: 'Light Mode',      // Localized display name
  icon: 'sunny',           // Ionicon name
  description: 'Always use light theme'  // Description text
}
```

### Selection Indicators

- **Icon Color**: Changes to accent color when selected
- **Text Color**: Changes to accent color when selected
- **Checkmark**: Appears next to selected option
- **Background**: Highlighted background for selected option

## Styling

### Key Style Elements

- **Card Design**: Rounded corners with elevation/shadow
- **Theme-Aware**: Uses colors from theme context
- **Interactive States**: Touch feedback and hover states
- **Visual Hierarchy**: Clear typography and spacing

### Color Usage

- `colors.surface` - Card and option backgrounds
- `colors.text` - Primary text
- `colors.textSecondary` - Secondary text and descriptions
- `colors.accent500` - Selection indicators
- `colors.primary50` - Selected option background
- `colors.border` - Dividers and borders

## System Theme Integration

### Automatic Detection

- Listens to system appearance changes
- Updates UI automatically when system theme changes
- Only active when "System Default" is selected

### Platform Support

- iOS: Full system integration
- Android: Supported on Android 10+
- Fallback: Uses light theme on older versions

## Integration

### Navigation Integration

Accessible through:
User Profile → Settings → Appearance

### Context Integration

- Uses `ThemeContext` for theme management
- Uses `I18nContext` for localized labels
- Integrates with app-wide theming system

## Error Handling

- Graceful fallback to system theme for invalid values
- Console error logging for debugging
- Modal state protection against invalid states

## Performance Considerations

- Lightweight modal implementation
- Minimal re-renders through context optimization
- Efficient theme switching without app restart
- Automatic cleanup of system listeners

## Accessibility

- Proper touch target sizes (44pt minimum)
- Clear visual hierarchy with icons and descriptions
- Descriptive text labels for screen readers
- High contrast ratios in both themes

## Color System

### Light Theme Colors

```javascript
{
  background: '#FFFFFF',
  surface: '#F5F5F5',
  text: '#000000',
  textSecondary: '#666666',
  // ... more colors
}
```

### Dark Theme Colors

```javascript
{
  background: '#0B111B',
  surface: '#1A1A1A',
  text: '#FFFFFF',
  textSecondary: '#CCCCCC',
  // ... more colors
}
```

## Future Enhancements

- High contrast theme option
- Custom theme creation
- Scheduled theme switching (automatic dark mode at sunset)
- More theme variants (sepia, blue light filter)
- Theme preview before selection

## Testing Checklist

- [ ] Modal opens when appearance card is tapped
- [ ] All theme options are displayed correctly
- [ ] Selected theme shows checkmark and highlighting
- [ ] Theme changes immediately when selected
- [ ] Modal closes after selection
- [ ] Theme persists after app restart
- [ ] System default follows device theme changes
- [ ] Footer shows correct current theme status
- [ ] Icons display correctly for each theme
- [ ] Touch targets are appropriate size
- [ ] Animations are smooth
- [ ] Works correctly on both iOS and Android

## Troubleshooting

### Common Issues

1. **Modal not showing content**: Check theme context initialization
2. **System theme not updating**: Verify Appearance listener setup
3. **Colors not changing**: Ensure components use theme context colors
4. **Persistence not working**: Check AsyncStorage permissions

### Debug Tips

- Check console for theme change logs
- Verify context providers are properly wrapped
- Test on both physical device and simulator
- Test system theme changes in device settings
