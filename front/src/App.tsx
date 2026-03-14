import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import AddTask from "./pages/AddTask";
import EditTask from "./pages/EditTask";
import TaskDetails from "./pages/TaskDetails";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Complete from "./components/Complete";
import Pending from "./components/Pending";
import Categories from "./components/Categories";
import Admin from "./pages/Admin";

function App() {


  return (
     <div className="card">
      <Navbar />

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/add" element={<AddTask />} />
        <Route path="/complete" element={<Complete />} />
        <Route path="/pending" element={<Pending />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/edit/:id" element={<EditTask />} />
        <Route path="/task/:id" element={<TaskDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>

    </div>
  );
}

export default App;