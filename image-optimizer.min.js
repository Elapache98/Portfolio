class ImageOptimizer{constructor(){this.observer=null,this.init()}init(){this.preloadCriticalImages(),this.setupLazyLoading(),this.setupProgressiveLoading(),this.addFadeInToExistingImages()}addFadeInToExistingImages(){document.querySelectorAll("img:not([data-src])").forEach(e=>{e.style.opacity="0",e.style.transition="opacity 0.6s ease",e.complete&&0!==e.naturalHeight?setTimeout(()=>{e.style.opacity="1",e.classList.add("loaded")},100):e.onload=()=>{setTimeout(()=>{e.style.opacity="1",e.classList.add("loaded")},50)}})}preloadCriticalImages(){["coverimage.png"].forEach(e=>{var t=document.createElement("link");t.rel="preload",t.as="image",t.href=e,document.head.appendChild(t)})}setupLazyLoading(){"IntersectionObserver"in window&&(this.observer=new IntersectionObserver(e=>{e.forEach(e=>{e.isIntersecting&&(this.loadImage(e.target),this.observer.unobserve(e.target))})},{rootMargin:"50px"}),document.querySelectorAll("img[data-src]").forEach(e=>{this.observer.observe(e)}))}loadImage(e){e.style.opacity="0",e.style.filter="blur(2px)",e.style.transition="opacity 0.6s ease, filter 0.6s ease";var t=new Image;t.onload=()=>{e.src=e.dataset.src,setTimeout(()=>{e.style.opacity="1",e.style.filter="none",e.classList.add("loaded")},50)},t.onerror=()=>{e.style.opacity="0.5",e.classList.add("error"),console.warn("Failed to load image:",e.dataset.src)},t.src=e.dataset.src}setupProgressiveLoading(){var e=document.createElement("style");e.textContent=`
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
    `,document.head.appendChild(e)}convertToLazyLoading(){document.querySelectorAll("img:not([data-src])").forEach(e=>{e.src&&!e.classList.contains("critical")&&(e.dataset.src=e.src,e.src='data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E',this.observer?.observe(e))})}}"loading"===document.readyState?document.addEventListener("DOMContentLoaded",()=>{new ImageOptimizer}):new ImageOptimizer;