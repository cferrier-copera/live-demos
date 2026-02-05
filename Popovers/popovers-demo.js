/**
 * Popover Demo with CSS Anchor Positioning
 * 
 * Uses CSS Anchor Positioning API for automatic popover placement.
 * Major browsers now support the Popover API natively.
 */

window.addEventListener('DOMContentLoaded', function() {
    console.log('Popover Demo v2.7 - Reorganized hover code with comments');
    
    // ========================================
    // UTILITY FUNCTIONS
    // ========================================
    
    /**
     * Announce popover content to screen readers using a dedicated live region
     * This is called when a popover opens via hover
     */
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

    // ========================================
    // POPOVER SETUP
    // ========================================
    
    document.querySelectorAll('.tooltip-icon').forEach(function(icon) {
        const targetId = icon.getAttribute('popovertarget');
        const popover = document.getElementById(targetId);
        if (!popover) return;

        // Track whether the popover was opened by hovering (vs clicking)
        let openedByHover = false;

        // ========================================
        // HOVER BEHAVIOR
        // ========================================
        
        /**
         * When user hovers over the trigger icon:
         * - Mark as opened by hover
         * - Set aria-expanded for accessibility
         * - Show the popover
         * - Announce content to screen readers
         */
        icon.addEventListener('mouseenter', function() {
            openedByHover = true;
            icon.setAttribute('aria-expanded', 'true');
            popover.showPopover();
            // Use setTimeout to ensure popover is rendered before announcing
            setTimeout(function() {
                announceOnHover(popover);
            }, 50);
        });

        /**
         * When mouse leaves the trigger icon:
         * - Only hide if it was opened by hover (not click)
         * - Don't hide if mouse moved to the popover itself
         */
        icon.addEventListener('mouseleave', function(e) {
            if (openedByHover && e.relatedTarget !== popover && !popover.contains(e.relatedTarget)) {
                icon.setAttribute('aria-expanded', 'false');
                popover.hidePopover();
            }
        });

        /**
         * When user hovers over the popover itself:
         * - Keep it open if it was opened by hover
         */
        popover.addEventListener('mouseenter', function() {
            if (openedByHover) {
                popover.showPopover();
            }
        });

        /**
         * When mouse leaves the popover:
         * - Hide it if it was opened by hover (not click)
         */
        popover.addEventListener('mouseleave', function() {
            if (openedByHover) {
                icon.setAttribute('aria-expanded', 'false');
                popover.hidePopover();
            }
        });

        // ========================================
        // CLICK BEHAVIOR
        // ========================================
        
        /**
         * When user clicks the trigger icon:
         * - If popover is already open from hover, convert to "sticky" (click-opened)
         * - Otherwise, let native popovertarget behavior handle it
         */
        icon.addEventListener('click', function(e) {
            // If popover is already open (from hover), keep it open by clearing the hover flag
            if (openedByHover && popover.matches(':popover-open')) {
                openedByHover = false;
                e.preventDefault(); // Prevent toggling
                popover.showPopover(); // Ensure it stays open
            }
            // Otherwise, let the native popovertarget behavior handle it
        });

        // ========================================
        // STATE MANAGEMENT
        // ========================================
        
        /**
         * Listen for popover toggle events to maintain aria-expanded state
         * and reset hover flag when popover closes
         */
        popover.addEventListener('toggle', function(e) {
            if (e.newState === 'open') {
                icon.setAttribute('aria-expanded', 'true');
            } else if (e.newState === 'closed') {
                icon.setAttribute('aria-expanded', 'false');
                // Reset hover flag when popover closes
                openedByHover = false;
            }
        });

        // ========================================
        // KEYBOARD/FOCUS BEHAVIOR
        // ========================================
        
        /**
         * Close popover when focus leaves both the trigger and the popover
         * This handles keyboard navigation and accessibility
         */
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

    // ========================================
    // CLOSE BUTTON HANDLER
    // ========================================
    
    /**
     * Handle clicks on the X close button within popovers
     */
    document.querySelectorAll('.popover-close').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            const popover = btn.closest('[popover]');
            if (popover) popover.hidePopover();
            e.stopPropagation();
        });
    });
});


