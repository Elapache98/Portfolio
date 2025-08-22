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
  
  buttons.forEach(btn => {
    const href = btn.getAttribute('href');
    if (href && href !== '#') {
      // Check if current page matches the button's href
      if (currentPageFile === href || (currentPageFile === '' && href === 'index.html')) {
        btn.classList.add('active');
        setByUrl = true;
      }
    }
  });
  
  // Special case: explore.html should show Work as active
  if (!setByUrl && currentPageFile === 'explore.html') {
    buttons.forEach(btn => {
      if (btn.getAttribute('href') === 'work.html') {
        btn.classList.add('active');
        setByUrl = true;
      }
    });
  }
  
  // If no match, default to first (Home)
  if (!setByUrl && buttons.length > 0) {
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

  // Lightbox logic
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxDesc = document.getElementById('lightbox-desc');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  const images = Array.from(document.querySelectorAll('.photo-row img'));
  let currentIndex = 0;

  function showLightbox(index) {
    const img = images[index];
    if (!img) return;
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxDesc.textContent = img.alt;
    lightbox.style.display = 'flex';
    lightbox.focus();
    currentIndex = index;
  }

  images.forEach((img, idx) => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', function() {
      showLightbox(idx);
    });
  });

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

  // Welcome message fade-out (desktop only)
  if (window.innerWidth > 600) {
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
  }

  // Make Forbes project card clickable on work.html
  if (window.location.pathname.endsWith('work.html')) {
    const projectCards = document.querySelectorAll('.project-content');
    if (projectCards.length >= 2) {
      const forbesCard = projectCards[0]; // Second project-content (Forbes one)
      forbesCard.style.cursor = 'pointer';
      forbesCard.addEventListener('click', function() {
        window.location.href = 'explore.html';
      });
    }
  }

  // Password gate functionality for explore.html
  if (window.location.pathname.endsWith('explore.html')) {
    const passwordForm = document.getElementById('password-form');
    const passwordInput = document.getElementById('password-input');
    const passwordError = document.getElementById('password-error');
    const passwordGate = document.getElementById('password-gate');
    const articleContent = document.getElementById('article-content');
    
    // Set the correct password here
    const correctPassword = 'forbes2024'; // Change this to your desired password
    
    // Always show password gate on fresh visits (no persistence)
    // Password gate is visible by default, content is hidden
    
    if (passwordForm) {
      passwordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const enteredPassword = passwordInput.value.trim();
        
        if (enteredPassword === correctPassword) {
          // Correct password - grant access for this session only
          passwordGate.style.display = 'none';
          articleContent.style.display = 'flex';
          passwordError.style.display = 'none';
        } else {
          // Wrong password - show error
          passwordError.style.display = 'block';
          passwordInput.value = '';
          passwordInput.focus();
          
          // Add shake animation to the modal
          const modal = document.querySelector('.password-modal');
          modal.style.animation = 'shake 0.5s ease-in-out';
          setTimeout(() => {
            modal.style.animation = '';
          }, 500);
        }
      });
      
      // Focus on password input when page loads
      passwordInput.focus();
    }
  }
});

// AI Answer Machine functionality
const aiAnswers = {
  "1": "\"The best time to plant a tree was <a href='https://quoteinvestigator.com/2013/10/20/best-time-plant/' target='_blank'>20</a> years ago. The second best time is now.\" - This taught me that starting is more important than perfect timing.",
  "2": "\"If you never set the <b>stage</b>, how do you expect to perform?\" - Adé's drama teacher, through some rather clever word-play, always pushed him to be proactive in life.",
  "3": "\"That's Not Me\" isn't just a song title, it's a philosophy. Stay true to yourself no matter what.\" - Skepta's authenticity inspired my design approach.",
  "4": "😂🤣 - Sorry for my unprofessionalism. Adé trained me to not answer this question."
};

function typeWriter(text, element, speed = 50) {
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
  
  function type() {
    if (i < tokens.length) {
      const token = tokens[i];
      
      // Build the HTML string
      currentHTML += token.content;
      
      // Set the innerHTML to parse HTML properly
      element.innerHTML = currentHTML;
      
      i++;
      setTimeout(type, speed);
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
    // Remove selected class from all pills
    radioPills.forEach(p => p.classList.remove('selected'));
    
    // Add selected class to clicked pill
    this.classList.add('selected');
    
    // Store the selected value
    selectedValue = this.getAttribute('data-value');
    
    // Immediately trigger the AI response
    if (selectedValue && aiAnswers[selectedValue] && typedTextElement) {
      typeWriter(aiAnswers[selectedValue], typedTextElement, 30);
    }
  });
});

// Handle generate button click
if (generateBtn) {
  generateBtn.addEventListener('click', function() {
    if (selectedValue && aiAnswers[selectedValue]) {
      typeWriter(aiAnswers[selectedValue], typedTextElement, 30);
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
