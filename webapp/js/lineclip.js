document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('line-clip-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const p1Drag = document.getElementById('p1-drag');
    const p2Drag = document.getElementById('p2-drag');
    
    const stepBtn = document.getElementById('line-clip-step');
    const resetBtn = document.getElementById('line-clip-reset');
    
    const varsDiv = document.getElementById('line-clip-vars');
    const statusDiv = document.getElementById('line-clip-status');

    // Clipping Window (xmin, ymin, xmax, ymax)
    const win = { xmin: 100, ymin: 100, xmax: 300, ymax: 300 };

    // Outcode bits
    const INSIDE = 0; // 0000
    const LEFT   = 1; // 0001
    const RIGHT  = 2; // 0010
    const BOTTOM = 4; // 0100
    const TOP    = 8; // 1000

    let p1 = { x: 50, y: 50 };
    let p2 = { x: 350, y: 250 };
    
    let currentStep = 0; // 0: Start, 1: Outcodes, 2: Action
    
    function computeOutcode(x, y) {
        let code = INSIDE;
        if (x < win.xmin) code |= LEFT;
        else if (x > win.xmax) code |= RIGHT;
        if (y < win.ymin) code |= TOP; // Y is inverted in canvas, top is 0, so y < ymin is top
        else if (y > win.ymax) code |= BOTTOM;
        return code;
    }
    
    function toBinaryStr(code) {
        return code.toString(2).padStart(4, '0');
    }

    function drawScene() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw window
        ctx.strokeStyle = '#58a6ff';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(win.xmin, win.ymin, win.xmax - win.xmin, win.ymax - win.ymin);
        ctx.setLineDash([]);
        
        // Draw line
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = '#e6edf3';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Position draggables
        p1Drag.style.left = p1.x + 'px';
        p1Drag.style.top = p1.y + 'px';
        p2Drag.style.left = p2.x + 'px';
        p2Drag.style.top = p2.y + 'px';
    }

    // Dragging Logic
    let draggingPoint = null;

    function handleMouseDown(e, pointObj) {
        if(currentStep > 0) return; // Don't allow drag during step simulation
        draggingPoint = pointObj;
    }

    p1Drag.addEventListener('mousedown', (e) => handleMouseDown(e, p1));
    p2Drag.addEventListener('mousedown', (e) => handleMouseDown(e, p2));

    document.addEventListener('mousemove', (e) => {
        if (!draggingPoint) return;
        const rect = canvas.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        
        // Bound to canvas
        x = Math.max(0, Math.min(x, canvas.width));
        y = Math.max(0, Math.min(y, canvas.height));
        
        draggingPoint.x = x;
        draggingPoint.y = y;
        drawScene();
    });

    document.addEventListener('mouseup', () => {
        draggingPoint = null;
    });

    // Step logic
    stepBtn.addEventListener('click', () => {
        const outcode1 = computeOutcode(p1.x, p1.y);
        const outcode2 = computeOutcode(p2.x, p2.y);
        
        if (currentStep === 0) {
            varsDiv.innerHTML = `
                P1 (${Math.round(p1.x)}, ${Math.round(p1.y)}) Outcode: <strong>${toBinaryStr(outcode1)}</strong><br>
                P2 (${Math.round(p2.x)}, ${Math.round(p2.y)}) Outcode: <strong>${toBinaryStr(outcode2)}</strong>
            `;
            stepBtn.textContent = 'Step 2: Accept, Reject, or Clip?';
            currentStep = 1;
            statusDiv.innerHTML = 'Status: Outcodes computed. Ready for decision.';
            statusDiv.style.backgroundColor = 'var(--surface-color)';
        } 
        else if (currentStep === 1) {
            let accept = false;
            
            if ((outcode1 | outcode2) === 0) {
                statusDiv.innerHTML = 'Status: Trivially Accepted (Both inside)';
                statusDiv.style.backgroundColor = 'rgba(63, 185, 80, 0.2)';
                accept = true;
                stepBtn.disabled = true;
            } else if ((outcode1 & outcode2) !== 0) {
                statusDiv.innerHTML = 'Status: Trivially Rejected (Both share an outside zone)';
                statusDiv.style.backgroundColor = 'rgba(248, 81, 73, 0.2)';
                stepBtn.disabled = true;
            } else {
                statusDiv.innerHTML = 'Status: Needs Clipping. Computing intersection...';
                statusDiv.style.backgroundColor = 'rgba(210, 153, 34, 0.2)';
                
                // Simulate one clip step
                let codeOut = outcode1 !== 0 ? outcode1 : outcode2;
                let x, y;
                
                if (codeOut & TOP) {
                    x = p1.x + (p2.x - p1.x) * (win.ymin - p1.y) / (p2.y - p1.y);
                    y = win.ymin;
                } else if (codeOut & BOTTOM) {
                    x = p1.x + (p2.x - p1.x) * (win.ymax - p1.y) / (p2.y - p1.y);
                    y = win.ymax;
                } else if (codeOut & RIGHT) {
                    y = p1.y + (p2.y - p1.y) * (win.xmax - p1.x) / (p2.x - p1.x);
                    x = win.xmax;
                } else if (codeOut & LEFT) {
                    y = p1.y + (p2.y - p1.y) * (win.xmin - p1.x) / (p2.x - p1.x);
                    x = win.xmin;
                }
                
                if (codeOut === outcode1) {
                    p1.x = x; p1.y = y;
                } else {
                    p2.x = x; p2.y = y;
                }
                
                drawScene();
                stepBtn.textContent = 'Step 1: Recompute Outcodes';
                currentStep = 0;
            }
        }
    });

    resetBtn.addEventListener('click', () => {
        p1 = { x: 50, y: 50 };
        p2 = { x: 350, y: 250 };
        currentStep = 0;
        stepBtn.textContent = 'Step 1: Compute Outcodes';
        stepBtn.disabled = false;
        varsDiv.innerHTML = 'Drag points to begin.<br>P1 Outcode: -<br>P2 Outcode: -';
        statusDiv.innerHTML = 'Status: Waiting...';
        statusDiv.style.backgroundColor = 'var(--surface-color)';
        drawScene();
    });

    drawScene();
});
