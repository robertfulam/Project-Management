import { useNavigate } from "react-router-dom";

function AdminToggle({ isAdminView }) {

  const navigate = useNavigate();

  const handleToggle = () => {

    if (isAdminView) {
      navigate("/");      // normal user dashboard
    } else {
      navigate("/admin"); // admin panel
    }

  };

  return (

    <button onClick={handleToggle}>

      {isAdminView ? "Switch to User Mode" : "Switch to Admin Mode"}

    </button>

  );
}

export default AdminToggle;