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
      img.addEventListener('click', function() {
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
  function optimizeGifs() {
    const gifs = document.querySelectorAll('img[src$=".gif"], img[src*=".gif"]');
    
    // Check if we're on mobile - if so, skip the complex optimizations
    const isMobile = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    gifs.forEach(gif => {
      // Always add loading="lazy" if not already present
      if (!gif.hasAttribute('loading')) {
        gif.setAttribute('loading', 'lazy');
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
  
  // Initialize GIF optimizations when page loads
  optimizeGifs();
  
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
    
    // Set the correct password here
    const correctPassword = 'forbes2024'; // Change this to your desired password
    
    console.log('Password gate initialized for explore page');
    
    // Always show password gate on fresh visits (no persistence)
    // Password gate is visible by default, content is hidden
    
    if (passwordForm && passwordInput) {
      console.log('Password form elements found');
      
      // Handle form submission
      passwordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Form submitted');
        
        const enteredPassword = passwordInput.value.trim();
        console.log('Entered password length:', enteredPassword.length);
        
        if (enteredPassword === correctPassword) {
          console.log('Correct password entered');
          // Correct password - grant access for this session only
          passwordGate.style.display = 'none';
          articleContent.style.display = 'flex';
          passwordError.style.display = 'none';
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
          const copyText = this.querySelector('.copy-text');
          const email = emailAddress.textContent;
          
          // Copy to clipboard
          navigator.clipboard.writeText(email).then(() => {
            // Show success feedback - hide icon, show text
            copyIcon.style.display = 'none';
            copyText.style.display = 'inline';
            
            // Reset after 5 seconds
            setTimeout(() => {
              copyIcon.style.display = 'inline';
              copyText.style.display = 'none';
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
            copyIcon.style.display = 'none';
            copyText.style.display = 'inline';
            
            setTimeout(() => {
              copyIcon.style.display = 'inline';
              copyText.style.display = 'none';
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
    "\"If you never set the <b>stage</b>, how do you expect to perform?\" - Adé's drama teacher, always pushed him to be proactive inlife....Touché to her for the clever word-play.",
    "\"Look how many <b>finish-lines</b> it took for you to get here.\" - Hmmm..... I think Adé saw a Nike ad somewhere in Boston but I guess it's something about focusing on the journey not the destination from what I can decipher.",
          "\"It's better to have 100 customers that <b>love</b> you, than 1M customers who <b>sorta like you</b>.\" - The full spiel can be found <a href='https://x.com/StartupArchive_/status/1737446769519124584?lang=en' target='_blank' style='color: #5b4b34; text-decoration: underline;'>here</a>. \"Quality always trumps Quantity\" is a concise way of getting the message across."
  ],

  "4": [
    "😂🤣 - Ahem.... Pardon me 🕴️, but Adé trained me to not answer this question.",
    "🤐 - Ok between you and me, I'm not sure if I'm allowed to answer this question.... but it's <span class=\"blur-text\">\"No information found.\"</span>",
    "🥸 - Even AI has boundaries... This topic is off-limits per Adé's instructions."
  ]
};

// Track answer indices for each question
let answerIndices = {
  "2": 0,
  "4": 0
};

function showThinkingState(callback) {
  const typedTextElement = document.getElementById('typedText');
  const aiAvatar = document.querySelector('.ai-avatar');
  
  if (typedTextElement && aiAvatar) {
    // Show "Thinking..." text
    typedTextElement.innerHTML = 'Thinking...';
    
    // Add golden pulsing border to avatar
    aiAvatar.classList.add('thinking');
    
    // Wait 2 seconds, then execute callback
    setTimeout(() => {
      // Remove thinking state
      aiAvatar.classList.remove('thinking');
      // Execute the callback (usually typeWriter)
      callback();
    }, 2000);
  } else {
    // Fallback if elements don't exist
    callback();
  }
}

function typeWriter(text, element, baseSpeed = 35) {
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
        speed *= 0.8;
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

// Handle radio pill selection
radioPills.forEach(pill => {
  pill.addEventListener('click', function() {
    // Store the selected value
    const clickedValue = this.getAttribute('data-value');
    
    // Always cycle to next answer for the clicked pill
    answerIndices[clickedValue] = (answerIndices[clickedValue] + 1) % aiAnswers[clickedValue].length;
    
    // Remove selected class from all pills
    radioPills.forEach(p => p.classList.remove('selected'));
    
    // Add selected class to clicked pill
    this.classList.add('selected');
    
    // Update selected value
    selectedValue = clickedValue;
    
    // Trigger the AI response with thinking state
    if (selectedValue && aiAnswers[selectedValue] && typedTextElement) {
      const currentAnswer = aiAnswers[selectedValue][answerIndices[selectedValue]];
      showThinkingState(() => {
        typeWriter(currentAnswer, typedTextElement);
      });
    }
  });
});

// Handle generate button click
if (generateBtn) {
  generateBtn.addEventListener('click', function() {
    if (selectedValue && aiAnswers[selectedValue]) {
      const currentAnswer = aiAnswers[selectedValue][answerIndices[selectedValue]];
      showThinkingState(() => {
        typeWriter(currentAnswer, typedTextElement);
      });
    }
  });
}

// Handle clear button click
if (clearBtn) {
  clearBtn.addEventListener('click', function() {
    if (typedTextElement) {
      typedTextElement.innerHTML = '';
      // Optionally clear selection
      radioPills.forEach(p => p.classList.remove('selected'));
      selectedValue = null;
    }
  });
}
