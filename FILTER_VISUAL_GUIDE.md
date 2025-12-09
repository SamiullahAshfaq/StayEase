# StayEase Filter Button - Visual Guide

## Filter Button Location

The filter button appears in the listing search page header, next to the search results count.

```
┌─────────────────────────────────────────────────────────────┐
│  X stays in [Location]                      [🔧 Filters] ②  │
│  [$100 - $500]  [Villa]  [3+ bedrooms]  [Clear all]        │
└─────────────────────────────────────────────────────────────┘
```

## Filter Button States

### 1. Default State (No Active Filters)

```
┌─────────────────┐
│  🔧  Filters    │
└─────────────────┘
```

### 2. With Active Filters

```
┌─────────────────────┐
│  🔧  Filters    ⑫   │
└─────────────────────┘
```

_Badge shows number of active filter criteria_

## Filter Modal Layout

```
┌──────────────────────────────────────────────────────────────┐
│  ✕              Filters                        Clear all      │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  Price range                                                   │
│  [Any price] [Under $100] [$100-$200] [$200-$400] [$400+]   │
│  Minimum: [$____]        Maximum: [$____]                     │
│                                                                │
│  ─────────────────────────────────────────────────────────    │
│                                                                │
│  Property type                                                 │
│  [House]      [Apartment]   [Condo]      [Villa]             │
│  [Cottage]    [Cabin]       [Loft]       [Townhouse]         │
│  [Bungalow]   [Chalet]                                        │
│                                                                │
│  ─────────────────────────────────────────────────────────    │
│                                                                │
│  Guests                                                        │
│  Number of guests                            [-]  4  [+]       │
│                                                                │
│  ─────────────────────────────────────────────────────────    │
│                                                                │
│  Rooms and beds                                                │
│  Bedrooms                                                      │
│  [Any] [1] [2] [3] [4] [5] [6] [7] [8+]                      │
│                                                                │
│  Beds                                                          │
│  [Any] [1] [2] [3] [4] [5] [6] [7] [8+]                      │
│                                                                │
│  Bathrooms                                                     │
│  [Any] [1] [2] [3] [4] [5] [6] [7] [8+]                      │
│                                                                │
│  ─────────────────────────────────────────────────────────    │
│                                                                │
│  Amenities                                                     │
│  ☑ WiFi              ☑ Kitchen                                │
│  ☐ Washer            ☑ Dryer                                  │
│  ☑ Air conditioning  ☐ Heating                                │
│  ☐ TV                ☐ Hair dryer                             │
│  ☐ Iron              ☑ Pool                                   │
│  ☐ Hot tub           ☑ Free parking                           │
│  ... (25 total)                                                │
│  5 amenities selected                                          │
│                                                                │
│  ─────────────────────────────────────────────────────────    │
│                                                                │
│  Booking options                                               │
│  ☑ Instant Book                                                │
│     Listings you can book without waiting for approval         │
│                                                                │
├──────────────────────────────────────────────────────────────┤
│  Clear all                           [Show 47 stays]          │
└──────────────────────────────────────────────────────────────┘
```

## Active Filter Chips

When filters are active, they appear as chips:

```
┌──────────────────────────────────────────────────────────────┐
│  47 stays in Miami                                            │
│  ┌─────────────┐ ┌──────┐ ┌──────────────┐ ┌────────────┐   │
│  │ $100 - $500 │ │ Villa│ │ 3+ bedrooms  │ │ Clear all  │   │
│  └─────────────┘ └──────┘ └──────────────┘ └────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

## Filter Behavior

### Price Range

- **Quick Presets**: Click preset button to set common ranges
- **Custom Values**: Type min/max values
- **Auto-clear**: Preset selection clears when manually typing

### Property Types

- **Multi-select**: Click multiple types
- **Toggle**: Click again to deselect
- **Visual feedback**: Selected items have black border + gray background

### Guests

- **Counter**: Use +/- buttons
- **Minimum 0**: Cannot go below 0
- **No maximum**: Can increment infinitely

### Rooms/Beds/Bathrooms

- **Any option**: Clears the filter
- **Number selection**: Click to select minimum count
- **8+ option**: Represents 8 or more
- **Visual feedback**: Active selections turn black with white text

### Amenities

- **Checkboxes**: Multi-select any combination
- **Counter**: Shows "X amenities selected"
- **Grid layout**: 2 columns for easy scanning

### Instant Book

- **Toggle**: Single checkbox
- **Description**: Explains what it means

## Button States

### Normal Button

```css
Border: gray-300
Background: white
Text: black
```

### Hover Button

```css
Border: black
Background: white
Text: black
```

### Selected Button

```css
Border: black
Background: black
Text: white
```

### Disabled Button

```css
Opacity: 30%
Cursor: not-allowed
```

## Responsive Design

### Desktop (1024px+)

- Modal: 600px width
- Grid: 2 columns for amenities/property types
- Full layout visible

### Tablet (768px - 1023px)

- Modal: 90% width
- Grid: 2 columns maintained
- Scrollable content

### Mobile (< 768px)

- Modal: Full width with padding
- Grid: 2 columns (stacked)
- Optimized touch targets (min 44px)

## Animations

All interactions have smooth 200ms transitions:

- Border color changes
- Background color changes
- Text color changes
- Opacity changes
- Transform (scale on hover)

## Accessibility Features

✅ Keyboard navigation
✅ Focus indicators
✅ ARIA labels on buttons
✅ Clear visual states
✅ Disabled state indicators
✅ Semantic HTML structure

---

**Pro Tip**: The filter system works exactly like Airbnb's - users can combine multiple filters, and all are applied together when clicking "Show X stays".
