/**
 * WorkSync Security Module
 * Implements client-side deterrents against inspection and tampering.
 * NOTE: Real security is enforced server-side via JWT + RBAC.
 */

const BLUR_ON_DEVTOOLS = true;

function applySecurityMeasures() {
  // 1. Disable right-click context menu
  document.addEventListener('contextmenu', (e) => e.preventDefault());

  // 2. Block common DevTools keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    const blocked =
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && ['I', 'J', 'C', 'K'].includes(e.key)) ||
      (e.ctrlKey && e.key === 'U') ||
      (e.metaKey && e.altKey && ['I', 'J', 'C'].includes(e.key)); // Mac
    if (blocked) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  });

  // 3. Clear the console periodically and print a warning
  const consoleWarning = () => {
    console.clear();
    console.log(
      '%c⚠ STOP!',
      'color: red; font-size: 40px; font-weight: bold;'
    );
    console.log(
      '%cThis is a browser feature intended for developers. Using this console may expose your account to security threats.\nIf someone told you to paste something here, it is a scam.',
      'color: #333; font-size: 14px;'
    );
  };
  setInterval(consoleWarning, 3000);
  consoleWarning();

  // 4. Detect DevTools open via window size deviation and blur the app
  if (BLUR_ON_DEVTOOLS) {
    const threshold = 160;
    const checkDevTools = () => {
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      const isOpen = widthDiff > threshold || heightDiff > threshold;
      const root = document.getElementById('root');
      if (root) {
        root.style.filter = isOpen ? 'blur(8px)' : '';
        root.style.userSelect = isOpen ? 'none' : '';
        root.style.pointerEvents = isOpen ? 'none' : '';
      }
      // Overlay warning
      let overlay = document.getElementById('devtools-overlay');
      if (isOpen) {
        if (!overlay) {
          overlay = document.createElement('div');
          overlay.id = 'devtools-overlay';
          overlay.style.cssText = `
            position: fixed; inset: 0; z-index: 999999;
            background: rgba(0,0,0,0.85);
            display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            color: white; font-family: sans-serif;
            text-align: center; padding: 2rem;
          `;
          overlay.innerHTML = `
            <div style="font-size:3rem; margin-bottom:1rem;">🔒</div>
            <h2 style="font-size:1.5rem; font-weight:bold; margin-bottom:0.5rem;">Access Restricted</h2>
            <p style="color:#aaa; font-size:0.9rem; max-width:380px;">Developer tools are not permitted in this application.<br/>Please close DevTools to continue.</p>
          `;
          document.body.appendChild(overlay);
        }
      } else {
        overlay?.remove();
      }
    };
    setInterval(checkDevTools, 500);
  }

  // 5. Disable text selection on sensitive UI (optional UX hardening)
  document.addEventListener('selectstart', (e) => {
    const target = e.target as HTMLElement;
    // Allow selection inside inputs/textareas
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
    e.preventDefault();
  });
}

export { applySecurityMeasures };
