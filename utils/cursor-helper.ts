/**
 * Helper to add a visual cursor indicator during Playwright tests
 * This makes it easier to see where the cursor is during test execution
 */

export async function addCursorTracking(page: any) {
  await page.addInitScript(() => {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initCursor);
    } else {
      initCursor();
    }

    function initCursor() {
      // Create custom cursor element with hand pointer
      const cursor = document.createElement('div');
      cursor.id = 'playwright-cursor';
      cursor.innerHTML = '👆';
      cursor.style.cssText = `
        position: fixed;
        font-size: 24px;
        pointer-events: none;
        z-index: 999999;
        transition: all 0.1s ease;
        display: none;
        transform: translate(-8px, -8px);
        filter: drop-shadow(0 0 3px rgba(0, 0, 0, 0.8));
      `;
      
      // Create input cursor indicator
      const inputCursor = document.createElement('div');
      inputCursor.id = 'playwright-input-cursor';
      inputCursor.style.cssText = `
        position: absolute;
        width: 2px;
        height: 20px;
        background: #007bff;
        pointer-events: none;
        z-index: 999999;
        display: none;
        animation: blink-cursor 1s infinite;
      `;
      
      // Add blinking animation
      const style = document.createElement('style');
      style.textContent = `
        @keyframes blink-cursor {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        @keyframes ripple-animation {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(3);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
      
      document.body.appendChild(cursor);
      document.body.appendChild(inputCursor);
      
      let focusedInput: HTMLElement | null = null;
      
      // Track mouse movement
      document.addEventListener('mousemove', (e: MouseEvent) => {
        cursor.style.display = 'block';
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
      });
      
      // Show cursor in focused input fields
      document.addEventListener('focusin', (e: Event) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          focusedInput = target;
          updateInputCursor();
        }
      });
      
      document.addEventListener('focusout', (e: Event) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          focusedInput = null;
          inputCursor.style.display = 'none';
        }
      });
      
      // Update cursor position when typing
      document.addEventListener('input', () => {
        if (focusedInput) {
          updateInputCursor();
        }
      });
      
      function updateInputCursor() {
        if (!focusedInput) return;
        
        const rect = focusedInput.getBoundingClientRect();
        const input = focusedInput as HTMLInputElement;
        
        // Show cursor at the end of the text
        inputCursor.style.display = 'block';
        inputCursor.style.left = (rect.left + 10 + (input.value.length * 8)) + 'px';
        inputCursor.style.top = (rect.top + (rect.height - 20) / 2) + 'px';
      }
      
      // Create ripple effect on click
      document.addEventListener('mousedown', (e: MouseEvent) => {
        // Scale up the hand pointer
        cursor.style.transform = 'translate(-8px, -8px) scale(1.3)';
        
        // Create ripple effect
        const ripple = document.createElement('div');
        ripple.style.cssText = `
          position: fixed;
          left: ${e.clientX}px;
          top: ${e.clientY}px;
          width: 20px;
          height: 20px;
          border: 3px solid #ff6b00;
          border-radius: 50%;
          background: rgba(255, 107, 0, 0.4);
          pointer-events: none;
          z-index: 999998;
          transform: translate(-50%, -50%);
          animation: ripple-animation 0.6s ease-out;
        `;
        
        document.body.appendChild(ripple);
        
        // Remove ripple after animation
        setTimeout(() => {
          ripple.remove();
        }, 600);
      });
      
      document.addEventListener('mouseup', () => {
        cursor.style.transform = 'translate(-8px, -8px) scale(1)';
      });
    }
  });
}
