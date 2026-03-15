import Submission from "../models/Submission.js";

export const submitTask = async (req, res) => {

  const submission = await Submission.create(req.body);

  res.json(submission);

};


export const checkSubmission = async (req, res) => {

  const submission = await Submission.findById(req.params.id);

  /* AI CHECK PLACEHOLDER */

  const aiResult = true;

  if (aiResult) {

    submission.status = "complete";

  } else {

    submission.status = "started";

  }

  submission.aiChecked = true;

  await submission.save();

  res.json(submission);

};