document.addEventListener('DOMContentLoaded', () => {
    function calculateAnalytics() {
        // 1. Progress
        const totalModules = 10; // intro, coords, dda, bresenham, line-clip, poly-clip, lighting, texture, vr, trends
        const moduleIds = ['intro', 'coords', 'dda', 'bresenham', 'line-clip', 'poly-clip', 'lighting', 'texture', 'vr', 'trends'];
        
        let completedModules = 0;
        moduleIds.forEach(id => {
            if (localStorage.getItem('cg_prog_' + id) === 'true') {
                completedModules++;
            }
        });
        
        let progressPct = Math.round((completedModules / totalModules) * 100);

        // 2. Challenge Accuracy & Topics
        let examHistory = JSON.parse(localStorage.getItem('cg_exam_history') || '[]');
        let accPct = 0;
        let bestTopic = 'N/A';
        let worstTopic = 'N/A';
        
        if (examHistory.length > 0) {
            let correctCount = examHistory.filter(e => e.correct).length;
            accPct = Math.round((correctCount / examHistory.length) * 100);
            
            // Topic breakdown
            let topics = {};
            examHistory.forEach(e => {
                if (!topics[e.algo]) topics[e.algo] = { total: 0, correct: 0 };
                topics[e.algo].total++;
                if (e.correct) topics[e.algo].correct++;
            });
            
            let bestRatio = -1;
            let worstRatio = 2;
            
            for (let algo in topics) {
                let ratio = topics[algo].correct / topics[algo].total;
                let name = algo === 'dda' ? 'DDA' : 'Bresenham';
                if (ratio > bestRatio) { bestRatio = ratio; bestTopic = name; }
                if (ratio < worstRatio) { worstRatio = ratio; worstTopic = name; }
            }
            if (bestRatio === worstRatio && Object.keys(topics).length === 1) {
                worstTopic = 'N/A'; // Need at least two to compare properly, or just leave it
            }
        }

        // 3. Quiz Score
        let bestQuiz = parseInt(localStorage.getItem('cg_best_quiz') || '0');
        let quizPct = Math.round((bestQuiz / 2) * 100); // 2 questions

        // 4. Readiness Score
        // 40% Progress + 40% Accuracy + 20% Quiz
        let readiness = Math.round((progressPct * 0.4) + (accPct * 0.4) + (quizPct * 0.2));

        // --- Update UI ---
        
        // Sidebar
        const sideProgText = document.getElementById('side-prog-text');
        const sideProgBar = document.getElementById('side-prog-bar');
        const sideReadinessText = document.getElementById('side-readiness-text');
        
        if(sideProgText) sideProgText.textContent = `${completedModules} / ${totalModules}`;
        if(sideProgBar) sideProgBar.style.width = `${progressPct}%`;
        if(sideReadinessText) sideReadinessText.textContent = `${readiness}%`;
        
        // Dashboard
        const dashReadiness = document.getElementById('dash-readiness');
        const dashReadinessBar = document.getElementById('dash-readiness-bar');
        const dashProgText = document.getElementById('dash-prog-text');
        const dashAccText = document.getElementById('dash-acc-text');
        const dashQuizText = document.getElementById('dash-quiz-text');
        const dashBest = document.getElementById('dash-best-topic');
        const dashWorst = document.getElementById('dash-worst-topic');

        if(dashReadiness) dashReadiness.textContent = `${readiness}%`;
        if(dashReadinessBar) dashReadinessBar.style.width = `${readiness}%`;
        if(dashProgText) dashProgText.textContent = `${completedModules} / ${totalModules} (${progressPct}%)`;
        if(dashAccText) dashAccText.textContent = examHistory.length > 0 ? `${accPct}% (${examHistory.filter(e=>e.correct).length}/${examHistory.length})` : '0%';
        if(dashQuizText) dashQuizText.textContent = `${quizPct}%`;
        if(dashBest) dashBest.textContent = bestTopic;
        if(dashWorst) dashWorst.textContent = worstTopic;
    }

    // Initial calculation
    calculateAnalytics();

    // Listen for updates from other scripts
    window.addEventListener('analytics-update', calculateAnalytics);
});
