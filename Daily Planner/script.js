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

const mostRecentInputValues = [];


const state = {
    hours: 8,
    minutes: 0,

    scrollAccumulator: 0,
    id: 0,
};


const plannerAppearanceElements = {
    mainWidth: 352,

    //Planner
    height: 512,
    borderRadius: 8,
    border: "1px solid hsl(0, 0%, 15%)",

};


const plannerUICommands = {
    width(value) {
        if (value < 352) {
            console.log("Min width is 352px");
            return;
        }
        if (value > window.innerWidth) {
            console.log("Too big for screen");
            return;
        }

        elements.mainContainer.style.width = value + "px";
    },

    color(value) {
        document.body.style.color = value;
    },

    borderRadius(value) {
        elements.plannerContainer.style.borderRadius = value + "px";
    },

    borderColor(value) {
        elements.plannerContainer.style.borderColor = value;
    }
};



//===================================================
// 3. EVENT LISTENERS
//===================================================
document.addEventListener("keydown", handleKeyonWholePage);

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

    mostRecentInputValues.push(value);

    if (mostRecentInputValues.length > 10) {
        mostRecentInputValues.shift();
    }

    elements.input.value = "";
    console.log(mostRecentInputValues);
}


function handleKeyonWholePage(event) {
    if (event.ctrlKey && event.key.toLowerCase() === "z") {
        event.preventDefault();

        if (mostRecentInputValues.length > 0) {
            const undoIndex = mostRecentInputValues.length - 1;

            elements.input.value = mostRecentInputValues[undoIndex];
            mostRecentInputValues.pop();
        } else {
            elements.input.value = "";
        }
    }
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

        //PLANNER UI
        case "width":
            plannerUI(command, parts);
            break;

        case "color":
            plannerUI(command, parts);
            break;

        case "borderRadius":
            plannerUI(command, parts);
            break;

        case "borderColor":
            plannerUI(command, parts);
            break;
    

        default:
            console.log("Usage: example; /add, clear - NOT / add, clear");
            console.log("")
            console.log("Use ex. border radius like this: borderRadius")
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



function plannerUI(command, parts) {
    const value = parts[1];

    if (!value) {
        console.log("Missing value");
        return;
    }

    const findCommand = plannerUICommands[command];

    if (!findCommand) {
        console.log("Unknown UI command");
        return;
    }

    findCommand(value);
}



//===================================================
// 8. INIT
//===================================================

updateDisplay();