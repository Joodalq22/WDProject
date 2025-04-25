// script.js - Complete consolidated JavaScript for PomoAid

// ==================== NAVBAR FUNCTIONS ====================
function initNavbarFeatures() {
    initStreakCounter();
    highlightActiveLink();
    setupTooltips();
}

function initStreakCounter() {
    const flameStreak = document.querySelector('.flame-streak');
    if (!flameStreak) return;
    
    let currentStreak = parseInt(localStorage.getItem('pomoaid-streak')) || 0;
    flameStreak.setAttribute('data-tooltip', `${currentStreak} day streak`);
    
    window.incrementStreak = function() {
        const now = new Date();
        const lastVisit = localStorage.getItem('pomoaid-last-visit');
        
        if (lastVisit) {
            const daysSinceLastVisit = Math.floor((now - new Date(lastVisit)) / (1000 * 60 * 60 * 24));
            if (daysSinceLastVisit > 1) {
                currentStreak = 0;
            }
        }
        
        const today = now.toDateString();
        if (localStorage.getItem('pomoaid-last-increment') !== today) {
            currentStreak++;
            localStorage.setItem('pomoaid-streak', currentStreak);
            localStorage.setItem('pomoaid-last-increment', today);
            flameStreak.setAttribute('data-tooltip', `${currentStreak} day streak`);
            celebrateStreak(currentStreak);
        }
        
        localStorage.setItem('pomoaid-last-visit', now.toString());
    };
}

function highlightActiveLink() {
    const currentPath = window.location.pathname.split('/').pop() || 'welcome_page.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        const linkPath = link.getAttribute('href');
        if (linkPath === currentPath || 
            (currentPath === '' && linkPath === 'welcome_page.html')) {
            link.classList.add('active');
            const underline = link.querySelector('.link-underline');
            if (underline) underline.style.width = '100%';
        }
    });
}

function setupTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    tooltipElements.forEach(el => {
        el.addEventListener('mouseenter', showTooltip);
        el.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(e) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = this.getAttribute('data-tooltip');
    document.body.appendChild(tooltip);
    
    const rect = this.getBoundingClientRect();
    tooltip.style.left = `${rect.left + rect.width/2 - tooltip.offsetWidth/2}px`;
    tooltip.style.top = `${rect.bottom + 5}px`;
}

function hideTooltip() {
    const tooltip = document.querySelector('.tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

function celebrateStreak(streak) {
    if (streak % 5 === 0) {
        const flames = document.querySelectorAll('.flame');
        flames.forEach(flame => {
            flame.style.animation = 'bigFlicker 0.5s 3';
            setTimeout(() => {
                flame.style.animation = 'flicker 3s ease-in-out infinite alternate';
            }, 1500);
        });
    }
}

// ==================== POMODORO TIMER ====================
let workTime;
let breakTime;
let timerInterval;
let isWorkTime = true;
let isPaused = true;

function initializeTimer() {
    workTime = parseInt(document.getElementById("work-time").value) * 60;
    breakTime = parseInt(document.getElementById("break-time").value) * 60;
    updateDisplay();
}

function updateDisplay() {
    const time = isWorkTime ? workTime : breakTime;
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    document.getElementById("pomodoro-minutes").textContent = String(minutes).padStart(2, '0');
    document.getElementById("pomodoro-seconds").textContent = String(seconds).padStart(2, '0');
}

function updateTimer() {
    if (isWorkTime) {
        workTime--;
    } else {
        breakTime--;
    }

    updateDisplay();

    if ((isWorkTime && workTime === 0) || (!isWorkTime && breakTime === 0)) {
        clearInterval(timerInterval);
        if (isWorkTime) {
            isWorkTime = false;
            workTime = parseInt(document.getElementById("work-time").value) * 60;
            document.getElementById("pomodoro-status").textContent = 'Break Time!';
        } else {
            isWorkTime = true;
            breakTime = parseInt(document.getElementById("break-time").value) * 60;
            document.getElementById("pomodoro-status").textContent = 'Work Time!';
        }
        
        timerInterval = setInterval(updateTimer, 1000);
        isPaused = false;
    }
}

function startTimer() {
    if (isPaused) {
        timerInterval = setInterval(updateTimer, 1000);
        isPaused = false;
    }
}

function pauseTimer() {
    clearInterval(timerInterval);
    isPaused = true;
    document.getElementById("start").disabled = false;
    document.getElementById("pause").disabled = true;
}

function resetTimer() {
    clearInterval(timerInterval);
    initializeTimer();
    isWorkTime = true;
    isPaused = true;
    document.getElementById("pomodoro-status").textContent = 'Work Time!';
    document.getElementById("start").disabled = false;
    document.getElementById("pause").disabled = false;
}

// ==================== TODO LIST ====================
function dragElement(el) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    el.style.position = 'absolute'; 
    el.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        if (e.target.tagName === "INPUT" || e.target.tagName === "BUTTON" || e.target.tagName === "TEXTAREA") return;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        el.style.top = (el.offsetTop - pos2) + "px";
        el.style.left = (el.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function createNewTodoList() {
    const todoListsContainer = document.getElementById("todoListsContainer");
    const newTodoContainer = document.createElement("div");
    newTodoContainer.className = "todo-container";
    newTodoContainer.style.position = "absolute";
    newTodoContainer.style.left = "100px";
    newTodoContainer.style.top = "100px";
    newTodoContainer.style.zIndex = 1000;

    const todoTitle = document.createElement("h3");
    todoTitle.innerHTML = 'To-Do List <i class="fas fa-trash delete-list-icon" style="cursor: pointer; color: #E06712;"></i>';
    newTodoContainer.appendChild(todoTitle);

    const todoList = document.createElement("ul");
    todoList.className = "todo-list";
    newTodoContainer.appendChild(todoList);

    const addTodo = document.createElement("div");
    addTodo.className = "add-todo";
    
    const todoInput = document.createElement("input");
    todoInput.type = "text";
    todoInput.placeholder = "Add a new task...";
    addTodo.appendChild(todoInput);
    
    const addTodoBtn = document.createElement("button");
    addTodoBtn.innerText = "Add";
    addTodoBtn.addEventListener("click", function() {
        const taskText = todoInput.value.trim();
        if (taskText) {
            const listItem = document.createElement("li");
            listItem.innerHTML = `
                <input type="checkbox"> 
                <span>${taskText}</span>
                <button class="edit-btn"><i class="fas fa-edit"></i></button>
                <button class="delete-btn"><i class="fas fa-trash"></i></button>
            `;
            todoList.appendChild(listItem);
            todoInput.value = '';

            listItem.querySelector('.edit-btn').addEventListener('click', function() {
                const currentText = listItem.querySelector('span').innerText;
                const newText = prompt("Edit task:", currentText);
                if (newText) {
                    listItem.querySelector('span').innerText = newText;
                }
            });

            listItem.querySelector('.delete-btn').addEventListener('click', function() {
                todoList.removeChild(listItem);
            });
        } else {
            alert("Please enter a task.");
        }
    });
    addTodo.appendChild(addTodoBtn);

    todoTitle.querySelector('.delete-list-icon').addEventListener('click', function() {
        todoListsContainer.removeChild(newTodoContainer);
    });

    newTodoContainer.appendChild(addTodo);
    todoListsContainer.appendChild(newTodoContainer);
    todoInput.focus();

    dragElement(newTodoContainer);
}

// ==================== MAIN PAGE FUNCTIONALITY ====================
function updatePlaylist() {
    const url = document.getElementById("playlistURL").value;
    const match = url.match(/(playlist|album|track)\/([a-zA-Z0-9]+)/);
    
    if (match) {
        const type = match[1];
        const id = match[2];
        const embedURL = `https://open.spotify.com/embed/${type}/${id}`;
        document.getElementById("spotifyPlayer").src = embedURL;
    } else {
        alert("Please enter a valid Spotify playlist, album, or track URL.");
    }
}

function setupAmbientSounds() {
    document.querySelectorAll('.ambient-slider').forEach(slider => {
        slider.addEventListener('input', function() {
            let sound = document.getElementById('audio' + this.id.charAt(0).toUpperCase() + this.id.slice(1));
            sound.volume = this.value;
            if (this.value > 0 && sound.paused) sound.play();
            else if (this.value == 0) sound.pause();
        });
    });
}


function setupBackgroundControls() {
    // Get all elements
    const videoBackgrounds = {
        studyWithMe: document.getElementById("videoBackground"),
        anime: document.getElementById("videoBackground1"),
        library: document.getElementById("videoBackground2"),
        cafe: document.getElementById("videoBackground3"),
        city: document.getElementById("videoBackground4")
    };

    const defaultBg = "url('defultBackground.jpg')"; // Default background from your CSS

    // Hide all videos and reset to default background
    function resetToDefault() {
        document.body.style.backgroundImage = defaultBg;
        for (const key in videoBackgrounds) {
            if (videoBackgrounds[key]) {
                videoBackgrounds[key].style.display = "none";
            }
        }
    }

    // Set up event listeners
    document.getElementById("StudywithMeBtn").addEventListener("click", function() {
        resetToDefault();
        videoBackgrounds.studyWithMe.style.display = "block";
    });

    document.getElementById("animeBtn").addEventListener("click", function() {
        resetToDefault();
        videoBackgrounds.anime.style.display = "block";
    });

    document.getElementById("libraryBtn").addEventListener("click", function() {
        resetToDefault();
        document.body.style.backgroundImage = "none";
        videoBackgrounds.library.style.display = "block";
    });

    document.getElementById("cafeBtn").addEventListener("click", function() {
        resetToDefault();
        document.body.style.backgroundImage = "none";
        videoBackgrounds.cafe.style.display = "block";
    });

    document.getElementById("cityBtn").addEventListener("click", function() {
        resetToDefault();
        document.body.style.backgroundImage = "none";
        videoBackgrounds.city.style.display = "block";
    });

    // Initialize with default background
    resetToDefault();
}
function setupPomodoroWidget() {
    const pomodoroWidget = document.getElementById("pomodoroWidget");
    const closeWidget = document.getElementById("closeWidget");
    let isDragging = false;
    let offsetX, offsetY;

    pomodoroWidget.addEventListener("mousedown", function(e) {
        if (e.target === closeWidget) return;
        isDragging = true;
        offsetX = e.clientX - pomodoroWidget.getBoundingClientRect().left;
        offsetY = e.clientY - pomodoroWidget.getBoundingClientRect().top;
        pomodoroWidget.style.cursor = "grabbing";
    });

    document.addEventListener("mousemove", function(e) {
        if (isDragging) {
            pomodoroWidget.style.left = `${e.clientX - offsetX}px`;
            pomodoroWidget.style.top = `${e.clientY - offsetY}px`;
        }
    });

    document.addEventListener("mouseup", function() {
        isDragging = false;
        pomodoroWidget.style.cursor = "grab";
    });
}

// ==================== INITIALIZATION ====================
document.addEventListener("DOMContentLoaded", function() {
    // Create navbar
    const navbarContainer = document.createElement('div');
    navbarContainer.id = 'navbar-container';
    document.body.prepend(navbarContainer);

    const navbarHTML = `
    <header class="creative-nav">
        <nav class="navbar">
            <div class="logo-container">
                <img src="logo.png" class="spin-on-hover" height="50" width="50" alt="PomoAid Logo">
                <div class="logo-pulse"></div>
            </div>
            
            <div class="nav-links-container">
                <div class="nav-links">
                    <a href="welcome_page.html" class="nav-link">
                        <span class="link-icon"><i class="fas fa-home"></i></span>
                        <span class="link-text">Home</span>
                        <div class="link-underline"></div>
                    </a>
                    <a href="mainPage.html" class="nav-link">
                        <span class="link-icon">⚙️</span>
                        <span class="link-text">Get Working</span>
                        <div class="link-underline"></div>
                    </a>
                    <a href="AboutUs.html" class="nav-link">
                        <span class="link-icon"><i class="fas fa-book"></i></span>
                        <span class="link-text">About Us</span>
                        <div class="link-underline"></div>
                    </a>
                    <a href="ConntactUS.html" class="nav-link">
                        <span class="link-icon">✉️</span>
                        <span class="link-text">Contact Us</span>
                        <div class="link-underline"></div>
                    </a>
                </div>
            </div>
            
            <div class="flame-streak" data-tooltip="0 day streak">
                <div class="flame"></div>
                <div class="flame"></div>
                <div class="flame"></div>
            </div>
        </nav>
    </header>`;
    
    navbarContainer.innerHTML = navbarHTML;
    initNavbarFeatures();

    // Sidebar toggle
    const sidebar = document.getElementById("sidebar");
    const toggleBtn = document.getElementById("toggleBtn");
    
    toggleBtn.addEventListener("click", function() {
        sidebar.classList.toggle("closed");
        toggleBtn.innerHTML = sidebar.classList.contains("closed") 
            ? '<i class="fas fa-bars"></i>' 
            : '<i class="fas fa-times"></i>';
    });

    // Pomodoro timer toggle
    document.getElementById("timerToggleBtn").addEventListener("click", function() {
        const pomodoroWidget = document.getElementById("pomodoroWidget");
        pomodoroWidget.style.display = pomodoroWidget.style.display === "none" ? "block" : "none";
    });

    // Initialize components
    initializeTimer();
    setupAmbientSounds();
    setupBackgroundControls();
    setupPomodoroWidget();

    // Event listeners for pomodoro timer
    document.getElementById("work-time").addEventListener("input", resetTimer);
    document.getElementById("break-time").addEventListener("input", resetTimer);
    document.getElementById("start").addEventListener("click", startTimer);
    document.getElementById("pause").addEventListener("click", pauseTimer);
    document.getElementById("reset").addEventListener("click", resetTimer);

    // Todo list button
    document.getElementById("newTodoListBtn").addEventListener("click", createNewTodoList);

    // Close widget button
    document.getElementById("closeWidget").addEventListener("click", function() {
        document.getElementById("pomodoroWidget").style.display = "none";
    });
});