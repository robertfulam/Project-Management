// // task model
// task: [
//     title: {

//     }
         
    
// ]


import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({

  title: {
    type: String,
    required: true
  },

  description: {
    type: String
  },

  category: {
    type: String
  },

  urgency: {
    type: String,
    enum: ["Urgent", "General", "Optional"]
  },

  priority: {
    type: String,
    enum: ["Low", "Medium", "High"]
  },

  dueDate: {
    type: Date
  },

  assignedTo: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],

  completed: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

export default mongoose.model("Task", taskSchema);