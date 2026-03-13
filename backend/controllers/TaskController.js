import tasks from "../data/tasks.js";

// GET all tasks
export const getTasks = (req, res) => {
  res.json(tasks);
};

// GET single task
export const getTaskById = (req, res) => {
  const task = tasks.find((t) => t.id === req.params.id);
  if (!task) return res.status(404).json({ message: "Task not found" });

  res.json(task);
};

// CREATE task
export const createTask = (req, res) => {
  const newTask = {
    id: Date.now().toString(),
    ...req.body,
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
};

// UPDATE task
export const updateTask = (req, res) => {
  const index = tasks.findIndex((t) => t.id === req.params.id);

  if (index === -1)
    return res.status(404).json({ message: "Task not found" });

  tasks[index] = { ...tasks[index], ...req.body };

  res.json(tasks[index]);
};

// DELETE task
export const deleteTask = (req, res) => {
  const index = tasks.findIndex((t) => t.id === req.params.id);

  if (index === -1)
    return res.status(404).json({ message: "Task not found" });

  const deleted = tasks.splice(index, 1);
  res.json(deleted[0]);
};