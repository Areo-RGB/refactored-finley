# Cache Priority System for iOS Storage Limits

## Overview

This PWA now implements a smart cache priority system designed to handle iOS storage limitations effectively. Videos are set to lowest priority (never cached) as requested.

## Priority Levels

### 🔴 CRITICAL (Priority 1) - Always Cached

- Core HTML files (index.html)
- Essential CSS (style.css, bootstrap.css)
- Core JavaScript (custom.js, bootstrap.min.js)
- Essential icons (empty.png, icon-192x192.png)

### 🟡 HIGH (Priority 2) - Cached When Space Available

- Essential fonts (FontAwesome core files)
- Core plugins (glightbox)

### 🟠 MEDIUM (Priority 3) - Cached Selectively

- Additional fonts (brands, etc.)
- Optional plugins (charts, filterizr, etc.)
- **Static thumbnail images (server-side generated)**

### 🔵 LOW (Priority 4) - Never Cached

- **Videos (.mp4, .webm, .ogg, etc.)**
- Large images from /images/players/ and /images/fitness/
- Content from DigitalOcean Spaces

## Storage Limits

- **iOS**: 50MB maximum cache size
- **Other platforms**: 100MB maximum cache size
- **Cleanup threshold**: 80% of available storage

## How It Works

1. **Installation**: Only caches CRITICAL, HIGH, and MEDIUM priority files
2. **Runtime Caching**: Dynamically decides what to cache based on:
   - File priority level
   - Current storage usage
   - Platform (iOS vs others)
3. **Automatic Cleanup**: Removes MEDIUM priority files when storage is 80% full
4. **Video Exclusion**: Videos are never cached, always streamed from network
5. **Server-Side Thumbnails**: Static thumbnail images are cached as MEDIUM priority using video poster attributes

## Cache Management

### Developer Tools

Access cache information in browser console:

```javascript
// Check storage usage
await window.cacheManager.getStorageInfo();

// Clear all cache
await window.cacheManager.clearCache();

// Log current usage
await window.cacheManager.logStorageUsage();
```

### Service Worker Debugging

Enable detailed logging by setting `APP_DIAG = true` in service-worker.js

## Benefits for iOS

1. **Respects iOS Safari storage limits**
2. **Prevents cache eviction** by staying under limits
3. **Prioritizes essential app functionality**
4. **Excludes large video files** that would quickly fill cache
5. **Automatic cleanup** prevents storage overflow

## File Changes Made

- `public/service-worker.js`: Complete rewrite with priority system
- `scripts/custom.js`: Enabled PWA and added cache utilities
- `manifest.json`: Updated version and description
- `public/manifest.json`: Updated to match

## Testing

1. Open browser developer tools
2. Check console for storage usage logs
3. Monitor Network tab to see what gets cached
4. Test on iOS devices to verify storage limits are respected

The system will automatically log storage usage 2 seconds after page load when PWA is enabled.

## Server-Side Thumbnail Implementation

### **Thumbnail Structure**

- **Videos**: Stored in DigitalOcean Spaces root
- **Thumbnails**: Stored in `/thumbnails/` subfolder
- **Naming**: `video-name.mp4` → `video-name.jpg`

### **Example URLs**

```
Video:     https://videos-data.fra1.cdn.digitaloceanspaces.com/3.mp4
Thumbnail: https://videos-data.fra1.cdn.digitaloceanspaces.com/thumbnails/3.jpg
```

### **HTML Implementation**

```html
<video
  poster="https://videos-data.fra1.cdn.digitaloceanspaces.com/thumbnails/video-name.jpg"
>
  <source
    src="https://videos-data.fra1.cdn.digitaloceanspaces.com/video-name.mp4"
  />
</video>
```

### **Thumbnail Generation**

Use the included thumbnail generator:

```javascript
// Generate all thumbnails
await window.thumbnailGenerator.generateAllThumbnails();

// Download as ZIP for upload
await window.thumbnailGenerator.downloadThumbnailsAsZip();
```

### **Benefits**

- ✅ **Instant Loading**: Thumbnails show immediately
- ✅ **Cache Friendly**: Static images cache perfectly
- ✅ **No Client Processing**: No CPU usage for extraction
- ✅ **Consistent Quality**: Server-generated thumbnails are uniform
- ✅ **iOS Optimized**: Small file sizes respect storage limits
