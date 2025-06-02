// Thumbnail Generation Script
// This script helps generate thumbnails from videos for server-side caching

class ThumbnailGenerator {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.generatedThumbnails = [];
  }

  // Generate thumbnail from video URL
  async generateThumbnail(videoUrl, options = {}) {
    const {
      time = 1, // Time in seconds to capture
      width = 640,
      height = 360,
      quality = 0.8,
      format = 'image/jpeg'
    } = options;

    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.muted = true;
      video.preload = 'metadata';
      video.playsInline = true;

      const timeout = setTimeout(() => {
        reject(new Error('Thumbnail generation timeout'));
      }, 10000);

      video.addEventListener('loadedmetadata', () => {
        video.currentTime = Math.min(time, video.duration * 0.1);
      });

      video.addEventListener('seeked', () => {
        try {
          // Set canvas dimensions
          this.canvas.width = width;
          this.canvas.height = height;

          // Draw video frame to canvas
          this.ctx.drawImage(video, 0, 0, width, height);

          // Convert to blob
          this.canvas.toBlob((blob) => {
            if (blob) {
              clearTimeout(timeout);
              
              // Create download info
              const thumbnailInfo = {
                videoUrl,
                blob,
                filename: this.getFilenameFromUrl(videoUrl) + '.jpg',
                dataUrl: URL.createObjectURL(blob),
                size: blob.size
              };
              
              this.generatedThumbnails.push(thumbnailInfo);
              resolve(thumbnailInfo);
            } else {
              clearTimeout(timeout);
              reject(new Error('Failed to create thumbnail blob'));
            }
          }, format, quality);

        } catch (error) {
          clearTimeout(timeout);
          reject(error);
        }
      });

      video.addEventListener('error', (e) => {
        clearTimeout(timeout);
        reject(new Error('Video loading failed: ' + e.message));
      });

      video.src = videoUrl;
    });
  }

  // Extract filename from video URL
  getFilenameFromUrl(url) {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    return filename.split('.')[0]; // Remove extension
  }

  // Generate thumbnails for all videos in the project
  async generateAllThumbnails() {
    const videoUrls = [
      'https://data3.fra1.cdn.digitaloceanspaces.com/DJI_20250511155856_0068_D.mp4',
      'https://videos-data.fra1.cdn.digitaloceanspaces.com/finley-page-profile',
      'https://videos-data.fra1.cdn.digitaloceanspaces.com/3.mp4',
      'https://videos-data.fra1.cdn.digitaloceanspaces.com/Untitled%201%2000002092%20V1-0001.mp4'
    ];

    console.log('🖼️ Starting thumbnail generation for', videoUrls.length, 'videos...');

    const results = [];
    for (let i = 0; i < videoUrls.length; i++) {
      const url = videoUrls[i];
      try {
        console.log(`📹 Processing video ${i + 1}/${videoUrls.length}:`, url);
        const thumbnail = await this.generateThumbnail(url);
        results.push(thumbnail);
        console.log(`✅ Generated thumbnail for ${thumbnail.filename} (${Math.round(thumbnail.size / 1024)}KB)`);
      } catch (error) {
        console.error(`❌ Failed to generate thumbnail for ${url}:`, error);
        results.push({ videoUrl: url, error: error.message });
      }
    }

    return results;
  }

  // Download all generated thumbnails as ZIP (requires JSZip library)
  async downloadThumbnailsAsZip() {
    if (typeof JSZip === 'undefined') {
      console.error('JSZip library not loaded. Please include JSZip to use this feature.');
      return;
    }

    const zip = new JSZip();
    const thumbnailsFolder = zip.folder('thumbnails');

    for (const thumbnail of this.generatedThumbnails) {
      if (thumbnail.blob) {
        thumbnailsFolder.file(thumbnail.filename, thumbnail.blob);
      }
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'video-thumbnails.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('📦 Downloaded thumbnails as ZIP file');
  }

  // Download individual thumbnail
  downloadThumbnail(thumbnail) {
    const a = document.createElement('a');
    a.href = thumbnail.dataUrl;
    a.download = thumbnail.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(thumbnail.dataUrl);
  }

  // Get upload instructions for DigitalOcean Spaces
  getUploadInstructions() {
    return `
📋 Upload Instructions for DigitalOcean Spaces:

1. Create a 'thumbnails' folder in your DigitalOcean Spaces bucket
2. Upload the generated thumbnails to: videos-data.fra1.cdn.digitaloceanspaces.com/thumbnails/
3. Ensure thumbnails are publicly accessible
4. Verify URLs work: https://videos-data.fra1.cdn.digitaloceanspaces.com/thumbnails/[filename].jpg

Generated thumbnails:
${this.generatedThumbnails.map(t => `- ${t.filename} (${Math.round(t.size / 1024)}KB)`).join('\n')}
    `;
  }
}

// Global instance
window.thumbnailGenerator = new ThumbnailGenerator();

// Usage examples:
console.log(`
🖼️ Thumbnail Generator Ready!

Usage:
// Generate all thumbnails
await window.thumbnailGenerator.generateAllThumbnails();

// Download as ZIP
await window.thumbnailGenerator.downloadThumbnailsAsZip();

// Get upload instructions
console.log(window.thumbnailGenerator.getUploadInstructions());
`);
