document.addEventListener('DOMContentLoaded', () => {
    // Calculator
    const btnCalc = document.getElementById('calc-run');
    const selAlgo = document.getElementById('calc-algo');
    const inX1 = document.getElementById('calc-x1');
    const inY1 = document.getElementById('calc-y1');
    const inX2 = document.getElementById('calc-x2');
    const inY2 = document.getElementById('calc-y2');
    const resDiv = document.getElementById('calc-result');

    btnCalc.addEventListener('click', () => {
        let x1 = parseFloat(inX1.value);
        let y1 = parseFloat(inY1.value);
        let x2 = parseFloat(inX2.value);
        let y2 = parseFloat(inY2.value);
        
        if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
            resDiv.innerHTML = '<span style="color:var(--danger-color)">Please enter all coordinates.</span>';
            return;
        }
        let algo = selAlgo.value;
        let out = '<div style="font-family: monospace; background: #0d1117; color: #58a6ff; padding: 15px; border-radius: 4px; border: 1px solid #30363d;">';

        if (algo === 'dda') {
            let dx = x2 - x1;
            let dy = y2 - y1;
            let steps = Math.max(Math.abs(dx), Math.abs(dy));
            let xInc = dx / steps;
            let yInc = dy / steps;
            
            out += `<span style="color:#8b949e">// 1. Calculate Differences</span><br>`;
            out += `dx = ${dx}<br>dy = ${dy}<br>steps = max(|dx|, |dy|) = ${steps}<br><br>`;
            
            out += `<span style="color:#8b949e">// 2. Calculate Increments</span><br>`;
            out += `xInc = dx / steps = ${xInc.toFixed(2)}<br>yInc = dy / steps = ${yInc.toFixed(2)}<br><br>`;
            
            out += `<span style="color:#8b949e">// 3. Iteration Loop</span><br>`;
            let x = x1; let y = y1;
            for(let k=0; k<=steps; k++) {
                out += `<strong>Step ${k}:</strong> X=${x.toFixed(2)}, Y=${y.toFixed(2)}  &rarr;  <span style="color:#3fb950">Plot(${Math.round(x)}, ${Math.round(y)})</span><br>`;
                x += xInc;
                y += yInc;
            }
        } else if (algo === 'bres') {
            let dx = Math.abs(x2 - x1);
            let dy = Math.abs(y2 - y1);
            let p = 2 * dy - dx;
            
            out += `<span style="color:#8b949e">// 1. Calculate Constants</span><br>`;
            out += `dx = ${dx}<br>dy = ${dy}<br><br>`;
            
            out += `<span style="color:#8b949e">// 2. Calculate Initial Decision Parameter</span><br>`;
            out += `Initial P₀ = 2dy - dx = ${p}<br><br>`;
            
            let x = x1; let y = y1;
            let stepX = x1 < x2 ? 1 : -1;
            let stepY = y1 < y2 ? 1 : -1;
            
            out += `<span style="color:#8b949e">// 3. Iteration Loop</span><br>`;
            out += `<strong>Step 0:</strong> Initial Point  &rarr;  <span style="color:#3fb950">Plot(${x}, ${y})</span><br>`;
            for(let k=0; k<dx; k++) {
                let oldP = p;
                if (p < 0) {
                    x += stepX;
                    p += 2 * dy;
                } else {
                    x += stepX;
                    y += stepY;
                    p += 2 * dy - 2 * dx;
                }
                out += `<strong>Step ${k+1}:</strong> Pk=${oldP}  &rarr;  <span style="color:#3fb950">Plot(${x}, ${y})</span><br>`;
            }
        }
        out += '</div>';
        resDiv.innerHTML = out;
    });

    // Quiz
    const btnSubmit = document.getElementById('quiz-submit');
    const resQuiz = document.getElementById('quiz-result');

    btnSubmit.addEventListener('click', () => {
        let q1 = document.querySelector('input[name="q1"]:checked');
        let q2 = document.querySelector('input[name="q2"]:checked');
        
        let score = 0;
        if (q1 && q1.value === 'dda') score++;
        if (q2 && q2.value === 'not0000') score++;
        
        if (score === 2) {
            resQuiz.style.color = 'var(--success-color)';
            resQuiz.textContent = `Score: 2/2. Excellent! You are ready for the exam.`;
        } else {
            resQuiz.style.color = 'var(--warning-color)';
            resQuiz.textContent = `Score: ${score}/2. Review the notes and try again!`;
        }
        
        // Save best quiz score
        let bestQuiz = parseInt(localStorage.getItem('cg_best_quiz') || '0');
        if (score > bestQuiz) {
            localStorage.setItem('cg_best_quiz', score);
        }
        window.dispatchEvent(new Event('analytics-update'));
    });
});
