document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Build participants avatars (up to 4) and a +N badge when needed
        const participants = details.participants || [];
        const maxVisible = 4;
        let avatarsHTML = "";

        if (participants.length === 0) {
          avatarsHTML = `<span class=\"participants-label\">No participants yet</span>`;
        } else {
          participants.slice(0, maxVisible).forEach((p) => {
            const local = p.split("@")[0];
            let initials = "";
            if (local.includes(".")) {
              const parts = local.split(".");
              initials = (parts[0][0] || "") + (parts[1] ? parts[1][0] : (parts[0][1]||""));
            } else if (local.includes("_")) {
              const parts = local.split("_");
              initials = (parts[0][0] || "") + (parts[1] ? parts[1][0] : (parts[0][1]||""));
            } else {
              initials = local.slice(0, 2);
            }
            initials = initials.toUpperCase();
            avatarsHTML += `<div class=\"avatar\" title=\"${p}\">${initials}</div>`;
          });
        }

        const remaining = participants.length - maxVisible;
        const moreHTML = remaining > 0 ? `<div class=\"more-badge\">+${remaining}</div>` : "";

        const participantsSection = `
          <div class=\"participants\">
            <div class=\"avatars\">${avatarsHTML}</div>
            ${moreHTML}
          </div>
        `;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          ${participantsSection}
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
