document.addEventListener('DOMContentLoaded', () => {
    const togTex = document.getElementById('vr-tog-tex');
    const togLight = document.getElementById('vr-tog-light');
    const togShadow = document.getElementById('vr-tog-shadow');
    const togGeo = document.getElementById('vr-tog-geo');
    
    const preview = document.getElementById('vr-preview');
    const sun = document.getElementById('vr-sun');
    const cube = document.getElementById('vr-cube');
    const feedback = document.getElementById('vr-feedback');

    function updateVR() {
        let text = 'Status: ';
        let score = 0;
        
        if (togTex.checked) {
            cube.style.backgroundImage = 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)';
            score++;
        } else {
            cube.style.backgroundImage = 'none';
        }
        
        if (togLight.checked) {
            sun.style.boxShadow = '0 0 40px #fffacd';
            sun.style.background = '#fffacd';
            score++;
        } else {
            sun.style.boxShadow = 'none';
            sun.style.background = '#ddd';
        }
        
        if (togShadow.checked) {
            cube.style.boxShadow = '20px 20px 0 rgba(0,0,0,0.5)';
            score++;
        } else {
            cube.style.boxShadow = 'none';
        }
        
        if (togGeo.checked) {
            cube.style.borderRadius = '15px';
            score++;
        } else {
            cube.style.borderRadius = '0';
        }
        
        if (score === 4) text += 'Immersive realism enabled. The scene feels lifelike.';
        else if (score >= 2) text += 'Partial realism. The scene looks like an older video game.';
        else text += 'Basic geometry only. The scene lacks depth and realism.';
        
        feedback.textContent = text;
    }

    togTex.addEventListener('change', updateVR);
    togLight.addEventListener('change', updateVR);
    togShadow.addEventListener('change', updateVR);
    togGeo.addEventListener('change', updateVR);
    
    updateVR();
});
