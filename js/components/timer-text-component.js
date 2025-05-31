/**
 * Timer Text Component
 * A reusable component that displays different text based on timer countdown
 */

class TimerTextComponent {
    constructor(options = {}) {
        this.timerElement = options.timerElement;
        this.textElement = options.textElement;
        this.initialDuration = options.initialDuration || 15;
        this.textChanges = options.textChanges || [];
        this.onComplete = options.onComplete || null;
        this.interval = null;
        this.currentSeconds = this.initialDuration;
        
        // Default text changes
        this.defaultTextChanges = [
            {
                triggerTime: 5,
                title: 'NEXT Up',
                subtitle: ''
            }
        ];
        
        // Merge default with custom text changes
        this.textChanges = [...this.defaultTextChanges, ...this.textChanges];
        
        // Store original text content
        this.originalContent = this.getTextContent();
    }
    
    /**
     * Get current text content from the text element
     */
    getTextContent() {
        if (!this.textElement) return null;
        
        const titleElement = this.textElement.querySelector('h1');
        const subtitleElement = this.textElement.querySelector('p');
        
        return {
            title: titleElement ? titleElement.textContent : '',
            subtitle: subtitleElement ? subtitleElement.textContent : ''
        };
    }
    
    /**
     * Set text content in the text element
     */
    setTextContent(title, subtitle) {
        if (!this.textElement) return;
        
        const titleElement = this.textElement.querySelector('h1');
        const subtitleElement = this.textElement.querySelector('p');
        
        if (titleElement) titleElement.textContent = title;
        if (subtitleElement) subtitleElement.textContent = subtitle;
    }
    
    /**
     * Reset text to original content
     */
    resetTextContent() {
        if (this.originalContent) {
            this.setTextContent(this.originalContent.title, this.originalContent.subtitle);
        }
    }
    
    /**
     * Start the timer countdown
     */
    start() {
        this.stop(); // Clear any existing timer
        this.currentSeconds = this.initialDuration;
        
        // Reset text to original content
        this.resetTextContent();
        
        // Update timer display
        if (this.timerElement) {
            this.timerElement.textContent = this.currentSeconds;
        }
        
        // Start countdown
        this.interval = setInterval(() => {
            this.currentSeconds--;
            
            // Update timer display
            if (this.timerElement) {
                this.timerElement.textContent = this.currentSeconds;
            }
            
            // Check for text changes
            this.checkTextChanges();
            
            // Check if timer is complete
            if (this.currentSeconds <= 0) {
                this.complete();
            }
        }, 1000);
    }
    
    /**
     * Stop the timer
     */
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
    
    /**
     * Complete the timer
     */
    complete() {
        this.stop();
        
        if (this.onComplete && typeof this.onComplete === 'function') {
            this.onComplete();
        }
    }
    
    /**
     * Check if any text changes should be triggered
     */
    checkTextChanges() {
        this.textChanges.forEach(change => {
            if (this.currentSeconds === change.triggerTime) {
                this.setTextContent(change.title, change.subtitle || '');
            }
        });
    }
    
    /**
     * Add a new text change trigger
     */
    addTextChange(triggerTime, title, subtitle = '') {
        this.textChanges.push({
            triggerTime,
            title,
            subtitle
        });
        
        // Sort by trigger time (descending)
        this.textChanges.sort((a, b) => b.triggerTime - a.triggerTime);
    }
    
    /**
     * Remove a text change trigger
     */
    removeTextChange(triggerTime) {
        this.textChanges = this.textChanges.filter(change => change.triggerTime !== triggerTime);
    }
    
    /**
     * Get current timer value
     */
    getCurrentTime() {
        return this.currentSeconds;
    }
    
    /**
     * Check if timer is running
     */
    isRunning() {
        return this.interval !== null;
    }
    
    /**
     * Set new duration and reset
     */
    setDuration(duration) {
        this.initialDuration = duration;
        this.currentSeconds = duration;
        
        if (this.timerElement) {
            this.timerElement.textContent = this.currentSeconds;
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TimerTextComponent;
}

// Make available globally
window.TimerTextComponent = TimerTextComponent;
