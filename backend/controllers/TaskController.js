// import tasks from "../data/tasks.js";

// // GET all tasks
// export const getTasks = (req, res) => {
//   res.json(tasks);
// };

// // GET single task
// export const getTaskById = (req, res) => {
//   const task = tasks.find((t) => t.id === req.params.id);
//   if (!task) return res.status(404).json({ message: "Task not found" });

//   res.json(task);
// };

// // CREATE task
// export const createTask = (req, res) => {
//   const newTask = {
//     id: Date.now().toString(),
//     ...req.body,
//   };

//   tasks.push(newTask);
//   res.status(201).json(newTask);
// };

// // UPDATE task
// export const updateTask = (req, res) => {
//   const index = tasks.findIndex((t) => t.id === req.params.id);

//   if (index === -1)
//     return res.status(404).json({ message: "Task not found" });

//   tasks[index] = { ...tasks[index], ...req.body };

//   res.json(tasks[index]);
// };

// // DELETE task
// export const deleteTask = (req, res) => {
//   const index = tasks.findIndex((t) => t.id === req.params.id);

//   if (index === -1)
//     return res.status(404).json({ message: "Task not found" });

//   const deleted = tasks.splice(index, 1);
//   res.json(deleted[0]);
// };




import Task from "../models/Task.js";
import User from "../models/User.js";


export const createTask = async (req, res) => {

  try {

    const task = await Task.create(req.body);

    res.json(task);

  } catch (error) {

    res.status(500).json(error);

  }

};


export const getTasks = async (req, res) => {

  const tasks = await Task.find().populate("assignedTo");

  res.json(tasks);

};


export const deleteTask = async (req, res) => {

  await Task.findByIdAndDelete(req.params.id);

  res.json("Task deleted");

};


export const completeTask = async (req, res) => {

  const task = await Task.findById(req.params.id);

  task.completed = true;

  await task.save();

  res.json(task);

};