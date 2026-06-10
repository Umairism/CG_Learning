document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('poly-clip-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const btnLeft = document.getElementById('poly-clip-left');
    const btnRight = document.getElementById('poly-clip-right');
    const btnTop = document.getElementById('poly-clip-top');
    const btnBottom = document.getElementById('poly-clip-bottom');
    const btnReset = document.getElementById('poly-clip-reset');
    
    const logDiv = document.getElementById('poly-clip-log');

    const win = { xmin: 100, ymin: 100, xmax: 300, ymax: 300 };
    
    const initialPoly = [
        { x: 150, y: 50 },
        { x: 350, y: 150 },
        { x: 250, y: 350 },
        { x: 50,  y: 250 }
    ];

    let currentPoly = [...initialPoly];
    let clippingStarted = false;

    function toLogical(p) {
        return {
            x: Math.round((p.x - 200) / 10),
            y: Math.round((200 - p.y) / 10)
        };
    }

    function drawGrid() {
        ctx.strokeStyle = '#30363d';
        ctx.lineWidth = 1;
        
        for(let i=0; i<=40; i+=2) {
            ctx.beginPath(); ctx.moveTo(i*10, 0); ctx.lineTo(i*10, canvas.height); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, i*10); ctx.lineTo(canvas.width, i*10); ctx.stroke();
        }
        
        ctx.beginPath();
        ctx.strokeStyle = '#58a6ff';
        ctx.lineWidth = 2;
        ctx.moveTo(200, 0); ctx.lineTo(200, 400);
        ctx.moveTo(0, 200); ctx.lineTo(400, 200);
        ctx.stroke();
    }

    function drawScene(highlightEdge = null) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid();
        
        // Draw Window
        ctx.strokeStyle = '#58a6ff';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(win.xmin, win.ymin, win.xmax - win.xmin, win.ymax - win.ymin);
        ctx.setLineDash([]);
        
        // Highlight active edge
        if (highlightEdge) {
            ctx.strokeStyle = '#f85149';
            ctx.lineWidth = 4;
            ctx.beginPath();
            if(highlightEdge === 'left') { ctx.moveTo(win.xmin, 0); ctx.lineTo(win.xmin, canvas.height); }
            if(highlightEdge === 'right') { ctx.moveTo(win.xmax, 0); ctx.lineTo(win.xmax, canvas.height); }
            if(highlightEdge === 'top') { ctx.moveTo(0, win.ymin); ctx.lineTo(canvas.width, win.ymin); }
            if(highlightEdge === 'bottom') { ctx.moveTo(0, win.ymax); ctx.lineTo(canvas.width, win.ymax); }
            ctx.stroke();
        }

        // Draw Polygon
        if (currentPoly.length > 0) {
            ctx.fillStyle = 'rgba(63, 185, 80, 0.4)';
            ctx.strokeStyle = '#3fb950';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(currentPoly[0].x, currentPoly[0].y);
            for(let i=1; i<currentPoly.length; i++) {
                ctx.lineTo(currentPoly[i].x, currentPoly[i].y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // Draw vertices
            currentPoly.forEach(p => {
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw coordinate text
                const lp = toLogical(p);
                ctx.fillStyle = '#8b949e';
                ctx.font = '10px monospace';
                ctx.fillText(`(${lp.x},${lp.y})`, p.x + 8, p.y - 8);
            });
        }
    }

    function logAction(msg) {
        logDiv.innerHTML += `<div>${msg}</div>`;
        logDiv.scrollTop = logDiv.scrollHeight;
    }

    function clipPolygon(edge) {
        if(currentPoly.length === 0) return;
        
        let newPoly = [];
        for(let i=0; i<currentPoly.length; i++) {
            let k = (i+1) % currentPoly.length;
            let p1 = currentPoly[i];
            let p2 = currentPoly[k];
            
            let i1 = inside(p1, edge);
            let i2 = inside(p2, edge);
            
            if(i1 && i2) {
                // Inside -> Inside
                newPoly.push(p2);
                let l2 = toLogical(p2);
                logAction(`Inside &rarr; Inside: Added (${l2.x}, ${l2.y})`);
            } else if(i1 && !i2) {
                // Inside -> Outside
                let sect = intersect(p1, p2, edge);
                newPoly.push(sect);
                let ls = toLogical(sect);
                logAction(`Inside &rarr; Outside: Added Intersection (${ls.x}, ${ls.y})`);
            } else if(!i1 && !i2) {
                // Outside -> Outside
                logAction(`Outside &rarr; Outside: Added Nothing`);
            } else {
                // Outside -> Inside
                let sect = intersect(p1, p2, edge);
                newPoly.push(sect);
                newPoly.push(p2);
                let ls = toLogical(sect);
                let l2 = toLogical(p2);
                logAction(`Outside &rarr; Inside: Added Intersection (${ls.x}, ${ls.y}) and (${l2.x}, ${l2.y})`);
            }
        }
        
        clippingStarted = true;
        
        currentPoly = newPoly;
        drawScene(edge);
        logAction(`<strong>Finished clipping against ${edge} edge. Vertices: ${currentPoly.length}</strong><br>`);
    }

    function inside(p, edge) {
        if(edge === 'left') return p.x >= win.xmin;
        if(edge === 'right') return p.x <= win.xmax;
        if(edge === 'top') return p.y >= win.ymin;
        if(edge === 'bottom') return p.y <= win.ymax;
    }

    function intersect(p1, p2, edge) {
        let x, y;
        let m = (p2.y - p1.y) / (p2.x - p1.x);
        
        if(edge === 'left') {
            x = win.xmin;
            y = p1.y + (win.xmin - p1.x) * m;
        } else if(edge === 'right') {
            x = win.xmax;
            y = p1.y + (win.xmax - p1.x) * m;
        } else if(edge === 'top') { // Canvas y inverted
            y = win.ymin;
            x = p1.x + (win.ymin - p1.y) / m;
        } else if(edge === 'bottom') {
            y = win.ymax;
            x = p1.x + (win.ymax - p1.y) / m;
        }
        return {x, y};
    }

    btnLeft.addEventListener('click', () => { clipPolygon('left'); btnLeft.disabled = true; });
    btnRight.addEventListener('click', () => { clipPolygon('right'); btnRight.disabled = true; });
    btnTop.addEventListener('click', () => { clipPolygon('top'); btnTop.disabled = true; });
    btnBottom.addEventListener('click', () => { clipPolygon('bottom'); btnBottom.disabled = true; });

    btnReset.addEventListener('click', () => {
        currentPoly = initialPoly.map(p => ({...p})); // deep copy
        clippingStarted = false;
        btnLeft.disabled = false;
        btnRight.disabled = false;
        btnTop.disabled = false;
        btnBottom.disabled = false;
        logDiv.innerHTML = 'Initial polygon loaded. You can drag the vertices.<br>Waiting for edge clipping...<br><br>';
        drawScene();
    });

    let draggingPoint = null;
    
    canvas.addEventListener('mousedown', (e) => {
        if(clippingStarted) return;
        
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        for(let i=0; i<initialPoly.length; i++) {
            const p = initialPoly[i];
            const dx = mouseX - p.x;
            const dy = mouseY - p.y;
            if(dx*dx + dy*dy < 64) {
                draggingPoint = p;
                break;
            }
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        if(draggingPoint) {
            const rect = canvas.getBoundingClientRect();
            draggingPoint.x = e.clientX - rect.left;
            draggingPoint.y = e.clientY - rect.top;
            currentPoly = initialPoly.map(p => ({...p}));
            drawScene();
        }
    });

    canvas.addEventListener('mouseup', () => { draggingPoint = null; });
    canvas.addEventListener('mouseleave', () => { draggingPoint = null; });

    logDiv.innerHTML = 'Initial polygon loaded. You can drag the vertices.<br>Waiting for edge clipping...<br><br>';
    drawScene();
});
