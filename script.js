document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'sprintlog_tasks_v1';

  const currentDateEl = document.getElementById('currentDate');
  const taskForm = document.getElementById('taskForm');
  const taskTitleInput = document.getElementById('taskTitle');
  const taskTrackInput = document.getElementById('taskTrack');
  const taskMinutesInput = document.getElementById('taskMinutes');
  const taskPriorityInput = document.getElementById('taskPriority');
  const taskListEl = document.getElementById('taskList');
  const emptyStateEl = document.getElementById('emptyState');
  const filterTabs = document.querySelectorAll('.tab');
  const clearCompletedBtn = document.getElementById('clearCompletedBtn');

  const progressPercentEl = document.getElementById('progressPercent');
  const progressBarEl = document.getElementById('progressBar');
  const completedCountEl = document.getElementById('completedCount');
  const pendingCountEl = document.getElementById('pendingCount');
  const totalMinutesEl = document.getElementById('totalMinutes');

  const today = new Date();
  currentDateEl.textContent = today.toLocaleDateString('en-NG', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const defaultTasks = [
    {
      id: 1,
      title: 'Deploy Ogun Harvest Direct landing page to GitHub Pages',
      track: 'Portfolio',
      minutes: 30,
      priority: 'High',
      completed: true
    },
    {
      id: 2,
      title: 'Implement LocalStorage persistence & array filtering in JavaScript',
      track: 'Frontend',
      minutes: 60,
      priority: 'High',
      completed: false
    },
    {
      id: 3,
      title: 'Review asynchronous fetch() and JSON error handling patterns',
      track: 'Backend',
      minutes: 45,
      priority: 'Medium',
      completed: false
    }
  ];

  let tasks = loadTasks();
  let currentFilter = 'all';

  function loadTasks() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return defaultTasks;
      }
    }
    return defaultTasks;
  }

  function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  function updateMetrics() {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const remaining = total - completed;
    const completedMins = tasks
      .filter((t) => t.completed)
      .reduce((sum, t) => sum + Number(t.minutes), 0);

    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    progressPercentEl.textContent = `${percent}%`;
    progressBarEl.style.width = `${percent}%`;
    completedCountEl.textContent = completed;
    pendingCountEl.textContent = remaining;
    totalMinutesEl.textContent = `${completedMins}m`;
  }

  function renderTasks() {
    taskListEl.innerHTML = '';

    const filtered = tasks.filter((task) => {
      if (currentFilter === 'active') return !task.completed;
      if (currentFilter === 'completed') return task.completed;
      return true;
    });

    if (filtered.length === 0) {
      emptyStateEl.hidden = false;
    } else {
      emptyStateEl.hidden = true;
    }

    filtered.forEach((task) => {
      const li = document.createElement('li');
      li.className = `task-item priority-${task.priority}${task.completed ? ' done' : ''}`;

      li.innerHTML = `
        <div class="task-left">
          <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} aria-label="Mark task complete">
          <div class="task-info">
            <span class="task-title"></span>
            <div class="task-meta">
              <span class="badge-track">${task.track}</span>
              <span>${task.minutes} mins</span>
              <span>• ${task.priority} Priority</span>
            </div>
          </div>
        </div>
        <button type="button" class="btn-delete">Remove</button>
      `;

      li.querySelector('.task-title').textContent = task.title;

      li.querySelector('.task-checkbox').addEventListener('change', () => {
        toggleTask(task.id);
      });

      li.querySelector('.btn-delete').addEventListener('click', () => {
        deleteTask(task.id);
      });

      taskListEl.appendChild(li);
    });

    updateMetrics();
  }

  function addTask(title, track, minutes, priority) {
    const newTask = {
      id: Date.now(),
      title,
      track,
      minutes: Number(minutes) || 30,
      priority,
      completed: false
    };
    tasks.unshift(newTask);
    saveTasks();
    renderTasks();
  }

  function toggleTask(id) {
    tasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    saveTasks();
    renderTasks();
  }

  function deleteTask(id) {
    tasks = tasks.filter((task) => task.id !== id);
    saveTasks();
    renderTasks();
  }

  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = taskTitleInput.value.trim();
    if (!title) {
      taskTitleInput.focus();
      return;
    }

    addTask(
      title,
      taskTrackInput.value,
      taskMinutesInput.value,
      taskPriorityInput.value
    );

    taskTitleInput.value = '';
    taskTitleInput.focus();
  });

  filterTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      filterTabs.forEach((btn) => btn.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.dataset.filter;
      renderTasks();
    });
  });

  clearCompletedBtn.addEventListener('click', () => {
    tasks = tasks.filter((task) => !task.completed);
    saveTasks();
    renderTasks();
  });

  renderTasks();
});