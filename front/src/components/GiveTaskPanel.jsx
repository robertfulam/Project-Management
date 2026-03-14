const GiveTask = () => {

  const handleSubmit = (e) => {

    e.preventDefault();

    alert("Task assigned to all users");

  };

  return (

    <div>

      <h2>Give Task to Everyone</h2>

      <form onSubmit={handleSubmit}>

        <input placeholder="Task title" required />

        <textarea placeholder="Task description" />

        <input type="file" />

        <button type="submit">
          Assign Task
        </button>

      </form>

    </div>

  );
};

export default GiveTask;