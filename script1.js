document.addEventListener('DOMContentLoaded', function () {
    const totalTime = 60 * 60 * 1000; // 60 minutes
    const warningTime = 5 * 60 * 1000; // 5 minutes
    const startTime = Date.now();
    let warned = false;

    // Get the number of questions dynamically
    const questionInputs = document.querySelectorAll('input[type="radio"][name^="q"]');
    const questionNames = new Set([...questionInputs].map(input => input.name));
    const totalQuestions = questionNames.size;

    // Validate correctAnswers object
    if (typeof correctAnswers === 'undefined') {
        console.error('Error: correctAnswers object is not defined in the HTML.');
        alert('Test cannot proceed: Correct answers are not defined.');
        return;
    }

    // Validate that correctAnswers has entries for all questions
    for (let i = 1; i <= totalQuestions; i++) {
        if (!correctAnswers[`q${i}`]) {
            console.error(`Error: Missing correct answer for question q${i}.`);
            alert(`Test cannot proceed: Missing correct answer for question ${i}.`);
            return;
        }
    }

    // Create question list in sidebar
    const questionGrid = document.querySelector('.question-grid');
    for (let i = 1; i <= totalQuestions; i++) {
        const questionItem = document.createElement('div');
        questionItem.classList.add('question-item');
        questionItem.textContent = i;
        questionItem.dataset.question = `q${i}`;
        questionItem.addEventListener('click', () => {
            const target = document.querySelector(`input[name="q${i}"]`);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
        questionGrid.appendChild(questionItem);
    }

    // Update question status
    function updateQuestionStatus() {
        for (let i = 1; i <= totalQuestions; i++) {
            const selected = document.querySelector(`input[name="q${i}"]:checked`);
            const questionItem = document.querySelector(`.question-item[data-question="q${i}"]`);
            if (selected) {
                questionItem.classList.add('answered');
            } else {
                questionItem.classList.remove('answered');
            }
        }
    }

    // Update timer
    function updateTimer() {
        const elapsed = Date.now() - startTime;
        const remaining = totalTime - elapsed;
        if (remaining <= 0) {
            submitQuiz();
        } else {
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            document.getElementById('timer').textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
            if (remaining <= warningTime && !warned) {
                checkUnanswered();
                warned = true;
            }
            setTimeout(updateTimer, 1000);
        }
    }

    // Check unanswered questions
    function checkUnanswered() {
        let unanswered = [];
        for (let i = 1; i <= totalQuestions; i++) {
            const selected = document.querySelector(`input[name="q${i}"]:checked`);
            if (!selected) {
                unanswered.push(i);
            }
        }
        if (unanswered.length > 0) {
            alert(`5 minutes left! You have not answered questions: ${unanswered.join(', ')}`);
        }
    }

    // Submit quiz and calculate score
    function submitQuiz() {
        let score = 0;
        for (let i = 1; i <= totalQuestions; i++) {
            const selected = document.querySelector(`input[name="q${i}"]:checked`);
            if (selected && selected.value === correctAnswers[`q${i}`]) {
                score += 10 / totalQuestions; // Scale score to max 10 points
            }
        }
        showResultModal(score);
    }

    // Event listener for radio button changes
    document.querySelectorAll('input[type="radio"]').forEach(input => {
        input.addEventListener('change', updateQuestionStatus);
    });

    // Event listener for submit button
    document.getElementById('sidebarSubmitBtn').addEventListener('click', function() {
        let answered = 0;
        for (let i = 1; i <= totalQuestions; i++) {
            const selected = document.querySelector(`input[name="q${i}"]:checked`);
            if (selected) {
                answered++;
            }
        }
        showConfirmModal(answered);
    });

    // Show confirmation modal
    function showConfirmModal(answered) {
        document.getElementById('answeredCount').textContent = answered;
        document.getElementById('confirmModal').style.display = 'flex';
    }

    // Show result modal
    function showResultModal(score) {
        document.getElementById('finalScore').textContent = score.toFixed(2);
        document.getElementById('resultModal').style.display = 'flex';
    }

    // Close modal
    function closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    // Event listeners for modal buttons
    document.getElementById('confirmSubmitBtn').addEventListener('click', function () {
        closeModal('confirmModal');
        submitQuiz();
    });

    document.getElementById('cancelSubmitBtn').addEventListener('click', function () {
        closeModal('confirmModal');
    });

    document.getElementById('closeResultBtn').addEventListener('click', function() {
        closeModal('resultModal');
    });
    
    // Start timer and update status
    updateTimer();
    updateQuestionStatus();

});