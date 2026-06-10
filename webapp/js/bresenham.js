document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('bres-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Grid settings
    let gridSize = 20;
    let cols = canvas.width / gridSize;
    let rows = canvas.height / gridSize;

    // UI Elements
    const x1Input = document.getElementById('bres-x1');
    const y1Input = document.getElementById('bres-y1');
    const x2Input = document.getElementById('bres-x2');
    const y2Input = document.getElementById('bres-y2');
    
    const initBtn = document.getElementById('bres-init');
    const prevBtn = document.getElementById('bres-prev');
    const nextBtn = document.getElementById('bres-next');
    const playBtn = document.getElementById('bres-play');
    const pauseBtn = document.getElementById('bres-pause');
    const resetBtn = document.getElementById('bres-reset');
    
    const varsDiv = document.getElementById('bres-vars');
    const tableBody = document.querySelector('#bres-table tbody');

    // State
    let bresSteps = [];
    let currentStepIndex = 0;
    let playInterval = null;

    function drawGrid() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#30363d';
        ctx.lineWidth = 1;
        
        let requiredRange = cols / 2;
        let lineInterval = 1;
        let tickInterval = 5;
        
        if (requiredRange > 30) {
            lineInterval = 5;
            tickInterval = 10;
        } else if (requiredRange > 15) {
            lineInterval = 2;
            tickInterval = 10;
        }
        
        for(let i=0; i<=cols; i+=lineInterval) {
            ctx.beginPath();
            ctx.moveTo(i*gridSize, 0);
            ctx.lineTo(i*gridSize, canvas.height);
            ctx.stroke();
        }
        for(let j=0; j<=rows; j+=lineInterval) {
            ctx.beginPath();
            ctx.moveTo(0, j*gridSize);
            ctx.lineTo(canvas.width, j*gridSize);
            ctx.stroke();
        }
        
        const centerX = cols / 2;
        const centerY = rows / 2;
        
        ctx.beginPath();
        ctx.strokeStyle = '#d29922';
        ctx.lineWidth = 2;
        ctx.moveTo(centerX * gridSize, 0);
        ctx.lineTo(centerX * gridSize, canvas.height);
        ctx.moveTo(0, centerY * gridSize);
        ctx.lineTo(canvas.width, centerY * gridSize);
        ctx.stroke();

        ctx.fillStyle = '#8b949e';
        ctx.font = '10px monospace';
        for(let i=0; i<=cols; i+=tickInterval) {
            const logicalX = i - centerX;
            ctx.fillText(logicalX, i*gridSize + 2, centerY * gridSize - 2);
        }
        for(let j=0; j<=rows; j+=tickInterval) {
            const logicalY = centerY - j;
            if(logicalY !== 0) ctx.fillText(logicalY, centerX * gridSize + 2, j*gridSize - 2);
        }
    }

    function plotPixel(x, y, color = '#d29922') {
        ctx.fillStyle = color;
        const centerX = cols / 2;
        const centerY = rows / 2;
        const drawX = centerX + x;
        const drawY = centerY - y;
        
        const pxX = Math.floor(drawX * gridSize) + 1;
        const pxY = Math.floor(drawY * gridSize) + 1;
        const pxSize = Math.max(1, Math.ceil(gridSize) - 1);
        
        ctx.fillRect(pxX, pxY, pxSize, pxSize);
    }

    function calculateBresenham() {
        let x1 = parseInt(x1Input.value);
        let y1 = parseInt(y1Input.value);
        let x2 = parseInt(x2Input.value);
        let y2 = parseInt(y2Input.value);

        // Dynamically adjust grid scale
        const maxCoord = Math.max(Math.abs(x1), Math.abs(y1), Math.abs(x2), Math.abs(y2));
        const requiredRange = Math.max(10, Math.ceil(maxCoord) + 1);
        cols = rows = 2 * requiredRange;
        gridSize = canvas.width / cols;

        // Simple Bresenham for 0 < slope < 1
        // We will swap points if x1 > x2 for simplicity of this demo
        if (x1 > x2) {
            let temp = x1; x1 = x2; x2 = temp;
            temp = y1; y1 = y2; y2 = temp;
        }

        const dx = x2 - x1;
        const dy = y2 - y1;
        
        let p = 2 * dy - dx;
        let x = x1;
        let y = y1;

        bresSteps = [];
        
        bresSteps.push({
            k: 0,
            p: p,
            x: x,
            y: y,
            dx: dx,
            dy: dy,
            chosen: 'Start'
        });

        for(let k = 0; k < dx; k++) {
            let oldP = p;
            let chosen = '';
            if (p < 0) {
                chosen = 'E';
                x = x + 1;
                p = p + 2 * dy;
            } else {
                chosen = 'NE';
                x = x + 1;
                y = y + 1;
                p = p + 2 * dy - 2 * dx;
            }
            
            bresSteps.push({
                k: k + 1,
                p: p,
                oldP: oldP,
                x: x,
                y: y,
                dx: dx,
                dy: dy,
                chosen: chosen
            });
        }

        varsDiv.innerHTML = `
            dx = ${dx}, dy = ${dy}<br>
            Initial P₀ = 2dy - dx = ${2*dy - dx}<br>
            Ready to simulate.
        `;
    }

    function updateView() {
        drawGrid();
        tableBody.innerHTML = '';
        
        for(let i=0; i<=currentStepIndex; i++) {
            const s = bresSteps[i];
            const isLatest = (i === currentStepIndex);
            
            plotPixel(s.x, s.y, isLatest ? '#3fb950' : '#d29922');
            
            const tr = document.createElement('tr');
            if(isLatest) tr.style.backgroundColor = 'rgba(63, 185, 80, 0.2)';
            
            let pStr = (i === 0) ? '-' : s.oldP;

            tr.innerHTML = `
                <td style="padding:4px 8px; border-bottom:1px solid #30363d;">${s.k}</td>
                <td style="padding:4px 8px; border-bottom:1px solid #30363d;">${pStr}</td>
                <td style="padding:4px 8px; border-bottom:1px solid #30363d;">(${s.x}, ${s.y})</td>
            `;
            tableBody.appendChild(tr);

            if(isLatest) {
                varsDiv.innerHTML = `
                    dx = ${s.dx}, dy = ${s.dy}<br>
                    Current P = ${pStr}<br>
                    Chosen Pixel: <strong>${s.chosen}</strong>
                `;
            }
        }
        
        tableBody.parentElement.parentElement.scrollTop = tableBody.parentElement.parentElement.scrollHeight;
    }

    initBtn.addEventListener('click', () => {
        clearInterval(playInterval);
        calculateBresenham();
        currentStepIndex = 0;
        updateView();
    });

    nextBtn.addEventListener('click', () => {
        if(currentStepIndex < bresSteps.length - 1) {
            currentStepIndex++;
            updateView();
        }
    });

    prevBtn.addEventListener('click', () => {
        if(currentStepIndex > 0) {
            currentStepIndex--;
            updateView();
        }
    });

    resetBtn.addEventListener('click', () => {
        clearInterval(playInterval);
        currentStepIndex = 0;
        updateView();
    });

    playBtn.addEventListener('click', () => {
        clearInterval(playInterval);
        if(currentStepIndex === bresSteps.length - 1) {
            currentStepIndex = 0;
        }
        playInterval = setInterval(() => {
            if(currentStepIndex < bresSteps.length - 1) {
                currentStepIndex++;
                updateView();
            } else {
                clearInterval(playInterval);
            }
        }, 800);
    });

    pauseBtn.addEventListener('click', () => {
        clearInterval(playInterval);
    });

    drawGrid();
});
