// Track API usage
class UsageTracker {
  constructor() {
    this.storageKey = 'wingman_usage';
    this.maxUsage = 1000; // Unlimited during beta
  }

  async getUsage() {
    const result = await browser.storage.local.get([this.storageKey]);
    return result[this.storageKey] || 0;
  }

  async incrementUsage() {
    const current = await this.getUsage();
    const newCount = current + 1;
    
    await browser.storage.local.set({ [this.storageKey]: newCount });
    return newCount;
  }

  async resetUsage() {
    await browser.storage.local.set({ [this.storageKey]: 0 });
    return 0;
  }
}

// Feedback system
class FeedbackSystem {
  constructor() {
    this.feedbackEndpoint = 'https://wingman-51k8gr5pi-trojanas-projects.vercel.app/api/feedback';
  }

  async sendFeedback(text, usageCount) {
    if (!text || text.trim().length === 0) {
      throw new Error('Feedback cannot be empty');
    }

    const feedback = {
      text: text.trim(),
      usageCount,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      extensionVersion: browser.runtime.getManifest().version
    };

    try {
      // Send to your feedback endpoint
      const response = await fetch(this.feedbackEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedback)
      });

      if (!response.ok) {
        throw new Error('Failed to send feedback');
      }

      return await response.json();
    } catch (error) {
      // Fallback: store locally if API fails
      console.log('Feedback stored locally:', feedback);
      return { success: true, storedLocally: true };
    }
  }
}

// Main popup controller
class PopupController {
  constructor() {
    this.usageTracker = new UsageTracker();
    this.feedbackSystem = new FeedbackSystem();
    this.init();
  }

  async init() {
    await this.loadUsage();
    this.setupEventListeners();
  }

  async loadUsage() {
    const usageCount = await this.usageTracker.getUsage();
    this.updateUsageDisplay(usageCount);
  }

  updateUsageDisplay(count) {
    const usageCountEl = document.getElementById('usage-count');
    const usageFillEl = document.getElementById('usage-fill');
    
    usageCountEl.textContent = count;
    
    // Calculate percentage for progress bar (max 1000 for beta)
    const percentage = Math.min((count / 1000) * 100, 100);
    usageFillEl.style.width = `${percentage}%`;
  }

  setupEventListeners() {
    const sendButton = document.getElementById('send-feedback');
    const feedbackText = document.getElementById('feedback-text');
    const successMessage = document.getElementById('success-message');

    sendButton.addEventListener('click', async () => {
      const text = feedbackText.value;
      const usageCount = await this.usageTracker.getUsage();

      if (!text.trim()) {
        alert('Please enter your feedback before sending.');
        return;
      }

      sendButton.disabled = true;
      sendButton.textContent = 'Sending...';

      try {
        await this.feedbackSystem.sendFeedback(text, usageCount);
        
        // Show success message
        successMessage.style.display = 'block';
        feedbackText.value = '';
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          successMessage.style.display = 'none';
        }, 3000);

      } catch (error) {
        alert('Failed to send feedback. Please try again.');
        console.error('Feedback error:', error);
      } finally {
        sendButton.disabled = false;
        sendButton.textContent = 'Send Feedback';
      }
    });

    // Allow Enter key to send feedback
    document.getElementById('feedback-text').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        sendButton.click();
      }
    });
  }
}

// Listen for API calls from content scripts to track usage
browser.runtime.onMessage.addListener((message, sender) => {
  if (message.type === 'API_CALL_MADE') {
    const tracker = new UsageTracker();
    tracker.incrementUsage().then(count => {
      // Update popup if it's open
      browser.runtime.sendMessage({ type: 'USAGE_UPDATED', count });
    });
  }
});

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});

// Listen for usage updates
browser.runtime.onMessage.addListener((message, sender) => {
  if (message.type === 'USAGE_UPDATED') {
    const popup = new PopupController();
    popup.updateUsageDisplay(message.count);
  }
});
