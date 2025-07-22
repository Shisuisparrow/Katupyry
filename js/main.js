document.addEventListener('DOMContentLoaded', function() {
    // Menú móvil
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const menu = document.querySelector('.menu');
    const authButtons = document.querySelector('.auth-buttons');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            menu.classList.toggle('active');
            authButtons.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
        });
    }
    
    // Testimonios slider
    const testimonialDots = document.querySelectorAll('.testimonial-dots .dot');
    const testimonials = document.querySelectorAll('.testimonial');
    
    if (testimonialDots.length > 0 && testimonials.length > 0) {
        testimonialDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                // Ocultar todos los testimonios
                testimonials.forEach(testimonial => {
                    testimonial.style.display = 'none';
                });
                
                // Mostrar el testimonio seleccionado
                testimonials[index].style.display = 'block';
                
                // Actualizar dots activos
                testimonialDots.forEach(d => d.classList.remove('active'));
                dot.classList.add('active');
            });
        });
        
        // Slider automático
        let currentTestimonial = 0;
        
        function nextTestimonial() {
            testimonials.forEach(testimonial => {
                testimonial.style.display = 'none';
            });
            
            currentTestimonial = (currentTestimonial + 1) % testimonials.length;
            testimonials[currentTestimonial].style.display = 'block';
            
            testimonialDots.forEach(d => d.classList.remove('active'));
            testimonialDots[currentTestimonial].classList.add('active');
        }
        
        // Cambiar testimonio cada 5 segundos
        setInterval(nextTestimonial, 5000);
    }
    
    // Animación de elementos al hacer scroll
    function animateOnScroll() {
        const elements = document.querySelectorAll('.feature-card, .path-card, .resource-card');
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('fade-in');
            }
        });
    }
    
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll();
    
    // Tablero de ajedrez animado en la página de inicio
    const chessboardAnimated = document.querySelector('.chess-board-animated');
    
    if (chessboardAnimated) {
        // Crear tablero
        createAnimatedChessboard(chessboardAnimated);
    }
    
    // Tabs en la página de aprendizaje
    const levelTabs = document.querySelectorAll('.level-tab');
    const levelContents = document.querySelectorAll('.level-content');
    
    if (levelTabs.length > 0 && levelContents.length > 0) {
        levelTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const level = tab.getAttribute('data-level');
                
                // Actualizar tabs activos
                levelTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Mostrar contenido correspondiente
                levelContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === level) {
                        content.classList.add('active');
                    }
                });
                
                // Actualizar URL sin recargar la página
                const url = new URL(window.location);
                url.searchParams.set('nivel', level);
                window.history.pushState({}, '', url);
            });
        });
        
        // Verificar si hay un nivel en la URL
        const urlParams = new URLSearchParams(window.location.search);
        const nivelParam = urlParams.get('nivel');
        
        if (nivelParam) {
            const tabToActivate = document.querySelector(`.level-tab[data-level="${nivelParam}"]`);
            if (tabToActivate) {
                tabToActivate.click();
            }
        }
    }
});

// Función para crear un tablero de ajedrez animado
function createAnimatedChessboard(container) {
    // Crear tablero
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.classList.add('square');
            
            if ((row + col) % 2 === 0) {
                square.classList.add('square-light');
            } else {
                square.classList.add('square-dark');
            }
            
            square.style.top = `${row * 12.5}%`;
            square.style.left = `${col * 12.5}%`;
            
            container.appendChild(square);
        }
    }
    
    // Posición inicial animada
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
    
    // Colocar piezas con animación
    setTimeout(() => {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const pieceType = initialPosition[row][col];
                
                if (pieceType) {
                    const piece = document.createElement('div');
                    piece.classList.add('piece', `piece-${pieceType}`);
                    piece.style.top = `${row * 12.5}%`;
                    piece.style.left = `${col * 12.5}%`;
                    
                    // Añadir con retraso para crear efecto de animación
                    setTimeout(() => {
                        container.appendChild(piece);
                        piece.classList.add('piece-animated');
                    }, (row * 8 + col) * 50);
                }
            }
        }
    }, 500);
    
    // Animación de movimientos
    setTimeout(() => {
        // Ejemplo de movimiento: e2-e4 (peón blanco)
        const pawnE2 = container.querySelector('.piece-wp[style*="top: 87.5%"][style*="left: 50%"]');
        if (pawnE2) {
            pawnE2.style.top = '50%';
        }
        
        // Ejemplo de movimiento: respuesta e7-e5 (peón negro)
        setTimeout(() => {
            const pawnE7 = container.querySelector('.piece-bp[style*="top: 12.5%"][style*="left: 50%"]');
            if (pawnE7) {
                pawnE7.style.top = '50%';
            }
        }, 1000);
        
        // Ejemplo de movimiento: Caballo g1-f3
        setTimeout(() => {
            const knightG1 = container.querySelector('.piece-wn[style*="top: 87.5%"][style*="left: 87.5%"]');
            if (knightG1) {
                knightG1.style.top = '62.5%';
                knightG1.style.left = '75%';
            }
        }, 2000);
        
        // Ejemplo de movimiento: Caballo b8-c6
        setTimeout(() => {
            const knightB8 = container.querySelector('.piece-bn[style*="top: 12.5%"][style*="left: 12.5%"]');
            if (knightB8) {
                knightB8.style.top = '37.5%';
                knightB8.style.left = '25%';
            }
        }, 3000);
        
        // Reiniciar animación
        setTimeout(() => {
            createAnimatedChessboard(container);
        }, 6000);
    }, 3000);
} 