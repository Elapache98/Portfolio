// Image Performance Optimizer
class ImageOptimizer {
  constructor() {
    this.observer = null;
    this.init();
  }

  init() {
    // Preload critical images
    this.preloadCriticalImages();
    
    // Setup lazy loading for non-critical images
    this.setupLazyLoading();
    
    // Setup progressive loading
    this.setupProgressiveLoading();
    
    // Add fade-in to existing images
    this.addFadeInToExistingImages();
  }

  addFadeInToExistingImages() {
    // Add fade-in animation to images that are already loaded
    document.querySelectorAll('img:not([data-src])').forEach(img => {
      // Always start invisible for animation
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.6s ease';
      
      if (img.complete && img.naturalHeight !== 0) {
        // Image is already loaded (cached) - animate immediately
        setTimeout(() => {
          img.style.opacity = '1';
          img.classList.add('loaded');
        }, 100); // Slight delay to ensure DOM is ready
      } else {
        // Image is still loading
        img.onload = () => {
          setTimeout(() => {
            img.style.opacity = '1';
            img.classList.add('loaded');
          }, 50);
        };
      }
    });
  }

  preloadCriticalImages() {
    // Preload images that are immediately visible
    const criticalImages = [
      'coverimage.png', // Work page hero image
      // Add other above-the-fold images here
    ];

    criticalImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });
  }

  setupLazyLoading() {
    // Use Intersection Observer for lazy loading
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage(entry.target);
            this.observer.unobserve(entry.target);
          }
        });
      }, {
        rootMargin: '50px' // Start loading 50px before image comes into view
      });

      // Observe all images with data-src
      document.querySelectorAll('img[data-src]').forEach(img => {
        this.observer.observe(img);
      });
    }
  }

  loadImage(img) {
    // Set initial loading state
    img.style.opacity = '0';
    img.style.filter = 'blur(2px)';
    img.style.transition = 'opacity 0.6s ease, filter 0.6s ease';
    
    // Create new image to preload
    const imageLoader = new Image();
    
    imageLoader.onload = () => {
      // Image loaded successfully - fade in
      img.src = img.dataset.src;
      
      // Small delay to ensure image is rendered
      setTimeout(() => {
        img.style.opacity = '1';
        img.style.filter = 'none';
        img.classList.add('loaded');
      }, 50);
    };
    
    imageLoader.onerror = () => {
      // Handle error
      img.style.opacity = '0.5';
      img.classList.add('error');
      console.warn('Failed to load image:', img.dataset.src);
    };
    
    // Start loading
    imageLoader.src = img.dataset.src;
  }

  setupProgressiveLoading() {
    // Add fade-in animation for loaded images
    const style = document.createElement('style');
    style.textContent = `
      img {
        transition: opacity 0.6s ease, filter 0.6s ease;
      }
      
      img[data-src] {
        opacity: 0;
        filter: blur(2px);
      }
      
      img.loaded {
        opacity: 1;
        filter: none;
      }
      
      /* Subtle fade-in for all images */
      img:not(.loaded) {
        opacity: 0;
      }
      
      img.error {
        opacity: 0.5;
        filter: grayscale(100%);
      }
      
      /* Skeleton loading effect */
      .image-skeleton {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
      }
      
      @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `;
    document.head.appendChild(style);
  }

  // Method to convert existing images to lazy loading
  convertToLazyLoading() {
    document.querySelectorAll('img:not([data-src])').forEach(img => {
      if (img.src && !img.classList.contains('critical')) {
        img.dataset.src = img.src;
        img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E'; // Transparent placeholder
        this.observer?.observe(img);
      }
    });
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ImageOptimizer();
  });
} else {
  new ImageOptimizer();
} 