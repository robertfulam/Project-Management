import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const registerUser = async (req, res) => {

  try {

    const { name, email, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed
    });

    res.json(user);

  } catch (error) {

    res.status(500).json(error);

  }

};


export const loginUser = async (req, res) => {

  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.status(400).json("User not found");

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) return res.status(400).json("Invalid password");

    res.json(user);

  } catch (error) {

    res.status(500).json(error);

  }

};