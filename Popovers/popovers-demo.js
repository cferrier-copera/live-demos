

window.addEventListener('DOMContentLoaded', function() {
    // Show/hide popover on trigger click
    document.querySelectorAll('.tooltip-icon').forEach(function(icon) {
        const targetId = icon.getAttribute('popovertarget');
        const popover = document.getElementById(targetId);
        if (!popover) return;
        icon.addEventListener('click', function(e) {
            e.preventDefault();
            // Hide all popovers first
            document.querySelectorAll('.popover').forEach(function(pop) {
                pop.style.display = 'none';
            });
            // Toggle this popover
            if (popover.style.display === 'none' || !popover.style.display) {
                // Use Anchor Positioning API if available
                if (popover.style.anchorName !== undefined && icon.id) {
                    popover.style.position = 'anchor';
                    popover.style.anchorName = icon.id;
                    // Position to the right and above the anchor
                    popover.style.inset = 'anchor(left) anchor(top)';
                    popover.style.display = 'block';
                } else {
                    // Fallback to manual positioning: right and above
                    const rect = icon.getBoundingClientRect();
                    popover.style.left = (rect.right + 8) + 'px';
                    popover.style.top = (rect.top + window.scrollY - popover.offsetHeight - 8) + 'px';
                    popover.style.display = 'block';
                }
            } else {
                popover.style.display = 'none';
            }
        });
    });

    // Hide popover when clicking close button
    document.querySelectorAll('.popover-close').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            const popover = btn.closest('.popover');
            if (popover) popover.style.display = 'none';
            e.stopPropagation();
        });
    });

    // Hide popover when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.classList.contains('tooltip-icon') && !e.target.classList.contains('popover-close')) {
            document.querySelectorAll('.popover').forEach(function(pop) {
                pop.style.display = 'none';
            });
        }
    });
});


