import { useState } from "react";
import { mockTasks } from "../data/mockTasks";

export const useTask = () => {
  const [tasks, setTasks] = useState(mockTasks);

  const addTask = (task) => {
    setTasks((prev) => [...prev, { ...task, id: Date.now().toString(), completed: false }]);
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const updateTask = (id, updatedData) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, ...updatedData } : task
      )
    );
  };

  const toggleComplete = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  return {
    tasks,
    addTask,
    deleteTask,
    updateTask,
    toggleComplete,
  };
};