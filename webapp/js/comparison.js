document.addEventListener('DOMContentLoaded', () => {
    const btnRun = document.getElementById('cmp-run');
    if(!btnRun) return;

    const inX1 = document.getElementById('cmp-x1');
    const inY1 = document.getElementById('cmp-y1');
    const inX2 = document.getElementById('cmp-x2');
    const inY2 = document.getElementById('cmp-y2');

    const cDDA = document.getElementById('cmp-dda-canvas');
    const cBres = document.getElementById('cmp-bres-canvas');
    const ctxDDA = cDDA.getContext('2d');
    const ctxBres = cBres.getContext('2d');

    let gridSize = 15;
    let cols = cDDA.width / gridSize;
    let rows = cDDA.height / gridSize;

    function drawGrid(ctx, canvas) {
        ctx.clearRect(0,0,canvas.width, canvas.height);
        ctx.strokeStyle = '#30363d';
        ctx.lineWidth = 1;
        
        let requiredRange = cols / 2;
        let lineInterval = 1;
        if (requiredRange > 30) lineInterval = 5;
        else if (requiredRange > 15) lineInterval = 2;

        for(let i=0; i<=cols; i+=lineInterval) {
            ctx.beginPath(); ctx.moveTo(i*gridSize, 0); ctx.lineTo(i*gridSize, canvas.height); ctx.stroke();
        }
        for(let i=0; i<=rows; i+=lineInterval) {
            ctx.beginPath(); ctx.moveTo(0, i*gridSize); ctx.lineTo(canvas.width, i*gridSize); ctx.stroke();
        }
        
        const centerX = cols / 2;
        const centerY = rows / 2;
        
        ctx.beginPath();
        ctx.strokeStyle = '#58a6ff';
        ctx.lineWidth = 2;
        ctx.moveTo(centerX * gridSize, 0);
        ctx.lineTo(centerX * gridSize, canvas.height);
        ctx.moveTo(0, centerY * gridSize);
        ctx.lineTo(canvas.width, centerY * gridSize);
        ctx.stroke();
    }

    function drawIdealLine(ctx, x1, y1, x2, y2) {
        const centerX = cols / 2;
        const centerY = rows / 2;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo((centerX + x1) * gridSize + gridSize/2, (centerY - y1) * gridSize + gridSize/2);
        ctx.lineTo((centerX + x2) * gridSize + gridSize/2, (centerY - y2) * gridSize + gridSize/2);
        ctx.stroke();
    }

    function plot(ctx, x, y, color) {
        const centerX = cols / 2;
        const centerY = rows / 2;
        ctx.fillStyle = color;
        const drawX = centerX + x;
        const drawY = centerY - y;
        
        const pxX = Math.floor(drawX * gridSize) + 1;
        const pxY = Math.floor(drawY * gridSize) + 1;
        const pxSize = Math.max(1, Math.ceil(gridSize) - 1);
        
        ctx.fillRect(pxX, pxY, pxSize, pxSize);
    }

    async function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    btnRun.addEventListener('click', async () => {
        let x1 = parseInt(inX1.value); let y1 = parseInt(inY1.value);
        let x2 = parseInt(inX2.value); let y2 = parseInt(inY2.value);

        const maxCoord = Math.max(Math.abs(x1), Math.abs(y1), Math.abs(x2), Math.abs(y2));
        const requiredRange = Math.max(10, Math.ceil(maxCoord) + 1);
        cols = rows = 2 * requiredRange;
        gridSize = cDDA.width / cols;

        drawGrid(ctxDDA, cDDA);
        drawGrid(ctxBres, cBres);
        drawIdealLine(ctxDDA, x1, y1, x2, y2);
        drawIdealLine(ctxBres, x1, y1, x2, y2);

        // Run DDA
        let ddx = x2 - x1;
        let ddy = y2 - y1;
        let steps = Math.max(Math.abs(ddx), Math.abs(ddy));
        let xInc = ddx / steps;
        let yInc = ddy / steps;
        
        let curXd = x1; let curYd = y1;

        // Run Bresenham
        let bdx = Math.abs(x2 - x1);
        let bdy = Math.abs(y2 - y1);
        let p = 2 * bdy - bdx;
        let curXb = x1; let curYb = y1;
        let stepX = x1 < x2 ? 1 : -1;
        let stepY = y1 < y2 ? 1 : -1;

        for(let i=0; i<=steps; i++) {
            // Plot DDA
            plot(ctxDDA, Math.floor(curXd), Math.floor(curYd), '#f85149');
            curXd += xInc;
            curYd += yInc;

            // Plot Bresenham (if within bounds, bres steps = bdx usually)
            if (i <= bdx) {
                plot(ctxBres, curXb, curYb, '#3fb950');
                if (i < bdx) {
                    if (p < 0) {
                        curXb += stepX;
                        p += 2 * bdy;
                    } else {
                        curXb += stepX;
                        curYb += stepY;
                        p += 2 * bdy - 2 * bdx;
                    }
                }
            }

            await sleep(100); // simultaneous animation
        }
    });

    // initial draw
    drawGrid(ctxDDA, cDDA);
    drawGrid(ctxBres, cBres);
});
