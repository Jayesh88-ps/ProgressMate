let weeklyReflections = JSON.parse(localStorage.getItem('weeklyReflections')) || [];

function saveWeeklyReflections() {
  localStorage.setItem('weeklyReflections', JSON.stringify(weeklyReflections));
}



function showTab(tabId) {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => tab.classList.remove('active'));

  const activeTab = document.getElementById(tabId);
  if (activeTab) activeTab.classList.add('active');

  // If switching to the review tab, render the chart after making it visible
  if (tabId === 'review') {
    renderWeeklyReview();
  }
}

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
  const taskList = document.getElementById('taskList');
  taskList.innerHTML = '';

  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.className = task.completed ? 'completed' : '';

    li.innerHTML = `
      <input type="checkbox" onchange="toggleTask(${index})" ${task.completed ? 'checked' : ''} />
      <span>${task.text}</span>
      <div class="task-actions">
        <button onclick="deleteTask(${index})">✖</button>
      </div>
    `;
    taskList.appendChild(li);
  });
}


function addTask() {
  const taskInput = document.getElementById('taskInput');
  const taskText = taskInput.value.trim();
  if (taskText === '') return;

  tasks.push({ text: taskText, completed: false });
  taskInput.value = '';
  saveTasks();
  renderTasks();
}

function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
}

// Initial render
renderTasks();


let learnings = JSON.parse(localStorage.getItem('learnings')) || [];

function saveLearnings() {
  localStorage.setItem('learnings', JSON.stringify(learnings));
}

function renderLearnings() {
  const learningList = document.getElementById('learningList');
  const searchInput = document.getElementById('searchInput');
  const noResultsMsg = document.getElementById('noResultsMsg');
  learningList.innerHTML = '';

  const searchTerm = searchInput.value.trim().toLowerCase();

  let hasResults = false;

  learnings.forEach((entry, index) => {
    const match =
      entry.text.toLowerCase().includes(searchTerm) ||
      entry.category.toLowerCase().includes(searchTerm) ||
      entry.date.toLowerCase().includes(searchTerm);

    if (match) {
      hasResults = true;

      const li = document.createElement('li');
      li.className = 'learning-card';
      li.innerHTML = `
        <span class="date">📅 ${entry.date}</span>
        <span class="entry">“${entry.text}”</span>
        <div class="tag ${entry.category}">${entry.category}</div>
        <button class="delete-btn" onclick="deleteLearningByIndex(${index})">✖</button>
      `;
      learningList.appendChild(li);
    }
  });

  noResultsMsg.style.display = hasResults ? 'none' : 'block';
}






function addLearning() {
  const learningInput = document.getElementById('learningInput');
  const categorySelect = document.getElementById('categorySelect');
  const learningText = learningInput.value.trim();
  const selectedCategory = categorySelect.value;

  if (learningText === '') return;

  const today = new Date().toLocaleDateString();
  learnings.unshift({
    date: today,
    text: learningText,
    category: selectedCategory
  });

  learningInput.value = '';
  saveLearnings();
  renderLearnings();
}


function deleteLearning(index) {
  learnings.splice(index, 1);
  saveLearnings();
  renderLearnings();
}

// Initial render
renderLearnings();


function renderWeeklyReview() {
  // Load saved reflection
  const completedTasks = tasks.filter(task => task.completed).length;
  const incompleteTasks = tasks.length - completedTasks;

  const chartContainer = document.getElementById('progressChart');
  if (tasks.length === 0) {
    chartContainer.style.display = 'none';
    // Show a message if no tasks
    if (!document.getElementById('noChartMsg')) {
      const msg = document.createElement('div');
      msg.id = 'noChartMsg';
      msg.style.textAlign = 'center';
      msg.style.color = '#888';
      msg.textContent = 'No tasks to display in chart.';
      chartContainer.parentNode.insertBefore(msg, chartContainer);
    }
  } else {
    chartContainer.style.display = 'block';
    const oldMsg = document.getElementById('noChartMsg');
    if (oldMsg) oldMsg.remove();
    const ctx = chartContainer.getContext('2d');
    if (window.progressChart && typeof window.progressChart.destroy === 'function') {
      window.progressChart.destroy(); // destroy previous chart if exists
    }
    window.progressChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['✅ Completed', '❌ Incomplete'],
        datasets: [{
          data: [completedTasks, incompleteTasks],
          backgroundColor: ['#4caf50', '#f44336'],
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: document.body.classList.contains('dark') ? '#eee' : '#333'
            }
          }
        }
      }
    });
  }
  renderSavedReflections();
}

function renderSavedReflections() {
  const container = document.getElementById('savedReflection');
  if (!container) return;
  if (weeklyReflections.length === 0) {
    container.innerHTML = '<em>No reflections saved yet.</em>';
    return;
  }
  container.innerHTML = '<h4>Previous Reflections</h4>' +
    '<ul style="padding-left: 20px;">' +
    weeklyReflections.map((r, i) =>
      `<li><b>Week of ${r.week}:</b> ${r.text} <button onclick="deleteReflection(${i})" style="color:red;float:right;font-size:18px;background:none;border:none;cursor:pointer;">✖</button></li>`
    ).join('') + '</ul>';
}


// Remove this duplicate event listener, as renderWeeklyReview is now called from showTab
// document.querySelector("button[onclick=\"showTab('review')\"]").addEventListener("click", renderWeeklyReview);


function deleteLearningByIndex(index) {
  learnings.splice(index, 1);
  saveLearnings();
  renderLearnings();
}

function toggleDarkMode() {
  const body = document.body;
  const isDark = body.classList.toggle('dark');

  // Save preference
  localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');

  // Update button text
  document.getElementById('toggleMode').textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
}

// Load saved preference on page load
window.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('darkMode');
  if (saved === 'enabled') {
    document.body.classList.add('dark');
    document.getElementById('toggleMode').textContent = '☀️ Light Mode';
  }
});

function saveReflection() {
  const reflectionText = document.getElementById('weeklyReflection').value.trim();
  if (reflectionText === '') return;

  const today = new Date();
  const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
  const dateLabel = weekStart.toLocaleDateString();

  // Add to the beginning of the list
  weeklyReflections.unshift({
    week: dateLabel,
    text: reflectionText
  });
  
  saveWeeklyReflections();
  renderWeeklyReview();
}

function deleteReflection(index) {
  if (confirm('Are you sure you want to delete this reflection?')) {
    weeklyReflections.splice(index, 1);
    saveWeeklyReflections();
    renderWeeklyReview();
  }
}
