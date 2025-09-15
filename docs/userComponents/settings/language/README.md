# Language Settings Component

## Overview

The Language component provides a user-friendly interface for selecting the app language. It displays the current language and allows users to switch between supported languages through a modal interface.

## File Location

`/components/UserComponents/Settings/Language/Language.js`

## Features

- **Current Language Display**: Shows the currently selected language in native script
- **Language Selection Modal**: Full-screen modal with language options
- **Visual Feedback**: Selected language is highlighted with checkmark
- **Persistent Storage**: Language choice is saved to AsyncStorage
- **Real-time Updates**: UI updates immediately after language change

## Supported Languages

1. **English** - English
2. **Hindi** - हिन्दी
3. **German** - Deutsch
4. **French** - Français
5. **Chinese** - 中文

## Component Structure

### Props

This component doesn't accept any props and manages its own state.

### State

- `modalVisible` - Controls the visibility of the language selection modal

### Context Dependencies

- `useI18n()` - For language management and translations
- `useTheme()` - For theme-aware styling

## Usage

```javascript
import Language from "./Language/Language";

function Settings() {
  return (
    <View>
      <Language />
    </View>
  );
}
```

## Functions

### `handleLanguageSelect(languageCode)`

- **Purpose**: Changes the app language and closes the modal
- **Parameters**:
  - `languageCode` (string) - The language code (en, hi, de, fr, zh)
- **Behavior**:
  - Calls `changeLanguage()` from i18n context
  - Closes the modal
  - Shows confirmation in console

### `getCurrentLanguageName()`

- **Purpose**: Gets the native name of the current language
- **Returns**: String - Native language name
- **Fallback**: Returns "English" if current language not found

## Modal Structure

### Modal Content

1. **Header**: Title and close button
2. **Language List**: Scrollable list of available languages
3. **Language Options**: Each showing native name and English name

### Modal Behavior

- Slides up from bottom
- Transparent overlay
- Tap outside to close
- Close button in header

## Styling

### Key Style Elements

- **Card Design**: Rounded corners with elevation/shadow
- **Theme-Aware**: Uses colors from theme context
- **Visual Hierarchy**: Clear typography hierarchy
- **Interactive States**: Touch feedback and selection states

### Color Usage

- `colors.surface` - Card background
- `colors.text` - Primary text
- `colors.textSecondary` - Secondary text
- `colors.accent500` - Selection indicator
- `colors.border` - Dividers and borders

## Integration

### Navigation Integration

Accessible through:
User Profile → Settings → Language

### Context Integration

- Uses `I18nContext` for language management
- Uses `ThemeContext` for styling
- Integrates with app-wide translation system

## Error Handling

- Graceful fallback to English for unsupported languages
- Console error logging for debugging
- Modal state protection against invalid states

## Performance Considerations

- Lightweight modal implementation
- Minimal re-renders through context optimization
- Efficient language switching without app restart

## Accessibility

- Proper touch target sizes (44pt minimum)
- Clear visual hierarchy
- Descriptive text labels
- Keyboard navigation support (iOS)

## Future Enhancements

- RTL language support
- Voice-over accessibility
- Language search/filter
- Regional variants (en-US, en-GB, etc.)
- Automatic language detection based on device locale

## Testing Checklist

- [ ] Modal opens when language card is tapped
- [ ] All languages are displayed correctly
- [ ] Selected language shows checkmark
- [ ] Language changes immediately when selected
- [ ] Modal closes after selection
- [ ] Language persists after app restart
- [ ] Works in both light and dark themes
- [ ] Touch targets are appropriate size
- [ ] Animations are smooth
