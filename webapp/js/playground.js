document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('pg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const modeBtns = document.querySelectorAll('.pg-mode');
    const btnClear = document.getElementById('pg-clear');
    const instr = document.getElementById('pg-instructions');

    let mode = 'dda';
    const gridSize = 15;
    const cols = canvas.width / gridSize;
    const rows = canvas.height / gridSize;

    // Clipping Window Boundaries (fixed for clipping modes)
    const xMin = 10;
    const xMax = 30;
    const yMin = 5;
    const yMax = 20;

    let points = []; // stores clicked points
    let lines = [];  // stores generated lines/shapes to persist drawings
    let polyPoints = []; // current building polygon

    function drawGrid() {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.strokeStyle = '#30363d';
        ctx.lineWidth = 1;
        for(let i=0; i<=cols; i++) {
            ctx.beginPath(); ctx.moveTo(i*gridSize, 0); ctx.lineTo(i*gridSize, canvas.height); ctx.stroke();
        }
        for(let i=0; i<=rows; i++) {
            ctx.beginPath(); ctx.moveTo(0, i*gridSize); ctx.lineTo(canvas.width, i*gridSize); ctx.stroke();
        }
        
        // Draw Window if in clip mode
        if (mode === 'cs-clip' || mode === 'sh-clip') {
            ctx.strokeStyle = 'rgba(255,255,255,0.4)';
            ctx.lineWidth = 2;
            ctx.strokeRect(xMin*gridSize, yMin*gridSize, (xMax-xMin)*gridSize, (yMax-yMin)*gridSize);
        }
    }

    function plot(x, y, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x * gridSize + 1, y * gridSize + 1, gridSize - 2, gridSize - 2);
    }

    function renderAll() {
        drawGrid();

        // Render persisted lines
        lines.forEach(l => {
            if(l.type === 'dda' || l.type === 'bresenham' || l.type === 'clip-line') {
                l.pixels.forEach(p => plot(p.x, p.y, l.color));
            } else if (l.type === 'poly') {
                ctx.fillStyle = 'rgba(63, 185, 80, 0.5)';
                ctx.beginPath();
                if(l.vertices.length > 0) {
                    ctx.moveTo(l.vertices[0].x * gridSize + gridSize/2, l.vertices[0].y * gridSize + gridSize/2);
                    for(let i=1; i<l.vertices.length; i++) {
                        ctx.lineTo(l.vertices[i].x * gridSize + gridSize/2, l.vertices[i].y * gridSize + gridSize/2);
                    }
                    ctx.closePath();
                    ctx.fill();
                    ctx.strokeStyle = '#3fb950';
                    ctx.stroke();
                }
            }
        });

        // Draw current points
        points.forEach(p => {
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(p.x * gridSize + gridSize/2, p.y * gridSize + gridSize/2, 4, 0, Math.PI*2);
            ctx.fill();
        });

        // Draw current building polygon
        if (mode === 'sh-clip' && polyPoints.length > 0) {
            ctx.strokeStyle = '#58a6ff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(polyPoints[0].x * gridSize + gridSize/2, polyPoints[0].y * gridSize + gridSize/2);
            for(let i=1; i<polyPoints.length; i++) {
                ctx.lineTo(polyPoints[i].x * gridSize + gridSize/2, polyPoints[i].y * gridSize + gridSize/2);
            }
            ctx.stroke();
            
            polyPoints.forEach(p => {
                ctx.fillStyle = '#58a6ff';
                ctx.beginPath();
                ctx.arc(p.x * gridSize + gridSize/2, p.y * gridSize + gridSize/2, 4, 0, Math.PI*2);
                ctx.fill();
            });
        }
    }

    // --- ALGORITHMS ---
    function getDDAPixels(x1, y1, x2, y2) {
        let pixels = [];
        let dx = x2 - x1; let dy = y2 - y1;
        let steps = Math.max(Math.abs(dx), Math.abs(dy));
        if(steps===0){ pixels.push({x:x1, y:y1}); return pixels; }
        let xInc = dx / steps; let yInc = dy / steps;
        let x = x1; let y = y1;
        for(let i=0; i<=steps; i++){
            pixels.push({x: Math.round(x), y: Math.round(y)});
            x+=xInc; y+=yInc;
        }
        return pixels;
    }

    function getBresenhamPixels(x1, y1, x2, y2) {
        let pixels = [];
        let dx = Math.abs(x2 - x1); let dy = Math.abs(y2 - y1);
        let sx = x1 < x2 ? 1 : -1; let sy = y1 < y2 ? 1 : -1;
        let err = dx - dy;
        
        while(true) {
            pixels.push({x: x1, y: y1});
            if (x1 === x2 && y1 === y2) break;
            let e2 = 2 * err;
            if (e2 > -dy) { err -= dy; x1 += sx; }
            if (e2 < dx) { err += dx; y1 += sy; }
        }
        return pixels;
    }

    // Trivial clipping returning start and end
    function cohenSutherland(x1, y1, x2, y2) {
        const INSIDE = 0, LEFT = 1, RIGHT = 2, BOTTOM = 4, TOP = 8;
        function computeOutcode(x, y) {
            let code = INSIDE;
            if (x < xMin) code |= LEFT;
            else if (x > xMax) code |= RIGHT;
            if (y < yMin) code |= TOP;
            else if (y > yMax) code |= BOTTOM;
            return code;
        }

        let out1 = computeOutcode(x1, y1);
        let out2 = computeOutcode(x2, y2);
        let accept = false;

        while (true) {
            if (!(out1 | out2)) { accept = true; break; } // Trivial accept
            else if (out1 & out2) { break; } // Trivial reject
            else {
                let x, y;
                let outOut = out1 ? out1 : out2;
                if (outOut & TOP) { x = x1 + (x2 - x1) * (yMin - y1) / (y2 - y1); y = yMin; }
                else if (outOut & BOTTOM) { x = x1 + (x2 - x1) * (yMax - y1) / (y2 - y1); y = yMax; }
                else if (outOut & RIGHT) { y = y1 + (y2 - y1) * (xMax - x1) / (x2 - x1); x = xMax; }
                else if (outOut & LEFT) { y = y1 + (y2 - y1) * (xMin - x1) / (x2 - x1); x = xMin; }

                if (outOut === out1) { x1 = x; y1 = y; out1 = computeOutcode(x1, y1); }
                else { x2 = x; y2 = y; out2 = computeOutcode(x2, y2); }
            }
        }
        if(accept) return {x1:Math.round(x1), y1:Math.round(y1), x2:Math.round(x2), y2:Math.round(y2)};
        return null;
    }

    // Sutherland Hodgman Poly Clip
    function clipPoly(poly) {
        let clipped = [...poly];
        const clipEdge = (pts, edgeFunc) => {
            let newPts = [];
            for(let i=0; i<pts.length; i++) {
                let curr = pts[i];
                let prev = pts[(i === 0) ? pts.length - 1 : i - 1];
                let currIn = edgeFunc.isInside(curr);
                let prevIn = edgeFunc.isInside(prev);
                
                if (currIn) {
                    if (!prevIn) newPts.push(edgeFunc.intersect(prev, curr));
                    newPts.push(curr);
                } else if (prevIn) {
                    newPts.push(edgeFunc.intersect(prev, curr));
                }
            }
            return newPts;
        };

        const edges = [
            { // Left
                isInside: p => p.x >= xMin,
                intersect: (p1, p2) => ({ x: xMin, y: p1.y + (p2.y - p1.y) * (xMin - p1.x) / (p2.x - p1.x) })
            },
            { // Right
                isInside: p => p.x <= xMax,
                intersect: (p1, p2) => ({ x: xMax, y: p1.y + (p2.y - p1.y) * (xMax - p1.x) / (p2.x - p1.x) })
            },
            { // Top (yMin)
                isInside: p => p.y >= yMin,
                intersect: (p1, p2) => ({ x: p1.x + (p2.x - p1.x) * (yMin - p1.y) / (p2.y - p1.y), y: yMin })
            },
            { // Bottom (yMax)
                isInside: p => p.y <= yMax,
                intersect: (p1, p2) => ({ x: p1.x + (p2.x - p1.x) * (yMax - p1.y) / (p2.y - p1.y), y: yMax })
            }
        ];

        edges.forEach(edge => {
            if(clipped.length > 0) clipped = clipEdge(clipped, edge);
        });

        return clipped.map(p => ({x: Math.round(p.x), y: Math.round(p.y)}));
    }

    // --- EVENTS ---

    canvas.addEventListener('contextmenu', e => {
        // Right click finishes polygon (fallback for desktop)
        e.preventDefault();
        finishPolygon();
    });

    const btnFinishPoly = document.getElementById('pg-finish-poly');
    if(btnFinishPoly) {
        btnFinishPoly.addEventListener('click', finishPolygon);
    }

    function finishPolygon() {
        if (mode === 'sh-clip' && polyPoints.length > 2) {
            let clipped = clipPoly(polyPoints);
            lines.push({type: 'poly', vertices: clipped});
            polyPoints = [];
            renderAll();
        }
    }

    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / gridSize);
        const y = Math.floor((e.clientY - rect.top) / gridSize);

        if (mode === 'sh-clip') {
            polyPoints.push({x, y});
            renderAll();
            return;
        }

        points.push({x, y});
        
        if (points.length === 2) {
            let p1 = points[0]; let p2 = points[1];
            
            if (mode === 'dda') {
                lines.push({type: 'dda', pixels: getDDAPixels(p1.x, p1.y, p2.x, p2.y), color: '#f85149'});
            } else if (mode === 'bresenham') {
                lines.push({type: 'bresenham', pixels: getBresenhamPixels(p1.x, p1.y, p2.x, p2.y), color: '#3fb950'});
            } else if (mode === 'cs-clip') {
                let res = cohenSutherland(p1.x, p1.y, p2.x, p2.y);
                if(res) {
                    lines.push({type: 'clip-line', pixels: getBresenhamPixels(res.x1, res.y1, res.x2, res.y2), color: '#58a6ff'});
                }
                // show unclipped faint line
                lines.push({type: 'clip-line', pixels: getBresenhamPixels(p1.x, p1.y, p2.x, p2.y), color: 'rgba(255,255,255,0.2)'});
            }
            
            points = [];
        }
        renderAll();
    });

    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            mode = btn.getAttribute('data-mode');
            points = [];
            polyPoints = [];
            
            if(btnFinishPoly) {
                btnFinishPoly.style.display = mode === 'sh-clip' ? 'inline-block' : 'none';
            }

            if(mode === 'dda') instr.textContent = "Click two points on the grid to draw a line using DDA.";
            if(mode === 'bresenham') instr.textContent = "Click two points on the grid to draw a line using Bresenham.";
            if(mode === 'cs-clip') instr.textContent = "Click two points to draw a line. It will be clipped against the window.";
            if(mode === 'sh-clip') instr.textContent = "Click multiple points to define a polygon. Click 'Finish Polygon' to clip it.";
            
            renderAll();
        });
    });

    btnClear.addEventListener('click', () => {
        lines = [];
        points = [];
        polyPoints = [];
        renderAll();
    });

    renderAll();
});
