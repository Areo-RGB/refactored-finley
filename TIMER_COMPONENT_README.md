# Timer Text Component Implementation
3
## Overview

This implementation provides a timer functionality that displays different text based on the countdown timer. The main feature is that when the timer reaches 5 seconds, the text changes from "Power Lifting Professional Level - Video Training" to "NEXT Up".

## Files Modified/Created

### 1. `page-profile-finley.html`
- **Modified**: `startVideoTimer()` function to include text change logic
- **Added**: Text overlay reset functionality
- **Added**: Timer-based text change at 5 seconds
- **Added**: Component script inclusion

### 2. `js/components/timer-text-component.js` (New)
- **Created**: Reusable TimerTextComponent class
- **Features**: 
  - Configurable timer duration
  - Multiple text change triggers
  - Callback on completion
  - Start/stop/reset functionality

### 3. `timer-component-demo.html` (New)
- **Created**: Demo page showing component usage
- **Features**: Two examples with different configurations

## Implementation Details

### Current Implementation (Direct)

The timer functionality is directly implemented in the `startVideoTimer()` function:

```javascript
// Change text when timer reaches 5 seconds
if (seconds === 5 && textOverlay) {
    const titleElement = textOverlay.querySelector('h1');
    const subtitleElement = textOverlay.querySelector('p');
    if (titleElement) titleElement.textContent = 'NEXT Up';
    if (subtitleElement) subtitleElement.textContent = '';
}
```

### Component-Based Implementation (Alternative)

A reusable component approach is also available:

```javascript
const timerComponent = new TimerTextComponent({
    timerElement: timerElement,
    textElement: textOverlay,
    initialDuration: 15,
    textChanges: [
        {
            triggerTime: 5,
            title: 'NEXT Up',
            subtitle: ''
        }
    ],
    onComplete: function() {
        loadNextVideo(card);
    }
});
```

## Features

### Timer Functionality
- 15-second countdown timer
- Visual timer display with red color and pulsing animation when ≤ 5 seconds
- Automatic video switching when timer reaches 0

### Text Changes
- **Initial Text**: "Power Lifting" / "Professional Level - Video Training"
- **At 5 seconds**: "NEXT Up" / (empty subtitle)
- **Reset**: Returns to original text when timer restarts

### Component Features
- **Configurable duration**: Set any initial timer duration
- **Multiple triggers**: Define multiple text changes at different times
- **Flexible text content**: Customize title and subtitle for each trigger
- **Event callbacks**: Execute custom functions when timer completes
- **State management**: Start, stop, reset functionality
- **Reusable**: Can be used across different parts of the application

## Usage Examples

### Basic Usage (Current Implementation)
The timer automatically starts when a video begins playing and changes text at 5 seconds.

### Component Usage
```javascript
const timer = new TimerTextComponent({
    timerElement: document.getElementById('timer'),
    textElement: document.getElementById('text-overlay'),
    initialDuration: 15,
    textChanges: [
        { triggerTime: 10, title: 'Prepare', subtitle: 'Get ready' },
        { triggerTime: 5, title: 'NEXT Up', subtitle: '' }
    ],
    onComplete: () => console.log('Timer finished!')
});

timer.start();
```

## Testing

To test the implementation:

1. **Live Testing**: Open `page-profile-finley.html` and play a video to see the timer in action
2. **Component Demo**: Open `timer-component-demo.html` to see the component examples
3. **Manual Testing**: The timer should change text from "Power Lifting Professional Level - Video Training" to "NEXT Up" when it reaches 5 seconds

## Browser Compatibility

- Modern browsers supporting ES6 classes
- No external dependencies required
- Uses standard DOM APIs

## Future Enhancements

- Add sound notifications at specific timer intervals
- Support for custom animations during text changes
- Integration with workout progression systems
- Accessibility improvements (screen reader support)
- Mobile-specific optimizations
