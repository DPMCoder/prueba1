const quizContainer = document.getElementById('quiz');
const resultsContainer = document.getElementById('results');

let currentQuestion = 0;
let timerInterval;
let timeLeft = 60; // Tiempo en segundos (ejemplo: 1 minuto)

let questions = []; // Inicializar como un array vacío

function loadQuestions() {
    fetch('questions.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error al cargar las preguntas: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            questions = data;
            shuffleArray(questions);

            // Aleatoriza las opciones de cada pregunta de opción múltiple
            questions.forEach(question => {
                if (question.type === "multipleChoice") {
                    const optionsArray = Object.entries(question.options);
                    shuffleArray(optionsArray);
                    question.options = Object.fromEntries(optionsArray);
                }
            });

            buildQuiz();
        })
        .catch(error => console.error('Error al cargar las preguntas:', error));
}

function startTimer() {
    timerInterval = setInterval(function() {
        timeLeft--;
        document.getElementById('timer').textContent = `Tiempo restante: ${timeLeft} segundos`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            document.getElementById('timer').textContent = '¡Tiempo Agotado!';
            //Aquí podría pasar algo, por ejemplo mostrar solamente las preguntas
        }
    }, 1000); // Actualiza cada segundo
}

function buildQuiz() {
    const output = [];

    questions.forEach((question, index) => {
        let options = [];
            if (question.type === 'multipleChoice') {
                 for (letter in question.options) {
                options.push(
                    `<label>
                        <input type="radio" name="question${index}" value="${letter}" onclick="checkAnswer(${index}, '${letter}')">
                        ${question.options[letter]}
                    </label>`
                );
            }
        } else if (question.type === 'trueFalse') {
            for (letter in question.options) {
                options.push(
                    `<label>
                        <input type="radio" name="question${index}" value="${letter}" onclick="checkAnswer(${index}, '${letter}')">
                        ${question.options[letter]}
                    </label>`
                );
            }
        }

        output.push(
            `<div class="question" id="question${index}">
                <p>${question.question}</p>
                <ul class="options"> ${options.join('')} </ul>
                <div class="justification" id="justification${index}"></div>
            </div>`
        );
    });

    quizContainer.innerHTML = output.join('');
    showQuestion(currentQuestion);
    startTimer();
}

function showQuestion(index) {
    const questionsElements = document.querySelectorAll('.question');
    questionsElements.forEach(element => element.style.display = 'none'); // Oculta todas las preguntas
    document.getElementById(`question${index}`).style.display = 'block'; // Muestra solo la pregunta actual

    // Oculta/Muestra los botones Anterior/Siguiente según la pregunta actual
    document.getElementById('previous').style.display = index === 0 ? 'none' : 'inline-block';
    document.getElementById('next').style.display = index === questions.length - 1 ? 'none' : 'inline-block';
}

function checkAnswer(questionIndex, selectedAnswer) {
    const question = questions[questionIndex];
    const justificationDiv = document.getElementById(`justification${questionIndex}`);

    if (selectedAnswer === question.correctAnswer) {
        justificationDiv.innerHTML = `<p style="color:green"><b>Correcta:</b> ${question.options[question.correctAnswer]}</p><p><b>Justificación:</b> ${question.justificacion}</p>`;
    } else {
        justificationDiv.innerHTML = `<p style="color:red"><b>Incorrecta:</b> La respuesta correcta era ${question.correctAnswer}: ${question.options[question.correctAnswer]}</p><p><b>Justificación:</b> ${question.justificacion}</p>`;
    }
    justificationDiv.style.display = "block";
}

function showNextQuestion() {
    currentQuestion++;
    showQuestion(currentQuestion);
}

function showPreviousQuestion() {
    currentQuestion--;
    showQuestion(currentQuestion);
}

// Llama a la función para cargar las preguntas y comenzar el examen
loadQuestions();

// Event listeners
document.getElementById('previous').addEventListener('click', showPreviousQuestion);
document.getElementById('next').addEventListener('click', showNextQuestion);