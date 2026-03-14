import { useState } from "react";
import { mockTasks } from "../data/mockTasks";
import "./TaskForm.css";

function TaskForm({ initialData = {}, onSubmit }) {

  const existingCategories = [
    ...new Set(mockTasks.map((task) => task.category))
  ];

  const [showModal, setShowModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const [formData, setFormData] = useState({
    category: initialData.category || "",
    title: initialData.title || "",
    description: initialData.description || "",
    status: initialData.status || "General",
    priority: initialData.priority || "Low",
    dueDate: initialData.dueDate || "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCategorySelect = (cat) => {
    setFormData({ ...formData, category: cat });
    setShowModal(false);
  };

  const handleNewCategory = () => {
    if (!newCategory.trim()) return;

    setFormData({ ...formData, category: newCategory });
    setNewCategory("");
    setShowModal(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form className="addTask" onSubmit={handleSubmit}>

      {/* CATEGORY */}
      {/* <label className="label">Category</label> */}

      <div className="category-select">
        <input
          type="text"
          name="Enter category eg Work, Personal"
          value={formData.category}
          placeholder="Select or create category"
          readOnly
        />

        <button
          type="button"
          onClick={() => setShowModal(true)}
        >
          Choose
        </button>
      </div>


      {/* CATEGORY MODAL */}
      {showModal && (
        <div className="modal-overlay">

          <div className="modal">

            <h3>Select Category</h3>

            {existingCategories.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className="category-btn"
              >
                {cat}
              </button>
            ))}

            <hr />

            <h4>Create New Category</h4>

            <input
              type="text"
              placeholder="New category name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />

            <button
              type="button"
              onClick={handleNewCategory}
            >
              Add Category
            </button>

            <button
              type="button"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>

          </div>

        </div>
      )}

      {/* TASK TITLE */}
      {/* <label className="label">Task Title</label> */}
      <input
        name="title"
        placeholder="Enter task title"
        value={formData.title}
        onChange={handleChange}
        required
      />

      {/* DESCRIPTION */}
      {/* <label className="label">Description</label> */}
      <textarea
        name="description"
        placeholder="Task description"
        value={formData.description}
        onChange={handleChange}
      />

      {/* URGENCY */}
      {/* <label className="label">Urgency</label> */}
      <select
        name="status"
        value={formData.status}
        onChange={handleChange}
      >
        <option>Urgent</option>
        <option>General</option>
        <option>Optional</option>
      </select>

      {/* PRIORITY */}
      {/* <label className="label">Priority</label> */}
      <select
        name="priority"
        value={formData.priority}
        onChange={handleChange}
      >
        <option>Low</option>
        <option>Medium</option>
        <option>High</option>
      </select>

      {/* COMPLETION DATE */}
      <label className="label">Completion Date</label>
      <input
        type="date"
        name="dueDate"
        value={formData.dueDate}
        onChange={handleChange}
      />

      <button type="submit">Create Task</button>

    </form>
  );
}

export default TaskForm;