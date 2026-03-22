import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// ScrollToTop: on route change scrolls the viewport so the page content is visible
// below a fixed header. It auto-detects header height and supports hash navigation.
const ScrollToTop = ({ offset = 0 }) => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const header = document.querySelector("header");
    const headerHeight = (header && header.offsetHeight) ? header.offsetHeight : 0;
    const totalOffset = Math.max(0, headerHeight - offset);

    // If navigating to an anchor/hash, try to scroll that element into view just below header
    if (hash) {
      const id = hash.replace('#', '');
      const el = document.getElementById(id) || document.querySelector(hash);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - totalOffset - 8;
        window.scrollTo({ top: Math.max(0, top), left: 0, behavior: 'smooth' });
        return;
      }
    }

    // Default: scroll to absolute top of the page so content starts at the top.
    // Hash/anchor navigation above handles offset for header; default route change goes to 0.
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      // Some browsers restore scroll after reload — enforce top again shortly after paint.
      // This prevents the page from jumping to a previously-restored position (e.g., a form section).
      setTimeout(() => {
        try { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }); } catch (_e) { window.scrollTo(0, 0); }
      }, 50);
    } catch (_e) {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash, offset]);

  return null;
};

export default ScrollToTop;
