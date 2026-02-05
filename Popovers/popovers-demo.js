

window.addEventListener('DOMContentLoaded', function() {
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
        });

        // Show popover on click (toggle behavior)
        icon.addEventListener('click', function(e) {
            e.preventDefault();
            openedByHover = false;
            if (popover.matches(':popover-open')) {
                popover.hidePopover();
            } else {
                popover.showPopover();
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
});


