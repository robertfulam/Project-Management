import { useState } from "react";
import "../components/Dashboard.css";

const priorities = ["High", "Medium", "Low"];
const urgencyLevels = ["Very Urgent", "Urgent", "Not Urgent"];

const data = {
  High: {
    "Very Urgent": {
      YouTube: ["Upload", "Fix thumbnails"],
      Work: ["Finish report"]
    },
    Urgent: {
      School: ["Submit assignment"]
    },
    "Not Urgent": {
      Personal: ["Watch course"]
    }
  },
  Medium: {
    Urgent: {
      School: ["Read notes"]
    }
  },
  Low: {
    "Not Urgent": {
      Personal: ["Gym", "Relax"]
    }
  }
};

function Dashboard() {
  const [priority, setPriority] = useState(null);
  const [urgency, setUrgency] = useState(null);
  const [category, setCategory] = useState(null);
  const [task, setTask] = useState(null);

  const [aiInput, setAiInput] = useState("");
  const [showActions, setShowActions] = useState(false);

  // NEW STATE: persistent last-selected task path
  const [taskPath, setTaskPath] = useState("AI Assistant");

  // Task selection: set input + close menus + store path
  const handleTaskClick = (t) => {
    setTask(t);
    setAiInput(`I'm working on this "${t}" today`);

    // Save persistent path
    setTaskPath(`${priority} - ${urgency} - ${category} - ${t}`);

    // Close floating menus
    setPriority(null);
    setUrgency(null);
    setCategory(null);
  };

  // + menu item clicked → close dropdown
  const handleActionClick = (action) => {
    console.log(action);
    setShowActions(false);
  };

  return (
    <div className="dashboard">

      {/* LEFT SIDE */}
      <div className="left-column">
        <h2>Priorities</h2>

        {priorities.map((p) => (
          <div className="priority-item" key={p}>
            <button
              onClick={() => {
                setPriority(p);
                setUrgency(null);
                setCategory(null);
                setTask(null);
              }}
            >
              {p}
            </button>

            {/* FLOATING MENU */}
            {priority === p && (
              <div className="floating-wrapper">

                {/* URGENCY */}
                <div className="float-column">
                  <h4>Urgency</h4>
                  {urgencyLevels.map((u) => (
                    <button
                      key={u}
                      onClick={() => {
                        setUrgency(u);
                        setCategory(null);
                        setTask(null);
                      }}
                    >
                      {u}
                    </button>
                  ))}
                </div>

                {/* CATEGORY */}
                {urgency && data[p]?.[urgency] && (
                  <div className="float-column">
                    <h4>Category</h4>
                    {Object.keys(data[p][urgency]).map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          setCategory(c);
                          setTask(null);
                        }}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}

                {/* TASK */}
                {category && (
                  <div className="float-column">
                    <h4>Tasks</h4>
                    {data[p][urgency][category].map((t) => (
                      <button key={t} onClick={() => handleTaskClick(t)}>
                        {t}
                      </button>
                    ))}
                  </div>
                )}

              </div>
            )}
          </div>
        ))}
      </div>

      {/* RIGHT SIDE */}
      <div className="right-column">

        {/* ✅ Persistent AI Header */}
        <div className="ai-header">{taskPath}</div>

        <div className="chat-box">
          <p>{aiInput || "Select a task..."}</p>
        </div>

        <div className="input-area">

          {/* PLUS BUTTON */}
          <div className="plus-container">
            <button onClick={() => setShowActions(!showActions)}>+</button>

            {showActions && (
              <div className="actions-dropdown">
                <button onClick={() => handleActionClick("Summarize Task")}>
                  Summarize Task
                </button>
                <button onClick={() => handleActionClick("Monetize Task")}>
                  Monetize Task
                </button>
                <button onClick={() => handleActionClick("Upload")}>
                  Upload
                </button>
              </div>
            )}
          </div>

          <input
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            placeholder="Ask AI..."
          />

          <button className="send-btn">↑</button>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;