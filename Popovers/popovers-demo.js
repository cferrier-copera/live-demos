/**
 * Popover Demo with JavaScript Positioning
 * 
 * Uses JavaScript for positioning to ensure proper viewport handling,
 * especially with pinch zoom and viewport changes.
 * 
 * Positioning logic:
 * - Default: Right side of trigger, bottom-aligned
 * - Fallbacks: below, left, above, center-below, center-above
 * 
 * Includes Popover API polyfill for Safari and older browsers.
 */

window.addEventListener('DOMContentLoaded', function() {
    console.log('Popover Demo v2.1 - CSS Anchor Positioning');
    
    // Check if browser supports Popover API
    const supportsPopover = typeof HTMLElement.prototype.showPopover === 'function';
    
    // Polyfill for Popover API
    if (!supportsPopover) {
        HTMLElement.prototype.showPopover = function() {
            this.style.display = 'block';
            this.setAttribute('data-popover-open', '');
            // Ensure aria-live is set for screen readers
            if (!this.hasAttribute('aria-live')) {
                this.setAttribute('aria-live', 'polite');
            }
        };
        
        HTMLElement.prototype.hidePopover = function() {
            this.style.display = 'none';
            this.removeAttribute('data-popover-open');
        };
        
        // Add helper to check if popover is open
        Element.prototype.matches = (function(matches) {
            return function(selector) {
                if (selector === ':popover-open') {
                    return this.hasAttribute('data-popover-open');
                }
                return matches.call(this, selector);
            };
        })(Element.prototype.matches);
    }
    
    // Announce popover content to screen readers using a dedicated live region
    function announceOnHover(popover) {
        // Find the content span
        const contentSpan = popover.querySelector('[id$="-content"]');
        if (!contentSpan) return;
        
        // Get the live region
        const announcer = document.getElementById('hover-announcer');
        if (!announcer) return;
        
        // Clear first to ensure the announcement triggers even if same content
        announcer.textContent = '';
        
        // Announce the content after a brief delay
        setTimeout(function() {
            announcer.textContent = contentSpan.textContent;
        }, 100);
        
        // Clear the announcer after it's been read
        setTimeout(function() {
            announcer.textContent = '';
        }, 3000);
    }
    
    // JavaScript positioning temporarily disabled - using CSS anchor positioning
    function positionPopover(popover, anchor) {
        // CSS anchor positioning handles this
        return;
    }

    document.querySelectorAll('.tooltip-icon').forEach(function(icon) {
        const targetId = icon.getAttribute('popovertarget');
        const popover = document.getElementById(targetId);
        if (!popover) return;

        // Track how the popover was opened
        let openedByHover = false;

        // Show popover on hover
        icon.addEventListener('mouseenter', function() {
            openedByHover = true;
            icon.setAttribute('aria-expanded', 'true');
            popover.showPopover();
            // Use setTimeout to ensure popover is rendered before announcing
            setTimeout(function() {
                announceOnHover(popover);
            }, 50);
        });

        // Click handler to keep popover open if it was opened by hover
        icon.addEventListener('click', function(e) {
            // If popover is already open (from hover), keep it open by clearing the hover flag
            if (openedByHover && popover.matches(':popover-open, [data-popover-open]')) {
                openedByHover = false;
                e.preventDefault(); // Prevent toggling
                popover.showPopover(); // Ensure it stays open
            }
            // Otherwise, let the native popovertarget behavior handle it
        });

        // Listen for popover toggle events to track state
        popover.addEventListener('toggle', function(e) {
            if (e.newState === 'open') {
                icon.setAttribute('aria-expanded', 'true');
            } else if (e.newState === 'closed') {
                icon.setAttribute('aria-expanded', 'false');
                // Reset hover flag when popover closes
                openedByHover = false;
            }
        });

        // Hide popover on mouse out from icon only if opened by hover
        icon.addEventListener('mouseleave', function(e) {
            if (openedByHover && e.relatedTarget !== popover && !popover.contains(e.relatedTarget)) {
                icon.setAttribute('aria-expanded', 'false');
                popover.hidePopover();
            }
        });

        // Keep popover open when hovering over it
        popover.addEventListener('mouseenter', function() {
            if (openedByHover) {
                popover.showPopover();
            }
        });

        // Hide popover when mouse leaves the popover only if opened by hover
        popover.addEventListener('mouseleave', function() {
            if (openedByHover) {
                icon.setAttribute('aria-expanded', 'false');
                popover.hidePopover();
            }
        });

        // Close popover when focus leaves both trigger and popover
        function handleFocusOut(e) {
            setTimeout(function() {
                const activeElement = document.activeElement;
                const focusInIcon = icon === activeElement;
                const focusInPopover = popover.contains(activeElement);
                
                if (!focusInIcon && !focusInPopover) {
                    popover.hidePopover();
                }
            }, 0);
        }

        icon.addEventListener('blur', handleFocusOut);
        popover.addEventListener('focusout', handleFocusOut);
    });

    // Hide popover when clicking close button
    document.querySelectorAll('.popover-close').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            const popover = btn.closest('[popover]');
            if (popover) popover.hidePopover();
            e.stopPropagation();
        });
    });

    // Scroll/resize handlers disabled - CSS anchor positioning handles this automatically

    // For browsers without native popover, handle clicking outside to close
    if (!supportsPopover) {
        document.addEventListener('click', function(e) {
            const clickedPopover = e.target.closest('[popover]');
            const clickedTrigger = e.target.closest('.tooltip-icon');
            
            if (!clickedPopover && !clickedTrigger) {
                document.querySelectorAll('[popover][data-popover-open]').forEach(function(popover) {
                    popover.hidePopover();
                });
            }
        });
        
        // Handle Escape key to close popovers
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                document.querySelectorAll('[popover][data-popover-open]').forEach(function(popover) {
                    popover.hidePopover();
                });
            }
        });
    }
});


