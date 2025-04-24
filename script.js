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

            // Find items for this day and add them
            scheduleItems.filter(item => item.day === day).forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('schedule-item');
                // Basic display, consider adding delete button later
                itemDiv.textContent = `${item.time} - ${item.subject}`;
                dayDiv.appendChild(itemDiv);
            });
        });
    }

    function displayDueDates() {
        if (!dueDatesList) return;
        dueDatesList.innerHTML = ''; // Clear previous content
        // Sort by due date (optional, but helpful)
        dueDates.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

        dueDates.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>${item.title}</strong> (${item.class}) - Due: ${item.dueDate}
                ${item.notes ? `<br><small><em>Notes:</em> ${item.notes}</small>` : ''}
                <!-- Add delete button later -->
            `;
            dueDatesList.appendChild(li);
        });
    }

    function displayActivities() {
        if (!activitiesList) return;
        activitiesList.innerHTML = ''; // Clear previous content
        // Sort by date (optional)
        activities.sort((a, b) => new Date(a.date) - new Date(b.date));

        activities.forEach(item => {
            const li = document.createElement('li');
            // Format date/time for better display
            const dateTime = new Date(item.date);
            const formattedDate = dateTime.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
            li.innerHTML = `
                <strong>${item.name}</strong> - ${formattedDate}
                ${item.notes ? `<br><small><em>Notes:</em> ${item.notes}</small>` : ''}
                <!-- Add delete button later -->
            `;
            activitiesList.appendChild(li);
        });
    }

    // --- Event Listeners for Forms ---

    if (addScheduleForm) {
        addScheduleForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent page reload
            const formData = new FormData(addScheduleForm);
            const newItem = {
                day: formData.get('day'),
                time: formData.get('time'),
                subject: formData.get('subject')
            };
            scheduleItems.push(newItem);
            saveData(SCHEDULE_KEY, scheduleItems);
            displaySchedule();
            addScheduleForm.reset(); // Clear the form
        });
    }

    if (addDueDateForm) {
        addDueDateForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(addDueDateForm);
            const newItem = {
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

    // --- Initial Load ---
    displaySchedule();
    displayDueDates();
    displayActivities();

    // --- Register Service Worker ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            }, err => {
                console.log('ServiceWorker registration failed: ', err);
            });
        });
    }

}); 