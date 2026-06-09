document.addEventListener('DOMContentLoaded', () => {
    const texThumbs = document.querySelectorAll('.tex-thumb');
    const preview = document.getElementById('active-tex-preview');
    const mappedElements = document.querySelectorAll('.mapped-tex');
    const objBtns = document.querySelectorAll('.obj-btn');
    
    const objCube = document.getElementById('obj-cube');
    const objSphere = document.getElementById('obj-sphere');
    const objCyl = document.getElementById('obj-cylinder');

    // Handle Texture Selection
    texThumbs.forEach(thumb => {
        thumb.addEventListener('click', () => {
            texThumbs.forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
            
            // Get background
            const bg = thumb.style.background;
            
            // Update preview
            preview.style.background = bg;
            
            // Update mapped objects
            mappedElements.forEach(el => {
                el.style.background = bg;
            });
        });
    });

    // Handle Object Selection
    objBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            objBtns.forEach(b => {
                b.classList.remove('btn-primary');
            });
            btn.classList.add('btn-primary');
            
            const targetObj = btn.getAttribute('data-obj');
            
            objCube.style.display = 'none';
            objSphere.style.display = 'none';
            objCyl.style.display = 'none';
            
            if (targetObj === 'cube') objCube.style.display = 'block';
            if (targetObj === 'sphere') objSphere.style.display = 'block';
            if (targetObj === 'cylinder') objCyl.style.display = 'block';
        });
    });
});
