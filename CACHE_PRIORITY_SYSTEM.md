# Maximum Cache Utilization System

## Overview

This PWA now implements an aggressive cache system designed to use as much of the available storage quota as possible (up to 285MB). The system is optimized for maximum performance and offline capability.

## Priority Levels

### 🔴 CRITICAL (Priority 1) - Always Cached

- **All HTML files** (index.html, page-Vergleich.html, page-profile-finley.html, page-videos.html, page-consulting-history.html)
- **Essential CSS** (style.css, bootstrap.css)
- **Core JavaScript** (custom.js, bootstrap.min.js)
- **Essential icons** (icon-192x192.png, icon-512x512.png, icon-384x384.png)

### 🟡 HIGH (Priority 2) - Cached When Space Available

- **All fonts** (FontAwesome complete set including brands)
- **All plugins** (glightbox, before-after, etc.)
- **All icons** (complete icon set for PWA)

### 🟠 MEDIUM (Priority 3) - Cached Selectively

- **Additional plugins** (charts, filterizr, countdown, etc.)
- **Local video files** (exercise1.mp4 through exercise5.mp4)
- **Static thumbnail images** (server-side generated)
- **External resources** (Google Fonts, DigitalOcean thumbnails)

### 🔵 LOW (Priority 4) - Cached When Storage Available

- **Large videos (.mp4, .webm, .ogg, etc.)** - Cached when storage usage < 85% (increased threshold)
- **Large images** from /images/players/ and /images/fitness/
- **DigitalOcean Spaces content** (videos and large media)
- **First to be removed** during cache cleanup

## Storage Limits - MAXIMUM UTILIZATION

- **iOS**: Uses actual system quota (fallback: 200MB if quota unavailable)
- **Other platforms**: Uses actual system quota (fallback: 250MB if quota unavailable)
- **Cleanup threshold**: 90% of available storage (aggressive utilization)
- **Video cache threshold**: 85% (videos cached until 85% storage usage)
- **HIGH priority threshold**: 95% (HIGH priority items cached until 95% full)

## How It Works

1. **Installation**: Caches CRITICAL, HIGH, and MEDIUM priority files (including local videos)
2. **Runtime Caching**: Aggressively caches content based on:
   - File priority level
   - Current storage usage (up to 90% utilization)
   - Platform detection
3. **Automatic Cleanup**: Removes LOW priority files first, then MEDIUM when storage reaches 90%
4. **Aggressive Video Caching**: Videos cached until 85% storage usage (increased from 70%)
5. **Proactive Caching**: Automatically caches external resources and thumbnails
6. **Real-time Monitoring**: Console logging every 30 seconds for cache usage tracking

## Cache Management

### Developer Tools

Access cache information in browser console:

```javascript
// Check detailed storage usage
await window.cacheManager.getStorageInfo();

// Clear all cache and reload
await window.cacheManager.clearCache();

// Log current usage (auto-runs every 30s)
await window.cacheManager.logStorageUsage();

// List all cached files
await window.cacheManager.listCachedFiles();
```

### Service Worker Debugging

Enable detailed logging by setting `APP_DIAG = true` in service-worker.js (already enabled)

## Benefits for Maximum Storage Usage

1. **Uses up to 90% of available storage** (285MB quota)
2. **Aggressive video caching** until 85% storage usage
3. **Proactive external resource caching**
4. **Real-time storage monitoring** with console logging
5. **Intelligent cleanup** maintains performance while maximizing cache
6. **Complete offline capability** for most app content

## File Changes Made

- `public/service-worker.js`: Updated to v5.0.0 with maximum cache utilization
- `scripts/custom.js`: Added comprehensive cache management utilities
- `CACHE_PRIORITY_SYSTEM.md`: Updated documentation for maximum usage strategy

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

```text
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
