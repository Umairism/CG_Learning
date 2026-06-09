document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('dda-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Grid settings
    const gridSize = 20; // 20x20 grid, each cell is 20px
    const cols = canvas.width / gridSize;
    const rows = canvas.height / gridSize;

    // UI Elements
    const x1Input = document.getElementById('dda-x1');
    const y1Input = document.getElementById('dda-y1');
    const x2Input = document.getElementById('dda-x2');
    const y2Input = document.getElementById('dda-y2');
    
    const initBtn = document.getElementById('dda-init');
    const prevBtn = document.getElementById('dda-prev');
    const nextBtn = document.getElementById('dda-next');
    const playBtn = document.getElementById('dda-play');
    const pauseBtn = document.getElementById('dda-pause');
    const resetBtn = document.getElementById('dda-reset');
    
    const varsDiv = document.getElementById('dda-vars');
    const tableBody = document.querySelector('#dda-table tbody');

    // State
    let ddaSteps = [];
    let currentStepIndex = 0;
    let playInterval = null;

    function drawGrid() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#30363d';
        ctx.lineWidth = 1;
        
        for(let i=0; i<=cols; i++) {
            ctx.beginPath();
            ctx.moveTo(i*gridSize, 0);
            ctx.lineTo(i*gridSize, canvas.height);
            ctx.stroke();
        }
        for(let j=0; j<=rows; j++) {
            ctx.beginPath();
            ctx.moveTo(0, j*gridSize);
            ctx.lineTo(canvas.width, j*gridSize);
            ctx.stroke();
        }
        
        // Draw coordinate numbers (every 5)
        ctx.fillStyle = '#8b949e';
        ctx.font = '10px monospace';
        for(let i=0; i<=cols; i+=5) {
            ctx.fillText(i, i*gridSize + 2, canvas.height - 2);
        }
        for(let j=0; j<=rows; j+=5) {
            ctx.fillText(j, 2, canvas.height - j*gridSize - 2);
        }
    }

    function plotPixel(x, y, color = '#58a6ff') {
        ctx.fillStyle = color;
        // Invert Y axis for drawing so origin is bottom-left
        const drawY = rows - y - 1; 
        ctx.fillRect(x * gridSize + 1, drawY * gridSize + 1, gridSize - 2, gridSize - 2);
    }

    function calculateDDA() {
        const x1 = parseFloat(x1Input.value);
        const y1 = parseFloat(y1Input.value);
        const x2 = parseFloat(x2Input.value);
        const y2 = parseFloat(y2Input.value);

        const dx = x2 - x1;
        const dy = y2 - y1;
        const steps = Math.max(Math.abs(dx), Math.abs(dy));

        const xInc = dx / steps;
        const yInc = dy / steps;

        ddaSteps = [];
        let x = x1;
        let y = y1;

        ddaSteps.push({
            k: 0,
            x: x,
            y: y,
            rx: Math.round(x),
            ry: Math.round(y)
        });

        for(let k = 1; k <= steps; k++) {
            x += xInc;
            y += yInc;
            ddaSteps.push({
                k: k,
                x: x,
                y: y,
                rx: Math.round(x),
                ry: Math.round(y)
            });
        }

        varsDiv.innerHTML = `
            dx = ${dx}, dy = ${dy}, steps = ${steps}<br>
            xInc = ${xInc.toFixed(4)}, yInc = ${yInc.toFixed(4)}
        `;
    }

    function updateView() {
        drawGrid();
        tableBody.innerHTML = '';
        
        for(let i=0; i<=currentStepIndex; i++) {
            const s = ddaSteps[i];
            const isLatest = (i === currentStepIndex);
            
            plotPixel(s.rx, s.ry, isLatest ? '#3fb950' : '#58a6ff');
            
            const tr = document.createElement('tr');
            if(isLatest) tr.style.backgroundColor = 'rgba(63, 185, 80, 0.2)';
            
            tr.innerHTML = `
                <td style="padding:4px 8px; border-bottom:1px solid #30363d;">${s.k}</td>
                <td style="padding:4px 8px; border-bottom:1px solid #30363d;">${s.x.toFixed(2)}</td>
                <td style="padding:4px 8px; border-bottom:1px solid #30363d;">${s.y.toFixed(2)}</td>
                <td style="padding:4px 8px; border-bottom:1px solid #30363d;">(${s.rx}, ${s.ry})</td>
            `;
            tableBody.appendChild(tr);
        }
        
        // Scroll to bottom of table
        tableBody.parentElement.parentElement.scrollTop = tableBody.parentElement.parentElement.scrollHeight;
    }

    initBtn.addEventListener('click', () => {
        clearInterval(playInterval);
        calculateDDA();
        currentStepIndex = 0;
        updateView();
    });

    nextBtn.addEventListener('click', () => {
        if(currentStepIndex < ddaSteps.length - 1) {
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
        if(currentStepIndex === ddaSteps.length - 1) {
            currentStepIndex = 0;
        }
        playInterval = setInterval(() => {
            if(currentStepIndex < ddaSteps.length - 1) {
                currentStepIndex++;
                updateView();
            } else {
                clearInterval(playInterval);
            }
        }, 500);
    });

    pauseBtn.addEventListener('click', () => {
        clearInterval(playInterval);
    });

    // Init on load
    drawGrid();
});
