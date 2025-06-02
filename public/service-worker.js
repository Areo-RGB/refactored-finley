// To clear cache on devices, always increase APP_VER number after making changes.
// The app will serve fresh content right away or after 2-3 refreshes (open / close)
var APP_NAME = "QuoVadis";
var APP_VER = "4.8.5"; // Incremented for consistent dark theme
var CACHE_NAME = APP_NAME + "-" + APP_VER;

// iOS Storage Limits and Configuration
var IOS_MAX_STORAGE = 50 * 1024 * 1024; // 50MB limit for iOS
var GENERAL_MAX_STORAGE = 100 * 1024 * 1024; // 100MB for other platforms
var CACHE_CLEANUP_THRESHOLD = 0.8; // Clean up when 80% full

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

  // PRIORITY.LOW files (videos, large images) are never cached
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

  // Never cache videos or large images (LOW priority)
  if (isVideoRequest(url) || isLargeImageRequest(url)) {
    if (APP_DIAG) console.log("SW: Skipping cache for video/large image:", url);
    return false;
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

  // Remove MEDIUM priority files first, then HIGH (never remove CRITICAL)
  const toDelete = [];

  for (const request of requests) {
    const url = request.url;
    const isMediumPriority = CACHE_FILES[PRIORITY.MEDIUM].some((file) =>
      url.includes(file)
    );

    if (isMediumPriority) {
      toDelete.push(request);
    }
  }

  // Delete medium priority files
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

        // Skip caching for videos and large images
        if (isVideoRequest(url) || isLargeImageRequest(url)) {
          if (APP_DIAG) console.log("SW: Not caching video/large image:", url);
          return networkResponse;
        }

        // Determine priority and cache if appropriate
        let priority = PRIORITY.MEDIUM; // Default priority

        // Check if it's a thumbnail (special handling)
        if (isThumbnailRequest(url)) {
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
