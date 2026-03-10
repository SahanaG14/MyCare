// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", function() {
  const mainContentContainer = document.getElementById("main-content");
  const themeToggleBtn = document.getElementById('theme-toggle');

  // --- Data Variables for Persistence ---
  // Initialize global arrays to store your data
  let journalEntries = [];
  let subjects = []; // Subjects, with nested modules
  let todayPlan = []; // Today's plan items

  // --- Helper Functions for localStorage ---
  function saveJournalEntriesToLocalStorage() {
    localStorage.setItem('journals', JSON.stringify(journalEntries));
  }

  function loadJournalEntriesFromLocalStorage() {
    const savedJournals = localStorage.getItem('journals');
    if (savedJournals) {
      journalEntries = JSON.parse(savedJournals);
    } else {
      journalEntries = []; // Ensure it's an empty array if nothing saved
    }
  }

  function saveSubjectsToLocalStorage() {
    localStorage.setItem('studySubjects', JSON.stringify(subjects));
  }

  function loadSubjectsFromLocalStorage() {
    const savedSubjects = localStorage.getItem('studySubjects');
    if (savedSubjects) {
      subjects = JSON.parse(savedSubjects);
    } else {
      subjects = []; // Ensure it's an empty array if nothing saved
    }
  }

  function saveTodayPlanToLocalStorage() {
    // Filter out completed tasks ONLY when explicitly saving for persistence after a session.
    // For in-page display, we want to show ticked items until the page is reloaded.
    const uncompletedTasks = todayPlan.filter(item => !item.completed);
    localStorage.setItem('todayPlan', JSON.stringify(uncompletedTasks));
  }

  function loadTodayPlanFromLocalStorage() {
    const savedPlan = localStorage.getItem('todayPlan');
    if (savedPlan) {
      todayPlan = JSON.parse(savedPlan);
    } else {
      todayPlan = []; // Ensure it's an empty array if nothing saved
    }
  }
  // --- End Helper Functions for localStorage ---

// --- Theme Toggle Logic ---

    // Reference to the body element for easier manipulation
    const body = document.body;

    // Function to apply the chosen theme
    function applyTheme(theme) {
        // First, remove both theme classes to ensure no conflicts
        body.classList.remove('light-theme', 'dark-theme');
        // Then, add the desired theme class
        body.classList.add(theme);

        // Update the theme toggle button's text/icon based on the new theme
        themeToggleBtn.textContent = theme === 'dark-theme' ? '☀️' : '🌙';

        // Save the chosen theme to localStorage so it persists across sessions
        localStorage.setItem('theme', theme);
    }

    // On initial page load, check for a saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        // If a theme is found in localStorage, apply it
        applyTheme(savedTheme);
    } else {
        // If no theme is saved, default to 'light-theme'
        // (Make sure your HTML <body> tag also starts with class="light-theme"
        // for immediate visual application before this script executes)
        applyTheme('light-theme');
    }

    // Add an event listener to the theme toggle button
    themeToggleBtn.addEventListener('click', function() {
        // Determine the current active theme
        const currentTheme = body.classList.contains('dark-theme') ? 'dark-theme' : 'light-theme';
        // Decide the new theme (toggle between light and dark)
        const newTheme = currentTheme === 'dark-theme' ? 'light-theme' : 'dark-theme';
        // Apply the new theme
        applyTheme(newTheme);
    });
    // --- End Theme Toggle Logic ---

  // Function to navigate to a specific page/feature
window.openPage = function(pageName) {
    mainContentContainer.innerHTML = ''; // Clear existing content

    const backButton = document.createElement("button");
    backButton.innerText = "⬅️ Back to Home";
    backButton.classList.add("action-button", "primary");
    backButton.style.marginBottom = '20px';
    backButton.onclick = () => {
        // When going back to home, ensure all data is saved.
        saveJournalEntriesToLocalStorage();
        saveSubjectsToLocalStorage();
        saveTodayPlanToLocalStorage(); // Save filtered (uncompleted) today's plan
        location.reload(); // Simple reload to go back to the main menu
    };
    mainContentContainer.appendChild(backButton);

    // Adjust layout classes
    mainContentContainer.classList.remove('button-container');
    mainContentContainer.classList.add('page-container');

    if (pageName === 'journal') {
        loadJournalPage();
    } else if (pageName === 'study') {
        loadStudyPage();
    } else if (pageName === 'hair') {
        loadHairCarePage();
    } else if (pageName === 'skin') {
        loadSkinCarePage();
    } else if (pageName === 'fitness') {
        loadFitnessPage(); // ✅ Navigate to Fitness page
    } else {
        const tempContent = document.createElement('div');
        tempContent.innerHTML = `<h2>${pageName.charAt(0).toUpperCase() + pageName.slice(1)} Page Coming Soon!</h2>`;
        mainContentContainer.appendChild(tempContent);
    }
};


  // ----------------- Load Journal Page -----------------
window.loadJournalPage = function () {
  mainContentContainer.innerHTML = ''; // clear previous content
  mainContentContainer.classList.remove('button-container');
  mainContentContainer.classList.add('page-container');

  // Back to Home button
const backButton = document.createElement('button');
backButton.innerText = "⬅️ Back to Home";
backButton.classList.add("action-button", "primary");
backButton.style.marginBottom = '20px';
backButton.onclick = () => {
  window.location.href = 'home.html'; // Redirect to home.html
};
mainContentContainer.appendChild(backButton);


  // Sidebar
  const journalSidebar = document.createElement('div');
  journalSidebar.classList.add('sidebar');
  journalSidebar.innerHTML = `
      <button class="journal-button" onclick="createNewJournal()">New +</button>
  `;
  mainContentContainer.appendChild(journalSidebar);

  // Main journal content area
  const journalMainContent = document.createElement('div');
  journalMainContent.classList.add('main-content-area');
  journalMainContent.id = 'journal-entries-container';
  mainContentContainer.appendChild(journalMainContent);

  loadJournalEntriesFromLocalStorage();
  displayExistingJournals();
};

// ----------------- Display Existing Journals with Search -----------------
window.displayExistingJournals = function () {
  const journalEntriesContainer = document.getElementById('journal-entries-container');
  if (!journalEntriesContainer) return;

  journalEntriesContainer.innerHTML = `
    <h2>Your Journals</h2>
    <input 
      type="text" 
      id="journal-search" 
      placeholder="Search" 
      style="width: 97%; padding: 10px; margin-bottom: 15px; border-radius: 5px; border: 1px solid #ccc;"
    >
  `;

  const renderList = (entries) => {
    const existingCards = journalEntriesContainer.querySelectorAll('.journal-entry-card, .no-results');
    existingCards.forEach(el => el.remove());

    if (entries.length === 0) {
      const noResults = document.createElement('p');
      noResults.classList.add('no-results');
      noResults.textContent = 'No matching journals found.';
      journalEntriesContainer.appendChild(noResults);
      return;
    }

    entries.forEach((journal, index) => {
      const journalCard = document.createElement('div');
      journalCard.classList.add('journal-entry-card');

      const titleSpan = document.createElement('span');
      titleSpan.classList.add('journal-title');
      titleSpan.textContent = journal.title;
      titleSpan.style.cursor = 'pointer';
      titleSpan.addEventListener('click', () => viewJournal(index));

      const actionsDiv = document.createElement('div');
      actionsDiv.classList.add('journal-actions');

      const editBtn = document.createElement('button');
      editBtn.textContent = 'Edit';
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        editJournal(index);
      });

      const deleteBtn = document.createElement('button');
      deleteBtn.classList.add('delete');
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteJournal(index);
      });

      actionsDiv.appendChild(editBtn);
      actionsDiv.appendChild(deleteBtn);

      journalCard.appendChild(titleSpan);
      journalCard.appendChild(actionsDiv);
      journalEntriesContainer.appendChild(journalCard);
    });
  };

  if (!journalEntries || journalEntries.length === 0) {
    renderList([]);
  } else {
    renderList(journalEntries);
  }

  const searchInput = document.getElementById('journal-search');
  searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    const filtered = journalEntries.filter(entry =>
      entry.title.toLowerCase().includes(searchTerm) ||
      entry.content.toLowerCase().includes(searchTerm)
    );
    renderList(filtered);
  });
};

// ----------------- Create New Journal -----------------
window.createNewJournal = function () {
  const journalEntriesContainer = document.getElementById('journal-entries-container');
  journalEntriesContainer.innerHTML = `
      <h2>New Journal Entry</h2>
      <input type="text" id="journal-title-input" placeholder="Journal Title" 
          style="width: 100%; padding: 10px; margin-bottom: 10px; border-radius: 5px; border: 1px solid #ccc;">
      <textarea id="journal-content-input" placeholder="Write your thoughts here..." 
          style="width: 100%; height: 200px; padding: 10px; margin-bottom: 10px; border-radius: 5px; border: 1px solid #ccc;"></textarea>
      <button class="action-button primary" onclick="saveJournal()">Save Journal</button>
      <button class="action-button" onclick="displayExistingJournals()">Cancel</button>
  `;
};

// ----------------- Save Journal -----------------
window.saveJournal = function () {
  const titleInput = document.getElementById('journal-title-input');
  const contentInput = document.getElementById('journal-content-input');
  const title = titleInput.value.trim();
  const content = contentInput.value.trim();

  if (title && content) {
    journalEntries.push({ title, content, date: new Date().toLocaleString() });
    saveJournalEntriesToLocalStorage();
    alert('Journal saved!');
    displayExistingJournals();
  } else {
    alert('Please enter both a title and content for your journal.');
  }
};

// ----------------- Edit Journal -----------------
window.editJournal = function (index) {
  const journalToEdit = journalEntries[index];
  if (!journalToEdit) {
    alert("Journal not found for editing.");
    displayExistingJournals();
    return;
  }

  const journalEntriesContainer = document.getElementById('journal-entries-container');
  journalEntriesContainer.innerHTML = `
      <h2>Edit Journal Entry</h2>
      <input type="text" id="journal-title-input" value="${journalToEdit.title}" 
          style="width: 100%; padding: 10px; margin-bottom: 10px; border-radius: 5px; border: 1px solid #ccc;">
      <textarea id="journal-content-input" 
          style="width: 100%; height: 200px; padding: 10px; margin-bottom: 10px; border-radius: 5px; border: 1px solid #ccc;">${journalToEdit.content}</textarea>
      <button class="action-button primary" onclick="updateJournal(${index})">Update Journal</button>
      <button class="action-button" onclick="displayExistingJournals()">Cancel</button>
  `;
};

// ----------------- Update Journal -----------------
function updateJournal(index) {
  const titleInput = document.getElementById('journal-title-input');
  const contentInput = document.getElementById('journal-content-input');
  const title = titleInput.value.trim();
  const content = contentInput.value.trim();

  if (title && content) {
    journalEntries[index].title = title;
    journalEntries[index].content = content;

    // --- Start of integrated date formatting code ---
    const now = new Date();
    const day = now.getDate().toString();
    const month = now.toLocaleString('en-US', { month: 'short' });
    const year = now.getFullYear();

    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    const formattedDate = `${day} ${month}, ${year}     ${hours}:${minutes} ${ampm}`;
    journalEntries[index].date = formattedDate;
    // --- End of integrated date formatting code ---

    saveJournalEntriesToLocalStorage();
    console.log('Journal updated!');
    displayExistingJournals();
  } else {
    console.log('Please enter both a title and content for your journal.');
  }
};

// ----------------- Delete Journal -----------------
window.deleteJournal = function (index) {
  if (confirm('Are you sure you want to delete this journal?')) {
    journalEntries.splice(index, 1);
    saveJournalEntriesToLocalStorage();
    alert('Journal deleted!');
    displayExistingJournals();
  }
};

// ----------------- View Journal -----------------
window.viewJournal = function (index) {
  const journal = journalEntries[index];
  if (!journal) {
    alert("Journal not found.");
    displayExistingJournals();
    return;
  }

  const container = document.getElementById('journal-entries-container');
  container.innerHTML = '';

  const backBtn = document.createElement('button');
  backBtn.className = 'action-button primary';
  backBtn.textContent = '⬅ Back';
  backBtn.addEventListener('click', displayExistingJournals);

  const title = document.createElement('h2');
  title.textContent = journal.title;

  const dateP = document.createElement('p');
  dateP.innerHTML = `<em>${journal.date || ''}</em>`;

  const contentDiv = document.createElement('div');
  contentDiv.style.marginTop = '20px';
  contentDiv.style.whiteSpace = 'pre-wrap';
  contentDiv.textContent = journal.content;

  container.appendChild(backBtn);
  container.appendChild(title);
  container.appendChild(dateP);
  container.appendChild(contentDiv);
};

 function loadStudyPage() {
    // Ensure the main content container itself is set up as a flex container for these two sections
    // These class removals/additions are likely already handled by the openPage function
    // mainContentContainer.classList.remove('button-container');
    // mainContentContainer.classList.add('page-container');

    // This is the container that will hold both "Subjects" and "Today's Plan" side-by-side
    const studyContentWrapper = document.createElement('div');
    studyContentWrapper.style.display = 'flex';
    studyContentWrapper.style.width = '100%';
    studyContentWrapper.style.gap = '20px'; // Space between the two columns
    studyContentWrapper.style.marginTop = '20px'; // Add some space below the back button
    // Add flex-wrap for responsiveness on smaller screens
    studyContentWrapper.style.flexWrap = 'wrap';
    studyContentWrapper.style.justifyContent = 'center'; // Center columns on wrap

    // --- Subjects (Left Column) ---
    const subjectsColumn = document.createElement('div');
    subjectsColumn.classList.add('study-column-left'); // Add a specific class for styling
    subjectsColumn.id = 'study-sidebar'; // Re-use ID as displaySubjects targets this
    subjectsColumn.style.flex = '1'; // Takes up available space
    subjectsColumn.style.minWidth = '300px'; // Slightly larger min-width for subjects
    subjectsColumn.style.maxWidth = 'calc(50% - 10px)'; // Max width to allow two columns
    subjectsColumn.style.padding = '20px';
    subjectsColumn.style.borderRadius = '8px';
    subjectsColumn.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
    studyContentWrapper.appendChild(subjectsColumn); // Append subjects first for left position

    // --- Today's Plan (Right Column) ---
    const todayPlanColumn = document.createElement('div');
    todayPlanColumn.classList.add('study-column-right'); // Add a specific class for styling
    todayPlanColumn.style.flex = '1'; // Takes up available space
    todayPlanColumn.style.minWidth = '250px'; // Ensure a minimum width
    todayPlanColumn.style.maxWidth = 'calc(50% - 10px)'; // Max width to allow two columns
    todayPlanColumn.style.padding = '20px';
    todayPlanColumn.style.borderRadius = '8px';
    todayPlanColumn.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
    todayPlanColumn.innerHTML = '<h2>Today\'s Plan</h2><div id="today-plan-list"></div>'; // Initial content for Today's Plan
    studyContentWrapper.appendChild(todayPlanColumn); // Append today's plan second for right position

    // Append the wrapper to the main content container (after the back button)
    mainContentContainer.appendChild(studyContentWrapper);

    loadSubjectsFromLocalStorage(); // Load subjects when study page is loaded
    loadTodayPlanFromLocalStorage(); // Load today's plan when study page is loaded

    displaySubjects(); // This will now populate the 'subjectsColumn' (which has id 'study-sidebar')
    displayTodayPlan(); // This will now populate the 'todayPlanColumn'
}

  // Variable to track which subject/module is currently being edited
  let editingSubjectIndex = null;
  let editingModuleInfo = null; // {subIndex, modIndex}

  function displaySubjects() {
    const studySidebar = document.getElementById('study-sidebar');
    // Keep the back button, clear content specific to subjects/modules
    studySidebar.innerHTML = '<h2>Subjects</h2>';

    // Add New Subject Input
    const newSubjectInputGroup = document.createElement('div');
    newSubjectInputGroup.classList.add('input-group');
    newSubjectInputGroup.innerHTML = `
            <input type="text" id="new-subject-name" placeholder="Add new subject..." class="new-item-input">
            <button class="action-button primary" onclick="addNewSubject()">Add</button>
        `;
    studySidebar.appendChild(newSubjectInputGroup);


    if (subjects.length === 0) {
      studySidebar.innerHTML += '<p>No subjects added yet.</p>';
    }

    subjects.forEach((subject, subIndex) => {
      const subjectDiv = document.createElement('div');
      subjectDiv.classList.add('subject-item');

      if (editingSubjectIndex === subIndex) {
        // Render edit form for this subject
        subjectDiv.innerHTML = `
                    <input type="text" id="edit-subject-name-${subIndex}" value="${subject.name}" class="edit-item-input">
                    <div class="subject-actions">
                        <button class="action-button primary" onclick="saveEditedSubject(${subIndex})">Save</button>
                        <button class="action-button" onclick="cancelEditSubject()">Cancel</button>
                    </div>
                `;
      } else {
        // Normal display for subject
        subjectDiv.innerHTML = `
                    <span>${subject.name}</span>
                    <div class="subject-actions">
                        <button class="action-button warning" onclick="editSubjectInline(${subIndex})">Edit</button>
                        <button class="action-button danger" onclick="deleteSubject(${subIndex})">Delete</button>
                    </div>
                `;
        subjectDiv.onclick = (e) => {
          // Prevent event bubbling from buttons
          if (!e.target.closest('button, input')) { // Also exclude input for editing
            toggleModules(subIndex);
          }
        };
      }
      studySidebar.appendChild(subjectDiv);

      const moduleListDiv = document.createElement('div');
      moduleListDiv.classList.add('module-list');
      moduleListDiv.id = `modules-for-${subIndex}`;
      moduleListDiv.style.display = 'none'; // Hidden by default

      if (subject.modules.length === 0) {
        moduleListDiv.innerHTML = '<p style="font-size: 0.9em; margin-top: 5px;">No modules yet.</p>';
      }

      subject.modules.forEach((module, modIndex) => {
        const moduleItem = document.createElement('div');
        moduleItem.classList.add('module-item');

        if (editingModuleInfo && editingModuleInfo.subIndex === subIndex && editingModuleInfo.modIndex === modIndex) {
          // Render edit form for this module
          moduleItem.innerHTML = `
                        <input type="text" id="edit-module-name-${subIndex}-${modIndex}" value="${module.name}" class="edit-item-input">
                        <div class="module-actions">
                            <button class="action-button primary" onclick="saveEditedModule(${subIndex}, ${modIndex})">Save</button>
                            <button class="action-button" onclick="cancelEditModule()">Cancel</button>
                        </div>
                    `;
        } else {
          // Normal display for module
          moduleItem.innerHTML = `
                        <span>${module.name}</span>
                        <div class="module-actions">
                            <button class="edit" onclick="editModuleInline(${subIndex}, ${modIndex})">Edit</button>
                            <button class="delete" onclick="deleteModule(${subIndex}, ${modIndex})">Delete</button>
                            <button onclick="addModuleToTodayPlan(${subIndex}, ${modIndex})">Add to Today's Plan</button>
                        </div>
                    `;
        }
        moduleListDiv.appendChild(moduleItem);
      });

      // Add New Module Input for this subject
      const newModuleInputGroup = document.createElement('div');
      newModuleInputGroup.classList.add('input-group');
      newModuleInputGroup.innerHTML = `
                <input type="text" id="new-module-name-${subIndex}" placeholder="Add new module..." class="new-item-input">
                <button class="action-button primary" onclick="addNewModule(${subIndex})">Add</button>
            `;
      moduleListDiv.appendChild(newModuleInputGroup);

      studySidebar.appendChild(moduleListDiv);
    });
    saveSubjectsToLocalStorage(); // Save subjects whenever displaySubjects is called
  }

  function toggleModules(subIndex) {
    const moduleListDiv = document.getElementById(`modules-for-${subIndex}`);
    moduleListDiv.style.display = moduleListDiv.style.display === 'none' ? 'block' : 'none';
  }

  // --- NEW: Inline Subject Add/Edit Functions ---
  window.addNewSubject = function() {
    const newSubjectInput = document.getElementById('new-subject-name');
    const newSubjectName = newSubjectInput.value.trim();
    if (newSubjectName) {
      subjects.push({ name: newSubjectName, modules: [] });
      newSubjectInput.value = ''; // Clear input
      displaySubjects(); // Re-render to show new subject
    } else {
      alert('Please enter a subject name.');
    }
  }

  window.editSubjectInline = function(subIndex) {
    editingSubjectIndex = subIndex;
    displaySubjects(); // Re-render to show input field
    // Optionally, focus the input field
    setTimeout(() => {
      const inputField = document.getElementById(`edit-subject-name-${subIndex}`);
      if (inputField) {
        inputField.focus();
      }
    }, 0);
  }

  window.saveEditedSubject = function(subIndex) {
    const inputField = document.getElementById(`edit-subject-name-${subIndex}`);
    const newName = inputField.value.trim();
    if (newName) {
      subjects[subIndex].name = newName;
      editingSubjectIndex = null; // Clear editing state
      displaySubjects(); // Re-render with updated name
    } else {
      alert('Subject name cannot be empty.');
    }
  }

  window.cancelEditSubject = function() {
    editingSubjectIndex = null; // Clear editing state
    displaySubjects(); // Re-render to go back to normal view
  }
  // --- END NEW: Inline Subject Add/Edit Functions ---

  // --- NEW: Inline Module Add/Edit Functions ---
  window.addNewModule = function(subIndex) {
    const newModuleInput = document.getElementById(`new-module-name-${subIndex}`);
    const newModuleName = newModuleInput.value.trim();
    if (newModuleName) {
      subjects[subIndex].modules.push({ name: newModuleName, completed: false }); // Added 'completed' for future flexibility
      newModuleInput.value = ''; // Clear input
      displaySubjects(); // Re-render to show new module
      // Ensure the module list stays open for this subject
      document.getElementById(`modules-for-${subIndex}`).style.display = 'block';
    } else {
      alert('Please enter a module name.');
    }
  }

  window.editModuleInline = function(subIndex, modIndex) {
    editingModuleInfo = { subIndex, modIndex };
    displaySubjects(); // Re-render to show input field
    // Ensure the subject's module list stays open
    document.getElementById(`modules-for-${subIndex}`).style.display = 'block';
    // Optionally, focus the input field
    setTimeout(() => {
      const inputField = document.getElementById(`edit-module-name-${subIndex}-${modIndex}`);
      if (inputField) {
        inputField.focus();
      }
    }, 0);
  }

  window.saveEditedModule = function(subIndex, modIndex) {
    const inputField = document.getElementById(`edit-module-name-${subIndex}-${modIndex}`);
    const newName = inputField.value.trim();
    if (newName) {
      subjects[subIndex].modules[modIndex].name = newName;
      editingModuleInfo = null; // Clear editing state
      displaySubjects(); // Re-render with updated name
      // Ensure the subject's module list stays open
      document.getElementById(`modules-for-${subIndex}`).style.display = 'block';

      // Also update the name if it exists in todayPlan
      todayPlan.forEach(item => {
        if (item.subjectIndex === subIndex && item.moduleIndex === modIndex) {
          item.name = newName;
        }
      });
      displayTodayPlan(); // Re-render today's plan with updated name
    } else {
      alert('Module name cannot be empty.');
    }
  }

  window.cancelEditModule = function() {
    const currentSubIndex = editingModuleInfo ? editingModuleInfo.subIndex : null;
    editingModuleInfo = null; // Clear editing state
    displaySubjects(); // Re-render to go back to normal view
    // Ensure the subject's module list stays open if it was open before cancel
    if (currentSubIndex !== null) {
      document.getElementById(`modules-for-${currentSubIndex}`).style.display = 'block';
    }
  }
  // --- END NEW: Inline Module Add/Edit Functions ---


  window.deleteSubject = function(subIndex) {
    if (confirm(`Are you sure you want to delete "${subjects[subIndex].name}" and all its modules?`)) {
      subjects.splice(subIndex, 1);
      editingSubjectIndex = null; // Clear any pending edit state
      editingModuleInfo = null; // Clear any pending module edit state

      // Remove any modules from this subject if they are in today's plan
      // We need to re-index todayPlan items whose subjectIndex is greater than the deleted one
      todayPlan = todayPlan.filter(item => item.subjectIndex !== subIndex);
      todayPlan.forEach(item => {
        if (item.subjectIndex > subIndex) {
          item.subjectIndex--; // Decrement index for subjects after the deleted one
        }
      });

      saveSubjectsToLocalStorage(); // Save subjects
      saveTodayPlanToLocalStorage(); // Save today's plan after re-indexing
      displaySubjects();
      displayTodayPlan();
    }
  }

  window.deleteModule = function(subIndex, modIndex) {
    if (confirm(`Are you sure you want to delete "${subjects[subIndex].modules[modIndex].name}"?`)) {
      subjects[subIndex].modules.splice(modIndex, 1);
      editingModuleInfo = null; // Clear any pending edit state

      // Remove from today's plan if it exists
      // We need to re-index todayPlan items whose moduleIndex is greater than the deleted one *within the same subject*
      todayPlan = todayPlan.filter(item => !(item.subjectIndex === subIndex && item.moduleIndex === modIndex));
      todayPlan.forEach(item => {
        if (item.subjectIndex === subIndex && item.moduleIndex > modIndex) {
          item.moduleIndex--; // Decrement index for modules after the deleted one within the same subject
        }
      });

      saveSubjectsToLocalStorage(); // Save subjects
      saveTodayPlanToLocalStorage(); // Save today's plan after re-indexing
      displaySubjects();
      // Ensure the module list stays open
      document.getElementById(`modules-for-${subIndex}`).style.display = 'block';
      displayTodayPlan();
    }
  }

  window.addModuleToTodayPlan = function(subIndex, modIndex) {
    const moduleToAdd = {
      subjectIndex: subIndex,
      moduleIndex: modIndex,
      name: subjects[subIndex].modules[modIndex].name,
      subjectName: subjects[subIndex].name,
      completed: false // Ensure it's false when added
    };

    // Check if already in today's plan by unique subjectIndex + moduleIndex combination
    const exists = todayPlan.some(item =>
      item.subjectIndex === subIndex && item.moduleIndex === modIndex
    );

    if (!exists) {
      todayPlan.push(moduleToAdd);
      saveTodayPlanToLocalStorage(); // Save to localStorage
      displayTodayPlan();
      alert(`"${moduleToAdd.name}" added to Today's Plan!`);
    } else {
      alert(`"${moduleToAdd.name}" is already in Today's Plan.`);
    }
    // Ensure the module list stays open after adding
    document.getElementById(`modules-for-${subIndex}`).style.display = 'block';
  };

  function displayTodayPlan() {
    const todayPlanList = document.getElementById('today-plan-list');
    todayPlanList.innerHTML = '';

    if (todayPlan.length === 0) {
      todayPlanList.innerHTML = '<p>No modules in Today\'s Plan. Add some from the subjects list!</p>';
    } else {
      todayPlan.forEach((item, index) => {
        const planItem = document.createElement('div');
        planItem.classList.add('today-plan-item');
        if (item.completed) {
          planItem.classList.add('completed-task');
        }
        planItem.innerHTML = `
                    <span class="task-name">${item.subjectName}: ${item.name}</span>
                    <div class="task-complete">
                        <input type="checkbox" ${item.completed ? 'checked' : ''} onchange="toggleTaskCompletion(${index})">
                    </div>
                `;
        todayPlanList.appendChild(planItem);
      });
    }
    // No need to call save here, it's called by toggleTaskCompletion and upon page navigation
  }

  // A flag to indicate if we are currently in the process of toggling a task's completion
  window.isTogglingCompletion = false; // Initialize the flag globally

  window.toggleTaskCompletion = function(index) {
    window.isTogglingCompletion = true; // Set flag
    todayPlan[index].completed = !todayPlan[index].completed; // Toggle the actual item in the array
    saveTodayPlanToLocalStorage(); // Save immediately after toggling
    displayTodayPlan(); // Re-render to reflect the change visually
    window.isTogglingCompletion = false; // Reset flag after re-render
  };

  // --- Hair Care Functions (UNCHANGED) ---
  const hairCareOptionsData = [
    {
      name: "What kind of hair do you have?",
      content: `
                <h3>Understanding Your Hair Type</h3>
                <p>Knowing your hair type is the first step to a good hair care routine. Hair type is generally categorized by:</p>
                <ul>
                    <li><strong>Texture:</strong> Straight, Wavy, Curly, Coily</li>
                    <li><strong>Porosity:</strong> How well your hair absorbs and retains moisture (Low, Medium, High)</li>
                    <li><strong>Density:</strong> How many strands of hair you have on your head (Thin, Medium, Thick)</li>
                    <li><strong>Oiliness/Scalp Type:</b> Oily, Normal, Dry, Combination</li>
                </ul>
                <p>Explore the other options in the sidebar to dive deeper into routines based on porosity!</p>
            `
    },
    {
      name: "Low Porosity",
      content: `
                <h3>Low Porosity Hair Routine</h3>
                <p>Low porosity hair has a tightly bound cuticle layer, which makes it harder for moisture to penetrate but also harder for it to escape. It can be prone to product build-up.</p>
                <h4>Daily Routine:</h4>
                <ul>
                    <li><strong>Moisturize:</strong> Use lightweight, water-based leave-in conditioners or mists.</li>
                    <li><strong>Seal:</strong> A light oil (e.g., jojoba, argan) can seal moisture without weighing it down.</li>
                </ul>
                <h4>Weekly Routine:</h4>
                <ul>
                    <li><strong>Shampoo:</strong> Use a clarifying shampoo once a week or every two weeks to remove build-up.</li>
                    <li><strong>Condition:</strong> Use a lightweight, protein-free conditioner.</li>
                    <li><strong>Deep Condition:</strong> Apply a heat-activated deep conditioner or use a steamer to help product penetrate.</li>
                    <li><strong>Avoid:</strong> Heavy butters or oils that sit on top of the hair.</li>
                </ul>
            `
    },
    {
      name: "Medium Porosity",
      content: `
                <h3>Medium Porosity Hair Routine</h3>
                <p>Medium porosity hair has a looser cuticle layer, allowing for a good balance of moisture absorption and retention. It's often considered the "ideal" hair type.</p>
                <h4>Daily Routine:</h4>
                <ul>
                    <li><strong>Moisturize:</strong> A balanced leave-in conditioner or light styling cream.</li>
                    <li><strong>Style:</strong> Use products that offer light hold and moisture balance.</li>
                </ul>
                <h4>Weekly Routine:</h4>
                <ul>
                    <li><strong>Shampoo:</strong> A gentle, sulfate-free shampoo as needed.</li>
                    <li><strong>Condition:</strong> A hydrating conditioner.</li>
                    <li><strong>Deep Condition:</strong> A balanced deep conditioner, perhaps once every 1-2 weeks. Can use a mix of protein and moisture treatments.</li>
                </ul>
            `
    },
    {
      name: "High Porosity",
      content: `
                <h3>High Porosity Hair Routine</h3>
                <p>High porosity hair has an open or raised cuticle, meaning it absorbs moisture quickly but also loses it just as fast. It can often feel dry and is prone to frizz.</p>
                <h4>Daily Routine:</h4>
                <ul>
                    <li><strong>Layering:</strong> Use the L.O.C. (Liquid, Oil, Cream) or L.C.O. method to layer moisture.</li>
                    <li><strong>Moisturize:</b> Rich, creamy leave-in conditioners.</li>
                    <li><strong>Seal:</strong> Heavy oils (e.g., castor, olive) or butters to lock in moisture.</li>
                </ul>
                <h4>Weekly Routine:</h4>
                <ul>
                    <li><strong>Shampoo:</strong> Gentle, moisturizing, sulfate-free shampoo.</li>
                    <li><strong>Condition:</strong> Super-hydrating, thick conditioners.</li>
                    <li><strong>Deep Condition:</b> Frequent deep conditioning treatments (1-2 times a week) with protein-rich formulas to help strengthen cuticles.</li>
                    <li><strong>Avoid:</strong> High heat styling without heat protectant.</li>
                </ul>
            `
    }
  ];

  function loadHairCarePage() {
    mainContentContainer.classList.remove('button-container');
    mainContentContainer.classList.add('page-container');

    const hairCareSidebar = document.createElement('div');
    hairCareSidebar.classList.add('sidebar');
    hairCareSidebar.innerHTML = '<h2>Hair Care</h2>';
    mainContentContainer.appendChild(hairCareSidebar);

    const hairCareMainContent = document.createElement('div');
    hairCareMainContent.classList.add('main-content-area');
    hairCareMainContent.id = 'hair-care-main-content';
    mainContentContainer.appendChild(hairCareMainContent);

    // Populate sidebar with buttons
    hairCareOptionsData.forEach(option => {
      const button = document.createElement('button');
      button.classList.add('hair-care-button','action-button');
      button.innerText = option.name;
      button.onclick = () => displayHairCareContent(option);
      hairCareSidebar.appendChild(button);
    });

    // Display initial content or first option's content
    if (hairCareOptionsData.length > 0) {
      displayHairCareContent(hairCareOptionsData[0]);
    } else {
      hairCareMainContent.innerHTML = '<p>No hair care information available.</p>';
    }
  }

  window.displayHairCareContent = function(option) {
    const hairCareMainContent = document.getElementById('hair-care-main-content');
    if (hairCareMainContent) { // Added a check to ensure the element exists
        hairCareMainContent.innerHTML = option.content;

        // Also, highlight the selected button in the sidebar
        document.querySelectorAll('.hair-care-button').forEach(btn => {
            if (btn.innerText === option.name) {
                btn.classList.add('primary'); // Use primary for selected style
            } else {
                btn.classList.remove('primary');
            }
        });
    }
};
  // --- END Hair Care Functions ---

  // Initial load of data when the whole DOM is ready
  loadJournalEntriesFromLocalStorage();
  loadSubjectsFromLocalStorage();
  loadTodayPlanFromLocalStorage(); // Load data initially

  // --- Skin Care Functions ---
const skinCareOptionsData = [
    {
        name: "What kind of skin do you have?",
        content: `
            <h3>Understanding Your Skin Type</h3>
            <p>Knowing your skin type is fundamental to an effective skincare routine. Skin types are typically categorized as:</p>
            <ul>
                <li><strong>Normal Skin:</strong> Well-balanced, neither too oily nor too dry.</li>
                <li><strong>Dry Skin:</strong> Lacks sufficient sebum (natural oils), feels tight, may look dull or flaky.</li>
                <li><strong>Oily Skin:</strong> Produces excess sebum, leading to a shiny complexion, enlarged pores, and prone to acne.</li>
                <li><strong>Combination Skin:</strong> Features both oily and dry/normal areas (e.g., oily T-zone, dry cheeks).</li>
                <li><strong>Sensitive Skin:</strong> Easily irritated, prone to redness, itching, or burning sensations.</li>
            </ul>
            <p>Select your skin type from the sidebar to see recommended routines!</p>
        `
    },
    {
        name: "Dry Skin",
        content: `
            <h3>Dry Skin Routine</h3>
            <p>Focus on hydration and barrier repair.</p>
            <h4>Daily Routine:</h4>
            <ul>
                <li><strong>Cleanse:</strong> Use a gentle, hydrating, non-foaming cleanser.</li>
                <li><strong>Serum:</strong> Apply a hyaluronic acid or ceramide serum on damp skin.</li>
                <li><strong>Moisturize:</strong> Use a rich, emollient cream or balm.</li>
                <li><strong>Sunscreen:</strong> Apply a hydrating sunscreen (SPF 30+) daily.</li>
            </ul>
            <h4>Weekly Routine:</h4>
            <ul>
                <li><strong>Exfoliate:</strong> Gently exfoliate 1-2 times a week with a mild chemical exfoliant (e.g., PHA) or enzyme peel. Avoid harsh physical scrubs.</li>
                <li><strong>Mask:</strong> Use a hydrating or nourishing face mask.</li>
            </ul>
        `
    },
    {
        name: "Normal Skin",
        content: `
            <h3>Normal Skin Routine</h3>
            <p>Maintain balance and protect against environmental damage.</p>
            <h4>Daily Routine:</h4>
            <ul>
                <li><strong>Cleanse:</strong> Use a mild, balanced cleanser.</li>
                <li><strong>Serum:</strong> Apply an antioxidant serum (e.g., Vitamin C) in the morning.</li>
                <li><strong>Moisturize:</strong> Use a lightweight, balanced moisturizer.</li>
                <li><strong>Sunscreen:</strong> Apply a broad-spectrum sunscreen (SPF 30+) daily.</li>
            </ul>
            <h4>Weekly Routine:</h4>
            <ul>
                <li><strong>Exfoliate:</strong> Exfoliate 2-3 times a week with a gentle scrub or mild chemical exfoliant (AHA/BHA).</li>
                <li><strong>Mask:</strong> Use a balancing or hydrating mask as needed.</li>
            </ul>
        `
    },
    {
        name: "Oily Skin",
        content: `
            <h3>Oily Skin Routine</h3>
            <p>Control excess oil, minimize pores, and prevent breakouts.</p>
            <h4>Daily Routine:</h4>
            <ul>
                <li><strong>Cleanse:</strong> Use a foaming or gel cleanser, possibly containing salicylic acid if prone to acne.</li>
                <li><strong>Serum:</strong> Apply a niacinamide serum to help regulate oil production and minimize pores.</li>
                <li><strong>Moisturize:</strong> Use a lightweight, oil-free, non-comedogenic moisturizer.</li>
                <li><strong>Sunscreen:</strong> Apply a matte-finish, non-comedogenic sunscreen (SPF 30+) daily.</li>
            </ul>
            <h4>Weekly Routine:</h4>
            <ul>
                <li><strong>Exfoliate:</strong> Use a BHA (salicylic acid) exfoliant 2-3 times a week to penetrate oil and clear pores.</li>
                <li><strong>Mask:</strong> Apply a clay mask 1-2 times a week to absorb excess oil and purify pores.</li>
            </ul>
        `
    },
    {
        name: "Combination Skin",
        content: `
            <h3>Combination Skin Routine</h3>
            <p>Address both oily and dry areas effectively.</p>
            <h4>Daily Routine:</h4>
            <ul>
                <li><strong>Cleanse:</strong> Use a gentle, balancing cleanser.</li>
                <li><strong>Serum:</strong> Apply a hydrating serum to dry areas and an oil-controlling or niacinamide serum to oily areas (e.g., T-zone).</li>
                <li><strong>Moisturize:</strong> Use a lightweight moisturizer, or a richer one on dry patches if needed.</li>
                <li><strong>Sunscreen:</strong> Apply a broad-spectrum sunscreen (SPF 30+) daily.</li>
            </ul>
            <h4>Weekly Routine:</h4>
            <ul>
                <li><strong>Exfoliate:</strong> Use a gentle chemical exfoliant (AHA/BHA) targeting oily areas, or a mild scrub.</li>
                <li><strong>Mask:</strong> Multi-masking (e.g., clay mask on T-zone, hydrating mask on cheeks) can be very beneficial.</li>
            </ul>
        `
    },
    {
        name: "Sensitive Skin",
        content: `
            <h3>Sensitive Skin Routine</h3>
            <p>Focus on soothing, calming, and strengthening the skin barrier.</p>
            <h4>Daily Routine:</h4>
            <ul>
                <li><strong>Cleanse:</strong> Use an ultra-gentle, fragrance-free, soap-free cleanser.</li>
                <li><strong>Serum:</strong> Apply a soothing, barrier-repairing serum (e.g., containing ceramides, centella asiatica, or panthenol).</li>
                <li><strong>Moisturize:</strong> Use a simple, fragrance-free, hypoallergenic moisturizer designed for sensitive skin.</li>
                <li><strong>Sunscreen:</strong> Apply a mineral sunscreen (zinc oxide and/or titanium dioxide) (SPF 30+) daily, as chemical sunscreens can be irritating.</li>
            </ul>
            <h4>Weekly Routine:</h4>
            <ul>
                <li><strong>Exfoliate:</strong> Avoid harsh exfoliation. If needed, use a very mild enzyme mask or skip exfoliation.</li>
                <li><strong>Mask:</strong> Use a soothing, calming, and hydrating mask formulated for sensitive skin.</li>
            </ul>
        `
    }
];

function loadSkinCarePage() {
    const skinCarePageContainer = document.createElement('div'); // Container for sidebar and main content
    // skinCarePageContainer.style.display = 'flex'; // REMOVED inline style
    skinCarePageContainer.classList.add('sidebar-page-wrapper'); // ADDED this class
    skinCarePageContainer.style.width = '100%';

    const skinCareSidebar = document.createElement('div');
    skinCareSidebar.classList.add('sidebar');
    skinCareSidebar.style.flex = '0 0 250px'; // Fixed width sidebar on desktop
    skinCareSidebar.style.paddingRight = '20px';
    //skinCareSidebar.style.borderRight = '1px solid #eee';
    skinCareSidebar.innerHTML = '<h2>Skin Care Options</h2>'; // Title for the sidebar
    skinCarePageContainer.appendChild(skinCareSidebar);

    const skinCareMainContent = document.createElement('div');
    skinCareMainContent.classList.add('main-content-area');
    skinCareMainContent.id = 'skin-care-main-content';
    skinCareMainContent.style.flex = '1'; // Take remaining space on desktop
    skinCareMainContent.style.paddingLeft = '20px';
    skinCarePageContainer.appendChild(skinCareMainContent);

    // Append the entire page structure to the main content container
    mainContentContainer.appendChild(skinCarePageContainer);

    // Populate sidebar with buttons from skinCareOptionsData
    skinCareOptionsData.forEach(option => {
        const button = document.createElement('button');
        button.classList.add('skin-care-button', 'action-button');
        button.innerText = option.name;
        button.onclick = () => displaySkinCareContent(option);
        skinCareSidebar.appendChild(button);
    });

    // Display initial content (first option)
    if (skinCareOptionsData.length > 0) {
        displaySkinCareContent(skinCareOptionsData[0]);
    } else {
        skinCareMainContent.innerHTML = '<p>No skin care information available.</p>';
    }
}

window.displaySkinCareContent = function(option) {
    const skinCareMainContent = document.getElementById('skin-care-main-content');
    if (skinCareMainContent) {
        skinCareMainContent.innerHTML = option.content;

        // Also, highlight the selected button in the sidebar
        document.querySelectorAll('.skin-care-button').forEach(btn => {
            if (btn.innerText === option.name) {
                btn.classList.add('primary'); // Use primary for selected style
            } else {
                btn.classList.remove('primary');
            }
        });
    }
};
// --- END Skin Care Functions ---
// ---Fitness page ---
function getRandomFullBodyWorkout() {
  const categoriesToInclude = [
    "Beginner/ Warm up exercises",
    "Arms",
    "Abs",
    "Legs",
    "Flexibility",
    "Double chin"
  ];

  const allExercises = [];

  categoriesToInclude.forEach(categoryName => {
    const category = fitnessOptionsData.find(opt => opt.name === categoryName);
    if (category) {
      const matches = [...category.content.matchAll(/<li>[\s\S]*?<\/li>/g)];
      matches.forEach(m => allExercises.push(m[0]));
    }
  });

  const shuffled = allExercises.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 15);

  return `
    <h3> Full Body Workout </h3>
    <ol>
      ${selected.join('\n')}
    </ol>
  `;
}

const fitnessOptionsData = [
    { name: "Which body part do you want to focus on?",
      content: `  
      <h3> Select the body part you want to focus on from the sidebar to see recommended routines !
      <img src=
      `
    },
    { name: "Beginner/ Warm up exercises",
      content: `
      <h3> Beginner/ Warm up exercises </h3>
      <ol>
      <li>Jumping Jacks</li>
      <li>Wall Push-ups</li>
      <li>Bodyweight Squats</li>
      <li>Glute Bridges</li>
      <li>Standing Side Bends (Oblique Stretch)</li>
      <li>Arm Circles (Forward & Backward)</li>
      <li>High Knees March (Slow Pace)</li>
      <li>Step-Back Lunges (Alternating Legs)</li>
      <li>Shoulder Taps (from Wall or Table Incline)</li>
      <li>Heel Raises (Standing Calf Raises)</li>
      <li>Standing Oblique Knee Crunches</li>
      <li>Side-Leg Raises (Left Leg)</li>
      <li>Side-Leg Raises (Right Leg)</li>
      <li>Slow Inchworm Walkouts</li>
      <li>Standing Hamstring Kickbacks (Leg to Back Glute Tap)</li>
      </ol>
      `
    },
    { name: "Arms",
      content: `
      <h3> Arm exercises </h3>
      <ol>
      <li>Arm Circles (All Directions – Forward, Backward, Small & Big)</li>
      <li>Wall Push-ups</li>
      <li>Tricep Dips (Chair/Bed Support)</li>
      <li>Inchworm Walkouts</li>
      <li>Shoulder Taps (Incline or Wall)</li>
      <li>Overhead Arm Raises (Hands to Sky)</li>
      <li>Side Arm Raises (Lateral Arm Lift)</li>
      <li>Front Arm Raises (Parallel to Ground)</li>
      <li>Bicep Curls (With Water Bottles or Without Weights)</li>
      <li>Punches in Air (Fast Forward Punches)</li>
      <li>Punches in Air (Crossbody Punches — Across Chest Twist)</li>
      <li>Bent-over Arm Rows (Water Bottles or No Weights — Squeeze Shoulder Blades)</li>
      <li>Reverse Arm Pulses (Arms Straight Backward Pulsing Up & Down)</li>
      <li>Reverse Prayer Arm Stretch (Hands Behind Back)</li>
      <li>Arm Squeezes (Palms Together — Push Inward Tightly for Tension)</li>
      </ol>
      `
    },
    { name: "Abs",
      content: `
      <h3> Abs exercises </h3>
      <ol>
      <li>Standing Oblique Knee Crunches (Side Knee to Elbow Touches)</li>
      <li>Basic Crunches (Lying Down, Lift Shoulders Up)</li>
      <li>Seated Russian Twists (No Weights)</li>
      <li>Leg Raises (Lying Down, Both Legs Up & Down Slowly)</li>
      <li>Reverse Crunches (Lift Hips Up towards Chest)</li>
      <li>Bird-Dog (Alternate Arm & Leg Lift on All Fours)</li>
      <li>Seated Knee Tucks (Sit, Pull Knees to Chest, Release)</li>
      <li>Heel Touches (Side to Side, Lying Down Oblique Crunch)</li>
      <li>Flutter Kicks (Alternate Leg Kicks, Lying Down)</li>
      <li>Dead Bug (Opposite Arm & Leg Movement, Lying Down)</li>
      <li>Bicycle Crunches (Elbow to Opposite Knee, Slow Pace)</li>
      <li>Plank Hold (Standard or on Knees for Easier Version)</li>
      <li>Toe Taps (Lying Down, Tap Floor with Toes Alternately)</li>
      <li>Cobra Stretch (Abdominal Stretch & Relaxation)</li>
      <li>Deep Breathing (Lying Down, Focus on Core Breathing)</li>
      </ol>
      `
    },
    { name: "Legs",
      content: `
      <h3> Leg exercises </h3>
      <ol>
      <li>Bodyweight Squats</li>
      <li>Side-Lying Leg Raises (Left Leg)</li>
      <li>Side-Lying Leg Raises (Right Leg)</li>
      <li>Step-Back Lunges (Alternating Legs)</li>
      <li>Wall Sit Hold (Static Hold)</li>
      <li>Glute Bridges (Lying Down, Lift Hips Up)</li>
      <li>Donkey Kicks (Left Leg)</li>
      <li>Donkey Kicks (Right Leg)</li>
      <li>Standing Quad Stretch (Left Leg Hold)</li>
      <li>Standing Quad Stretch (Right Leg Hold)</li>
      <li>Sumo Squats (Wide-Leg Squats)</li>
      <li>Standing Hamstring Curls (Left — Heel to Glute Tap)</li>
      <li>Standing Hamstring Curls (Right — Heel to Glute Tap)</li>
      <li>Clamshells (Lying on Side, Knees Bent — Left Leg)</li>
      <li>Clamshells (Lying on Side, Knees Bent — Right Leg)</li>
      </ol>
      `
    },
    { name: "Flexibility",
      content: `
      <h3> Yoga asanas </h3>
      <ol>
      <li>Vrikshasana</li>
<li>Paada hastasana</li>
<li>Ardha Chakrasana</li>
<li>Chakrasana</li>
<li>Trikonasana</li>
<li>Samadandasana</li>
<li>Bhadrasana</li>
<li>Vajrasana</li>
<li>Ardha ushtrasana</li>
<li>Ushtrasana</li>
<li>Shashanksana</li>
<li>Vakrasana</li>
<li>Makarasana</li>
<li>Ardha bhujangasana</li>
<li>Bhujangasana</li>
<li>Shalabhasana</li>
<li>Uttana padasana</li>
<li>Ardha halasana</li>
<li>Halasana</li>
<li>Eka pada raja kapotasana</li>
<li>Raja kapotasana</li>
<li>Pavanamuktasana</li>
<li>Shavasana</li>
</ol>  
      `
    },
    { name: "Double chin",
      content: `
    <h3> To reduce double chin </h3> 
    <ol>
      <li>Chin Lifts<br>
<strong>How to do:</strong> Tilt your head back and look at the ceiling. Pucker your lips towards the ceiling as if you’re trying to kiss it.<br>
<strong>Hold:</strong> 10 seconds.<br>
<strong>Reps:</strong> 10–15 times.
</li>

<li>Jaw Jut (Forward Jaw Stretch)<br>
<strong>How to do:</strong> Tilt your head back, look at the ceiling, push your lower jaw forward.<br>
<strong>Hold:</strong> 10 seconds.<br>
<strong>Reps:</strong> 10–15 times.
</li>

<li>Neck Rolls<br>
<strong>How to do:</strong> Slowly rotate your head clockwise, stretching neck and jaw muscles.<br>
<strong>Reps:</strong> 10 rounds clockwise, 10 rounds anti-clockwise.
</li>

<li>Tongue Stretch<br>
<strong>How to do:</strong> Stick your tongue out as far as possible and try to touch your chin with it.<br>
<strong>Hold:</strong> 10 seconds.<br>
<strong>Reps:</strong> 10 times.
</li>

<li>Cheek Puff (Fish Face)<br>
<strong>How to do:</strong> Suck your cheeks in and hold a “fish face”.<br>
<strong>Hold:</strong> 10 seconds.<br>
<strong>Reps:</strong> 15 times.
</li>

<li>Platysma Exercise (Neck Muscle Tightener)<br>
<strong>How to do:</strong> Pull your lips back against your teeth and open your mouth slightly. Move the jaw up and down.<br>
<strong>Reps:</strong> 10–15 times.
</li>

<li>Ball Press (Under Chin)<br>
<strong>How to do:</strong> Place a small ball (around 9–10 inches) under your chin and press your chin down against the ball.<br>
<strong>Reps:</strong> 10–15 times.
</li>

<li>Neck Stretch (Seated/Standing)<br>
<strong>How to do:</strong> Tilt your head to one side (ear to shoulder) and hold.<br>
<strong>Hold:</strong> 10 seconds per side.<br>
<strong>Reps:</strong> 10 times per side.
</li>
</ol>
      `
    },
    { name: "Full Body Workout",
      get content() {
    return getRandomFullBodyWorkout();
    }
    }
];
function loadFitnessPage() {
    const fitnessPageContainer = document.createElement('div'); // Container for sidebar and main content
    fitnessPageContainer.classList.add('sidebar-page-wrapper');
    fitnessPageContainer.style.width = '100%';

    const fitnessSidebar = document.createElement('div');
    fitnessSidebar.classList.add('sidebar');
    fitnessSidebar.style.flex = '0 0 250px'; // Fixed width sidebar
    fitnessSidebar.style.paddingRight = '20px';
    //fitnessSidebar.style.borderRight = '1px solid #eee';
    fitnessSidebar.innerHTML = '<h2>Fitness Options</h2>'; // Title for the sidebar
    fitnessPageContainer.appendChild(fitnessSidebar);

    const fitnessMainContent = document.createElement('div');
    fitnessMainContent.classList.add('main-content-area');
    fitnessMainContent.id = 'fitness-main-content';
    fitnessMainContent.style.flex = '1';
    fitnessMainContent.style.paddingLeft = '20px';
    fitnessPageContainer.appendChild(fitnessMainContent);

    // Append the entire page structure to the main content container
    mainContentContainer.appendChild(fitnessPageContainer);

    // Populate sidebar with buttons from fitnessOptionsData
    fitnessOptionsData.forEach(option => {
        const button = document.createElement('button');
        button.classList.add('fitness-button', 'action-button');
        button.innerText = option.name;
        button.onclick = () => displayFitnessContent(option);
        fitnessSidebar.appendChild(button);
    });

    // Display initial content (first option)
    if (fitnessOptionsData.length > 0) {
        displayFitnessContent(fitnessOptionsData[0]);
    } else {
        fitnessMainContent.innerHTML = '<p>No fitness information available.</p>';
    }
}

window.displayFitnessContent = function(option) {
    const fitnessMainContent = document.getElementById('fitness-main-content');
    if (fitnessMainContent) {
        fitnessMainContent.innerHTML = option.content;

        // Highlight selected button in sidebar
        document.querySelectorAll('.fitness-button').forEach(btn => {
            if (btn.innerText === option.name) {
                btn.classList.add('primary'); // Selected style
            } else {
                btn.classList.remove('primary');
            }
        });
    }
};

});