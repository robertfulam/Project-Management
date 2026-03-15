import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({

  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task"
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  contentType: {
    type: String,
    enum: ["text", "pdf", "video", "audio"]
  },

  content: {
    type: String
  },

  status: {
    type: String,
    enum: ["not started", "started", "complete"],
    default: "started"
  },

  aiChecked: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

export default mongoose.model("Submission", submissionSchema);