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

    // --- Load Data from Local Storage ---
    function loadData(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    }

    let scheduleItems = loadData(SCHEDULE_KEY);
    let dueDates = loadData(DUEDATES_KEY);
    let activities = loadData(ACTIVITIES_KEY);

    // --- Save Data to Local Storage ---
    function saveData(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    // --- Utility Functions ---
    
    // Generate a unique ID for items
    function generateId() {
        return Date.now().toString();
    }
    
    // Format time from 24h to 12h format with AM/PM
    function formatTime(timeString) {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${minutes} ${ampm}`;
    }

    // --- Functions to Display Data ---

    function displaySchedule() {
        if (!scheduleGrid) return;
        scheduleGrid.innerHTML = ''; // Clear previous content

        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        // Create day columns
        daysOfWeek.forEach(day => {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('schedule-day');
            dayDiv.innerHTML = `<h3>${day}</h3>`;
            scheduleGrid.appendChild(dayDiv);

            // For each schedule item
            scheduleItems.forEach(item => {
                // Check if this item occurs on this day
                if (item.days && item.days.includes(day)) {
                    const itemDiv = document.createElement('div');
                    itemDiv.classList.add('schedule-item');
                    
                    // Format the display text
                    const startTimeFormatted = formatTime(item.startTime);
                    const endTimeFormatted = item.endTime ? formatTime(item.endTime) : '';
                    const timeDisplay = endTimeFormatted 
                        ? `${startTimeFormatted} - ${endTimeFormatted}` 
                        : startTimeFormatted;
                    
                    itemDiv.innerHTML = `
                        ${timeDisplay}<br>
                        ${item.subject}
                        <button class="delete-btn" data-id="${item.id}" data-type="schedule">×</button>
                    `;
                    dayDiv.appendChild(itemDiv);
                }
            });
        });

        // Add event listeners for delete buttons
        document.querySelectorAll('.delete-btn[data-type="schedule"]').forEach(btn => {
            btn.addEventListener('click', handleDelete);
        });
    }

    function displayDueDates() {
        if (!dueDatesList) return;
        dueDatesList.innerHTML = ''; // Clear previous content
        
        // Sort by due date
        dueDates.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

        dueDates.forEach(item => {
            const li = document.createElement('li');
            li.classList.add('due-date-item');
            
            // Format the date and time
            const dueDate = new Date(item.dueDate);
            const formattedDate = dueDate.toLocaleString([], { 
                dateStyle: 'medium', 
                timeStyle: 'short' 
            });
            
            li.innerHTML = `
                <strong>${item.title}</strong> (${item.class})<br>
                Due: ${formattedDate}
                ${item.notes ? `<br><small>${item.notes}</small>` : ''}
                <button class="delete-btn" data-id="${item.id}" data-type="due-date">×</button>
            `;
            dueDatesList.appendChild(li);
        });

        // Add event listeners for delete buttons
        document.querySelectorAll('.delete-btn[data-type="due-date"]').forEach(btn => {
            btn.addEventListener('click', handleDelete);
        });
    }

    function displayActivities() {
        if (!activitiesList) return;
        activitiesList.innerHTML = ''; // Clear previous content
        
        // Sort by date
        activities.sort((a, b) => new Date(a.date) - new Date(b.date));

        activities.forEach(item => {
            const li = document.createElement('li');
            li.classList.add('activity-item');
            
            // Format date/time for better display
            const dateTime = new Date(item.date);
            const formattedDate = dateTime.toLocaleString([], { 
                dateStyle: 'medium', 
                timeStyle: 'short' 
            });
            
            li.innerHTML = `
                <strong>${item.name}</strong><br>
                ${formattedDate}
                ${item.notes ? `<br><small>${item.notes}</small>` : ''}
                <button class="delete-btn" data-id="${item.id}" data-type="activity">×</button>
            `;
            activitiesList.appendChild(li);
        });

        // Add event listeners for delete buttons
        document.querySelectorAll('.delete-btn[data-type="activity"]').forEach(btn => {
            btn.addEventListener('click', handleDelete);
        });
    }

    // --- Delete Item Handler ---
    function handleDelete(e) {
        const id = e.target.getAttribute('data-id');
        const type = e.target.getAttribute('data-type');

        if (type === 'schedule') {
            scheduleItems = scheduleItems.filter(item => item.id !== id);
            saveData(SCHEDULE_KEY, scheduleItems);
            displaySchedule();
        } else if (type === 'due-date') {
            dueDates = dueDates.filter(item => item.id !== id);
            saveData(DUEDATES_KEY, dueDates);
            displayDueDates();
        } else if (type === 'activity') {
            activities = activities.filter(item => item.id !== id);
            saveData(ACTIVITIES_KEY, activities);
            displayActivities();
        }
    }

    // --- Event Listeners for Forms ---

    if (addScheduleForm) {
        addScheduleForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get selected days
            const selectedDays = Array.from(
                addScheduleForm.querySelectorAll('input[name="days"]:checked')
            ).map(input => input.value);
            
            // Validate that at least one day is selected
            if (selectedDays.length === 0) {
                alert('Please select at least one day');
                return;
            }
            
            const newItem = {
                id: generateId(),
                days: selectedDays,
                startTime: addScheduleForm.startTime.value,
                endTime: addScheduleForm.endTime.value || null,
                subject: addScheduleForm.subject.value
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
            const newItem = {
                id: generateId(),
                class: addDueDateForm.elements['class'].value,
                title: addDueDateForm.elements['title'].value,
                dueDate: addDueDateForm.elements['dueDate'].value,
                notes: addDueDateForm.elements['notes'].value
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
            const newItem = {
                id: generateId(),
                name: addActivityForm.elements['name'].value,
                date: addActivityForm.elements['date'].value,
                notes: addActivityForm.elements['notes'].value
            };
            activities.push(newItem);
            saveData(ACTIVITIES_KEY, activities);
            displayActivities();
            addActivityForm.reset();
        });
    }

    // --- Data Structure Conversion (if needed) ---
    // This function handles conversion from the old data structure (single-day classes)
    // to new data structure (classes with multiple days)
    function convertOldScheduleData() {
        // Check if we need to convert (look for an item without id and days array)
        const needsConversion = scheduleItems.some(item => 
            !item.id || !Array.isArray(item.days) || !item.startTime
        );
        
        if (needsConversion) {
            console.log('Converting old schedule data format to new format...');
            
            // Create a new array with the converted structure
            const newScheduleItems = scheduleItems.map(item => {
                // If it's already in the new format, return as is
                if (item.id && Array.isArray(item.days) && item.startTime) {
                    return item;
                }
                
                // Convert from old format to new format
                return {
                    id: generateId(),
                    days: [item.day], // Old format had a single day
                    startTime: item.time, // Old format had 'time' instead of 'startTime'
                    endTime: null,
                    subject: item.subject
                };
            });
            
            // Replace the old array with the new one
            scheduleItems = newScheduleItems;
            saveData(SCHEDULE_KEY, scheduleItems);
            console.log('Conversion complete.');
        }
    }

    // --- Convert old data structure if needed ---
    convertOldScheduleData();

    // --- Add IDs to items that don't have them (for existing data) ---
    function ensureItemsHaveIds() {
        let updated = false;
        
        // Schedule items
        scheduleItems = scheduleItems.map(item => {
            if (!item.id) {
                updated = true;
                return { ...item, id: generateId() };
            }
            return item;
        });
        
        // Due dates
        dueDates = dueDates.map(item => {
            if (!item.id) {
                updated = true;
                return { ...item, id: generateId() };
            }
            return item;
        });
        
        // Activities
        activities = activities.map(item => {
            if (!item.id) {
                updated = true;
                return { ...item, id: generateId() };
            }
            return item;
        });
        
        if (updated) {
            saveData(SCHEDULE_KEY, scheduleItems);
            saveData(DUEDATES_KEY, dueDates);
            saveData(ACTIVITIES_KEY, activities);
        }
    }
    
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