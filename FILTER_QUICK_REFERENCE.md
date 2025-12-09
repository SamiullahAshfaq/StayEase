# 🎯 StayEase Filter System - Quick Reference Card

## 📍 Location

**Listing Search Page** → Top right corner → **"Filters"** button

## 🎛️ Available Filters

### 1️⃣ Price Range

- **Presets**: Any, <$100, $100-$200, $200-$400, $400+
- **Custom**: Enter min/max values
- **Behavior**: Presets auto-select, clear on manual input

### 2️⃣ Property Type (Multi-select)

```
House        Apartment    Condo        Villa
Cottage      Cabin        Loft         Townhouse
Bungalow     Chalet
```

### 3️⃣ Guests

- **Type**: Counter (+/- buttons)
- **Range**: 0 to ∞
- **Default**: 0 (any)

### 4️⃣ Bedrooms

```
[Any] [1] [2] [3] [4] [5] [6] [7] [8+]
```

### 5️⃣ Beds

```
[Any] [1] [2] [3] [4] [5] [6] [7] [8+]
```

### 6️⃣ Bathrooms

```
[Any] [1] [2] [3] [4] [5] [6] [7] [8+]
```

### 7️⃣ Amenities (25 total, multi-select)

```
WiFi              Kitchen           Washer
Dryer             Air conditioning  Heating
TV                Hair dryer        Iron
Pool              Hot tub           Free parking
EV charger        Gym               Breakfast
Smoking allowed   Pets allowed      Self check-in
Workspace         Fireplace         Piano
BBQ grill         Outdoor dining    Beach access
Ski-in/Ski-out
```

### 8️⃣ Booking Options

- **Instant Book**: ☐ Toggle

## 🎨 Visual States

### Button States

| State    | Appearance             |
| -------- | ---------------------- |
| Default  | White bg, gray border  |
| Hover    | White bg, black border |
| Active   | Black bg, white text   |
| Disabled | 30% opacity            |

### Badge

```
No filters: [🔧 Filters]
With filters: [🔧 Filters ②]
```

## 🏷️ Filter Chips

Active filters show as chips:

```
[$100 - $500]  [Villa]  [3+ bedrooms]  [Pool]  [WiFi]  [Clear all]
```

## ⚡ Quick Actions

| Action            | Location            | Effect                   |
| ----------------- | ------------------- | ------------------------ |
| Apply Filters     | Modal Footer        | Applies and closes modal |
| Clear All (Modal) | Modal Header/Footer | Clears temp filters      |
| Clear All (Page)  | Below results       | Resets all filters       |
| Close Modal       | ✕ button            | Cancels changes          |

## 🔢 Filter Count Logic

Badge count includes:

- ✅ 1 for price range (if set)
- ✅ 1 per property type selected
- ✅ 1 per amenity selected
- ✅ 1 for bedrooms (if set)
- ✅ 1 for beds (if set)
- ✅ 1 for bathrooms (if set)
- ✅ 1 for guests (if set)
- ✅ 1 for instant book (if enabled)

## 💡 Pro Tips

1. **Combine Filters**: All filters work together (AND logic)
2. **Use Presets**: Fastest way to set price range
3. **Any Option**: Clears room/bed/bathroom filters
4. **Multiple Amenities**: Select as many as needed
5. **Real-time Count**: "Show X stays" updates as you filter

## 📱 Responsive Breakpoints

| Device              | Modal Width    | Grid Columns |
| ------------------- | -------------- | ------------ |
| Desktop (>1024px)   | 600px          | 2            |
| Tablet (768-1023px) | 90%            | 2            |
| Mobile (<768px)     | Full - padding | 2            |

## ⌨️ Keyboard Shortcuts

- **Tab**: Navigate between fields
- **Space**: Toggle checkboxes/buttons
- **Enter**: Apply filters (when focused on button)
- **Esc**: Close modal

## 🎭 Animations

All transitions: **200ms** ease-in-out

- Border colors
- Background colors
- Text colors
- Opacity
- Transform (scale)

## 📋 Summary Display

When filters active:

```
47 stays in Miami
┌─────────────┐ ┌──────┐ ┌──────────────┐
│ $100 - $500 │ │ Villa│ │ 3+ bedrooms  │
└─────────────┘ └──────┘ └──────────────┘
┌──────┐ ┌──────┐ ┌────────────┐
│ Pool │ │ WiFi │ │ Clear all  │
└──────┘ └──────┘ └────────────┘
```

## 🐛 Common Issues

| Issue                      | Solution                                 |
| -------------------------- | ---------------------------------------- |
| Filters not applying       | Click "Show X stays" button              |
| Preset not clearing        | Type in price input to override          |
| Can't decrease guest count | Already at 0 (minimum)                   |
| Too many results           | Add more specific filters                |
| No results                 | Remove some filters or click "Clear all" |

## 🔗 Related Files

- `listing-search.component.ts` - Filter logic
- `listing-search.component.html` - Filter UI
- `listing.model.ts` - Filter interfaces
- `mock-listing.service.ts` - Data service

## ✅ Status

**Production Ready** | **Fully Tested** | **Mobile Responsive**

---

_Print this card for quick reference while developing!_
