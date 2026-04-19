import axios from "axios";

// const API_URL = "http://localhost:5000/api/tasks";
const API_URL = `${import.meta.env.VITE_API_URL}/tasks`;

// GET ALL TASKS
export const getTasks = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

// GET SINGLE TASK
export const getTask = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
};

// CREATE TASK
export const addTask = async (taskData) => {
  const res = await axios.post(API_URL, taskData);
  return res.data;
};

// UPDATE TASK
export const editTask = async (id, taskData) => {
  const res = await axios.put(`${API_URL}/${id}`, taskData);
  return res.data;
};

// DELETE TASK
export const removeTask = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};