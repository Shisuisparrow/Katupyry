document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado - Lección');
    
    // Obtener ID de la lección de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const lessonId = parseInt(urlParams.get('id')) || 1;
    
    // Inicializar el tablero de ajedrez
    const board = initializeChessBoard();
    
    if (board) {
        // Configurar navegación entre pasos de la lección
        setupLessonNavigation(lessonId, board);
        
        // Configurar controles del tablero
        setupBoardControls(board);
    } else {
        console.error('No se pudo inicializar el tablero de ajedrez');
    }
    
    // Configurar quiz
    setupQuiz(lessonId);
    
    // Actualizar progreso de la lección
    updateLessonProgress(lessonId);
});

// Función para inicializar el tablero de ajedrez
function initializeChessBoard() {
    console.log('Inicializando tablero de ajedrez...');
    
    const squaresElement = document.getElementById('lesson-squares');
    const piecesElement = document.getElementById('lesson-pieces');
    
    if (!squaresElement || !piecesElement) {
        console.error('No se encontraron los elementos del tablero:', { 
            squaresElement: squaresElement ? 'encontrado' : 'no encontrado', 
            piecesElement: piecesElement ? 'encontrado' : 'no encontrado' 
        });
        return null;
    }
    
    console.log('Elementos del tablero encontrados');
    
    // Crear tablero
    const board = {
        squaresElement: squaresElement,
        piecesElement: piecesElement,
        position: createEmptyPosition(),
        orientation: 'white', // 'white' o 'black'
        selectedPiece: null,
        arrows: [],
        highlights: []
    };
    
    console.log('Creando casillas del tablero...');
    // Crear casillas del tablero
    createBoardSquares(board);
    
    console.log('Configurando posición inicial...');
    // Configurar posición inicial vacía
    updateBoardPosition(board, board.position);
    
    console.log('Configurando eventos de arrastrar y soltar...');
    // Configurar eventos de arrastrar y soltar
    setupDragAndDrop(board);
    
    console.log('Tablero inicializado correctamente');
    return board;
}

// Función para crear una posición vacía
function createEmptyPosition() {
    const position = [];
    
    for (let row = 0; row < 8; row++) {
        position[row] = [];
        for (let col = 0; col < 8; col++) {
            position[row][col] = '';
        }
    }
    
    return position;
}

// Función para crear las casillas del tablero
function createBoardSquares(board) {
    board.squaresElement.innerHTML = '';
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.classList.add('square');
            
            if ((row + col) % 2 === 0) {
                square.classList.add('square-light');
            } else {
                square.classList.add('square-dark');
            }
            
            // Posicionar la casilla
            square.style.top = board.orientation === 'white' ? 
                `${row * 12.5}%` : `${(7 - row) * 12.5}%`;
            square.style.left = board.orientation === 'white' ? 
                `${col * 12.5}%` : `${(7 - col) * 12.5}%`;
            
            // Añadir atributos de datos para filas y columnas
            square.dataset.row = row;
            square.dataset.col = col;
            
            // Añadir evento de clic
            square.addEventListener('click', (e) => {
                handleSquareClick(board, row, col);
            });
            
            board.squaresElement.appendChild(square);
        }
    }
}

// Función para actualizar la posición del tablero
function updateBoardPosition(board, position) {
    // Eliminar todas las piezas existentes
    while (board.piecesElement.firstChild) {
        board.piecesElement.removeChild(board.piecesElement.firstChild);
    }
    
    // Añadir piezas según la posición
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const pieceType = position[row][col];
            
            if (pieceType) {
                const piece = document.createElement('img');
                piece.classList.add('piece');
                piece.src = `img/pieces/png/${pieceType}.png`;
                piece.alt = pieceType;
                piece.draggable = false; // Prevenir el comportamiento de arrastrar predeterminado
                
                // Posicionar la pieza
                piece.style.top = board.orientation === 'white' ? 
                    `${row * 12.5}%` : `${(7 - row) * 12.5}%`;
                piece.style.left = board.orientation === 'white' ? 
                    `${col * 12.5}%` : `${(7 - col) * 12.5}%`;
                
                // Añadir atributos de datos
                piece.dataset.row = row;
                piece.dataset.col = col;
                piece.dataset.type = pieceType;
                
                // Añadir evento de clic
                piece.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    handlePieceClick(board, row, col, piece);
                });
                
                board.piecesElement.appendChild(piece);
            }
        }
    }
}

// Función para manejar el clic en una pieza
function handlePieceClick(board, row, col, pieceElement) {
    // Si ya hay una pieza seleccionada, deseleccionarla
    if (board.selectedPiece) {
        const selectedSquare = board.squaresElement.querySelector('.square-selected');
        if (selectedSquare) {
            selectedSquare.classList.remove('square-selected');
        }
    }
    
    // Seleccionar la pieza actual
    board.selectedPiece = {
        row: row,
        col: col,
        type: board.position[row][col],
        element: pieceElement
    };
    
    // Resaltar la casilla
    const square = board.squaresElement.querySelector(`.square[data-row="${row}"][data-col="${col}"]`);
    if (square) {
        square.classList.add('square-selected');
    }
}

// Función para manejar el clic en una casilla
function handleSquareClick(board, row, col) {
    // Si hay una pieza seleccionada, moverla a esta casilla
    if (board.selectedPiece) {
        movePiece(board, board.selectedPiece.row, board.selectedPiece.col, row, col);
        
        // Deseleccionar la pieza
        board.selectedPiece = null;
        
        // Quitar resaltado de casillas
        const selectedSquare = board.squaresElement.querySelector('.square-selected');
        if (selectedSquare) {
            selectedSquare.classList.remove('square-selected');
        }
    }
    
    // Verificar si es la casilla objetivo para la lección
    const currentStep = document.querySelector('.lesson-step.active');
    if (currentStep && currentStep.dataset.step === '2') {
        // Paso 2: hacer clic en e4
        const targetRow = board.orientation === 'white' ? 4 : 3;
        const targetCol = 4;
        
        if (row === targetRow && col === targetCol) {
            // Avanzar al siguiente paso
            document.getElementById('next-step').click();
            
            // Resaltar la casilla como correcta
            const square = board.squaresElement.querySelector(`.square[data-row="${row}"][data-col="${col}"]`);
            if (square) {
                square.classList.add('square-highlight');
                
                // Quitar resaltado después de 1 segundo
                setTimeout(() => {
                    square.classList.remove('square-highlight');
                }, 1000);
            }
        }
    }
}

// Función para mover una pieza
function movePiece(board, fromRow, fromCol, toRow, toCol) {
    // Actualizar la posición en el modelo
    const pieceType = board.position[fromRow][fromCol];
    board.position[fromRow][fromCol] = '';
    board.position[toRow][toCol] = pieceType;
    
    // Actualizar la posición en el tablero
    updateBoardPosition(board, board.position);
}

// Función para configurar eventos de arrastrar y soltar
function setupDragAndDrop(board) {
    let draggedPiece = null;
    let startX, startY;
    let startRow, startCol;
    
    // Evento de inicio de arrastre
    board.piecesElement.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('piece')) {
            e.preventDefault();
            
            draggedPiece = e.target;
            startX = e.clientX;
            startY = e.clientY;
            
            startRow = parseInt(draggedPiece.dataset.row);
            startCol = parseInt(draggedPiece.dataset.col);
            
            draggedPiece.classList.add('dragging');
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        }
    });
    
    function onMouseMove(e) {
        if (!draggedPiece) return;
        
        e.preventDefault();
        
        // Calcular desplazamiento
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        
        // Mover la pieza
        draggedPiece.style.transform = `translate(${dx}px, ${dy}px)`;
    }
    
    function onMouseUp(e) {
        if (!draggedPiece) return;
        
        e.preventDefault();
        
        // Quitar clase de arrastre
        draggedPiece.classList.remove('dragging');
        draggedPiece.style.transform = '';
        
        // Calcular la casilla de destino
        const boardRect = board.squaresElement.getBoundingClientRect();
        const squareSize = boardRect.width / 8;
        
        const x = e.clientX - boardRect.left;
        const y = e.clientY - boardRect.top;
        
        let col = Math.floor(x / squareSize);
        let row = Math.floor(y / squareSize);
        
        // Ajustar según la orientación del tablero
        if (board.orientation === 'black') {
            row = 7 - row;
            col = 7 - col;
        }
        
        // Verificar si la casilla está dentro del tablero
        if (row >= 0 && row < 8 && col >= 0 && col < 8) {
            // Mover la pieza
            movePiece(board, startRow, startCol, row, col);
            
            // Verificar si es parte de la configuración inicial
            if (document.querySelector('.lesson-step[data-step="4"].active')) {
                checkInitialSetupProgress(board);
            }
        }
        
        // Limpiar
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        draggedPiece = null;
    }
}

// Función para configurar navegación entre pasos de la lección
function setupLessonNavigation(lessonId, board) {
    const lessonSteps = document.querySelectorAll('.lesson-step');
    const totalSteps = lessonSteps.length;
    
    // Actualizar progreso inicial
    updateStepProgress(1, totalSteps);
    
    // Configurar botones de siguiente paso
    const nextStepButtons = document.querySelectorAll('[id^="next-step"]');
    nextStepButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Encontrar el paso actual y el siguiente
            const currentStep = document.querySelector('.lesson-step.active');
            const currentStepNumber = parseInt(currentStep.dataset.step);
            const nextStepNumber = currentStepNumber + 1;
            
            // Ocultar paso actual
            currentStep.classList.remove('active');
            
            // Mostrar siguiente paso
            const nextStep = document.querySelector(`.lesson-step[data-step="${nextStepNumber}"]`);
            if (nextStep) {
                nextStep.classList.add('active');
                
                // Actualizar progreso
                updateStepProgress(nextStepNumber, totalSteps);
                
                // Actualizar tablero según el paso
                updateBoardForStep(board, nextStepNumber);
            }
        });
    });
}

// Función para actualizar el tablero según el paso de la lección
function updateBoardForStep(board, step) {
    // Limpiar tablero
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            board.position[row][col] = '';
        }
    }
    
    switch (step) {
        case 1:
            // Paso 1: Tablero vacío
            updateBoardPosition(board, board.position);
            break;
            
        case 2:
            // Paso 2: Tablero vacío con pista en e4
            updateBoardPosition(board, board.position);
            addHint(board, 4, 4);
            break;
            
        case 3:
            // Paso 3: Posición inicial
            const initialPosition = [
                ['br', 'bn', 'bb', 'bq', 'bk', 'bb', 'bn', 'br'],
                ['bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp'],
                ['', '', '', '', '', '', '', ''],
                ['', '', '', '', '', '', '', ''],
                ['', '', '', '', '', '', '', ''],
                ['', '', '', '', '', '', '', ''],
                ['wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp'],
                ['wr', 'wn', 'wb', 'wq', 'wk', 'wb', 'wn', 'wr']
            ];
            
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    board.position[row][col] = initialPosition[row][col];
                }
            }
            
            updateBoardPosition(board, board.position);
            break;
            
        case 4:
            // Paso 4: Tablero vacío con piezas arrastrables
            updateBoardPosition(board, board.position);
            addDraggablePieces(board);
            break;
            
        case 5:
            // Paso 5: Posición inicial
            const finalPosition = [
                ['br', 'bn', 'bb', 'bq', 'bk', 'bb', 'bn', 'br'],
                ['bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp'],
                ['', '', '', '', '', '', '', ''],
                ['', '', '', '', '', '', '', ''],
                ['', '', '', '', '', '', '', ''],
                ['', '', '', '', '', '', '', ''],
                ['wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp'],
                ['wr', 'wn', 'wb', 'wq', 'wk', 'wb', 'wn', 'wr']
            ];
            
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    board.position[row][col] = finalPosition[row][col];
                }
            }
            
            updateBoardPosition(board, board.position);
            break;
    }
}

// Función para añadir una pista visual en una casilla
function addHint(board, row, col) {
    // Eliminar pistas anteriores
    const hints = board.squaresElement.querySelectorAll('.square-hint');
    hints.forEach(hint => hint.remove());
    
    // Crear elemento de pista
    const hint = document.createElement('div');
    hint.className = 'square-hint';
    
    // Posicionar la pista
    hint.style.top = board.orientation === 'white' ? 
        `${row * 12.5}%` : `${(7 - row) * 12.5}%`;
    hint.style.left = board.orientation === 'white' ? 
        `${col * 12.5}%` : `${(7 - col) * 12.5}%`;
    
    board.squaresElement.appendChild(hint);
}

// Función para añadir piezas arrastrables para la configuración inicial
function addDraggablePieces(board) {
    // Crear contenedor para las piezas arrastrables
    const container = document.createElement('div');
    container.className = 'draggable-pieces-container';
    container.style.position = 'absolute';
    container.style.top = '100%';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.display = 'flex';
    container.style.flexWrap = 'wrap';
    container.style.gap = '10px';
    container.style.padding = '10px';
    container.style.backgroundColor = '#fff';
    container.style.borderRadius = '4px';
    container.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
    container.style.marginTop = '20px';
    
    // Añadir piezas arrastrables
    const pieces = [
        { type: 'wk', count: 1 },
        { type: 'wq', count: 1 },
        { type: 'wr', count: 2 },
        { type: 'wb', count: 2 },
        { type: 'wn', count: 2 },
        { type: 'wp', count: 8 },
        { type: 'bk', count: 1 },
        { type: 'bq', count: 1 },
        { type: 'br', count: 2 },
        { type: 'bb', count: 2 },
        { type: 'bn', count: 2 },
        { type: 'bp', count: 8 }
    ];
    
    pieces.forEach(piece => {
        for (let i = 0; i < piece.count; i++) {
            const pieceElement = document.createElement('img');
            pieceElement.src = `img/pieces/png/${piece.type}.png`;
            pieceElement.alt = piece.type;
            pieceElement.style.width = '40px';
            pieceElement.style.height = '40px';
            pieceElement.style.cursor = 'pointer';
            pieceElement.dataset.type = piece.type;
            
            pieceElement.addEventListener('mousedown', (e) => {
                e.preventDefault();
                
                // Crear una pieza en el tablero
                const boardRect = board.squaresElement.getBoundingClientRect();
                const pieceRect = pieceElement.getBoundingClientRect();
                
                const pieceType = pieceElement.dataset.type;
                
                // Encontrar una casilla vacía para la pieza
                let row = -1;
                let col = -1;
                
                // Determinar la posición según el tipo de pieza
                if (pieceType.charAt(0) === 'w') {
                    // Piezas blancas en las filas 1 y 2
                    if (pieceType === 'wp') {
                        // Peones blancos en la fila 2
                        row = 6;
                    } else {
                        // Otras piezas blancas en la fila 1
                        row = 7;
                    }
                } else {
                    // Piezas negras en las filas 7 y 8
                    if (pieceType === 'bp') {
                        // Peones negros en la fila 7
                        row = 1;
                    } else {
                        // Otras piezas negras en la fila 8
                        row = 0;
                    }
                }
                
                // Encontrar una columna vacía
                for (col = 0; col < 8; col++) {
                    if (!board.position[row][col]) {
                        break;
                    }
                }
                
                if (col < 8) {
                    // Añadir la pieza al tablero
                    board.position[row][col] = pieceType;
                    updateBoardPosition(board, board.position);
                    
                    // Seleccionar la pieza para moverla
                    const newPiece = board.piecesElement.querySelector(`.piece[data-row="${row}"][data-col="${col}"]`);
                    if (newPiece) {
                        handlePieceClick(board, row, col, newPiece);
                    }
                    
                    // Verificar progreso
                    checkInitialSetupProgress(board);
                }
            });
            
            container.appendChild(pieceElement);
        }
    });
    
    board.piecesElement.parentNode.appendChild(container);
}

// Función para verificar el progreso de la configuración inicial
function checkInitialSetupProgress(board) {
    // Posición correcta
    const correctPosition = [
        ['br', 'bn', 'bb', 'bq', 'bk', 'bb', 'bn', 'br'],
        ['bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp'],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp'],
        ['wr', 'wn', 'wb', 'wq', 'wk', 'wb', 'wn', 'wr']
    ];
    
    // Verificar si la posición actual es correcta
    let isCorrect = true;
    let totalPieces = 0;
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (correctPosition[row][col]) {
                totalPieces++;
                
                if (board.position[row][col] !== correctPosition[row][col]) {
                    isCorrect = false;
                }
            }
        }
    }
    
    // Contar piezas colocadas
    let placedPieces = 0;
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (board.position[row][col]) {
                placedPieces++;
            }
        }
    }
    
    // Si todas las piezas están colocadas correctamente, avanzar al siguiente paso
    if (isCorrect && placedPieces === totalPieces) {
        setTimeout(() => {
            document.getElementById('next-step-3').click();
        }, 1000);
    }
}

// Función para actualizar el progreso de los pasos
function updateStepProgress(currentStep, totalSteps) {
    const progressBar = document.querySelector('.progress');
    const progressText = document.querySelector('.progress-text');
    
    if (progressBar && progressText) {
        const progressPercentage = (currentStep / totalSteps) * 100;
        progressBar.style.width = `${progressPercentage}%`;
        progressText.textContent = `${Math.round(progressPercentage)}% completado`;
    }
}

// Función para configurar controles del tablero
function setupBoardControls(board) {
    // Botón de reiniciar
    const resetButton = document.getElementById('reset-board');
    if (resetButton) {
        resetButton.addEventListener('click', () => {
            const currentStep = document.querySelector('.lesson-step.active');
            if (currentStep) {
                const stepNumber = parseInt(currentStep.dataset.step);
                updateBoardForStep(board, stepNumber);
            }
        });
    }
    
    // Botón de girar
    const flipButton = document.getElementById('flip-board');
    if (flipButton) {
        flipButton.addEventListener('click', () => {
            // Cambiar orientación
            board.orientation = board.orientation === 'white' ? 'black' : 'white';
            
            // Actualizar posición
            updateBoardPosition(board, board.position);
        });
    }
    
    // Botón de pista
    const hintButton = document.getElementById('show-hint');
    const hintContent = document.querySelector('.hint-content');
    
    if (hintButton && hintContent) {
        hintButton.addEventListener('click', () => {
            hintContent.classList.toggle('hidden');
        });
    }
}

// Función para configurar quiz
function setupQuiz(lessonId) {
    const submitButton = document.getElementById('submit-quiz');
    if (!submitButton) return;
    
    submitButton.addEventListener('click', () => {
        // Obtener respuestas correctas según la lección
        let correctAnswers;
        
        switch (lessonId) {
            case 1:
                correctAnswers = {
                    q1: 'c', // 64 casillas
                    q2: 'a', // a1
                    q3: 'c'  // 16 piezas
                };
                break;
            case 2:
                correctAnswers = {
                    q1: 'b', // 2 casillas
                    q2: 'a', // en diagonal
                    q3: 'd'  // promoción
                };
                break;
            default:
                correctAnswers = {};
        }
        
        // Verificar respuestas
        let correctCount = 0;
        let totalQuestions = 0;
        
        for (const question in correctAnswers) {
            totalQuestions++;
            const selectedOption = document.querySelector(`input[name="${question}"]:checked`);
            
            if (selectedOption) {
                const options = document.querySelectorAll(`input[name="${question}"]`);
                options.forEach(option => {
                    const optionLabel = option.parentElement;
                    
                    // Quitar clases anteriores
                    optionLabel.classList.remove('correct', 'incorrect');
                    
                    // Añadir clases según la respuesta
                    if (option.value === correctAnswers[question]) {
                        optionLabel.classList.add('correct');
                    } else if (option === selectedOption) {
                        optionLabel.classList.add('incorrect');
                    }
                });
                
                // Contar respuestas correctas
                if (selectedOption.value === correctAnswers[question]) {
                    correctCount++;
                }
            }
        }
        
        // Actualizar texto del botón
        submitButton.textContent = `Resultado: ${correctCount} de ${totalQuestions} correctas`;
        
        // Actualizar progreso si todas las respuestas son correctas
        if (correctCount === totalQuestions) {
            const progressBar = document.querySelector('.progress');
            const progressText = document.querySelector('.progress-text');
            
            if (progressBar && progressText) {
                progressBar.style.width = '100%';
                progressText.textContent = '100% completado';
            }
        }
    });
}

// Función para actualizar progreso de la lección
function updateLessonProgress(lessonId) {
    // Aquí se podría implementar la lógica para guardar el progreso en localStorage o en un servidor
    console.log(`Actualizando progreso de la lección ${lessonId}`);
} 