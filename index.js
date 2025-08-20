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

  // Set active based on current page (future-proof)
  let setByUrl = false;
  buttons.forEach(btn => {
    const href = btn.getAttribute('href');
    if (href && href !== '#' && window.location.pathname.endsWith(href.replace('#', ''))) {
      btn.classList.add('active');
      setByUrl = true;
    }
  });
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

// AI Answer Machine functionality
const aiAnswers = {
  "1": "\"The best time to plant a tree was 20 years ago. The second best time is now.\" - This taught me that starting is more important than perfect timing.",
  "2": "\"If you never set the <b>stage</b>, how do you expect to perform?\" - Adé's drama teacher, through some rather clever word-play, always pushed him to be proactive in life.",
  "3": "\"That's Not Me\" isn't just a song title, it's a philosophy. Stay true to yourself no matter what.\" - Skepta's authenticity inspired my design approach.",
  "4": "😂🤣 - Sorry for my unprofessionalism.Adé trained me to not answer this question."
};

function typeWriter(text, element, speed = 50) {
  let i = 0;
  element.innerHTML = '';
  
  // Parse HTML tags to avoid breaking them during typing
  const textArray = [];
  let tempText = text;
  let currentIndex = 0;
  
  // Split text while preserving HTML tags
  while (currentIndex < text.length) {
    const nextTagStart = text.indexOf('<', currentIndex);
    
    if (nextTagStart === -1) {
      // No more tags, add remaining text character by character
      for (let j = currentIndex; j < text.length; j++) {
        textArray.push(text.charAt(j));
      }
      break;
    }
    
    // Add characters before the tag
    for (let j = currentIndex; j < nextTagStart; j++) {
      textArray.push(text.charAt(j));
    }
    
    // Find the end of the tag
    const nextTagEnd = text.indexOf('>', nextTagStart);
    if (nextTagEnd !== -1) {
      // Add the entire tag as one element
      textArray.push(text.substring(nextTagStart, nextTagEnd + 1));
      currentIndex = nextTagEnd + 1;
    } else {
      // Malformed tag, treat as regular character
      textArray.push(text.charAt(nextTagStart));
      currentIndex = nextTagStart + 1;
    }
  }
  
  function type() {
    if (i < textArray.length) {
      element.innerHTML += textArray[i];
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
    
    // Automatically generate answer when pill is clicked
    if (selectedValue && aiAnswers[selectedValue] && typedTextElement) {
      typedTextElement.innerHTML = '';
      setTimeout(() => {
        typeWriter(aiAnswers[selectedValue], typedTextElement, 30);
      }, 300);
    }
  });
});

if (generateBtn && typedTextElement) {
  generateBtn.addEventListener('click', function() {
    if (selectedValue && aiAnswers[selectedValue]) {
      typedTextElement.innerHTML = '';
      setTimeout(() => {
        typeWriter(aiAnswers[selectedValue], typedTextElement, 30);
      }, 300);
    } else {
      typedTextElement.innerHTML = 'Hmm...looks like you did not select a person. Perhaps you should give it another try?';
    }
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', function() {
      typedTextElement.innerHTML = '';
      // Optionally clear selection
      radioPills.forEach(p => p.classList.remove('selected'));
      selectedValue = null;
    });
  }
}

