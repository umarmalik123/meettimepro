(function() {
    // Create a div for the timer display
    const timerDiv = document.createElement('div');
    timerDiv.id = 'meeting-timer';
    timerDiv.style.position = 'fixed';
    timerDiv.style.top = '10px';  // Changed from 'bottom' to 'top'
    timerDiv.style.left = '10px';
    timerDiv.style.padding = '10px';
    timerDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    timerDiv.style.color = 'white';
    timerDiv.style.borderRadius = '5px';
    timerDiv.style.zIndex = '10000';
    timerDiv.style.fontSize = '14px';
    document.body.appendChild(timerDiv);

    // Function to update the current time
    function updateCurrentTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
        });
        return `${timeString.toLowerCase().replace(' ', '')} `;
    }

    // Function to find the meeting end time from Google Meet details
    function findMeetingEndTime() {
        console.log("Attempting to find meeting end time...");
        
        // Search the entire document for time information
        const bodyText = document.body.innerText;
        console.log("Body text:", bodyText);

        const regex = /(\d{1,2}:\d{2})\s*(?:AM|PM)?\s*[-–]\s*(\d{1,2}:\d{2})\s*(AM|PM)?/i;
        const match = regex.exec(bodyText);

        if (match) {
            console.log("Regex match found:", match);
            const [, , endTime, period] = match;
            const now = new Date();
            let [endHours, endMinutes] = endTime.split(':').map(Number);
            
            // Convert to 24-hour format if necessary
            if (period && period.toLowerCase() === 'pm' && endHours !== 12) {
                endHours += 12;
            } else if (period && period.toLowerCase() === 'am' && endHours === 12) {
                endHours = 0;
            }

            const meetingEndTime = new Date(now);
            meetingEndTime.setHours(endHours, endMinutes, 0, 0);

            // Check if the meeting end time is for the next day
            if (meetingEndTime < now) {
                meetingEndTime.setDate(meetingEndTime.getDate() + 1);
            }

            console.log("Meeting end time found:", meetingEndTime);
            return meetingEndTime;
        } else {
            console.log("No time information found in the document");
            return null;
        }
    }

    // Function to calculate and display the time left until the meeting ends
    function updateTimeLeft(meetingEndTime) {
        const now = new Date();
        const timeDifference = meetingEndTime - now;
        let timeLeftText = '';
        let isLessThan5Minutes = false;

        if (timeDifference > 0) {
            const minutesLeft = Math.floor(timeDifference / (1000 * 60));
            const secondsLeft = Math.floor((timeDifference % (1000 * 60)) / 1000);
            timeLeftText = `${minutesLeft} mins left`;
            isLessThan5Minutes = minutesLeft < 5;
        } else {
            timeLeftText = 'Oops, you\'re out of time!';
            isLessThan5Minutes = true;
        }

        return { timeLeftText, isLessThan5Minutes };
    }

    // Main function to initialize the timer
    function initializeTimer() {
        console.log("Initializing timer...");
        let meetingEndTime = findMeetingEndTime();
        
        function updateTimer() {
            if (!meetingEndTime) {
                console.log("Meeting end time not found, attempting to find again...");
                meetingEndTime = findMeetingEndTime();
            }
            
            if (meetingEndTime) {
                const currentTimeText = updateCurrentTime();
                const { timeLeftText, isLessThan5Minutes } = updateTimeLeft(meetingEndTime);
                timerDiv.innerHTML = `${currentTimeText}<br><span id="time-left">${timeLeftText}</span>`;
                
                const timeLeftSpan = timerDiv.querySelector('#time-left');
                timeLeftSpan.style.color = isLessThan5Minutes ? '#dc362e' : 'white';
            } else {
                timerDiv.innerHTML = 'Waiting for meeting details...<br>Click the ⓘ icon ↘';
            }
        }

        // Update timer immediately and then every second
        updateTimer();
        setInterval(updateTimer, 1000);
    }

    // Wait for the page to load, then initialize the timer
    if (document.readyState === 'loading') {
        console.log("Page still loading, waiting for load event...");
        window.addEventListener('load', initializeTimer);
    } else {
        console.log("Page already loaded, initializing timer immediately...");
        initializeTimer();
    }
})();
