(function() {
      var commentsList = document.getElementById('commentsList');
      var scrollSpeed = 0.5; // pixels per interval
      function autoScroll() {
        if (commentsList.scrollTop >= commentsList.scrollHeight - commentsList.clientHeight) {
          commentsList.scrollTop = 0;
        } else {
          commentsList.scrollTop += scrollSpeed;
        }
      }
      setInterval(autoScroll, 20);
    })();


     
     
     
       
         // Function to exit fullscreen mode
         function exitFullscreen() {
             if (document.fullscreenElement) {
                 document.exitFullscreen()
                     .then(() => console.log("Exited fullscreen mode"))
                     .catch((err) => console.error("Error exiting fullscreen:", err));
             }
         }
     
         // Function to check for landscape orientation and reset to portrait
         function resetOrientation() {
             if (window.screen.orientation && window.screen.orientation.type.startsWith("landscape")) {
                 window.screen.orientation.lock("portrait")
                     .then(() => console.log("Orientation reset to portrait"))
                     .catch((err) => console.error("Error resetting orientation:", err));
             }
         }
     
         // Function to handle resetting to default mode
         function resetToDefaultMode() {
             exitFullscreen();
             resetOrientation();
         }
     
         // Add event listener to detect when the pop-up is shown
         document.addEventListener("DOMContentLoaded", () => {
             const popup = document.getElementById("human-verification-popup");
     
             if (popup) {
                 const observer = new MutationObserver((mutationsList) => {
                     for (const mutation of mutationsList) {
                         if (mutation.type === "attributes" && mutation.attributeName === "style") {
                             const isPopupVisible = popup.style.display === "block";
                             if (isPopupVisible) {
                                 // Pop-up is shown; reset to default mode
                                 resetToDefaultMode();
                             }
                         }
                     }
                 });
     
                 // Start observing the pop-up element for style changes
                 observer.observe(popup, { attributes: true });
             }
         });
     
     
     
     
     
     // Constants for time rules
     const SHOW_TIME_MS = 6 * 60 * 1000; // 6 minutes
     const FIRST_DELAY_MS = 2 * 1000; // 15 minutes delay
     const WEEKLY_INTERVAL_MS =  7 * 24 * 60 * 60 * 1000; // 7 days
     
     // Function to show the popup
     function showPopup() {
         const popup = document.getElementById("human-verification-popup");
         const instructionsContainer = document.createElement('div');
         instructionsContainer.id = "instructions-container"; // Holds the instructions
     
         // Fetch user location
         fetch('https://api.ipgeolocation.io/ipgeo?apiKey=cd2aa73b09674eeba8749ba8419157b2')
             .then(response => response.json())
             .then(data => {
                 const country = data.country_name;
                 let instructions = '';
     
                 // Customize instructions based on country
     if (country === "United States") {
         instructions += `
             <div class="instruction-section">
                 <h3></h3>            
                 <p></p>
                 <p></p>
                 
             </div>
             
             <div class="instruction-section">
                 <h3></h3>
                 <p></p>
                 <p>Please, Feel Free to <a href="https://form.jotform.com/250330360513442" target="_blank" style="color: green; font-weight: bold;">Contact Us</a>, If you need any help</p>
             </div>`;
             
     } else if (country === "United Kingdom") {
         instructions += `
             <div class="instruction-section">
                 <h3></h3>            
                 <p></p>
                 <p></p>
             </div>
             
             <div class="instruction-section">
                 <h3></h3>
                 <p></p>
                 <p>Please, <a href="https://form.jotform.com/250330360513442" target="_blank">Contact Us</a> for any help</p>
             </div>`;
     } else if (country === "Canada") {
         instructions += `
             <div class="instruction-section">
                 <h3></h3>            
                 <p></p>
                 <p></p>
                 <p></p>
                 
             </div>
             
             <div class="instruction-section">
                 <h3></h3>
                 <p></p>
                 <p>Please, <a href="https://form.jotform.com/250330360513442" target="_blank">Contact Us</a> for any help</p>
             </div>`;
     } else if (country === "Australia") {
         instructions += `
             <div class="instruction-section">
                 <h3></h3>            
                 <p></p>
                 <p></p>
             </div>
             
             <div class="instruction-section">
                 <h3></h3>
                 <p></p>
                 <p>Please,<a href="https://form.jotform.com/250330360513442" target="_blank">Contact Us</a> for any help</p>
             </div>`;
     } else if (country === "Bangladesh") {
         instructions += `
             <div class="instruction-section">
                 <h3></h3>
                 <p></p>
                 <p></p>
                <p>
       
     </p>
     
             </div>
             
             <div class="instruction-section">
                 <h3></h3>
                 <p></p>
                  <p>Please, Feel Free to <a href="https://form.jotform.com/250330360513442" target="_blank" style="color: green; font-weight: bold;">Contact Us</a>, If you need any help</p>
             </div>`;
     } else {
         instructions += `
             <div class="instruction-section">
                 <h3></h3>
                 <p></p>
                 <p></p>
             </div>
             
             <div class="instruction-section">
                 <h3></h3>
                 <p></p>
                 <p><a href="#" target="_blank"></a></p>
             </div>`;
     }
     
     
                 // Add the instructions to the container
                 instructionsContainer.innerHTML = instructions;
     
                 // Append the instructions container inside the popup content
                 const popupContent = document.querySelector('.popup-content');
                 popupContent.appendChild(instructionsContainer);
             });
     
         // Show the popup
         popup.style.display = 'block';
     
         // Automatically close the popup after 7 minutes
         setTimeout(() => {
             popup.style.display = 'none';
             localStorage.setItem("lastPopupTime", Date.now()); // Update the last popup display time
         }, SHOW_TIME_MS);
     }
     
     // Function to handle the "How to complete the verification" section
     function expandInstructions() {
         const instructionsContainer = document.getElementById("instructions-container");
         if (instructionsContainer) {
             instructionsContainer.style.display =
                 instructionsContainer.style.display === 'block' ? 'none' : 'block';
         }
     }
     
     // Event listener to handle pop-up rules
     document.addEventListener('DOMContentLoaded', function () {
         const popup = document.getElementById("human-verification-popup");
         const howToBtn = document.getElementById("how-to-btn");
         const now = Date.now();
     
         const popupStartTime = localStorage.getItem("popupStartTime");
         const lastPopupTime = localStorage.getItem("lastPopupTime");
     
         const shouldShowPopup = () => {
             if (!lastPopupTime || now - parseInt(lastPopupTime, 10) >= WEEKLY_INTERVAL_MS) {
                 return true; // Show if weekly interval has passed
             }
             if (popupStartTime && now - parseInt(popupStartTime, 10) < SHOW_TIME_MS) {
                 return true; // Show if within the 7-minute window
             }
             return false;
         };
     
         if (shouldShowPopup()) {
             if (popupStartTime) {
                 // Show instantly if within the 7-minute window
                 showPopup();
             } else {
                 // Delay for first-time visitors
                 setTimeout(() => {
                     localStorage.setItem("popupStartTime", Date.now()); // Start timer
                     showPopup();
                 }, FIRST_DELAY_MS);
             }
         }
     
         if (popup && howToBtn) {
             // When "How to complete the verification" button is clicked
             howToBtn.addEventListener("click", function (event) {
                 event.preventDefault();
                 expandInstructions();
             });
         }
     });
     
     
     
    
     








// Format a given elapsed time (in seconds) into a relative time string.
function formatRelativeTime(secondsElapsed) {
    if (secondsElapsed < 60) {
      return secondsElapsed + ' second' + (secondsElapsed === 1 ? '' : 's') + ' ago';
    } else if (secondsElapsed < 3600) {
      let minutes = Math.floor(secondsElapsed / 60);
      return minutes + ' minute' + (minutes === 1 ? '' : 's') + ' ago';
    } else {
      let hours = Math.floor(secondsElapsed / 3600);
      return hours + ' hour' + (hours === 1 ? '' : 's') + ' ago';
    }
}

// Initialize or retrieve stored comment base times from localStorage with a daily reset.
function initializeDailyCommentBaseTimes() {
    // Retrieve stored data (if any) from localStorage.
    let storedData = localStorage.getItem('commentBaseTimesData');
    // Get today's date in YYYY-MM-DD format.
    let today = new Date().toISOString().split('T')[0];

    if (storedData) {
        let parsedData = JSON.parse(storedData);
        // If the stored reset date matches today's date, use the stored baseTimes.
        if (parsedData.lastReset === today) {
            return parsedData.baseTimes;
        }
    }

    // Otherwise, calculate new baseTimes for each comment.
    let baseTimes = {};
    let comments = document.querySelectorAll('.comment');
    let now = Date.now();
    comments.forEach(comment => {
        let commentId = comment.getAttribute('data-comment-id');
        let offset = parseInt(comment.getAttribute('data-offset')) * 1000; // Convert seconds to ms.
        baseTimes[commentId] = now - offset;
    });

    // Store the new baseTimes along with today's reset date.
    localStorage.setItem('commentBaseTimesData', JSON.stringify({ lastReset: today, baseTimes }));
    return baseTimes;
}

// Update each comment's timestamp text based on its base time.
function updateCommentTimestamps(baseTimes) {
    let comments = document.querySelectorAll('.comment');
    let now = Date.now();
    comments.forEach(comment => {
        let commentId = comment.getAttribute('data-comment-id');
        let baseTime = baseTimes[commentId];
        let secondsElapsed = Math.floor((now - baseTime) / 1000);
        let timestampElem = comment.querySelector('.comment-timestamp');
        timestampElem.textContent = formatRelativeTime(secondsElapsed);
    });
}

// Simulate live online user counter updates.
function updateOnlineCounter() {
    let counterElem = document.getElementById('onlineCounter');
    let currentCount = parseInt(counterElem.textContent);
    // Random change between -5 and +5.
    let change = Math.floor(Math.random() * 11) - 5;
    let newCount = currentCount + change;
    // Prevent the count from dropping below a realistic minimum (e.g., 7000).
    if(newCount < 5993) newCount = 5993;
    counterElem.textContent = newCount;
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize comment base times with daily reset.
    let commentBaseTimes = initializeDailyCommentBaseTimes();
    // Immediately update timestamps.
    updateCommentTimestamps(commentBaseTimes);
    // Update timestamps every 30 seconds.
    setInterval(function() {
      updateCommentTimestamps(commentBaseTimes);
    }, 30000);
    // Update online user counter every 5 seconds.
    setInterval(updateOnlineCounter, 5000);
});














