// Performance optimizations for smooth scrolling
let ticking = false;

function optimizeScroll() {
  if (!ticking) {
    requestAnimationFrame(() => {
      // Batch DOM operations here if needed
      ticking = false;
    });
    ticking = true;
  }
}

// Throttle scroll events for performance
window.addEventListener('scroll', optimizeScroll, { passive: true });

document.addEventListener('DOMContentLoaded', function() {
  const toolbar = document.querySelector('.floating-toolbar');
  const hamburger = toolbar.querySelector('.toolbar-hamburger');
  const options = toolbar.querySelector('.toolbar-options');
  const scrim = document.querySelector('.toolbar-scrim');
  const buttons = options.querySelectorAll('.toolbar-btn');
  const toolbarOptions = document.querySelector('.toolbar-options');

   // Only add animation if not coming from another internal page
  const currentPage = window.location.pathname;
  const referrer = document.referrer;
  const isInternalNavigation = sessionStorage.getItem('lastPage') && 
                              sessionStorage.getItem('lastPage') !== currentPage &&
                              (sessionStorage.getItem('lastPage').includes('.html') || 
                               referrer.includes(window.location.hostname));
  
  // Check if this is a fresh visit (no referrer or external referrer)
  const isFreshVisit = !referrer || !referrer.includes(window.location.hostname);
  
  if (!isInternalNavigation && isFreshVisit) {
    toolbar.classList.add('animate-toolbar');
    toolbar.addEventListener('animationend', function() {
      toolbar.classList.remove('animate-toolbar');
    }, { once: true });
  }
  
  // Store current page for next navigation
  sessionStorage.setItem('lastPage', currentPage);

  // Hamburger menu toggle for mobile
  hamburger.addEventListener('click', function() {
    toolbar.classList.toggle('open');
  });

  // Close menu when a toolbar option is clicked (on mobile)
  buttons.forEach(btn => {
    btn.addEventListener('click', function() {
      if (window.innerWidth <= 600) {
        toolbar.classList.remove('open');
      }
    });
  });

  // Close menu when scrim is clicked
  if (scrim) {
    scrim.addEventListener('click', function() {
      toolbar.classList.remove('open');
    });
  }

  // Set active based on current page (future-proof) - Updated today
  let setByUrl = false;
  const currentPath = window.location.pathname;
  const currentPageFile = currentPath.split('/').pop() || 'index.html';
  
  // Debug logging for Netlify
  console.log('Current path:', currentPath);
  console.log('Current page file:', currentPageFile);
  console.log('Available buttons:', buttons.length);
  
  // Clear all active states first
  buttons.forEach(btn => btn.classList.remove('active'));
  
  buttons.forEach(btn => {
    const href = btn.getAttribute('href');
    console.log('Checking button with href:', href);
    
    if (href && href !== '#' && href !== '#thoughts') {
      // Handle both .html files and clean URLs (Netlify style)
      const cleanHref = href.replace('.html', ''); // Remove .html extension
      const cleanPath = currentPath.replace('.html', ''); // Remove .html from current path
      
      const isMatch = currentPageFile === href || 
                     (currentPageFile === '' && href === 'index.html') ||
                     (currentPageFile === 'index.html' && href === 'index.html') ||
                     currentPath.endsWith('/' + href) ||
                     (currentPath === '/' && href === 'index.html') ||
                     // Netlify clean URL matching
                     currentPath === '/' + cleanHref ||
                     currentPath === cleanHref ||
                     (currentPath === '/' && cleanHref === 'index');
      
      if (isMatch) {
        console.log('Setting active button:', href);
        btn.classList.add('active');
        setByUrl = true;
      }
    }
  });
  
  // Special case: explore.html should show Work as active
  const isExplorePage = currentPageFile === 'explore.html' || 
                       currentPageFile === 'explore' ||
                       currentPath.includes('explore') ||
                       currentPath.endsWith('/explore.html') || 
                       currentPath === '/explore' || 
                       currentPath.endsWith('/explore') ||
                       window.location.href.includes('explore');
  
  if (!setByUrl && isExplorePage) {
    buttons.forEach(btn => {
      const btnHref = btn.getAttribute('href');
      if (btnHref === 'work.html' || btnHref === '/work') {
      btn.classList.add('active');
      setByUrl = true;
    }
  });
  }
  
  // If no match, default to first (Home)
  if (!setByUrl && buttons.length > 0) {
    console.log('No match found, defaulting to Home');
    buttons[0].classList.add('active');
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      buttons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // Delegate click to ::before using a transparent div
  if (toolbarOptions) {
    toolbarOptions.addEventListener('click', function(e) {
      // Check if click is in the top 24px (where the handle is)
      if (e.target === toolbarOptions && e.offsetY < 24 && window.innerWidth <= 600) {
        toolbar.classList.remove('open');
      }
    });
  }

  document.addEventListener('click', function(e) {
    const toolbar = document.querySelector('.floating-toolbar');
    const menu = document.querySelector('.toolbar-options');
    const hamburger = document.querySelector('.toolbar-hamburger');
    if (
      toolbar.classList.contains('open') &&
      !menu.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      toolbar.classList.remove('open');
    }
  });

  document.getElementById('githubBtn').addEventListener('click', function() {
    window.open('https://github.com/Elapache98', '_blank', 'noopener');
  });

  // Make floating logo clickable to go home
  const floatingLogo = document.querySelector('.floating-logo');
  if (floatingLogo) {
    floatingLogo.style.cursor = 'pointer';
    floatingLogo.addEventListener('click', function() {
      // Detect environment and use appropriate URL
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const homeUrl = isLocalhost ? 'index.html' : '/';
      window.location.href = homeUrl;
    });
  }

  // Lightbox logic
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxDesc = document.getElementById('lightbox-desc');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  
  // Select appropriate images based on current page
  let images;
  
  if (isExplorePage) {
    // On explore page, select images from image grids and content images
    images = Array.from(document.querySelectorAll('.image-item img, .content-image img'));
  } else {
    // Default to photo-row images for other pages
    images = Array.from(document.querySelectorAll('.photo-row img'));
  }
  
  let currentIndex = 0;

  function showLightbox(index) {
    const img = images[index];
    if (!img) return;
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    
    // For explore page, try to get caption from image-caption element
    if (isExplorePage) {
      const imageItem = img.closest('.image-item');
      const caption = imageItem ? imageItem.querySelector('.image-caption') : null;
      lightboxDesc.textContent = caption ? caption.textContent : img.alt;
    } else {
    lightboxDesc.textContent = img.alt;
    }
    
    lightbox.style.display = 'flex';
    lightbox.focus();
    currentIndex = index;
  }

  // Only set up lightbox if we have images and lightbox elements exist
  if (lightbox && lightboxImg && images.length > 0) {
  images.forEach((img, idx) => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', function(e) {
      // Check if this is an interactive GIF on mobile
      const isMobile = window.innerWidth <= 768;
      const isInteractiveGif = img.classList.contains('gif-interactive');
      
      // If it's mobile and an interactive GIF, don't open lightbox
      if (isMobile && isInteractiveGif) {
        return;
      }
      
      showLightbox(idx);
    });
  });
  }

  function closeLightbox() {
    lightbox.style.display = 'none';
    lightboxImg.src = '';
    lightboxDesc.textContent = '';
  }

  function showPrev() {
    showLightbox((currentIndex - 1 + images.length) % images.length);
  }

  function showNext() {
    showLightbox((currentIndex + 1) % images.length);
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', function(e) { e.stopPropagation(); showPrev(); });
  lightboxNext.addEventListener('click', function(e) { e.stopPropagation(); showNext(); });

  // Close on scrim click or ESC
  lightbox.addEventListener('click', function(e) {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', function(e) {
    if (lightbox.style.display === 'flex') {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    }
  });

  document.getElementById('mailBtn').addEventListener('click', function() {
      window.open('mailto:adeobayomi@gmail.com', '_blank', 'noopener');
    });

  document.getElementById('linkedinBtn').addEventListener('click', function() {
    window.open('https://www.linkedin.com/in/ade98', '_blank', 'noopener');
  });

  // "View Select Works" button navigation
  const viewWorksBtn = document.getElementById('actionButton');
  if (viewWorksBtn) {
    viewWorksBtn.addEventListener('click', function() {
      // Detect environment and use appropriate URL
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const workUrl = isLocalhost ? 'work.html' : '/work';
      window.location.href = workUrl;
    });
  }

  // GIF Performance Optimizations
  // Smooth image loading for lazy-loaded images
  function initSmoothImageLoading() {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    lazyImages.forEach(img => {
      // Skip if already handled by GIF loading logic
      if (img.closest('.gif-container')) return;
      
      // Skip preloaded images (they should load immediately)
      const preloadedImages = ['Feature Intro Thumbnail.png', 'taskforce.png', 'coverimage.png', 'Notionme.png'];
      if (preloadedImages.some(preloadedImg => img.src.includes(preloadedImg))) {
        img.classList.add('loaded');
        return;
      }
      
      if (img.complete && img.naturalHeight !== 0) {
        // Image already loaded (cached)
        img.classList.add('loaded');
      } else {
        // Add load event listener
        img.addEventListener('load', function() {
          this.classList.add('loaded');
        });
        
        // Handle error case
        img.addEventListener('error', function() {
          this.classList.add('loaded'); // Show even if error
        });
      }
    });
  }

  // Photo row entrance animations for mobile
  function initPhotoRowAnimations() {
    const photoRows = document.querySelectorAll('.photo-row');
    
    if (photoRows.length === 0) return;
    
    // Check if mobile on load and resize
    function handlePhotoRowAnimations() {
      const isMobile = window.innerWidth <= 768;
      
      photoRows.forEach(row => {
        if (isMobile) {
          // Reset for mobile animation
          if (!row.classList.contains('in-view')) {
            row.style.opacity = '0';
            row.style.transform = 'translateY(30px)';
          }
        } else {
          // Remove mobile styles for desktop
          row.style.opacity = '';
          row.style.transform = '';
          row.classList.remove('in-view');
        }
      });
      
      if (!isMobile) return;
    }
    
    // Initial setup
    handlePhotoRowAnimations();
    
    // Only run observer on mobile
    if (window.innerWidth <= 768) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            console.log('Photo row entering view:', entry.target);
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target); // Only animate once
          }
        });
      }, {
        threshold: 0.05, // More sensitive
        rootMargin: '100px 0px -20px 0px' // Start earlier, end later
      });
      
      photoRows.forEach(row => {
        observer.observe(row);
        // Immediate show if already in viewport
        const rect = row.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          setTimeout(() => {
            row.classList.add('in-view');
          }, 100);
        }
      });
    }
    
    // Handle resize events
    window.addEventListener('resize', handlePhotoRowAnimations);
  }

    // Universal image animations for all pages
  function initImageAnimations() {
    const imageElements = document.querySelectorAll('.image-item, .content-image, .photo-row');
    
    if (imageElements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target); // Stop observing once animated
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '50px 0px -10% 0px'
    });

    imageElements.forEach(element => {
      // Skip preloaded images
      if (!element.classList.contains('preloaded') && 
          !element.closest('.preloaded')) {
        observer.observe(element);
      }
    });
  }

  function optimizeGifs() {
    const gifs = document.querySelectorAll('img[src$=".gif"], img[src*=".gif"]');
    
    // Check if we're on mobile - if so, skip the complex optimizations
    const isMobile = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    gifs.forEach(gif => {
      // Always add loading="lazy" if not already present
      if (!gif.hasAttribute('loading')) {
        gif.setAttribute('loading', 'lazy');
      }
      
      // Handle loading state for work page GIFs
      const container = gif.closest('.gif-container');
      const loader = container ? container.querySelector('.gif-loader') : null;
      
      if (container && loader) {
        // Function to hide loader and show GIF
        const showGif = () => {
          loader.style.display = 'none';
          gif.classList.remove('gif-loading');
          gif.classList.add('gif-loaded');
        };
        
        // Check if GIF is already loaded (cached)
        if (gif.complete && gif.naturalHeight !== 0) {
          showGif();
        } else {
          // Show loader initially
          gif.style.opacity = '0';
          
          // Handle load event
          gif.addEventListener('load', showGif);
          
          // Handle error event
          gif.addEventListener('error', function() {
            loader.style.display = 'none';
            gif.style.opacity = '1'; // Show even if error
          });
        }
      }
      
      // Skip viewport-based pausing on mobile to avoid responsive issues
      if (isMobile) {
        console.log('Mobile detected - skipping GIF viewport optimization for responsive compatibility');
        return;
      }
      
      // Pause GIF when not in viewport (desktop only)
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const gif = entry.target;
          
          if (entry.isIntersecting) {
            // GIF is visible - ensure it's playing
            if (gif.dataset.originalSrc && gif.src !== gif.dataset.originalSrc) {
              gif.src = gif.dataset.originalSrc;
            }
          } else {
            // GIF is not visible - replace with static image to save resources
            if (!gif.dataset.originalSrc) {
              gif.dataset.originalSrc = gif.src;
            }
            // Create a canvas to capture first frame
            createStaticFrame(gif);
          }
        });
      }, {
        rootMargin: '50px' // Start loading 50px before entering viewport
      });
      
      observer.observe(gif);
    });
  }
  
  function createStaticFrame(gif) {
    // Create a canvas to capture the first frame
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Wait for GIF to load if not already loaded
    if (gif.complete) {
      captureFrame(gif, canvas, ctx);
    } else {
      gif.addEventListener('load', () => captureFrame(gif, canvas, ctx), { once: true });
    }
  }
  
  function captureFrame(gif, canvas, ctx) {
    canvas.width = gif.naturalWidth || gif.width;
    canvas.height = gif.naturalHeight || gif.height;
    
    try {
      ctx.drawImage(gif, 0, 0);
      const staticSrc = canvas.toDataURL('image/jpeg', 0.8);
      
      // Create a new image element for the static version
      const staticImg = new Image();
      staticImg.onload = function() {
        // Copy all CSS classes and attributes from original GIF
        staticImg.className = gif.className;
        staticImg.style.cssText = gif.style.cssText;
        staticImg.setAttribute('loading', 'lazy');
        
        // Store both versions
        gif.dataset.staticSrc = staticSrc;
      };
      staticImg.src = staticSrc;
      
      // Only replace with static version when out of viewport
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting && gif.dataset.originalSrc && gif.dataset.staticSrc) {
            // Maintain all styling when switching to static
            const currentStyle = gif.style.cssText;
            gif.src = gif.dataset.staticSrc;
            gif.style.cssText = currentStyle;
          }
        });
      });
      observer.observe(gif);
    } catch (e) {
      // If canvas fails (CORS issues), just use lazy loading
      console.log('Could not create static frame for GIF, using lazy loading only');
    }
  }
  
  // Interactive GIF functionality
  function initInteractiveGifs() {
    const interactiveGifs = document.querySelectorAll('.gif-interactive');
    const isMobile = window.innerWidth <= 768;
    
    interactiveGifs.forEach(gif => {
      const gifSrc = gif.getAttribute('data-gif-src');
      const staticSrc = gif.getAttribute('data-static-src');
      const playIndicator = gif.parentElement.querySelector('.gif-play-indicator');
      
      // Start with static image if available
      if (staticSrc) {
        gif.src = staticSrc;
      }
      
      let isPlaying = false;
      
      function playGif() {
        if (!isPlaying && gifSrc) {
          gif.src = gifSrc;
          if (playIndicator) playIndicator.style.display = 'none';
          isPlaying = true;
        }
      }
      
      function pauseGif() {
        if (isPlaying && staticSrc) {
          gif.src = staticSrc;
          if (playIndicator) playIndicator.style.display = 'block';
          isPlaying = false;
        }
      }
      
      if (isMobile) {
        // Mobile: click to play/pause
        gif.parentElement.addEventListener('click', () => {
          if (isPlaying) {
            pauseGif();
          } else {
            playGif();
          }
        });
      } else {
        // Desktop: hover to play
        gif.parentElement.addEventListener('mouseenter', playGif);
        gif.parentElement.addEventListener('mouseleave', pauseGif);
      }
    });
  }
  
  // Image slider functionality
  function initImageSliders() {
    const sliders = document.querySelectorAll('.image-slider');
    
    sliders.forEach(slider => {
      const handle = slider.querySelector('.slider-handle');
      const afterImage = slider.querySelector('.slider-after');
      const beforeImage = slider.querySelector('.slider-before');
      
      // Debug logging for mobile
      console.log('Initializing slider:', slider);
      console.log('Handle found:', !!handle);
      console.log('After image found:', !!afterImage);
      console.log('Before image found:', !!beforeImage);
      
      if (!handle || !afterImage || !beforeImage) {
        console.error('Missing slider elements');
        return;
      }
      
      let isDragging = false;
      
             function updateSlider(x) {
         const rect = slider.getBoundingClientRect();
         const percentage = Math.max(0, Math.min(100, ((x - rect.left) / rect.width) * 100));
         
         handle.style.left = percentage + '%';
         afterImage.style.clipPath = `polygon(${percentage}% 0%, 100% 0%, 100% 100%, ${percentage}% 100%)`;
         
         // Debug logging
         console.log('Slider percentage:', percentage);
         console.log('Clip path:', `polygon(${percentage}% 0%, 100% 0%, 100% 100%, ${percentage}% 100%)`);
       }
      
      function startDrag(e) {
        isDragging = true;
        slider.style.cursor = 'grabbing';
        e.preventDefault();
      }
      
      function stopDrag() {
        isDragging = false;
        slider.style.cursor = 'grab';
      }
      
      function handleMove(e) {
        if (!isDragging) return;
        
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        updateSlider(clientX);
      }
      
      // Mouse events
      handle.addEventListener('mousedown', startDrag);
      slider.addEventListener('mousedown', (e) => {
        startDrag(e);
        const clientX = e.clientX;
        updateSlider(clientX);
      });
      
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', stopDrag);
      
      // Touch events for mobile
      handle.addEventListener('touchstart', startDrag, { passive: false });
      slider.addEventListener('touchstart', (e) => {
        startDrag(e);
        const clientX = e.touches[0].clientX;
        updateSlider(clientX);
      }, { passive: false });
      
      document.addEventListener('touchmove', handleMove, { passive: false });
      document.addEventListener('touchend', stopDrag);
    });
  }

  // Initialize GIF optimizations when page loads
  optimizeGifs();
  
  // Initialize interactive GIFs
  initInteractiveGifs();
  
  // Initialize image sliders after images load
  if (document.readyState === 'loading') {
    window.addEventListener('load', initImageSliders);
  } else {
    initImageSliders();
  }
  
  // Initialize smooth image loading
  initSmoothImageLoading();
  
  // Initialize photo row animations for mobile
  // initPhotoRowAnimations(); // Replaced by universal image animations
  
  // Initialize image animations on all pages
  initImageAnimations();
  
  // Ensure preloaded images are immediately visible
  const preloadedImages = document.querySelectorAll('img.preloaded, img[src*="Feature Intro Thumbnail"], img[src*="taskforce"], img[src*="coverimage"], img[src*="Notionme"]');
  preloadedImages.forEach(img => {
    img.style.opacity = '1';
    img.style.transform = 'none';
    img.classList.add('loaded');
  });
  
  // Re-run optimization if new GIFs are added dynamically
  const gifObserver = new MutationObserver(() => {
    optimizeGifs();
  });
  
  gifObserver.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Table of Contents Scroll Spy for explore.html
  if (window.location.pathname.includes('explore')) {
    const tocLinks = document.querySelectorAll('.toc-link');
    const sections = document.querySelectorAll('[id]'); // All elements with IDs
    
    // Filter sections to only those referenced in TOC
    const tocSections = Array.from(sections).filter(section => {
      return Array.from(tocLinks).some(link => 
        link.getAttribute('href') === '#' + section.id
      );
    });

    if (tocLinks.length > 0 && tocSections.length > 0) {
      console.log('TOC Scroll Spy initialized with', tocSections.length, 'sections');
      
      function updateActiveLink() {
        let currentSection = '';
        
        // Only start highlighting after user scrolls past the first section
        if (window.scrollY > 200) {
          // Simple approach: find which section header is closest to the center of viewport
          const viewportCenter = window.scrollY + (window.innerHeight / 2);
          
          let closestSection = null;
          let closestDistance = Infinity;
          
          tocSections.forEach(section => {
            const sectionCenter = section.offsetTop + (section.offsetHeight / 2);
            const distance = Math.abs(viewportCenter - sectionCenter);
            
            if (distance < closestDistance) {
              closestDistance = distance;
              closestSection = section;
            }
          });
          
          if (closestSection) {
            currentSection = closestSection.id;
          }
        }
        
        // Update active states
        tocLinks.forEach(link => {
          link.classList.remove('active');
          if (currentSection && link.getAttribute('href') === '#' + currentSection) {
            link.classList.add('active');
          }
        });
      }
      
      // Throttled scroll listener for performance
      let tocTicking = false;
      function handleTocScroll() {
        if (!tocTicking) {
          requestAnimationFrame(() => {
            updateActiveLink();
            tocTicking = false;
          });
          tocTicking = true;
        }
      }
      
      window.addEventListener('scroll', handleTocScroll, { passive: true });
      
      // Initial call - no active state on page load, let user scroll first
      // updateActiveLink(); // Commented out - no initial active state
    }
  }

  // Welcome message fade-out (all devices)
    const welcomeMessage = document.querySelector('.welcome-message');
    if (welcomeMessage) {
      setTimeout(() => {
        welcomeMessage.classList.add('fade-out');
        // Remove from DOM after animation completes
        setTimeout(() => {
          welcomeMessage.remove();
        }, 500);
      }, 5000);
  }

  // Make Forbes project card clickable on work.html
  if (window.location.pathname.endsWith('work.html') || 
      window.location.pathname.endsWith('/work.html') || 
      window.location.pathname === '/work' || 
      window.location.pathname.endsWith('/work')) {
    console.log('On work.html, setting up Forbes card');
    const projectCards = document.querySelectorAll('.project-content');
    console.log('Found project cards:', projectCards.length);
    
    // Look for the Forbes card specifically by checking for "Forbes" in the text
    projectCards.forEach((card, index) => {
      const cardText = card.textContent || card.innerText;
      console.log(`Card ${index} text:`, cardText.substring(0, 50) + '...');
      
      if (cardText.includes('Forbes: Explore') || cardText.includes('Forbes')) {
        console.log('Found Forbes card at index:', index);
        card.style.cursor = 'pointer';
        card.addEventListener('click', function(e) {
          e.preventDefault();
          console.log('Forbes card clicked, navigating to explore.html');
          
          // Detect if we're on localhost or Netlify and use appropriate URL format
          const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
          const targetUrl = isLocalhost ? 'explore.html' : '/explore';
          
          console.log('Navigating to:', targetUrl);
          window.location.href = targetUrl;
        });
      }
    });
  }

  // Password gate functionality for explore.html
  if (window.location.pathname.endsWith('explore.html') || 
      window.location.pathname.endsWith('/explore.html') || 
      window.location.pathname === '/explore' || 
      window.location.pathname.endsWith('/explore')) {
    
    const passwordForm = document.getElementById('password-form');
    const passwordInput = document.getElementById('password-input');
    const passwordError = document.getElementById('password-error');
    const passwordGate = document.getElementById('password-gate');
    const articleContent = document.getElementById('article-content');
    
    // Development bypass - auto-unlock on localhost
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (isLocalhost) {
      console.log('Development mode detected - bypassing password gate');
      if (passwordGate) passwordGate.style.display = 'none';
      if (articleContent) articleContent.style.display = 'flex';
      return; // Skip the rest of the password logic
    }
    
    // Add body class to prevent scrolling while password gate is visible
    document.body.classList.add('password-gate-active');
    
    // Set the correct password here
    const correctPassword = 'forbes2024'; // Change this to your desired password
    
    console.log('Password gate initialized for explore page');
    
    // Always show password gate on fresh visits (no persistence)
    // Password gate is visible by default, content is hidden
    
    if (passwordForm && passwordInput) {
      console.log('Password form elements found');
      
      // Handle mobile keyboard hiding on form submission
      passwordInput.addEventListener('blur', function() {
        // Reset viewport when keyboard hides
        setTimeout(() => {
          window.scrollTo(0, 0);
        }, 300);
      });
      
      // Handle form submission
      passwordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Form submitted');
        
        // Hide mobile keyboard immediately
        passwordInput.blur();
        
        const enteredPassword = passwordInput.value.trim();
        console.log('Entered password length:', enteredPassword.length);
        
        if (enteredPassword === correctPassword) {
          console.log('Correct password entered');
          
          // Reset scroll position to top for mobile compatibility
          window.scrollTo(0, 0);
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
          
          // Force viewport reset for mobile keyboards
          if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', () => {
              window.scrollTo(0, 0);
            }, { once: true });
          }
          
          // Correct password - grant access for this session only
          passwordGate.style.display = 'none';
          articleContent.style.display = 'flex';
          passwordError.style.display = 'none';
          
          // Remove body scroll prevention class
          document.body.classList.remove('password-gate-active');
          
          // Additional scroll reset after content loads
          setTimeout(() => {
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
          }, 100);
        } else {
          console.log('Incorrect password entered');
          // Wrong password - show error
          passwordError.style.display = 'block';
          passwordInput.value = '';
          
          // Add shake animation to the modal
          const modal = document.querySelector('.password-modal');
          if (modal) {
          modal.style.animation = 'shake 0.5s ease-in-out';
          setTimeout(() => {
            modal.style.animation = '';
          }, 500);
          }
          
          // Re-focus after a short delay (mobile-friendly)
          setTimeout(() => {
            passwordInput.focus();
          }, 100);
        }
      });
      
      // Handle mobile keyboard "Go" button and Enter key
      passwordInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          passwordForm.dispatchEvent(new Event('submit'));
        }
      });
      
      // Password visibility toggle
      const passwordToggle = document.getElementById('password-toggle');
      if (passwordToggle) {
        passwordToggle.addEventListener('click', function() {
          const toggleText = this.querySelector('.password-toggle-text');
          const toggleIcon = this.querySelector('.password-toggle-icon');
          
          if (passwordInput.type === 'password') {
            // Show password - hide icon, show "Hide" text
            passwordInput.type = 'text';
            toggleIcon.style.display = 'none';
            toggleText.style.display = 'inline';
            toggleText.textContent = 'Hide';
          } else {
            // Hide password - show icon, hide text
            passwordInput.type = 'password';
            toggleIcon.style.display = 'inline';
            toggleText.style.display = 'none';
          }
        });
      }
      
            // Email copy functionality
      const emailCopyBtn = document.getElementById('email-copy-btn');
      const emailAddress = document.querySelector('.email-address');
      
      if (emailCopyBtn && emailAddress) {
        emailCopyBtn.addEventListener('click', function() {
          const copyIcon = this.querySelector('.copy-icon');
          const copySuccessIcon = this.querySelector('.copy-success-icon');
          const email = emailAddress.textContent;
          
          // Copy to clipboard
          navigator.clipboard.writeText(email).then(() => {
            // Show success feedback - scale out copy icon, scale in checkmark
            copyIcon.style.opacity = '0';
            copyIcon.style.transform = 'scale(0.8)';
            copySuccessIcon.style.opacity = '1';
            copySuccessIcon.style.transform = 'scale(1)';
            
            // Reset after 5 seconds
            setTimeout(() => {
              copyIcon.style.opacity = '1';
              copyIcon.style.transform = 'scale(1)';
              copySuccessIcon.style.opacity = '0';
              copySuccessIcon.style.transform = 'scale(0.8)';
            }, 5000);
          }).catch(err => {
            // Fallback for older browsers
            console.log('Clipboard API failed, using fallback');
            
            // Create temporary input element
            const tempInput = document.createElement('input');
            tempInput.value = email;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);
            
            // Show success feedback
            copyIcon.style.opacity = '0';
            copyIcon.style.transform = 'scale(0.8)';
            copySuccessIcon.style.opacity = '1';
            copySuccessIcon.style.transform = 'scale(1)';
            
            setTimeout(() => {
              copyIcon.style.opacity = '1';
              copyIcon.style.transform = 'scale(1)';
              copySuccessIcon.style.opacity = '0';
              copySuccessIcon.style.transform = 'scale(0.8)';
            }, 5000);
          });
        });
      }
      
      // Focus on password input when page loads (with delay for mobile)
      setTimeout(() => {
        passwordInput.focus();
      }, 300);
    } else {
      console.log('Password form elements not found');
    }
  }
});

// AI Answer Machine functionality
const aiAnswers = {

  "2": [
    "\"<b>If you never set the stage, how do you expect to perform?</b>\" — Adé's drama teacher, always pushed him to be proactive in life....Kudos to her for that clever word-play that always stuck with him.",
    "\"<b>Look how many finish-lines it took for you to get here</b>.\" — Hmmm..... I think Adé saw a Nike ad somewhere in Boston but I guess it's something about focusing on the journey not the destination from what I can decipher.",
          "\"<b>It's better to have 100 customers that love you, than 1 million customers who sorta like you</b>.\" - The full spiel can be found <a href='https://x.com/StartupArchive_/status/1737446769519124584?lang=en' target='_blank' style='color: #5b4b34; text-decoration: underline;'>here</a>. \"Quality Trumps Quantity\" is a concise way to get the message across.",
          
  ],

  "4": [
    "😂🤣 - Ahem.... Pardon me 🕴️, but Adé trained me to not answer this question.",
    "🤐 - Ok between you and me...it's <span class=\"blur-text\">\" <b>Error 404</b> \"</span>. 🫣",
    "🥸 - Even AI has boundaries... This topic is off-limits per Adé's instructions."
  ]
};

// Track answer indices for each question - randomize initial indices
let answerIndices = {
  "2": Math.floor(Math.random() * aiAnswers["2"].length),
  "4": Math.floor(Math.random() * aiAnswers["4"].length)
};

// Store the initial random indices for resetting
let initialIndices = { ...answerIndices };

// Track which answers have been shown for each question
let shownAnswers = {
  "2": new Set(),
  "4": new Set()
};

// Helper function to check if all answers have been shown
function allAnswersShown(questionId) {
  return shownAnswers[questionId].size >= aiAnswers[questionId].length;
}

// Helper function to mark an answer as shown
function markAnswerAsShown(questionId, answerIndex) {
  shownAnswers[questionId].add(answerIndex);
}

// Helper function to reset shown answers when switching pills
function resetShownAnswers(questionId) {
  shownAnswers[questionId].clear();
}

// Disabled pills system - pills become disabled after token exhaustion
// 2 minutes for localhost, 1 hour for production
const DISABLE_DURATION_LOCALHOST = 2 * 60 * 1000; // 2 minutes in milliseconds
const DISABLE_DURATION_PRODUCTION = 60 * 60 * 1000; // 1 hour in milliseconds
let disabledPills = new Set();

// Get disable duration based on environment
function getDisableDuration() {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return DISABLE_DURATION_LOCALHOST; // 2 minutes for localhost
  }
  return DISABLE_DURATION_PRODUCTION; // 1 hour for production
}

// Load disabled pills from localStorage
function loadDisabledPills() {
  try {
    const stored = localStorage.getItem('disabledPills');
    
    if (stored) {
      const data = JSON.parse(stored);
      const now = Date.now();
      const duration = getDisableDuration();
      
      // Filter out expired disabled pills
      Object.keys(data).forEach(pillValue => {
        const disabledAt = data[pillValue];
        if (now - disabledAt < duration) {
          disabledPills.add(pillValue);
        }
      });
      
      // Update localStorage with only non-expired pills
      const validData = {};
      disabledPills.forEach(pillValue => {
        validData[pillValue] = data[pillValue];
      });
      localStorage.setItem('disabledPills', JSON.stringify(validData));
    }
  } catch (e) {
    console.error('Error loading disabled pills:', e);
  }
}

// Save disabled pill to localStorage
function disablePill(pillValue) {
  disabledPills.add(pillValue);
  try {
    const stored = localStorage.getItem('disabledPills');
    const data = stored ? JSON.parse(stored) : {};
    data[pillValue] = Date.now();
    localStorage.setItem('disabledPills', JSON.stringify(data));
  } catch (e) {
    console.error('Error saving disabled pill:', e);
  }
}

// Check if a pill is still within its disabled period
function isPillDisabled(pillValue) {
  if (!disabledPills.has(pillValue)) return false;
  
  try {
    const stored = localStorage.getItem('disabledPills');
    if (stored) {
      const data = JSON.parse(stored);
      const disabledAt = data[pillValue];
      const duration = getDisableDuration();
      
      if (disabledAt && (Date.now() - disabledAt < duration)) {
        return true;
      } else {
        // Time expired, remove from disabled set
        disabledPills.delete(pillValue);
        delete data[pillValue];
        localStorage.setItem('disabledPills', JSON.stringify(data));
        return false;
      }
    }
  } catch (e) {
    console.error('Error checking disabled pill:', e);
  }
  return false;
}

// Apply disabled state to pills (visual only - still clickable)
function updatePillStates() {
  const pills = document.querySelectorAll('.radio-pill');
  pills.forEach(pill => {
    const pillValue = pill.getAttribute('data-value');
    if (isPillDisabled(pillValue)) {
      pill.classList.add('disabled');
      pill.style.opacity = '0.7';
      pill.style.cursor = 'pointer'; // Keep clickable
      // Remove pointer-events blocking to allow clicks
    } else {
      pill.classList.remove('disabled');
      pill.style.opacity = '';
      pill.style.cursor = '';
    }
  });
}

function showThinkingState(callback) {
  const typedTextElement = document.getElementById('typedText');
  const aiAvatar = document.querySelector('.ai-avatar');
  
  if (typedTextElement && aiAvatar) {
    // Clear content and prepare for animation
    typedTextElement.innerHTML = '';
    typedTextElement.style.opacity = '0';
    typedTextElement.style.transform = 'translateY(10px)';
    
    // Add golden pulsing border to avatar
    aiAvatar.classList.add('thinking');
    
    // Small delay then fade in thinking text
    setTimeout(() => {
      typedTextElement.innerHTML = 'Thinking...';
      typedTextElement.style.transition = 'opacity 0.4s ease-out, transform 0.4s ease-out';
      typedTextElement.style.opacity = '1';
      typedTextElement.style.transform = 'translateY(0)';
    }, 100);
    
    // Wait 4 seconds, then execute callback
    thinkingTimeout = setTimeout(() => {
      // Remove thinking state
      aiAvatar.classList.remove('thinking');
      // Reset styles for typewriter
      typedTextElement.style.transition = '';
      typedTextElement.style.opacity = '';
      typedTextElement.style.transform = '';
      // Clear timeout reference
      thinkingTimeout = null;
      // Execute the callback (usually typeWriter)
      callback();
    }, 4000);
  } else {
    // Fallback if elements don't exist
    callback();
  }
}

function typeWriter(text, element, baseSpeed = 35, callback = null) {
  let i = 0;
  element.innerHTML = '';
  
  // Parse HTML into tokens (text and tags)
  const tokens = [];
  let currentIndex = 0;
  
  while (currentIndex < text.length) {
    const nextTagStart = text.indexOf('<', currentIndex);
    
    if (nextTagStart === -1) {
      // No more tags, add remaining text character by character
      const remainingText = text.substring(currentIndex);
      for (let char of remainingText) {
        tokens.push({ type: 'char', content: char });
      }
      break;
    }
    
    // Add characters before the tag
    const beforeTag = text.substring(currentIndex, nextTagStart);
    for (let char of beforeTag) {
      tokens.push({ type: 'char', content: char });
    }
    
    // Find the end of the tag
    const nextTagEnd = text.indexOf('>', nextTagStart);
    if (nextTagEnd !== -1) {
      const tagContent = text.substring(nextTagStart, nextTagEnd + 1);
      tokens.push({ type: 'tag', content: tagContent });
      currentIndex = nextTagEnd + 1;
    } else {
      // Malformed tag, treat as regular character
      tokens.push({ type: 'char', content: text.charAt(nextTagStart) });
      currentIndex = nextTagStart + 1;
    }
  }
  
  let currentHTML = '';
  
  function getVariableSpeed(token, nextToken) {
    // Base speed with natural variation
    let speed = baseSpeed + Math.random() * 15 - 7; // ±7ms variation
    
    if (token.type === 'char') {
      const char = token.content;
      
      // Longer pauses after sentences
      if (char === '.' || char === '!' || char === '?') {
        speed += 200 + Math.random() * 100; // 200-300ms pause
      }
      // Medium pauses after commas and colons
      else if (char === ',' || char === ':' || char === ';') {
        speed += 80 + Math.random() * 40; // 80-120ms pause
      }
      // Short pause after dashes and quotes
      else if (char === '-' || char === '"' || char === "'" || char === ')') {
        speed += 40 + Math.random() * 20; // 40-60ms pause
      }
      // Slightly faster for spaces (natural reading flow)
      else if (char === ' ') {
        speed *= 1;
      }
      // Faster for common letters
      else if ('eaiotnshrdlu'.includes(char.toLowerCase())) {
        speed *= 0.9;
      }
    }
    // Tags appear instantly
    else if (token.type === 'tag') {
      speed = 0;
    }
    
    return Math.max(speed, 15); // Minimum 15ms
  }
  
  function type() {
    if (i < tokens.length) {
      const token = tokens[i];
      const nextToken = tokens[i + 1];
      
      // Build the HTML string
      currentHTML += token.content;
      
      // Set the innerHTML to parse HTML properly
      element.innerHTML = currentHTML;
      
      i++;
      
      // Get variable speed for more natural flow
      const delay = getVariableSpeed(token, nextToken);
      setTimeout(type, delay);
    } else {
      // Typing completed, call callback if provided and not disabled
      if (callback && !element.dataset.disabled) {
        setTimeout(callback, 300); // Small delay before showing redo button
      }
    }
  }
  type();
}

// AI Answer Machine event listeners
const generateBtn = document.getElementById('actionButton');
const clearBtn = document.getElementById('secondaryButton');
const radioPills = document.querySelectorAll('.radio-pill');
const typedTextElement = document.getElementById('typedText');
let selectedValue = null;
let isTyping = false;
let thinkingTimeout = null;

// Initialize disabled pills system on page load
if (radioPills.length > 0) {
  loadDisabledPills();
  updatePillStates();
  
  // Check every minute to update pill states (in case hour expires)
  setInterval(() => {
    updatePillStates();
  }, 60000); // 60 seconds
}

// Debug function for localhost development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  window.clearDisabledPills = function() {
    disabledPills.clear();
    localStorage.removeItem('disabledPills');
    updatePillStates();
    console.log('All disabled pills cleared for testing');
  };
}

// Functions to manage pill states during typing
function disableUnselectedPills() {
  isTyping = true;
  radioPills.forEach(pill => {
    if (!pill.classList.contains('selected')) {
      pill.style.opacity = '0.5';
      pill.style.cursor = 'not-allowed';
      pill.style.pointerEvents = 'none';
    }
  });
}

function enableAllPills() {
  isTyping = false;
  radioPills.forEach(pill => {
    pill.style.opacity = '';
    pill.style.cursor = '';
    pill.style.pointerEvents = '';
  });
}

function clearThinkingState() {
  // Clear any pending thinking timeout
  if (thinkingTimeout) {
    clearTimeout(thinkingTimeout);
    thinkingTimeout = null;
  }
  
  // Remove thinking state from avatar
  const aiAvatar = document.querySelector('.ai-avatar');
  if (aiAvatar) {
    aiAvatar.classList.remove('thinking');
  }
  
  // Clear and reset typed text element
  const typedTextElement = document.getElementById('typedText');
  if (typedTextElement) {
    typedTextElement.innerHTML = '';
    typedTextElement.style.transition = '';
    typedTextElement.style.opacity = '';
    typedTextElement.style.transform = '';
  }
}

// Redo button functions
function createTokensAlert() {
  const alert = document.createElement('div');
  alert.id = 'tokensAlert';
  alert.className = 'tokens-alert';
  alert.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)">
      <path opacity="0.4" d="M12.7516 3.50098C12.7516 3.08676 12.4158 2.75098 12.0016 2.75098C11.5874 2.75098 11.2516 3.08676 11.2516 3.50098V4.28801C7.46161 4.6643 4.5016 7.86197 4.5016 11.751V14.865L3.80936 16.7109C3.25776 18.1819 4.34514 19.751 5.9161 19.751H18.0871C19.658 19.7509 20.7454 18.1819 20.1938 16.7109L19.5016 14.865V11.751C19.5016 7.86197 16.5416 4.6643 12.7516 4.28801V3.50098Z" fill="#947b57"/>
      <path d="M14.8736 20.751H9.12622C9.55878 21.918 10.6824 22.7495 11.9999 22.7495C13.3175 22.7495 14.4411 21.918 14.8736 20.751Z" fill="#947b57"/>
    </svg>
    <div class="tokens-divider"></div>
    <span>You've run out of tokens for this conversation. To learn more, reach out to adeobayomi@gmail.com</span>
    <button type="button" class="email-copy-btn tokens-copy-btn" aria-label="Copy email address">
      <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)">
        <path opacity="0.4" d="M7.19447 4.625C7.16931 4.78798 7.15625 4.95497 7.15625 5.125C7.15625 6.91992 8.61132 8.375 10.4062 8.375H13.5937C15.3887 8.375 16.8438 6.91992 16.8437 5.12499C16.8437 4.95496 16.8307 4.78798 16.8055 4.625H17.25C18.4926 4.625 19.5 5.63236 19.5 6.875L19.5 20.625C19.5 21.8676 18.4926 22.875 17.25 22.875H6.75C5.50736 22.875 4.5 21.8676 4.5 20.625V6.875C4.5 5.63236 5.50736 4.625 6.75 4.625H7.19447Z" fill="#947b57"/>
        <path d="M10.4063 2.875C9.16361 2.875 8.15625 3.88236 8.15625 5.125C8.15625 6.36764 9.16361 7.375 10.4062 7.375H13.5937C14.8364 7.375 15.8438 6.36764 15.8437 5.125C15.8437 3.88236 14.8364 2.875 13.5937 2.875H10.4063Z" fill="#947b57"/>
      </svg>
      <svg class="copy-success-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)">
        <path d="M19.5455 6.4965C19.9848 6.93584 19.9848 7.64815 19.5455 8.08749L10.1286 17.5043C9.6893 17.9437 8.97699 17.9437 8.53765 17.5043L4.45451 13.4212C4.01517 12.9819 4.01516 12.2695 4.4545 11.8302C4.89384 11.3909 5.60616 11.3909 6.0455 11.8302L9.33315 15.1179L17.9545 6.4965C18.3938 6.05716 19.1062 6.05716 19.5455 6.4965Z" fill="#947b57"/>
      </svg>
    </button>
  `;
  return alert;
}

function showTokensAlert(skipAnimation = false) {
  let tokensAlert = document.getElementById('tokensAlert');
  const isFirstTime = !tokensAlert;
  
  if (!tokensAlert) {
    tokensAlert = createTokensAlert();
    const output = document.getElementById('output');
    if (output) {
      output.appendChild(tokensAlert);
    }
    
    // Add copy functionality to the tokens alert
    const tokensCopyBtn = tokensAlert.querySelector('.tokens-copy-btn');
    if (tokensCopyBtn) {
      tokensCopyBtn.addEventListener('click', function() {
        const copyIcon = this.querySelector('.copy-icon');
        const copySuccessIcon = this.querySelector('.copy-success-icon');
        const emailAddress = 'adeobayomi@gmail.com';
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(emailAddress).then(() => {
            // Show success feedback - scale out copy icon, scale in checkmark
            copyIcon.style.opacity = '0';
            copyIcon.style.transform = 'scale(0.8)';
            copySuccessIcon.style.opacity = '1';
            copySuccessIcon.style.transform = 'scale(1)';
            
            setTimeout(() => {
              copyIcon.style.opacity = '1';
              copyIcon.style.transform = 'scale(1)';
              copySuccessIcon.style.opacity = '0';
              copySuccessIcon.style.transform = 'scale(0.8)';
            }, 2000);
          }).catch(() => {
            // Fallback for clipboard API failure
            fallbackCopyTextToClipboard(emailAddress, copyIcon, copySuccessIcon);
          });
        } else {
          // Fallback for older browsers
          fallbackCopyTextToClipboard(emailAddress, copyIcon, copySuccessIcon);
        }
        
        function fallbackCopyTextToClipboard(text, copyIcon, copySuccessIcon) {
          const textArea = document.createElement("textarea");
          textArea.value = text;
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          
          try {
            document.execCommand('copy');
            copyIcon.style.opacity = '0';
            copyIcon.style.transform = 'scale(0.8)';
            copySuccessIcon.style.opacity = '1';
            copySuccessIcon.style.transform = 'scale(1)';
            setTimeout(() => {
              copyIcon.style.opacity = '1';
              copyIcon.style.transform = 'scale(1)';
              copySuccessIcon.style.opacity = '0';
              copySuccessIcon.style.transform = 'scale(0.8)';
            }, 2000);
          } catch (err) {
            console.error('Fallback: Could not copy text');
          }
          
          document.body.removeChild(textArea);
        }
      });
    }
  }
  
  // Ensure alert is always visible
  tokensAlert.classList.remove('show'); // Remove first to ensure clean state
  
  // Show with or without animation based on parameters
  if (skipAnimation || !isFirstTime) {
    // Show immediately without animation for subsequent clicks
    tokensAlert.offsetHeight; // Force reflow
    tokensAlert.classList.add('show');
  } else {
    // First time showing - use fade-in animation
    tokensAlert.offsetHeight;
    setTimeout(() => {
      tokensAlert.classList.add('show');
    }, 10);
  }
}

function hideTokensAlert(skipAnimation = false) {
  const tokensAlert = document.getElementById('tokensAlert');
  if (tokensAlert) {
    if (skipAnimation) {
      // Remove immediately without animation
      if (tokensAlert.parentNode) {
        tokensAlert.parentNode.removeChild(tokensAlert);
      }
    } else {
      // Remove with fade-out animation
      tokensAlert.classList.remove('show');
      setTimeout(() => {
        if (tokensAlert.parentNode) {
          tokensAlert.parentNode.removeChild(tokensAlert);
        }
      }, 400); // Wait for animation to complete
    }
  }
}

function createRedoButton() {
  const redoBtn = document.createElement('button');
  redoBtn.id = 'redoButton';
  redoBtn.className = 'sec-btn';
  redoBtn.style.opacity = '0';
  redoBtn.style.height='0'; 
  redoBtn.style.width='34px';
  redoBtn.style.height= '34px';
  redoBtn.style.marginTop = '0';
  redoBtn.style.marginBottom = '0';
  redoBtn.style.overflow = 'hidden';
  redoBtn.style.transform = 'translateY(-10px)';
  redoBtn.style.pointerEvents = 'none';

  redoBtn.style.transition = 'opacity 0.4s ease-in-out, height 0.4s ease-in-out, transform 0.4s ease-in-out, margin 0.4s ease-in-out';
  redoBtn.innerHTML = `
   <svg width="32" height="96" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)">
<path d="M7.17466 4.46302C8.83368 3.19001 10.8664 2.5 12.9575 2.5C15.0487 2.5 17.0814 3.19001 18.7404 4.46302C19.7896 5.26807 20.6522 6.27783 21.2815 7.42228L23.0527 6.92706C23.3449 6.84538 23.6575 6.94772 23.8447 7.18637C24.032 7.42502 24.0571 7.75297 23.9082 8.0173L22.1736 11.0983C22.076 11.2717 21.9136 11.3991 21.722 11.4527C21.5304 11.5063 21.3254 11.4815 21.1521 11.3839L18.0714 9.64919C17.8071 9.50036 17.6584 9.20697 17.6948 8.90582C17.7311 8.60466 17.9453 8.35506 18.2374 8.27338L19.7901 7.83927C19.2797 7.00108 18.6161 6.25835 17.8273 5.65305C16.4302 4.58106 14.7185 4 12.9575 4C11.1966 4 9.48486 4.58106 8.08781 5.65305C6.69076 6.72504 5.68647 8.22807 5.2307 9.92901C5.1235 10.3291 4.71225 10.5665 4.31215 10.4593C3.91205 10.3521 3.67461 9.94088 3.78182 9.54078C4.32304 7.52089 5.51565 5.73603 7.17466 4.46302Z" fill="#947b57"/>
<path d="M4.18603 12.5458C4.3776 12.4922 4.58261 12.517 4.75594 12.6146L7.83665 14.3493C8.10096 14.4981 8.2496 14.7915 8.21325 15.0927C8.17691 15.3938 7.96274 15.6434 7.6706 15.7251L6.1265 16.1568C6.63702 16.9958 7.30106 17.7392 8.09052 18.345C9.48757 19.417 11.1993 19.998 12.9602 19.998C14.7212 19.998 16.4329 19.417 17.83 18.345C19.227 17.273 20.2313 15.77 20.6871 14.069C20.7943 13.6689 21.2055 13.4315 21.6056 13.5387C22.0057 13.6459 22.2432 14.0572 22.136 14.4573C21.5947 16.4771 20.4021 18.262 18.7431 19.535C17.0841 20.808 15.0514 21.498 12.9602 21.498C10.8691 21.498 8.8364 20.808 7.17738 19.535C6.12761 18.7295 5.26458 17.719 4.63517 16.5738L2.85527 17.0714C2.56313 17.1531 2.25055 17.0507 2.06329 16.8121C1.87603 16.5734 1.85096 16.2455 1.99978 15.9812L3.73441 12.9001C3.832 12.7268 3.99445 12.5993 4.18603 12.5458Z" fill="#947b57"/>
</svg>

  `;
  
  // Add click handler
  redoBtn.addEventListener('click', function() {
    if (selectedValue && aiAnswers[selectedValue]) {
      // Cycle to next answer
      answerIndices[selectedValue] = (answerIndices[selectedValue] + 1) % aiAnswers[selectedValue].length;
      
      // Hide redo button and tokens alert during typing
      hideRedoButton();
      hideTokensAlert();
      
      // Show new answer
      const currentAnswer = aiAnswers[selectedValue][answerIndices[selectedValue]];
      showThinkingState(() => {
        disableUnselectedPills();
        typeWriter(currentAnswer, typedTextElement, 50, () => {
          // Mark this answer as shown
          markAnswerAsShown(selectedValue, answerIndices[selectedValue]);
          // Show redo button only if there are still unshown variations
          if (!allAnswersShown(selectedValue)) {
            enableAllPills();
            showRedoButton();
          } else {
            // Show tokens alert when all answers are exhausted
            showTokensAlert();
            // Disable this pill for 1 hour
            disablePill(selectedValue);
            // Enable all pills first, then update states (so other pills become clickable)
            enableAllPills();
            updatePillStates();
          }
        });
      });
    }
  });
  
  return redoBtn;
}

function showRedoButton() {
  let redoBtn = document.getElementById('redoButton');
  
  if (!redoBtn) {
    redoBtn = createRedoButton();
    const outputDiv = document.getElementById('output');
    if (outputDiv) {
      outputDiv.appendChild(redoBtn);
      // Force reflow to ensure collapsed state is applied before animation
      redoBtn.offsetHeight;
    }
  }
  
  // Fade in with slight delay to ensure DOM is ready
  setTimeout(() => {
    redoBtn.style.height = '32px';
    redoBtn.style.marginTop = '12px';
    redoBtn.style.marginBottom = '';
    redoBtn.style.transform = 'translateY(0)';
    redoBtn.style.overflow = '';
    redoBtn.style.opacity = '1';
    redoBtn.style.pointerEvents = 'auto';
  }, 10);
}

function hideRedoButton() {
  const redoBtn = document.getElementById('redoButton');
  if (redoBtn) {
    redoBtn.style.opacity = '0';
    redoBtn.style.pointerEvents = 'none';
    redoBtn.style.transform = 'translateY(-10px)';
    redoBtn.style.height = '0';
    redoBtn.style.marginTop = '0';
    redoBtn.style.marginBottom = '0';
    redoBtn.style.overflow = 'hidden';
  }
}

// Handle radio pill selection
radioPills.forEach(pill => {
  pill.addEventListener('click', function() {
    // Store the selected value
    const clickedValue = this.getAttribute('data-value');
    
    // If pill is disabled, show tokens alert instead of normal flow
    if (isPillDisabled(clickedValue)) {
      // Clear any ongoing thinking state and prevent output
      clearThinkingState();
      
      // Reset typing state and enable all pills
      enableAllPills();
      
      // Clear any existing output and prevent any pending callbacks
      const typedTextElement = document.getElementById('typedText');
      if (typedTextElement) {
        typedTextElement.innerHTML = '';
        // Add a flag to prevent any pending typewriter callbacks
        typedTextElement.dataset.disabled = 'true';
      }
      
      // Still update visual selection
      radioPills.forEach(p => p.classList.remove('selected'));
      this.classList.add('selected');
      selectedValue = clickedValue;
      
      // Hide any existing redo button
      hideRedoButton();
      
      // Show tokens alert immediately (will replace existing if present)
      showTokensAlert(true);
      return;
    }
    
    // Prevent clicking on already active pill or during typing (but allow during thinking)
    if (selectedValue === clickedValue || isTyping) {
      return;
    }
    
    // Clear any ongoing thinking state (allows interrupting thinking to switch topics)
    clearThinkingState();
    
    // Clear disabled flag to allow normal operation
    const typedTextElement = document.getElementById('typedText');
    if (typedTextElement) {
      delete typedTextElement.dataset.disabled;
    }
    
    // Reset to initial random index when switching to a different pill
    answerIndices[clickedValue] = initialIndices[clickedValue];
    
    // Reset shown answers tracking for the new pill
    resetShownAnswers(clickedValue);
    
    // Remove selected class from all pills
    radioPills.forEach(p => p.classList.remove('selected'));
    
    // Add selected class to clicked pill
    this.classList.add('selected');
    
    // Update selected value
    selectedValue = clickedValue;
    
    // Hide redo button and tokens alert when switching pills
    hideRedoButton();
    hideTokensAlert(true); // Skip animation for immediate hiding
    
    // Trigger the AI response with thinking state
    if (selectedValue && aiAnswers[selectedValue] && typedTextElement) {
      const currentAnswer = aiAnswers[selectedValue][answerIndices[selectedValue]];
      showThinkingState(() => {
        disableUnselectedPills();
        typeWriter(currentAnswer, typedTextElement, 50, () => {
          // Mark this answer as shown
          markAnswerAsShown(selectedValue, answerIndices[selectedValue]);
          // Show redo button only if there are unshown variations
          if (!allAnswersShown(selectedValue)) {
            enableAllPills();
            showRedoButton();
          } else {
            // Show tokens alert when all answers are exhausted
            showTokensAlert();
            // Disable this pill for 1 hour
            disablePill(selectedValue);
            // Enable all pills first, then update states (so other pills become clickable)
            enableAllPills();
            updatePillStates();
          }
        });
      });
    }
  });
});

// Handle generate button click
if (generateBtn) {
  generateBtn.addEventListener('click', function() {
    if (selectedValue && aiAnswers[selectedValue]) {
      hideRedoButton();
      hideTokensAlert();
      const currentAnswer = aiAnswers[selectedValue][answerIndices[selectedValue]];
      showThinkingState(() => {
        disableUnselectedPills();
        typeWriter(currentAnswer, typedTextElement, 50, () => {
          // Mark this answer as shown
          markAnswerAsShown(selectedValue, answerIndices[selectedValue]);
          // Show redo button only if there are unshown variations
          if (!allAnswersShown(selectedValue)) {
            enableAllPills();
            showRedoButton();
          } else {
            // Show tokens alert when all answers are exhausted
            showTokensAlert();
            // Disable this pill for 1 hour
            disablePill(selectedValue);
            // Enable all pills first, then update states (so other pills become clickable)
            enableAllPills();
            updatePillStates();
          }
        });
      });
    }
  });
}

// Handle clear button click
if (clearBtn) {
  clearBtn.addEventListener('click', function() {
    if (typedTextElement) {
      typedTextElement.innerHTML = '';
      // Hide and remove redo button and tokens alert
      hideRedoButton();
      hideTokensAlert();
      setTimeout(() => {
        const redoBtn = document.getElementById('redoButton');
        if (redoBtn) {
          redoBtn.remove();
        }
      }, 300);
      // Optionally clear selection
      radioPills.forEach(p => p.classList.remove('selected'));
      selectedValue = null;
    }
  });
}
