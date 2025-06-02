// To clear cache on devices, always increase APP_VER number after making changes.
// The app will serve fresh content right away or after 2-3 refreshes (open / close)
var APP_NAME = "QuoVadis";
var APP_VER = "4.9.0"; // Incremented for video caching enabled
var CACHE_NAME = APP_NAME + "-" + APP_VER;

// iOS Storage Limits and Configuration
var IOS_MAX_STORAGE = 50 * 1024 * 1024; // 50MB fallback for iOS (use actual quota when available)
var GENERAL_MAX_STORAGE = 100 * 1024 * 1024; // 100MB fallback for other platforms
var CACHE_CLEANUP_THRESHOLD = 0.95; // Clean up when 95% full (increased from 80% to use more available storage)

// Cache Priority Levels
var PRIORITY = {
  CRITICAL: 1, // Always cache - core app functionality
  HIGH: 2, // Cache when space available - essential UI
  MEDIUM: 3, // Cache selectively - nice-to-have features
  LOW: 4, // Never cache - videos and large media
};

// Priority-based file categorization
var CACHE_FILES = {
  [PRIORITY.CRITICAL]: [
    // Core HTML files
    "index.html",
    // Essential styles
    "styles/style.css",
    "styles/bootstrap.css",
    // Core scripts
    "scripts/custom.js",
    "scripts/bootstrap.min.js",
    // Essential icons
    "app/icons/icon-192x192.png",
  ],

  [PRIORITY.HIGH]: [
    // Essential fonts
    "fonts/css/fontawesome-all.min.css",
    "fonts/webfonts/fa-solid-900.woff2",
    "fonts/webfonts/fa-regular-400.woff2",
    // Core plugins
    "plugins/glightbox/glightbox.js",
    "plugins/glightbox/glightbox.css",
  ],

  [PRIORITY.MEDIUM]: [
    // Additional fonts
    "fonts/webfonts/fa-brands-400.woff2",
    // Optional plugins
    "plugins/before-after/before-after.css",
    "plugins/before-after/before-after.js",
    "plugins/charts/charts.js",
    "plugins/charts/charts-call-graphs.js",
    "plugins/countdown/countdown.js",
    "plugins/filterizr/filterizr.js",
    "plugins/filterizr/filterizr.css",
    "plugins/filterizr/filterizr-call.js",
    "plugins/galleryViews/gallery-views.js",
    "plugins/glightbox/glightbox-call.js",
    // Small images and thumbnails (dynamically cached)
    "thumbnail",
    "thumb",
    "preview",
  ],

  // PRIORITY.LOW files (videos, large images) - cached when storage available, cleaned up first
};

// Service Worker Diagnostic. Set true to get console logs.
var APP_DIAG = false;

// Utility Functions
function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function getMaxStorage() {
  return isIOS() ? IOS_MAX_STORAGE : GENERAL_MAX_STORAGE;
}

function isVideoRequest(url) {
  return (
    /\.(mp4|webm|ogg|avi|mov)(\?.*)?$/i.test(url) ||
    url.includes("digitaloceanspaces.com") ||
    url.includes("/videos/") ||
    url.includes("video")
  );
}

function isThumbnailRequest(url) {
  return (
    url.includes("/thumbnails/") ||
    url.includes("thumbnail") ||
    (/\.(jpg|jpeg|png|webp)(\?.*)?$/i.test(url) &&
      (url.includes("thumb") || url.includes("preview")))
  );
}

function isLargeImageRequest(url) {
  return (
    /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url) &&
    (url.includes("/images/players/") || url.includes("/images/fitness/"))
  );
}

async function getStorageUsage() {
  if ("storage" in navigator && "estimate" in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return {
      used: estimate.usage || 0,
      available: estimate.quota || getMaxStorage(),
      percentage: estimate.usage
        ? estimate.usage / (estimate.quota || getMaxStorage())
        : 0,
    };
  }
  return { used: 0, available: getMaxStorage(), percentage: 0 };
}

async function shouldCache(request, priority) {
  const url = request.url;

  // Check storage for videos and large images (LOW priority)
  if (isVideoRequest(url) || isLargeImageRequest(url)) {
    const storage = await getStorageUsage();
    // Only cache videos/large images when storage usage is below 70%
    if (storage.percentage > 0.7) {
      if (APP_DIAG)
        console.log(
          "SW: Storage too full for video/large image:",
          url,
          storage.percentage
        );
      return false;
    }
    if (APP_DIAG)
      console.log("SW: Caching video/large image (LOW priority):", url);
    return true;
  }

  // Cache thumbnails as MEDIUM priority
  if (isThumbnailRequest(url)) {
    const storage = await getStorageUsage();
    const isNearLimit = storage.percentage > CACHE_CLEANUP_THRESHOLD;

    if (isNearLimit) {
      if (APP_DIAG)
        console.log("SW: Storage near limit, skipping thumbnail:", url);
      return false;
    }

    if (APP_DIAG) console.log("SW: Caching thumbnail as MEDIUM priority:", url);
    return true;
  }

  // Always cache CRITICAL files
  if (priority === PRIORITY.CRITICAL) {
    return true;
  }

  // Check storage usage for other priorities
  const storage = await getStorageUsage();
  const isNearLimit = storage.percentage > CACHE_CLEANUP_THRESHOLD;

  // Always cache HIGH priority items unless extremely close to limit
  if (priority === PRIORITY.HIGH) {
    return storage.percentage < 0.98; // Only skip HIGH priority at 98% full
  }

  // For MEDIUM priority, respect the cleanup threshold
  if (isNearLimit && priority > PRIORITY.HIGH) {
    if (APP_DIAG)
      console.log("SW: Storage near limit, skipping medium/low priority:", url);
    return false;
  }

  return true;
}

async function cleanupCache() {
  const storage = await getStorageUsage();

  if (storage.percentage < CACHE_CLEANUP_THRESHOLD) {
    return; // No cleanup needed
  }

  if (APP_DIAG)
    console.log("SW: Starting cache cleanup, usage:", storage.percentage);

  const cache = await caches.open(CACHE_NAME);
  const requests = await cache.keys();

  // Remove LOW priority files first (videos), then MEDIUM, then HIGH (never remove CRITICAL)
  const toDelete = [];

  // First pass: Remove videos and large images (LOW priority)
  for (const request of requests) {
    const url = request.url;
    if (isVideoRequest(url) || isLargeImageRequest(url)) {
      toDelete.push(request);
    }
  }

  // Second pass: If still need space, remove MEDIUM priority files
  if (toDelete.length === 0) {
    for (const request of requests) {
      const url = request.url;
      const isMediumPriority = CACHE_FILES[PRIORITY.MEDIUM].some((file) =>
        url.includes(file)
      );

      if (isMediumPriority || isThumbnailRequest(url)) {
        toDelete.push(request);
      }
    }
  }

  // Delete selected files
  for (const request of toDelete) {
    await cache.delete(request);
    if (APP_DIAG) console.log("SW: Deleted from cache:", request.url);
  }
}

//Service Worker Function Below.
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(function (cache) {
        //Adding files to cache with priority system
        const filesToCache = [
          ...CACHE_FILES[PRIORITY.CRITICAL],
          ...CACHE_FILES[PRIORITY.HIGH],
          ...CACHE_FILES[PRIORITY.MEDIUM],
        ];
        return cache.addAll(filesToCache);
      })
      .catch(function (error) {
        //Output error if file locations are incorrect
        if (APP_DIAG) {
          console.log(
            "Service Worker Cache: Error Check REQUIRED_FILES array in _service-worker.js - files are missing or path to files is incorrectly written -  " +
              error
          );
        }
      })
      .then(function () {
        //Install SW if everything is ok
        return self.skipWaiting();
      })
      .then(function () {
        if (APP_DIAG) {
          console.log("Service Worker: Cache is OK");
        }
      })
  );
  if (APP_DIAG) {
    console.log("Service Worker: Installed");
  }
});

self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request).then(async function (response) {
      // Return cached response if available
      if (response) {
        if (APP_DIAG) console.log("SW: Serving from cache:", event.request.url);
        return response;
      }

      // Fetch from network
      try {
        const networkResponse = await fetch(event.request);

        // Don't cache if it's not a successful response
        if (
          !networkResponse ||
          networkResponse.status !== 200 ||
          networkResponse.type !== "basic"
        ) {
          return networkResponse;
        }

        // Determine priority and cache if appropriate
        const url = event.request.url;
        let priority = PRIORITY.MEDIUM; // Default priority

        // Check if it's a video or large image (LOW priority)
        if (isVideoRequest(url) || isLargeImageRequest(url)) {
          priority = PRIORITY.LOW;
          if (APP_DIAG)
            console.log("SW: Detected video/large image request:", url);
        }
        // Check if it's a thumbnail (MEDIUM priority)
        else if (isThumbnailRequest(url)) {
          priority = PRIORITY.MEDIUM;
          if (APP_DIAG) console.log("SW: Detected thumbnail request:", url);
        }
        // Check if it's a critical file
        else if (
          CACHE_FILES[PRIORITY.CRITICAL].some((file) => url.includes(file))
        ) {
          priority = PRIORITY.CRITICAL;
        } else if (
          CACHE_FILES[PRIORITY.HIGH].some((file) => url.includes(file))
        ) {
          priority = PRIORITY.HIGH;
        }

        // Check if we should cache based on priority and storage
        if (await shouldCache(event.request, priority)) {
          const cache = await caches.open(CACHE_NAME);

          // Clean up cache if needed before adding new items
          await cleanupCache();

          // Clone the response before caching
          cache.put(event.request, networkResponse.clone());

          if (APP_DIAG) {
            const type = isThumbnailRequest(url) ? "thumbnail" : "file";
            console.log(`SW: Cached ${type} with priority`, priority, ":", url);
          }
        }

        return networkResponse;
      } catch (error) {
        if (APP_DIAG) console.log("SW: Fetch failed:", error);

        // Return a basic offline page or error response
        if (event.request.destination === "document") {
          return new Response("App is offline. Please check your connection.", {
            status: 503,
            statusText: "Service Unavailable",
            headers: { "Content-Type": "text/plain" },
          });
        }

        throw error;
      }
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(self.clients.claim());
  event.waitUntil(
    //Check cache number, clear all assets and re-add if cache number changed
    caches.keys().then(async (cacheNames) => {
      // Delete old caches
      await Promise.all(
        cacheNames
          .filter((cacheName) => cacheName.startsWith(APP_NAME + "-"))
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );

      // Perform initial cache cleanup if needed
      await cleanupCache();

      // Log storage usage for debugging
      if (APP_DIAG) {
        const storage = await getStorageUsage();
        console.log("SW: Storage usage after activation:", {
          used: Math.round(storage.used / 1024 / 1024) + "MB",
          available: Math.round(storage.available / 1024 / 1024) + "MB",
          percentage: Math.round(storage.percentage * 100) + "%",
          isIOS: isIOS(),
        });
      }
    })
  );
  if (APP_DIAG) {
    console.log("Service Worker: Activated with priority caching system");
  }
});
