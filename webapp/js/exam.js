document.addEventListener('DOMContentLoaded', () => {
    const btnGen = document.getElementById('exam-gen');
    if (!btnGen) return;

    const selAlgo = document.getElementById('exam-algo');
    const selDiff = document.getElementById('exam-diff');
    const promptDiv = document.getElementById('exam-prompt');
    const workspace = document.getElementById('exam-workspace');
    
    const exX1 = document.getElementById('ex-x1');
    const exY1 = document.getElementById('ex-y1');
    const exX2 = document.getElementById('ex-x2');
    const exY2 = document.getElementById('ex-y2');
    const exAlgoName = document.getElementById('ex-algo-name');

    const canvas = document.getElementById('exam-canvas');
    const ctx = canvas.getContext('2d');
    const btnSubmit = document.getElementById('exam-submit');
    const btnClear = document.getElementById('exam-clear');
    const feedback = document.getElementById('exam-feedback');
    const solBox = document.getElementById('exam-solution-box');
    const btnShowSol = document.getElementById('exam-show-sol');
    const solContent = document.getElementById('exam-sol-content');

    const gridSize = 20; // 20x20 grid cells
    const maxCoord = 20;

    let currentProblem = null;
    let userPixels = []; // array of {x, y}

    function drawGrid() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#30363d';
        ctx.lineWidth = 1;
        for (let i = 0; i <= maxCoord; i++) {
            ctx.beginPath(); ctx.moveTo(i * gridSize, 0); ctx.lineTo(i * gridSize, canvas.height); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, i * gridSize); ctx.lineTo(canvas.width, i * gridSize); ctx.stroke();
        }
        
        const centerX = maxCoord / 2;
        const centerY = maxCoord / 2;
        
        ctx.beginPath();
        ctx.strokeStyle = '#58a6ff';
        ctx.lineWidth = 2;
        ctx.moveTo(centerX * gridSize, 0);
        ctx.lineTo(centerX * gridSize, canvas.height);
        ctx.moveTo(0, centerY * gridSize);
        ctx.lineTo(canvas.width, centerY * gridSize);
        ctx.stroke();
    }

    function plotPixel(x, y, color) {
        ctx.fillStyle = color;
        const centerX = maxCoord / 2;
        const centerY = maxCoord / 2;
        ctx.fillRect((centerX + x) * gridSize + 1, (centerY - y) * gridSize + 1, gridSize - 2, gridSize - 2);
    }

    function renderState() {
        drawGrid();
        // Draw user pixels
        userPixels.forEach(p => {
            plotPixel(p.x, p.y, '#f85149'); // red-ish for user
        });
        // Always draw start and end in blue
        if (currentProblem) {
            plotPixel(currentProblem.x1, currentProblem.y1, '#58a6ff');
            plotPixel(currentProblem.x2, currentProblem.y2, '#58a6ff');
        }
    }

    // Generate random coordinate based on difficulty
    btnGen.addEventListener('click', () => {
        let diff = selDiff.value;
        let x1 = 2, y1 = 2, x2 = 10, y2 = 6; // default easy

        if (diff === 'easy') {
            x1 = Math.floor(Math.random() * 5) - 8;
            y1 = Math.floor(Math.random() * 5) - 8;
            x2 = x1 + Math.floor(Math.random() * 6) + 3;
            y2 = y1 + Math.floor(Math.random() * 4) + 1; // slope < 1
        } else if (diff === 'medium') {
            x1 = Math.floor(Math.random() * 5) - 5;
            y1 = Math.floor(Math.random() * 5) - 5;
            x2 = x1 + Math.floor(Math.random() * 4) + 1;
            y2 = y1 + Math.floor(Math.random() * 6) + 3; // slope > 1
        } else if (diff === 'hard') {
            x1 = Math.floor(Math.random() * 5) + 3;
            y1 = Math.floor(Math.random() * 5) + 3;
            x2 = x1 - Math.floor(Math.random() * 6) - 2;
            y2 = y1 - Math.floor(Math.random() * 4) - 1; // negative slope
        }

        currentProblem = { x1, y1, x2, y2, algo: selAlgo.value };
        
        exX1.textContent = x1;
        exY1.textContent = y1;
        exX2.textContent = x2;
        exY2.textContent = y2;
        exAlgoName.textContent = selAlgo.options[selAlgo.selectedIndex].text;

        promptDiv.style.display = 'block';
        workspace.style.display = 'block';
        feedback.innerHTML = 'Submit your answer to see feedback.';
        feedback.style.borderColor = 'var(--border-color)';
        solBox.style.display = 'none';
        solContent.style.display = 'none';
        
        userPixels = [];
        renderState();
    });

    // Handle clicking on canvas
    canvas.addEventListener('click', (e) => {
        if (!currentProblem) return;
        const rect = canvas.getBoundingClientRect();
        const centerX = maxCoord / 2;
        const centerY = maxCoord / 2;
        const rawX = Math.floor((e.clientX - rect.left) / gridSize);
        const rawY = Math.floor((e.clientY - rect.top) / gridSize);
        const x = rawX - centerX;
        const y = centerY - rawY;

        // Don't toggle start/end
        if ((x === currentProblem.x1 && y === currentProblem.y1) || 
            (x === currentProblem.x2 && y === currentProblem.y2)) {
            return;
        }

        // Toggle pixel
        const idx = userPixels.findIndex(p => p.x === x && p.y === y);
        if (idx > -1) {
            userPixels.splice(idx, 1);
        } else {
            userPixels.push({x, y});
        }
        renderState();
    });

    btnClear.addEventListener('click', () => {
        userPixels = [];
        renderState();
    });

    // Compute ideal solution
    function getSolution() {
        let sol = [];
        let log = '';
        let {x1, y1, x2, y2, algo} = currentProblem;

        if (algo === 'dda') {
            let dx = x2 - x1;
            let dy = y2 - y1;
            let steps = Math.max(Math.abs(dx), Math.abs(dy));
            let xInc = dx / steps;
            let yInc = dy / steps;
            let x = x1; let y = y1;
            
            log += `dx=${dx}, dy=${dy}, steps=${steps}\n`;
            log += `xInc=${xInc.toFixed(2)}, yInc=${yInc.toFixed(2)}\n\n`;

            for(let i=0; i<=steps; i++) {
                let rx = Math.round(x);
                let ry = Math.round(y);
                sol.push({x: rx, y: ry});
                log += `Step ${i}: Plot(${rx}, ${ry})\n`;
                x += xInc;
                y += yInc;
            }
        } else {
            // Bresenham
            let dx = Math.abs(x2 - x1);
            let dy = Math.abs(y2 - y1);
            let p = 2 * dy - dx;
            let x = x1; let y = y1;
            let stepX = x1 < x2 ? 1 : -1;
            let stepY = y1 < y2 ? 1 : -1;

            log += `dx=${dx}, dy=${dy}, Initial P=${p}\n\n`;

            sol.push({x, y});
            log += `Step 0: Plot(${x}, ${y})\n`;

            for(let i=0; i<dx; i++) { // Simplistic bresenham assuming dx > dy for this demo
                let oldP = p;
                if (p < 0) {
                    x += stepX;
                    p += 2 * dy;
                } else {
                    x += stepX;
                    y += stepY;
                    p += 2 * dy - 2 * dx;
                }
                sol.push({x, y});
                log += `Step ${i+1}: Pk=${oldP} -> Plot(${x}, ${y})\n`;
            }
        }
        return {sol, log};
    }

    btnSubmit.addEventListener('click', () => {
        if (!currentProblem) return;

        let {sol, log} = getSolution();
        
        // Add start/end to userPixels for comparison if they aren't there
        let allUser = [...userPixels, {x: currentProblem.x1, y: currentProblem.y1}, {x: currentProblem.x2, y: currentProblem.y2}];
        
        // Check if sets match
        let isCorrect = true;
        let missing = [];
        let extra = [];

        sol.forEach(sp => {
            if (!allUser.find(up => up.x === sp.x && up.y === sp.y)) {
                isCorrect = false;
                missing.push(sp);
            }
        });

        allUser.forEach(up => {
            if (!sol.find(sp => sp.x === up.x && sp.y === up.y)) {
                isCorrect = false;
                extra.push(up);
            }
        });

        let examHistory = JSON.parse(localStorage.getItem('cg_exam_history') || '[]');

        if (isCorrect) {
            feedback.innerHTML = '<h4 style="color:var(--success-color)">✓ Perfect!</h4><p>You have accurately executed the algorithm visually.</p>';
            feedback.style.borderColor = 'var(--success-color)';
            examHistory.push({ algo: currentProblem.algo, correct: true });
        } else {
            let msg = '<h4 style="color:var(--danger-color)">✗ Incorrect</h4>';
            if (missing.length > 0) msg += `<p>You missed ${missing.length} pixel(s).</p>`;
            if (extra.length > 0) msg += `<p>You added ${extra.length} incorrect pixel(s).</p>`;
            msg += `<p>Use the "Show Solution" button to see where you went wrong.</p>`;
            feedback.innerHTML = msg;
            feedback.style.borderColor = 'var(--danger-color)';
            examHistory.push({ algo: currentProblem.algo, correct: false });
        }
        
        localStorage.setItem('cg_exam_history', JSON.stringify(examHistory));
        window.dispatchEvent(new Event('analytics-update'));

        solBox.style.display = 'block';
        solContent.innerHTML = log.replace(/\n/g, '<br>');
    });

    btnShowSol.addEventListener('click', () => {
        solContent.style.display = solContent.style.display === 'none' ? 'block' : 'none';
        
        // Draw actual solution in green
        if (solContent.style.display === 'block') {
            let {sol} = getSolution();
            sol.forEach(p => {
                // If user didn't pick it, draw green outline
                const centerX = maxCoord / 2;
                const centerY = maxCoord / 2;
                ctx.strokeStyle = '#3fb950';
                ctx.lineWidth = 2;
                ctx.strokeRect((centerX + p.x) * gridSize + 2, (centerY - p.y) * gridSize + 2, gridSize - 4, gridSize - 4);
            });
        } else {
            renderState(); // clear solution overlay
        }
    });

});
