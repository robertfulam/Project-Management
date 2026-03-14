const validateTaskSubmission = async (taskQuestion, userSubmission) => {

  const response = await fetch("/api/ai-validate", {

    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({
      question: taskQuestion,
      submission: userSubmission
    })

  });

  const data = await response.json();

  return data.valid;

};