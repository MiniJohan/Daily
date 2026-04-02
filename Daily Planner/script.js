// ==================================================
// DAILY PLANNER (CLEAN STRUCTURE)
// ==================================================



// ==================================================
// 1. DOM ELEMENTS
// ==================================================


const elements = {
    timeSelector: document.getElementById("time-selector"),
    input: document.getElementById("input"),
    mainContainer: document.getElementById("main-container"),
    plannerContainer: document.getElementById("planner-container"),
    plannerView: document.getElementById("planner-view"),
    timeView: document.getElementById("time-view"),
};




//===================================================
// 2. STATES
//===================================================

const state = {
    hours: 9,
    minutes: 0,

    scrollAccumulator: 0,
    id: 0,
};


//===================================================
// 3. EVENT LISTENERS
//===================================================

elements.timeSelector.addEventListener("wheel", handleTimeScroll);

elements.input.addEventListener("keydown", handleCommandKeydown);



//===================================================
// 4. EVENT HANDLERS
//===================================================

function handleTimeScroll(event) {
    event.preventDefault();

    state.scrollAccumulator += event.deltaY;
    const threshold = 48;

    if (state.scrollAccumulator > threshold) {
        adjustTime(event, 1);
        state.scrollAccumulator = 0;

    } else if (state.scrollAccumulator < -threshold) {
        adjustTime(event, -1);
        state.scrollAccumulator = 0;
    }

    updateDisplay();
}

function handleCommandKeydown(event) {
    if (event.key !== "Enter") return;

    const value = elements.input.value.trim();

    if (!value) return;
    
    if (value.startsWith("/")) {
        handleCommand(value);
    } else {
        createEvent(getCurrentTime(), value);
    }

    elements.input.value = "";
}


//===================================================
// 5. COMMAND SYSTEM
//===================================================

function handleCommand(raw) {
    const parts = raw.slice(1).split(" ");
    const command = parts[0];

    switch (command) {
        case "clear":
            clearEvents();
            break;
        
        case "add":
            const time = parts[1];
            const text = parts.slice(2).join(" ");

            if (isValidTime(time) && text) {
                createEvent(time, text);
            } else {
                console.log("INVALID /ADD USAGE");
            }
            break;
        
        default:
            console.log("Usage: /add HH:MM text");
    }
}

//===================================================
// 6. TIME LOGIC
//===================================================

function adjustTime(event, direction) {
    if (event.shiftKey) {
        state.hours = (state.hours + direction + 24) % 24;
    } else {
        state.minutes += direction * (event.ctrlKey ? 1 : 5);

        if (state.minutes >= 60) {
            state.minutes -= 60;
            state.hours = (state.hours + 1) % 24;
        }

        if (state.minutes < 0) {
            state.minutes += 60;
            state.hours = (state.hours - 1 + 24) % 24;
        }
    }
}


function getCurrentTime() {
    return `${pad(state.hours)}:${pad(state.minutes)}`;
}

function pad(n) {
    return n.toString().padStart(2, "0");
}

function isValidTime(time) {
    return /^([01]?\d|2[0-3]):[0-5]\d$/.test(time);
}

function toMinutes(time) {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
}


//===================================================
// 7. UI FUNCTIONS
//===================================================

function updateDisplay() {
    elements.timeSelector.innerHTML = getCurrentTime();
}

function createEvent(time, text) {
    state.id++;

    // EVENT
    const eventDiv = document.createElement("input");
    eventDiv.className = "event";
    eventDiv.id = "event" + state.id;
    eventDiv.value = text;

    // TIME
    const timeDiv = document.createElement("div");
    timeDiv.className = "time";
    timeDiv.id = "time" + state.id;
    timeDiv.innerHTML = time;

    //CONTAINERS
    const eventContainer = document.createElement("div");
    eventContainer.className = "newEventContainer";

    const timeContainer = document.createElement("div");
    timeContainer.className = "newTimeContainer";

    eventContainer.appendChild(eventDiv);
    timeContainer.appendChild(timeDiv);

    elements.plannerView.appendChild(eventContainer);
    elements.timeView.appendChild(timeContainer);

    sortEvents();
}



function clearEvents() {
    elements.plannerView.innerHTML = "";
    elements.timeView.innerHTML = "";
}



function sortEvents() {
    const times = Array.from(elements.timeView.children);
    const events = Array.from(elements.plannerView.children);

    const combined = times.map((t, i) => ({
        time: toMinutes(t.innerText),
        timeDiv: t,
        eventDiv: events[i],
    }));

    combined.sort((a, b) => a.time - b.time);

    combined.forEach(item => {
        elements.timeView.appendChild(item.timeDiv);
        elements.plannerView.appendChild(item.eventDiv);
    });
}

//===================================================
// 8. INIT
//===================================================

updateDisplay();