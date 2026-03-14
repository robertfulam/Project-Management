import { useNavigate } from "react-router-dom";

const MyTasks = () => {

  const navigate = useNavigate();

  return (

    <div>

      <h2>Admin Personal Tasks</h2>

      <button onClick={() => navigate("/")}>
        Open My Task Portal
      </button>

    </div>

  );
};

export default MyTasks;