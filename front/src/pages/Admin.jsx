import React, { useState } from "react";
import ActiveTasks from "../components/ActiveTaskPanel";
import Users from "../components/UsersPanel";
import GiveTask from "../components/GiveTaskPanel";
import Progress from "../components/ProgressPanel";
import MyTasks from "../components/MyTaskPanel";
import AdminAccount from "../components/AdminAccountPanel";
import AdminProgress from "../components/AdminProgress";
import "../components/Admin.css";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("tasks");

  return (
    <div className="admin-container">
      <div className="admin-navbar">
        <button onClick={() => setActiveTab("tasks")}>Active Tasks</button>
        <button onClick={() => setActiveTab("users")}>Users</button>
        <button onClick={() => setActiveTab("giveTask")}>Give Task</button>
        <button onClick={() => setActiveTab("progress")}>My Progress</button>
        <button onClick={() => setActiveTab("teamProgress")}>Team Progress</button>
        <button onClick={() => setActiveTab("mytasks")}>My Tasks</button>
        <button onClick={() => setActiveTab("account")}>Admin Account</button>
      </div>

      {activeTab === "tasks" && <ActiveTasks />}
      {activeTab === "users" && <Users />}
      {activeTab === "giveTask" && <GiveTask />}
      {activeTab === "progress" && <Progress />}
      {activeTab === "teamProgress" && <AdminProgress />}
      {activeTab === "mytasks" && <MyTasks />}
      {activeTab === "account" && <AdminAccount />}
    </div>
  );
};

export default Admin;