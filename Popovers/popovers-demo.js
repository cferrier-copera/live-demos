/**
 * Popover Demo with CSS Anchor Positioning
 * 
 * This demo uses CSS Anchor Positioning API (Chrome 125+) with JavaScript fallback
 * for Safari and other browsers that don't support anchor positioning yet.
 * 
 * The JS fallback implements the same positioning logic:
 * - Default: Right side of trigger, bottom-aligned
 * - Fallbacks: below, left, above, center-below, center-above
 * 
 * Also includes Popover API polyfill for Safari and older browsers.
 */

window.addEventListener('DOMContentLoaded', function() {
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
    
    // Check if CSS Anchor Positioning is supported
    const supportsAnchorPositioning = false; // Force JS positioning for better viewport handling
    
    // Add class to disable CSS anchor positioning
    document.documentElement.classList.add('js-positioning');
    
    // Function to position popover with JavaScript fallback
    function positionPopover(popover, anchor) {
        if (supportsAnchorPositioning) return; // Let CSS handle it
        
        const anchorRect = anchor.getBoundingClientRect();
        const popoverRect = popover.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const scrollY = window.scrollY;
        const scrollX = window.scrollX;
        
        // Gap between anchor and popover
        const gap = 0;
        
        // Try positions in order of preference
        const positions = [
            // Default: Right side, bottom aligned
            {
                left: anchorRect.right + gap,
                top: anchorRect.bottom - popoverRect.height,
                name: 'right'
            },
            // Fallback 1: Below, left aligned
            {
                left: anchorRect.left,
                top: anchorRect.bottom + gap,
                name: 'below'
            },
            // Fallback 2: Left side, bottom aligned
            {
                left: anchorRect.left - popoverRect.width - gap,
                top: anchorRect.bottom - popoverRect.height,
                name: 'left'
            },
            // Fallback 3: Above, left aligned
            {
                left: anchorRect.left,
                top: anchorRect.top - popoverRect.height - gap,
                name: 'above'
            },
            // Fallback 4: Center below
            {
                left: anchorRect.left + (anchorRect.width / 2) - (popoverRect.width / 2),
                top: anchorRect.bottom + gap,
                name: 'center-below'
            },
            // Fallback 5: Center above
            {
                left: anchorRect.left + (anchorRect.width / 2) - (popoverRect.width / 2),
                top: anchorRect.top - popoverRect.height - gap,
                name: 'center-above'
            }
        ];
        
        // Find the first position that fits in viewport
        const margin = 8;
        let chosenPosition = positions[0];
        for (let pos of positions) {
            const fitsHorizontally = pos.left >= margin && (pos.left + popoverRect.width) <= (viewportWidth - margin);
            const fitsVertically = pos.top >= margin && (pos.top + popoverRect.height) <= (viewportHeight - margin);
            
            if (fitsHorizontally && fitsVertically) {
                chosenPosition = pos;
                break;
            }
        }
        
        // Constrain to viewport bounds
        let finalLeft = Math.max(margin, Math.min(chosenPosition.left, viewportWidth - popoverRect.width - margin));
        let finalTop = Math.max(margin, Math.min(chosenPosition.top, viewportHeight - popoverRect.height - margin));
        
        // Apply position (convert to fixed positioning relative to viewport)
        popover.style.position = 'fixed';
        popover.style.left = finalLeft + 'px';
        popover.style.top = finalTop + 'px';
        popover.style.right = 'auto';
        popover.style.bottom = 'auto';
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
            popover.showPopover();
            // Use setTimeout to ensure popover is rendered before positioning
            setTimeout(function() {
                positionPopover(popover, icon);
            }, 0);
        });

        // Show popover on click (toggle behavior)
        icon.addEventListener('click', function(e) {
            e.preventDefault();
            openedByHover = false;
            if (popover.matches(':popover-open')) {
                popover.hidePopover();
            } else {
                popover.showPopover();
                // Use setTimeout to ensure popover is rendered before positioning
                setTimeout(function() {
                    positionPopover(popover, icon);
                }, 0);
            }
        });

        // Hide popover on mouse out from icon only if opened by hover
        icon.addEventListener('mouseleave', function(e) {
            if (openedByHover && e.relatedTarget !== popover && !popover.contains(e.relatedTarget)) {
                popover.hidePopover();
            }
        });

        // Keep popover open when hovering over it
        popover.addEventListener('mouseenter', function() {
            if (openedByHover) {
                popover.showPopover();
                // Reposition in case it moved
                setTimeout(function() {
                    positionPopover(popover, icon);
                }, 0);
            }
        });

        // Hide popover when mouse leaves the popover only if opened by hover
        popover.addEventListener('mouseleave', function() {
            if (openedByHover) {
                popover.hidePopover();
            }
        });

        // Reset flag when popover closes
        popover.addEventListener('toggle', function(e) {
            if (e.newState === 'closed') {
                openedByHover = false;
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

    // For browsers without anchor positioning, update position on scroll/resize
    if (!supportsAnchorPositioning) {
        let repositionTimer;
        function handleRepositioning() {
            clearTimeout(repositionTimer);
            repositionTimer = setTimeout(function() {
                document.querySelectorAll('[popover]:popover-open, [popover][data-popover-open]').forEach(function(popover) {
                    const anchorId = popover.id.replace('-tip', '-anchor');
                    const anchor = document.getElementById(anchorId);
                    if (anchor) {
                        positionPopover(popover, anchor);
                    }
                });
            }, 16); // ~60fps
        }
        
        window.addEventListener('scroll', handleRepositioning, { passive: true });
        window.addEventListener('resize', handleRepositioning);
    }

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


