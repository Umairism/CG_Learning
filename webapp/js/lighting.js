document.addEventListener('DOMContentLoaded', () => {
    const cTotal = document.getElementById('light-total');
    if (!cTotal) return;
    
    const cAmb = document.getElementById('light-ambient');
    const cDiff = document.getElementById('light-diffuse');
    const cSpec = document.getElementById('light-specular');

    const ctxTotal = cTotal.getContext('2d');
    const ctxAmb = cAmb.getContext('2d');
    const ctxDiff = cDiff.getContext('2d');
    const ctxSpec = cSpec.getContext('2d');

    // Controls
    const inKa = document.getElementById('ctrl-ka');
    const inKd = document.getElementById('ctrl-kd');
    const inKs = document.getElementById('ctrl-ks');
    const inAlpha = document.getElementById('ctrl-alpha');
    const inLx = document.getElementById('ctrl-lx');
    const inLy = document.getElementById('ctrl-ly');
    const inLz = document.getElementById('ctrl-lz');

    const valKa = document.getElementById('val-ka');
    const valKd = document.getElementById('val-kd');
    const valKs = document.getElementById('val-ks');
    const valAlpha = document.getElementById('val-alpha');

    const sphereColor = { r: 88, g: 166, b: 255 }; // Primary color
    const lightColor = { r: 255, g: 255, b: 255 }; // White light

    function normalize(v) {
        let len = Math.sqrt(v.x*v.x + v.y*v.y + v.z*v.z);
        if(len === 0) return {x:0, y:0, z:0};
        return {x: v.x/len, y: v.y/len, z: v.z/len};
    }

    function dot(v1, v2) {
        return v1.x*v2.x + v1.y*v2.y + v1.z*v2.z;
    }

    function renderSphere(ctx, width, height, mode) {
        const imgData = ctx.createImageData(width, height);
        const data = imgData.data;

        let ka = parseFloat(inKa.value);
        let kd = parseFloat(inKd.value);
        let ks = parseFloat(inKs.value);
        let alpha = parseFloat(inAlpha.value);
        
        let lx = parseFloat(inLx.value);
        let ly = parseFloat(inLy.value);
        let lz = parseFloat(inLz.value);
        
        let L = normalize({x: lx, y: ly, z: lz});
        let V = {x: 0, y: 0, z: 1}; // Viewer looking down Z

        for(let y = 0; y < height; y++) {
            for(let x = 0; x < width; x++) {
                // Map pixel to -1 to 1
                let nx = (x / width) * 2 - 1;
                let ny = -((y / height) * 2 - 1);
                
                let r2 = nx*nx + ny*ny;
                if(r2 > 1) continue; // Outside sphere
                
                let nz = Math.sqrt(1 - r2);
                let N = {x: nx, y: ny, z: nz};
                
                // Diffuse
                let nDotL = Math.max(0, dot(N, L));
                
                // Specular (Reflection vector)
                // R = 2*(N.L)*N - L
                let rx = 2 * nDotL * N.x - L.x;
                let ry = 2 * nDotL * N.y - L.y;
                let rz = 2 * nDotL * N.z - L.z;
                let R = normalize({x: rx, y: ry, z: rz});
                let rDotV = Math.max(0, dot(R, V));
                
                let specIntensity = Math.pow(rDotV, alpha);

                let cR = 0, cG = 0, cB = 0;

                if (mode === 'ambient' || mode === 'total') {
                    cR += ka * sphereColor.r;
                    cG += ka * sphereColor.g;
                    cB += ka * sphereColor.b;
                }
                if (mode === 'diffuse' || mode === 'total') {
                    cR += kd * nDotL * sphereColor.r;
                    cG += kd * nDotL * sphereColor.g;
                    cB += kd * nDotL * sphereColor.b;
                }
                if (mode === 'specular' || mode === 'total') {
                    cR += ks * specIntensity * lightColor.r;
                    cG += ks * specIntensity * lightColor.g;
                    cB += ks * specIntensity * lightColor.b;
                }

                let idx = (y * width + x) * 4;
                data[idx]   = Math.min(255, cR);
                data[idx+1] = Math.min(255, cG);
                data[idx+2] = Math.min(255, cB);
                data[idx+3] = 255;
            }
        }
        ctx.putImageData(imgData, 0, 0);
    }

    function updateAll() {
        valKa.textContent = inKa.value;
        valKd.textContent = inKd.value;
        valKs.textContent = inKs.value;
        valAlpha.textContent = inAlpha.value;

        // Clear backgrounds since spheres are drawn on transparent BG
        ctxTotal.clearRect(0,0,cTotal.width,cTotal.height);
        ctxAmb.clearRect(0,0,cAmb.width,cAmb.height);
        ctxDiff.clearRect(0,0,cDiff.width,cDiff.height);
        ctxSpec.clearRect(0,0,cSpec.width,cSpec.height);

        renderSphere(ctxTotal, cTotal.width, cTotal.height, 'total');
        renderSphere(ctxAmb, cAmb.width, cAmb.height, 'ambient');
        renderSphere(ctxDiff, cDiff.width, cDiff.height, 'diffuse');
        renderSphere(ctxSpec, cSpec.width, cSpec.height, 'specular');
    }

    [inKa, inKd, inKs, inAlpha, inLx, inLy, inLz].forEach(el => {
        el.addEventListener('input', updateAll);
    });

    updateAll();
});
