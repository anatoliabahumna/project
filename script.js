// JavaScript for Class Organizer App

document.addEventListener('DOMContentLoaded', () => {
    console.log('Class Organizer App Initialized');

    // --- Get DOM Elements ---
    const scheduleGrid = document.getElementById('schedule-grid');
    const dueDatesList = document.getElementById('due-dates-list');
    const activitiesList = document.getElementById('activities-list');

    const addScheduleForm = document.getElementById('add-schedule-item-form');
    const addDueDateForm = document.getElementById('add-due-date-form');
    const addActivityForm = document.getElementById('add-activity-form');

    // --- Local Storage Keys ---
    const SCHEDULE_KEY = 'classOrganizer_schedule';
    const DUEDATES_KEY = 'classOrganizer_dueDates';
    const ACTIVITIES_KEY = 'classOrganizer_activities';

    // --- Load Data from Local Storage (with Error Handling) ---
    function loadData(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error(`Error loading data for key "${key}" from localStorage:`, e);
            alert(`Could not load data. LocalStorage might be disabled or full.`);
            return [];
        }
    }

    let scheduleItems = loadData(SCHEDULE_KEY);
    let dueDates = loadData(DUEDATES_KEY);
    let activities = loadData(ACTIVITIES_KEY);

    // --- Save Data to Local Storage (with Error Handling) ---
    function saveData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error(`Error saving data for key "${key}" to localStorage:`, e);
            alert(`Could not save data. LocalStorage might be disabled or full.`);
        }
    }

    // --- Utility Functions ---
    function generateId() {
        return Date.now().toString();
    }

    function formatTime(timeString) {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${minutes} ${ampm}`;
    }
    
    function formatDateTime(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
    }

    // --- Generic Render Function ---
    function renderItems(container, items, itemRenderer) {
        if (!container) return;
        container.innerHTML = ''; // Clear previous content
        items.forEach(item => {
            const element = itemRenderer(item);
            if (element) {
                container.appendChild(element);
            }
        });
    }

    // --- Specific Item Renderers ---
    
    function createScheduleItemElement(item) {
        // This is specific to schedule grid, so it's handled differently
        // We return null here because rendering is done within displaySchedule
        return null; 
    }

    function createDueDateElement(item) {
        const li = document.createElement('li');
        li.classList.add('due-date-item');
        li.innerHTML = `
            <strong>${item.title}</strong> (${item.class})<br>
            Due: ${formatDateTime(item.dueDate)}
            ${item.notes ? `<br><small>${item.notes}</small>` : ''}
            <button class="delete-btn" data-id="${item.id}" data-type="due-date">×</button>
        `;
        return li;
    }

    function createActivityElement(item) {
        const li = document.createElement('li');
        li.classList.add('activity-item');
        li.innerHTML = `
            <strong>${item.name}</strong><br>
            ${formatDateTime(item.date)}
            ${item.notes ? `<br><small>${item.notes}</small>` : ''}
            <button class="delete-btn" data-id="${item.id}" data-type="activity">×</button>
        `;
        return li;
    }

    // --- Functions to Display Data (Using Generic Renderer) ---

    function displaySchedule() {
        if (!scheduleGrid) return;
        scheduleGrid.innerHTML = ''; // Clear previous content

        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayElements = {}; // Store references to day divs

        // Create day columns
        daysOfWeek.forEach(day => {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('schedule-day');
            dayDiv.innerHTML = `<h3>${day}</h3>`;
            scheduleGrid.appendChild(dayDiv);
            dayElements[day] = dayDiv; // Store reference
        });

        // Sort schedule items by start time for consistent ordering within days
        scheduleItems.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

        // Add items to the appropriate day columns
        scheduleItems.forEach(item => {
            item.days?.forEach(day => {
                if (dayElements[day]) {
                    const itemDiv = document.createElement('div');
                    itemDiv.classList.add('schedule-item');
                    
                    const startTimeFormatted = formatTime(item.startTime);
                    const endTimeFormatted = item.endTime ? formatTime(item.endTime) : '';
                    const timeDisplay = endTimeFormatted ? `${startTimeFormatted} - ${endTimeFormatted}` : startTimeFormatted;
                    
                    itemDiv.innerHTML = `
                        ${timeDisplay}<br>
                        <strong>${item.subject}</strong>
                        <button class="delete-btn" data-id="${item.id}" data-type="schedule">×</button>
                    `;
                    dayElements[day].appendChild(itemDiv);
                }
            });
        });
    }

    function displayDueDates() {
        dueDates.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        renderItems(dueDatesList, dueDates, createDueDateElement);
    }

    function displayActivities() {
        activities.sort((a, b) => new Date(a.date) - new Date(b.date));
        renderItems(activitiesList, activities, createActivityElement);
    }

    // --- Handle Clicks (Event Delegation) ---
    function handleListClick(e) {
        if (e.target.classList.contains('delete-btn')) {
            handleDelete(e.target);
        }
    }

    function handleDelete(deleteButton) {
        const id = deleteButton.getAttribute('data-id');
        const type = deleteButton.getAttribute('data-type');

        // Optional: Add a confirmation dialog
        // if (!confirm('Are you sure you want to delete this item?')) {
        //     return;
        // }

        if (type === 'schedule') {
            scheduleItems = scheduleItems.filter(item => item.id !== id);
            saveData(SCHEDULE_KEY, scheduleItems);
            displaySchedule(); // Re-render the specific list
        } else if (type === 'due-date') {
            dueDates = dueDates.filter(item => item.id !== id);
            saveData(DUEDATES_KEY, dueDates);
            displayDueDates(); // Re-render the specific list
        } else if (type === 'activity') {
            activities = activities.filter(item => item.id !== id);
            saveData(ACTIVITIES_KEY, activities);
            displayActivities(); // Re-render the specific list
        }
    }

    // Add delegated event listeners to containers
    scheduleGrid?.addEventListener('click', handleListClick);
    dueDatesList?.addEventListener('click', handleListClick);
    activitiesList?.addEventListener('click', handleListClick);


    // --- Event Listeners for Forms ---

    if (addScheduleForm) {
        addScheduleForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(addScheduleForm);
            const selectedDays = formData.getAll('days');
            
            if (selectedDays.length === 0) {
                alert('Please select at least one day');
                return;
            }
            
            const newItem = {
                id: generateId(),
                days: selectedDays,
                startTime: formData.get('startTime'),
                endTime: formData.get('endTime') || null,
                subject: formData.get('subject')
            };
            
            scheduleItems.push(newItem);
            saveData(SCHEDULE_KEY, scheduleItems);
            displaySchedule();
            addScheduleForm.reset();
        });
    }

    if (addDueDateForm) {
        addDueDateForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(addDueDateForm);
            const newItem = {
                id: generateId(),
                class: formData.get('class'),
                title: formData.get('title'),
                dueDate: formData.get('dueDate'),
                notes: formData.get('notes')
            };
            dueDates.push(newItem);
            saveData(DUEDATES_KEY, dueDates);
            displayDueDates();
            addDueDateForm.reset();
        });
    }

    if (addActivityForm) {
        addActivityForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(addActivityForm);
            const newItem = {
                id: generateId(),
                name: formData.get('name'),
                date: formData.get('date'),
                notes: formData.get('notes')
            };
            activities.push(newItem);
            saveData(ACTIVITIES_KEY, activities);
            displayActivities();
            addActivityForm.reset();
        });
    }

    // --- Data Structure Conversion & ID Ensuring ---
    // (Keep these functions as they handle legacy data and ensure IDs exist)
    function convertOldScheduleData() {
        const needsConversion = scheduleItems.some(item => 
            !item.id || !Array.isArray(item.days) || (item.hasOwnProperty('time') && !item.hasOwnProperty('startTime'))
        );
        
        if (needsConversion) {
            console.log('Converting old schedule data format...');
            scheduleItems = scheduleItems.map(item => {
                if (item.id && Array.isArray(item.days) && item.startTime) return item;
                return {
                    id: item.id || generateId(),
                    days: Array.isArray(item.days) ? item.days : [item.day].filter(Boolean),
                    startTime: item.startTime || item.time, 
                    endTime: item.endTime || null,
                    subject: item.subject
                };
            }).filter(item => item.days && item.days.length > 0 && item.subject); // Ensure converted items are valid
            saveData(SCHEDULE_KEY, scheduleItems);
            console.log('Conversion complete.');
        }
    }

    function ensureItemsHaveIds() {
        let updated = false;
        const updateId = (item) => {
            if (!item.id) {
                updated = true;
                return { ...item, id: generateId() };
            }
            return item;
        };
        
        scheduleItems = scheduleItems.map(updateId);
        dueDates = dueDates.map(updateId);
        activities = activities.map(updateId);
        
        if (updated) {
            console.log('Adding missing IDs to items...');
            saveData(SCHEDULE_KEY, scheduleItems);
            saveData(DUEDATES_KEY, dueDates);
            saveData(ACTIVITIES_KEY, activities);
            console.log('Finished adding missing IDs.');
        }
    }
    
    convertOldScheduleData();
    ensureItemsHaveIds();

    // --- Initial Load ---
    displaySchedule();
    displayDueDates();
    displayActivities();

    // --- Register Service Worker ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js').then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            }, err => {
                console.log('ServiceWorker registration failed: ', err);
            });
        });
    }
}); 