# Quick Implementation Guide

## How to Use i18n and Themes in Your Components

### 1. Import the hooks

```javascript
import { useI18n } from "../store/i18n-context";
import { useTheme } from "../store/theme-context";
```

### 2. Use in your component

```javascript
function MyComponent() {
  const { t } = useI18n();
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.background,
    },
    text: {
      color: colors.text,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{t("common.welcome")}</Text>
    </View>
  );
}
```

### 3. Adding new translations

1. Add to `localization/translations/en.json`:

```json
{
  "mySection": {
    "myKey": "My English text"
  }
}
```

2. Add same structure to other language files
3. Use in component: `t('mySection.myKey')`

### 4. Using dynamic colors

Instead of hardcoded colors like `"#FFFFFF"`, use:

- `colors.background` - Main background
- `colors.surface` - Card/panel background
- `colors.text` - Primary text
- `colors.textSecondary` - Secondary text
- `colors.primary300` - Brand yellow
- `colors.accent500` - Brand red

### 5. Testing your changes

1. Navigate to Settings in the app
2. Change language and theme
3. Verify your component updates correctly

## Need help?

Check the demo component in `components/I18nThemeDemo.js` for examples!
