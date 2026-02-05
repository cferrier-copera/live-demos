/**
 * Popover Demo with CSS Anchor Positioning
 * 
 * Uses CSS Anchor Positioning API for automatic popover placement.
 * Major browsers now support the Popover API natively.
 */

window.addEventListener('DOMContentLoaded', function() {
    console.log('Popover Demo v2.2 - CSS Anchor Positioning');
    
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
            if (openedByHover && popover.matches(':popover-open')) {
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
});


