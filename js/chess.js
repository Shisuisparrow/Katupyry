/**
 * Chess.js - Biblioteca para lógica de ajedrez
 * Basada en chess.js (https://github.com/jhlywa/chess.js)
 */

class Chess {
    constructor(fen) {
        // Constantes
        this.EMPTY = -1;
        this.PAWN = 0;
        this.KNIGHT = 1;
        this.BISHOP = 2;
        this.ROOK = 3;
        this.QUEEN = 4;
        this.KING = 5;
        
        this.WHITE = 0;
        this.BLACK = 1;
        
        this.SQUARES = {
            a8: 0, b8: 1, c8: 2, d8: 3, e8: 4, f8: 5, g8: 6, h8: 7,
            a7: 16, b7: 17, c7: 18, d7: 19, e7: 20, f7: 21, g7: 22, h7: 23,
            a6: 32, b6: 33, c6: 34, d6: 35, e6: 36, f6: 37, g6: 38, h6: 39,
            a5: 48, b5: 49, c5: 50, d5: 51, e5: 52, f5: 53, g5: 54, h5: 55,
            a4: 64, b4: 65, c4: 66, d4: 67, e4: 68, f4: 69, g4: 70, h4: 71,
            a3: 80, b3: 81, c3: 82, d3: 83, e3: 84, f3: 85, g3: 86, h3: 87,
            a2: 96, b2: 97, c2: 98, d2: 99, e2: 100, f2: 101, g2: 102, h2: 103,
            a1: 112, b1: 113, c1: 114, d1: 115, e1: 116, f1: 117, g1: 118, h1: 119
        };
        
        this.SQUARE_NAMES = Object.keys(this.SQUARES);
        
        // Estado del juego
        this.board = new Array(128);
        this.kings = { w: this.EMPTY, b: this.EMPTY };
        this.turn = this.WHITE;
        this.castling = { w: 0, b: 0 };
        this.epSquare = this.EMPTY;
        this.halfMoves = 0;
        this.moveNumber = 1;
        this.history = [];
        
        // Cargar posición inicial o FEN
        this.load(fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    }
    
    // Cargar posición desde notación FEN
    load(fen) {
        const tokens = fen.split(/\s+/);
        const position = tokens[0];
        let square = 0;
        
        // Limpiar tablero
        this.board = new Array(128);
        for (let i = 0; i < this.board.length; i++) {
            this.board[i] = null;
        }
        
        // Colocar piezas
        for (let i = 0; i < position.length; i++) {
            const piece = position.charAt(i);
            
            if (piece === '/') {
                square += 8;
            } else if ('12345678'.indexOf(piece) !== -1) {
                square += parseInt(piece, 10);
            } else {
                const color = piece < 'a' ? this.WHITE : this.BLACK;
                const pieceType = this.getPieceType(piece.toLowerCase());
                
                this.board[this.SQUARE_NAMES[square]] = { type: pieceType, color: color };
                
                if (pieceType === this.KING) {
                    this.kings[color === this.WHITE ? 'w' : 'b'] = this.SQUARE_NAMES[square];
                }
                
                square++;
            }
        }
        
        // Turno
        this.turn = tokens[1] === 'w' ? this.WHITE : this.BLACK;
        
        // Enroque
        this.castling = { w: 0, b: 0 };
        if (tokens[2].indexOf('K') !== -1) this.castling.w |= 1;
        if (tokens[2].indexOf('Q') !== -1) this.castling.w |= 2;
        if (tokens[2].indexOf('k') !== -1) this.castling.b |= 1;
        if (tokens[2].indexOf('q') !== -1) this.castling.b |= 2;
        
        // Captura al paso
        this.epSquare = tokens[3] === '-' ? this.EMPTY : this.SQUARES[tokens[3]];
        
        // Contador de medios movimientos
        this.halfMoves = parseInt(tokens[4], 10);
        
        // Número de movimiento
        this.moveNumber = parseInt(tokens[5], 10);
        
        return true;
    }
    
    // Obtener tipo de pieza a partir de su símbolo
    getPieceType(piece) {
        switch (piece.toLowerCase()) {
            case 'p': return this.PAWN;
            case 'n': return this.KNIGHT;
            case 'b': return this.BISHOP;
            case 'r': return this.ROOK;
            case 'q': return this.QUEEN;
            case 'k': return this.KING;
            default: return this.EMPTY;
        }
    }
    
    // Obtener símbolo de pieza
    getPieceSymbol(piece) {
        if (!piece) return '';
        
        const symbols = 'pnbrqk';
        let symbol = symbols[piece.type];
        
        if (piece.color === this.WHITE) {
            symbol = symbol.toUpperCase();
        }
        
        return symbol;
    }
    
    // Convertir a FEN
    fen() {
        let empty = 0;
        let fen = '';
        
        // Posición de las piezas
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const square = i * 16 + j;
                const piece = this.board[square];
                
                if (piece === null) {
                    empty++;
                } else {
                    if (empty > 0) {
                        fen += empty;
                        empty = 0;
                    }
                    fen += this.getPieceSymbol(piece);
                }
            }
            
            if (empty > 0) {
                fen += empty;
                empty = 0;
            }
            
            if (i < 7) {
                fen += '/';
            }
        }
        
        // Turno
        fen += ' ' + (this.turn === this.WHITE ? 'w' : 'b');
        
        // Enroque
        let castling = '';
        if (this.castling.w & 1) castling += 'K';
        if (this.castling.w & 2) castling += 'Q';
        if (this.castling.b & 1) castling += 'k';
        if (this.castling.b & 2) castling += 'q';
        fen += ' ' + (castling || '-');
        
        // Captura al paso
        fen += ' ' + (this.epSquare === this.EMPTY ? '-' : this.algebraic(this.epSquare));
        
        // Contador de medios movimientos y número de movimiento
        fen += ' ' + this.halfMoves + ' ' + this.moveNumber;
        
        return fen;
    }
    
    // Convertir índice interno a notación algebraica
    algebraic(i) {
        const f = i & 15;
        const r = i >> 4;
        return 'abcdefgh'.substring(f, f + 1) + '87654321'.substring(r, r + 1);
    }
    
    // Generar movimientos posibles
    generateMoves(options) {
        const moves = [];
        
        // TODO: Implementar generación de movimientos
        
        return moves;
    }
    
    // Realizar un movimiento
    move(move) {
        // TODO: Implementar movimiento
        
        return null;
    }
    
    // Deshacer el último movimiento
    undo() {
        // TODO: Implementar deshacer
        
        return null;
    }
    
    // Verificar si el rey está en jaque
    inCheck() {
        // TODO: Implementar verificación de jaque
        
        return false;
    }
    
    // Verificar si hay jaque mate
    inCheckmate() {
        // TODO: Implementar verificación de jaque mate
        
        return false;
    }
    
    // Verificar si hay tablas
    inDraw() {
        // TODO: Implementar verificación de tablas
        
        return false;
    }
    
    // Verificar si la posición es válida
    isValid() {
        // TODO: Implementar validación de posición
        
        return true;
    }
    
    // Convertir a notación PGN
    pgn() {
        // TODO: Implementar conversión a PGN
        
        return '';
    }
    
    // Cargar desde notación PGN
    loadPgn(pgn) {
        // TODO: Implementar carga desde PGN
        
        return false;
    }
}

// Exportar para uso en navegador o Node.js
if (typeof exports !== 'undefined') {
    exports.Chess = Chess;
} else {
    window.Chess = Chess;
} 