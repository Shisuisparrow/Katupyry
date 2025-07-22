document.addEventListener('DOMContentLoaded', function() {
    // Mostrar progreso de las lecciones
    updateLessonProgress();
    
    // Actualizar URL al cargar la página
    const urlParams = new URLSearchParams(window.location.search);
    const nivelParam = urlParams.get('nivel');
    
    if (nivelParam) {
        const tabToActivate = document.querySelector(`.level-tab[data-level="${nivelParam}"]`);
        if (tabToActivate) {
            tabToActivate.click();
        }
    }
});

// Función para actualizar el progreso de las lecciones
function updateLessonProgress() {
    // Obtener datos de progreso del almacenamiento local
    const progress = JSON.parse(localStorage.getItem('lessonProgress')) || {
        principiante: {
            completed: [1, 2], // IDs de lecciones completadas
            totalLessons: 6,
        },
        intermedio: {
            completed: [],
            totalLessons: 3,
        },
        avanzado: {
            completed: [],
            totalLessons: 3,
        }
    };
    
    // Actualizar barras de progreso
    Object.keys(progress).forEach(level => {
        const levelData = progress[level];
        const progressBar = document.querySelector(`#${level} .progress`);
        const progressText = document.querySelector(`#${level} .progress-text`);
        
        if (progressBar && progressText) {
            const completedPercentage = (levelData.completed.length / levelData.totalLessons) * 100;
            progressBar.style.width = `${completedPercentage}%`;
            progressText.textContent = `${Math.round(completedPercentage)}% completado`;
        }
    });
    
    // Desbloquear lecciones según el progreso
    const principianteLessons = document.querySelectorAll('#principiante .lesson-card');
    
    principianteLessons.forEach((lesson, index) => {
        // Las primeras 3 lecciones siempre están desbloqueadas
        if (index < 3) {
            lesson.classList.add('unlocked');
            lesson.classList.remove('locked');
            
            const button = lesson.querySelector('.btn');
            if (button) {
                button.classList.remove('disabled');
                button.classList.remove('btn-secondary');
                button.classList.add('btn-primary');
                button.textContent = 'Comenzar';
            }
        } 
        // Las lecciones se desbloquean si se han completado las anteriores
        else if (progress.principiante.completed.includes(index)) {
            lesson.classList.add('unlocked');
            lesson.classList.remove('locked');
            
            const button = lesson.querySelector('.btn');
            if (button) {
                button.classList.remove('disabled');
                button.classList.remove('btn-secondary');
                button.classList.add('btn-primary');
                button.textContent = 'Comenzar';
                button.href = `leccion.html?id=${index + 1}`;
            }
        }
    });
    
    // Desbloquear nivel intermedio si se ha completado el principiante
    if (progress.principiante.completed.length === progress.principiante.totalLessons) {
        const intermedioLessons = document.querySelectorAll('#intermedio .lesson-card');
        
        intermedioLessons.forEach((lesson, index) => {
            if (index === 0 || progress.intermedio.completed.includes(index)) {
                lesson.classList.add('unlocked');
                lesson.classList.remove('locked');
                
                const button = lesson.querySelector('.btn');
                if (button) {
                    button.classList.remove('disabled');
                    button.classList.remove('btn-secondary');
                    button.classList.add('btn-primary');
                    button.textContent = 'Comenzar';
                    button.href = `leccion.html?id=${index + 7}`; // 7 = total de lecciones de principiante + 1
                }
            }
        });
    }
    
    // Desbloquear nivel avanzado si se ha completado el intermedio
    if (progress.intermedio.completed.length === progress.intermedio.totalLessons) {
        const avanzadoLessons = document.querySelectorAll('#avanzado .lesson-card');
        
        avanzadoLessons.forEach((lesson, index) => {
            if (index === 0 || progress.avanzado.completed.includes(index)) {
                lesson.classList.add('unlocked');
                lesson.classList.remove('locked');
                
                const button = lesson.querySelector('.btn');
                if (button) {
                    button.classList.remove('disabled');
                    button.classList.remove('btn-secondary');
                    button.classList.add('btn-primary');
                    button.textContent = 'Comenzar';
                    button.href = `leccion.html?id=${index + 10}`; // 10 = total de lecciones de principiante + intermedio + 1
                }
            }
        });
    }
}

// Función para marcar una lección como completada
function completeLessonAndUpdateProgress(lessonId) {
    // Obtener datos de progreso actuales
    const progress = JSON.parse(localStorage.getItem('lessonProgress')) || {
        principiante: {
            completed: [],
            totalLessons: 6,
        },
        intermedio: {
            completed: [],
            totalLessons: 3,
        },
        avanzado: {
            completed: [],
            totalLessons: 3,
        }
    };
    
    // Determinar a qué nivel pertenece la lección
    let level = 'principiante';
    if (lessonId > 6 && lessonId <= 9) {
        level = 'intermedio';
        lessonId -= 6; // Ajustar ID para el nivel
    } else if (lessonId > 9) {
        level = 'avanzado';
        lessonId -= 9; // Ajustar ID para el nivel
    }
    
    // Añadir la lección a las completadas si no está ya
    if (!progress[level].completed.includes(lessonId)) {
        progress[level].completed.push(lessonId);
        progress[level].completed.sort((a, b) => a - b); // Ordenar IDs
        
        // Guardar progreso actualizado
        localStorage.setItem('lessonProgress', JSON.stringify(progress));
    }
    
    return progress;
} 