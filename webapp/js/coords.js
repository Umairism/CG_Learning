document.addEventListener('DOMContentLoaded', () => {
    const dragWindow = document.getElementById('drag-window');
    const worldSpace = document.getElementById('world-space');
    const vpObject = document.getElementById('vp-object');
    const coordCalc = document.getElementById('coord-calc');

    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    dragWindow.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        initialLeft = dragWindow.offsetLeft;
        initialTop = dragWindow.offsetTop;
        dragWindow.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        let dx = e.clientX - startX;
        let dy = e.clientY - startY;

        let newLeft = initialLeft + dx;
        let newTop = initialTop + dy;

        // Boundary checks
        if (newLeft < 0) newLeft = 0;
        if (newTop < 0) newTop = 0;
        if (newLeft + dragWindow.offsetWidth > worldSpace.offsetWidth) {
            newLeft = worldSpace.offsetWidth - dragWindow.offsetWidth;
        }
        if (newTop + dragWindow.offsetHeight > worldSpace.offsetHeight) {
            newTop = worldSpace.offsetHeight - dragWindow.offsetHeight;
        }

        dragWindow.style.left = newLeft + 'px';
        dragWindow.style.top = newTop + 'px';

        updateMapping(newLeft, newTop);
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        dragWindow.style.cursor = 'move';
    });

    function updateMapping(winX, winY) {
        // World object is at 150, 100
        const objX = 150;
        const objY = 100;
        
        // Window properties
        const xwmin = winX;
        const ywmin = winY;
        const xwmax = winX + 100;
        const ywmax = winY + 100;

        // Viewport properties (we are mapping to a 300x300 space)
        const xvmin = 0, yvmin = 0, xvmax = 300, yvmax = 300;

        // If object is inside window, map it. Else hide it or put it outside.
        // For simplicity, we just calculate the mapping directly.
        const sx = (xvmax - xvmin) / (xwmax - xwmin);
        const sy = (yvmax - yvmin) / (ywmax - ywmin);

        const mappedX = xvmin + (objX - xwmin) * sx;
        const mappedY = yvmin + (objY - ywmin) * sy;

        // Update the star on viewport
        vpObject.style.left = mappedX + 'px';
        vpObject.style.top = mappedY + 'px';

        // Update calculations text
        coordCalc.innerHTML = `
            Sx = (300-0)/100 = ${sx}<br>
            Sy = (300-0)/100 = ${sy}<br>
            Mapped X: ${mappedX.toFixed(2)}<br>
            Mapped Y: ${mappedY.toFixed(2)}
        `;
    }

    // Initial call
    updateMapping(50, 50);
});
