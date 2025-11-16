# Storybook Addon: Keyboard Navigation Visualizer

A Storybook addon that helps you visualize keyboard navigation, tab order, and focus management in your components. Perfect for testing accessibility (a11y) and ensuring proper keyboard navigation flows.

![Version](https://img.shields.io/npm/v/storybook-addon-keyboard-nav-visualizer)
![License](https://img.shields.io/npm/l/storybook-addon-keyboard-nav-visualizer)

## Features

✨ **Visual Tab Order** — See numbered badges on all focusable elements showing the tab order  
⌨️ **Keyboard Event Tracking** — Track all keyboard events in real-time with timestamps  
👁️ **Focus Overlay** — Highlight the currently focused element with a blue border  
📋 **Focus History** — View a log of all focused elements during your testing session  
🎛️ **Customizable Settings** — Toggle features on/off including overlay, badges, and history tracking  
♿ **Accessibility Testing** — Identify keyboard navigation issues and WCAG compliance problems  

## Installation

```bash
npm install --save-dev storybook-addon-keyboard-nav-visualizer
# or
yarn add --dev storybook-addon-keyboard-nav-visualizer
```

## Setup

Add the addon to your Storybook configuration in `.storybook/main.js` (or `main.ts`):

```javascript
// .storybook/main.js
module.exports = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    'storybook-addon-keyboard-nav-visualizer',
    // ... other addons
  ],
};
```

## Usage

### 1. Enable the Visualizer

- Open any story in Storybook
- Click the **⌨️ Keyboard Nav** button in the toolbar (top right)
- The addon will activate and show tab order badges on focusable elements

### 2. Test Keyboard Navigation

- Press **Tab** to navigate through focusable elements
- Watch the blue **focus overlay** highlight the current element
- View **key press history** in the panel showing all keys pressed with timestamps
- View **focus history** in the panel showing the order of focused elements

### 3. Customize Settings

In the **Keyboard Navigation** panel, toggle settings:

- **Show Focus Overlay** — Display blue border around focused element
- **Show Tab Index** — Display numbered badges on focusable elements
- **Highlight on Focus** — Automatically highlight elements when focused
- **Track History** — Record keyboard and focus events

## How It Works

### Tab Order Detection

The addon automatically detects all focusable elements:
- `<a href>` links
- `<button>` elements
- `<input>` fields
- `<select>` dropdowns
- `<textarea>` elements
- Elements with `[tabindex]` attribute
- Elements with `[contenteditable="true"]`

Elements are sorted by their natural tab order based on `tabindex` values and DOM position.

### Real-Time Updates

- **Tab Order** updates automatically when elements are added/removed from the DOM
- **Keyboard Events** are logged as you press keys
- **Focus Events** are tracked as you navigate with Tab/Shift+Tab

### Event History

All events are logged with precise timestamps showing:
- **Key Press History**: Key name, code, target element, and timestamp
- **Focus History**: Focused element selector and timestamp
- **Max 50 key presses** and **30 focus changes** stored (older events removed)

## Example Story

```javascript
// Button.stories.js
import Button from './Button';

export default {
  title: 'Components/Button',
  component: Button,
};

export const Primary = () => (
  <div>
    <Button>Click Me</Button>
    <Button>Another Button</Button>
    <a href="#test">Link</a>
    <input type="text" placeholder="Text input" />
  </div>
);
```

Enable the keyboard navigation visualizer to see:
1. Numbered badges (1, 2, 3, 4) on each element
2. Blue focus overlay as you tab through
3. Key press and focus events logged in the panel

## Keyboard Shortcuts

- **Tab** — Navigate forward
- **Shift + Tab** — Navigate backward
- **Enter/Space** — Activate buttons/links
- **Arrow Keys** — Navigate in select/radio groups

All keyboard interactions are logged in the Key Press History.

## Settings Explained

| Setting | Purpose |
|---------|---------|
| **Show Focus Overlay** | Displays a blue border around the currently focused element |
| **Show Tab Index** | Shows numbered badges (1, 2, 3...) on focusable elements |
| **Highlight on Focus** | Automatically highlights elements when they receive focus |
| **Track History** | Records keyboard and focus events in the panel |

## Common Issues

### No tab order badges showing
- Make sure **Show Tab Index** is enabled in settings
- Ensure focusable elements are visible (not hidden with `display: none`)
- Check that elements are actually focusable (buttons, links, inputs, etc.)

### Focus overlay not appearing
- Enable **Show Focus Overlay** in settings
- Ensure **Highlight on Focus** is enabled
- Try tabbing to an element manually

### History not tracking
- Enable **Track History** in settings
- Make sure you're pressing keys or tabbing through elements
- Clear history with the "Clear" button to see fresh events

## Browser Support

Works with all modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Contributing

Found a bug or have a feature request? [Open an issue on GitHub](https://github.com/vaibhav111tandon/storybook-addon-keyboard-nav-visualizer/issues)

## License

MIT © [Vaibhav Tandon](https://github.com/vaibhav111tandon)

## Resources

- [Storybook Documentation](https://storybook.js.org)
- [WCAG Keyboard Accessibility](https://www.w3.org/WAI/test-evaluate/keyboard/)
- [MDN: Keyboard Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques/Using_the_tab_role)