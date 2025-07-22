/**
 * ChessBoard.js - Biblioteca para visualizar tableros de ajedrez
 * Versión simplificada inspirada en chessboard.js
 */

class ChessBoard {
    constructor(containerElement, config) {
        // Configuración por defecto
        this.config = {
            position: 'start',
            orientation: 'white',
            showNotation: true,
            draggable: true,
            dropOffBoard: 'snapback',
            pieceTheme: 'img/pieces/{piece}.svg',
            appearSpeed: 200,
            moveSpeed: 200,
            snapbackSpeed: 50,
            snapSpeed: 30,
            trashSpeed: 100,
            ...config
        };
        
        // Elementos del DOM
        this.containerElement = containerElement;
        this.boardElement = null;
        this.squaresElement = null;
        this.piecesElement = null;
        
        // Estado del tablero
        this.position = {};
        this.orientation = this.config.orientation;
        this.boardState = {};
        this.draggedPiece = null;
        this.draggedPieceSource = null;
        this.draggedPieceElement = null;
        this.squareElements = {};
        this.pieceElements = {};
        
        // Inicializar
        this.init();
    }
    
    // Inicializar el tablero
    init() {
        // Crear elementos del tablero
        this.createBoardElements();
        
        // Configurar eventos
        this.setupEvents();
        
        // Establecer posición inicial
        this.setPosition(this.config.position);
    }
    
    // Crear elementos del tablero
    createBoardElements() {
        // Limpiar contenedor
        this.containerElement.innerHTML = '';
        
        // Crear elemento del tablero
        this.boardElement = document.createElement('div');
        this.boardElement.className = 'chess-board';
        this.containerElement.appendChild(this.boardElement);
        
        // Crear elemento interno del tablero
        const boardInner = document.createElement('div');
        boardInner.className = 'board-inner';
        this.boardElement.appendChild(boardInner);
        
        // Crear elemento para las casillas
        this.squaresElement = document.createElement('div');
        this.squaresElement.className = 'squares';
        boardInner.appendChild(this.squaresElement);
        
        // Crear casillas
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                const squareName = this.getSquareName(row, col);
                
                square.className = 'square';
                square.classList.add((row + col) % 2 === 0 ? 'square-light' : 'square-dark');
                square.dataset.square = squareName;
                
                // Posicionar la casilla
                square.style.top = `${row * 12.5}%`;
                square.style.left = `${col * 12.5}%`;
                square.style.width = '12.5%';
                square.style.height = '12.5%';
                
                this.squaresElement.appendChild(square);
                this.squareElements[squareName] = square;
            }
        }
        
        // Crear elemento para las piezas
        this.piecesElement = document.createElement('div');
        this.piecesElement.className = 'pieces';
        boardInner.appendChild(this.piecesElement);
        
        // Añadir notación si está activada
        if (this.config.showNotation) {
            this.addBoardNotation();
        }
    }
    
    // Añadir notación al tablero
    addBoardNotation() {
        const notationElement = document.createElement('div');
        notationElement.className = 'board-coordinates';
        
        // Notación de columnas (a-h)
        const filesElement = document.createElement('div');
        filesElement.className = 'files';
        
        for (let i = 0; i < 8; i++) {
            const file = document.createElement('span');
            file.textContent = 'abcdefgh'.charAt(i);
            filesElement.appendChild(file);
        }
        
        // Notación de filas (1-8)
        const ranksElement = document.createElement('div');
        ranksElement.className = 'ranks';
        
        for (let i = 0; i < 8; i++) {
            const rank = document.createElement('span');
            rank.textContent = '87654321'.charAt(i);
            ranksElement.appendChild(rank);
        }
        
        notationElement.appendChild(filesElement);
        notationElement.appendChild(ranksElement);
        this.boardElement.appendChild(notationElement);
    }
    
    // Configurar eventos
    setupEvents() {
        if (this.config.draggable) {
            // Eventos de arrastrar y soltar
            this.boardElement.addEventListener('mousedown', this.onMouseDown.bind(this));
            document.addEventListener('mousemove', this.onMouseMove.bind(this));
            document.addEventListener('mouseup', this.onMouseUp.bind(this));
            
            // Prevenir comportamiento predeterminado de arrastrar
            this.boardElement.addEventListener('dragstart', (e) => e.preventDefault());
        }
    }
    
    // Evento de inicio de arrastre
    onMouseDown(e) {
        // Verificar si se hizo clic en una pieza
        if (!e.target.classList.contains('piece')) return;
        
        e.preventDefault();
        
        const square = e.target.dataset.square;
        
        // Guardar información de la pieza arrastrada
        this.draggedPiece = this.position[square];
        this.draggedPieceSource = square;
        this.draggedPieceElement = e.target;
        
        // Estilos para arrastrar
        this.draggedPieceElement.classList.add('dragging');
        
        // Guardar posición inicial del ratón
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
        
        // Guardar posición inicial de la pieza
        const pieceRect = this.draggedPieceElement.getBoundingClientRect();
        this.draggedPieceElement.startX = pieceRect.left;
        this.draggedPieceElement.startY = pieceRect.top;
    }
    
    // Evento de movimiento durante arrastre
    onMouseMove(e) {
        if (!this.draggedPieceElement) return;
        
        e.preventDefault();
        
        // Calcular desplazamiento
        const dx = e.clientX - this.dragStartX;
        const dy = e.clientY - this.dragStartY;
        
        // Mover la pieza
        this.draggedPieceElement.style.transform = `translate(${dx}px, ${dy}px)`;
    }
    
    // Evento de soltar
    onMouseUp(e) {
        if (!this.draggedPieceElement) return;
        
        e.preventDefault();
        
        // Quitar estilos de arrastre
        this.draggedPieceElement.classList.remove('dragging');
        this.draggedPieceElement.style.transform = '';
        
        // Calcular casilla de destino
        const boardRect = this.boardElement.getBoundingClientRect();
        const squareSize = boardRect.width / 8;
        
        const x = e.clientX - boardRect.left;
        const y = e.clientY - boardRect.top;
        
        let row = Math.floor(y / squareSize);
        let col = Math.floor(x / squareSize);
        
        // Ajustar según la orientación
        if (this.orientation === 'black') {
            row = 7 - row;
            col = 7 - col;
        }
        
        const targetSquare = this.getSquareName(row, col);
        
        // Verificar si es un movimiento válido
        if (this.isValidMove(this.draggedPieceSource, targetSquare)) {
            // Realizar el movimiento
            this.move(this.draggedPieceSource, targetSquare);
            
            // Llamar al callback si existe
            if (this.config.onDrop) {
                this.config.onDrop(this.draggedPieceSource, targetSquare, this.draggedPiece);
            }
        } else {
            // Devolver la pieza a su posición original
            this.snapbackPiece(this.draggedPieceElement, this.draggedPieceSource);
        }
        
        // Limpiar estado
        this.draggedPiece = null;
        this.draggedPieceSource = null;
        this.draggedPieceElement = null;
    }
    
    // Devolver una pieza a su posición original
    snapbackPiece(pieceElement, square) {
        // Animación de retorno
        const squareElement = this.squareElements[square];
        const squareRect = squareElement.getBoundingClientRect();
        const pieceRect = pieceElement.getBoundingClientRect();
        
        const dx = squareRect.left - pieceRect.left;
        const dy = squareRect.top - pieceRect.top;
        
        // Aplicar animación
        pieceElement.style.transition = `transform ${this.config.snapbackSpeed}ms`;
        pieceElement.style.transform = `translate(${dx}px, ${dy}px)`;
        
        // Restaurar posición después de la animación
        setTimeout(() => {
            pieceElement.style.transition = '';
            pieceElement.style.transform = '';
            this.updatePosition();
        }, this.config.snapbackSpeed);
    }
    
    // Verificar si un movimiento es válido
    isValidMove(source, target) {
        // Por defecto, permitir cualquier movimiento
        // Las validaciones específicas se hacen en la implementación del juego
        return true;
    }
    
    // Realizar un movimiento
    move(source, target) {
        // Actualizar posición interna
        this.position[target] = this.position[source];
        delete this.position[source];
        
        // Actualizar visualización
        this.updatePosition();
        
        // Llamar al callback si existe
        if (this.config.onChange) {
            this.config.onChange(this.position);
        }
    }
    
    // Establecer posición
    setPosition(position) {
        // Posición inicial
        if (position === 'start') {
            position = {
                a8: 'br', b8: 'bn', c8: 'bb', d8: 'bq', e8: 'bk', f8: 'bb', g8: 'bn', h8: 'br',
                a7: 'bp', b7: 'bp', c7: 'bp', d7: 'bp', e7: 'bp', f7: 'bp', g7: 'bp', h7: 'bp',
                a2: 'wp', b2: 'wp', c2: 'wp', d2: 'wp', e2: 'wp', f2: 'wp', g2: 'wp', h2: 'wp',
                a1: 'wr', b1: 'wn', c1: 'wb', d1: 'wq', e1: 'wk', f1: 'wb', g1: 'wn', h1: 'wr'
            };
        } else if (position === 'empty') {
            position = {};
        } else if (typeof position === 'string') {
            // Convertir FEN a posición
            position = this.fenToPosition(position);
        }
        
        // Actualizar posición interna
        this.position = position;
        
        // Actualizar visualización
        this.updatePosition();
        
        // Llamar al callback si existe
        if (this.config.onChange) {
            this.config.onChange(this.position);
        }
    }
    
    // Actualizar visualización de la posición
    updatePosition() {
        // Limpiar piezas existentes
        this.piecesElement.innerHTML = '';
        this.pieceElements = {};
        
        // Añadir piezas según la posición
        for (const square in this.position) {
            const pieceType = this.position[square];
            this.addPiece(square, pieceType);
        }
    }
    
    // Añadir una pieza al tablero
    addPiece(square, pieceType) {
        const [row, col] = this.getSquareRowCol(square);
        
        // Crear elemento de la pieza
        const pieceElement = document.createElement('img');
        pieceElement.className = `piece piece-${pieceType}`;
        pieceElement.dataset.square = square;
        pieceElement.dataset.piece = pieceType;
        pieceElement.src = `img/pieces/png/${pieceType}.png`;
        pieceElement.alt = pieceType;
        
        // Posicionar la pieza
        const adjustedRow = this.orientation === 'white' ? row : 7 - row;
        const adjustedCol = this.orientation === 'white' ? col : 7 - col;
        
        pieceElement.style.top = `${adjustedRow * 12.5}%`;
        pieceElement.style.left = `${adjustedCol * 12.5}%`;
        pieceElement.style.width = '12.5%';
        pieceElement.style.height = '12.5%';
        
        // Añadir al DOM
        this.piecesElement.appendChild(pieceElement);
        this.pieceElements[square] = pieceElement;
    }
    
    // Cambiar orientación del tablero
    setOrientation(orientation) {
        if (orientation !== 'white' && orientation !== 'black') return;
        
        this.orientation = orientation;
        this.updatePosition();
    }
    
    // Girar el tablero
    flip() {
        this.setOrientation(this.orientation === 'white' ? 'black' : 'white');
    }
    
    // Limpiar el tablero
    clear() {
        this.setPosition('empty');
    }
    
    // Obtener posición actual
    getPosition() {
        return { ...this.position };
    }
    
    // Convertir FEN a posición
    fenToPosition(fen) {
        const position = {};
        const fenParts = fen.split(' ');
        const fenPosition = fenParts[0];
        const rows = fenPosition.split('/');
        
        let row = 0;
        let col = 0;
        
        for (const fenRow of rows) {
            col = 0;
            
            for (const char of fenRow) {
                if ('12345678'.indexOf(char) !== -1) {
                    col += parseInt(char, 10);
                } else {
                    const square = this.getSquareName(row, col);
                    const pieceType = this.fenCharToPieceType(char);
                    position[square] = pieceType;
                    col++;
                }
            }
            
            row++;
        }
        
        return position;
    }
    
    // Convertir posición a FEN
    positionToFen() {
        let fen = '';
        
        for (let row = 0; row < 8; row++) {
            let emptyCount = 0;
            
            for (let col = 0; col < 8; col++) {
                const square = this.getSquareName(row, col);
                const piece = this.position[square];
                
                if (piece) {
                    if (emptyCount > 0) {
                        fen += emptyCount;
                        emptyCount = 0;
                    }
                    fen += this.pieceTypeToFenChar(piece);
                } else {
                    emptyCount++;
                }
            }
            
            if (emptyCount > 0) {
                fen += emptyCount;
            }
            
            if (row < 7) {
                fen += '/';
            }
        }
        
        return fen;
    }
    
    // Convertir carácter FEN a tipo de pieza
    fenCharToPieceType(char) {
        const color = char === char.toUpperCase() ? 'w' : 'b';
        const piece = char.toLowerCase();
        
        return color + piece;
    }
    
    // Convertir tipo de pieza a carácter FEN
    pieceTypeToFenChar(pieceType) {
        const color = pieceType.charAt(0);
        const piece = pieceType.charAt(1);
        
        return color === 'w' ? piece.toUpperCase() : piece;
    }
    
    // Obtener nombre de casilla a partir de fila y columna
    getSquareName(row, col) {
        const file = 'abcdefgh'.charAt(col);
        const rank = '87654321'.charAt(row);
        return file + rank;
    }
    
    // Obtener fila y columna a partir de nombre de casilla
    getSquareRowCol(square) {
        const file = square.charAt(0);
        const rank = square.charAt(1);
        
        const col = 'abcdefgh'.indexOf(file);
        const row = '87654321'.indexOf(rank);
        
        return [row, col];
    }
    
    // Destruir el tablero y limpiar eventos
    destroy() {
        // Limpiar eventos
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onMouseUp);
        
        // Limpiar contenedor
        this.containerElement.innerHTML = '';
        
        // Limpiar referencias
        this.boardElement = null;
        this.squaresElement = null;
        this.piecesElement = null;
        this.position = {};
        this.squareElements = {};
        this.pieceElements = {};
    }
}

// Exportar para uso en navegador o Node.js
if (typeof exports !== 'undefined') {
    exports.ChessBoard = ChessBoard;
} else {
    window.ChessBoard = ChessBoard;
} 