const taskInput = document.getElementById("taskInput");
const dueDateInput = document.getElementById("dueDate");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const filterBtns = document.querySelectorAll(".filter-btn");
const searchInput = document.getElementById("searchInput");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// Save to localStorage
function saveTasks() { localStorage.setItem("tasks", JSON.stringify(tasks)); }

// Render tasks
function renderTasks(filter = "all", search = "") {
  taskList.innerHTML = "";
  tasks.forEach((task, index) => {
    if (filter === "completed" && !task.completed) return;
    if (filter === "pending" && task.completed) return;
    if (!task.name.toLowerCase().includes(search.toLowerCase())) return;

    const li = document.createElement("li");
    li.className = "task-item" + (task.completed ? " completed" : "");
    if (task.due && new Date(task.due) < new Date() && !task.completed) li.classList.add("overdue");
    li.setAttribute("draggable", true);
    li.dataset.index = index;

    li.innerHTML = `
      <span>${task.name} ${task.due ? "(Due: "+task.due+")" : ""}</span>
      <div>
        <button class="complete-btn">${task.completed ? "✔️" : "✅"}</button>
        <button class="delete-btn">🗑️</button>
      </div>
    `;

    li.querySelector(".complete-btn").addEventListener("click", () => {
      tasks[index].completed = !tasks[index].completed;
      saveTasks();
      renderTasks(filter, search);
    });

    li.querySelector(".delete-btn").addEventListener("click", () => {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks(filter, search);
    });

    taskList.appendChild(li);
  });

  addDragDrop();
}

// Add Task
addTaskBtn.addEventListener("click", () => {
  const name = taskInput.value.trim();
  const due = dueDateInput.value;
  if (!name) return alert("Enter a task!");
  tasks.push({ name, completed: false, due });
  taskInput.value = "";
  dueDateInput.value = "";
  saveTasks();
  renderTasks();
});

// Filters
filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    filterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderTasks(btn.dataset.filter, searchInput.value);
  });
});

// Search
searchInput.addEventListener("input", () => {
  renderTasks(document.querySelector(".filter-btn.active")?.dataset.filter || "all", searchInput.value);
});

// Drag & Drop
function addDragDrop() {
  let draggedItem;
  const items = document.querySelectorAll(".task-item");

  items.forEach(item => {
    item.addEventListener("dragstart", () => {
      draggedItem = item;
      item.classList.add("dragging");
    });
    item.addEventListener("dragend", () => item.classList.remove("dragging"));
    item.addEventListener("dragover", e => {
      e.preventDefault();
      const bounding = item.getBoundingClientRect();
      const offset = e.clientY - bounding.top + 1;
      const parent = item.parentNode;
      if (offset > bounding.height / 2) parent.insertBefore(draggedItem, item.nextSibling);
      else parent.insertBefore(draggedItem, item);
    });
  });

  // Update tasks array order
  taskList.addEventListener("drop", () => {
    const newTasks = [];
    document.querySelectorAll(".task-item").forEach(el => {
      newTasks.push(tasks[el.dataset.index]);
    });
    tasks = newTasks;
    saveTasks();
    renderTasks(document.querySelector(".filter-btn.active")?.dataset.filter || "all", searchInput.value);
  });
}

// Initial render
renderTasks();
