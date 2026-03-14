import { Pie } from "react-chartjs-2";

const Progress = () => {

  const data = {

    labels: ["Completed", "Started", "Not Started"],

    datasets: [

      {
        data: [10, 5, 3],

        backgroundColor: [
          "#22c55e",
          "#f59e0b",
          "#ef4444"
        ]
      }

    ]
  };

  return (

    <div>

      <h2>Task Progress</h2>

      <div style={{ width: "300px" }}>

        <Pie data={data} />

      </div>

    </div>

  );
};

export default Progress;