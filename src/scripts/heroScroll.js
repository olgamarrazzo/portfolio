export function heroScroll() {
    const el = document.querySelector(".hero-text");
    if (!el) return;
  
    let lastScroll = 0;
  
    window.addEventListener("scroll", () => {
      lastScroll = window.scrollY;
    });
  
    function animate() {
      const y = lastScroll * -0.25;
      const opacity = Math.max(1 - lastScroll / 500, 0);
  
      el.style.transform = `translate3d(0, ${y}px, 0)`;
      el.style.opacity = opacity;
  
      requestAnimationFrame(animate);
    }
  
    animate();
  }