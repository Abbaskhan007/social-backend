const bcrypt = require("bcrypt");
const userModel = require("../Models/userModel");
const jwt = require("jsonwebtoken");
const express = require("express");
const userRouter = express.Router();
const mongoose = require("mongoose");

userRouter.post("/registeration", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      image,
      friendsList,
      location,
      occupation,
    } = req.body;

    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      firstName,
      lastName,
      email,
      password: hashPassword,
      image,
      location,
      occupation,
      friendsList,
      viewedProfile: Math.floor(Math.random() * 1000),
      impression: Math.floor(Math.random() * 1000),
    });

    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
    alert("User Updated Successfully");
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({ error: error.message });
  }
});

userRouter.post("/login", async (req, res) => {
  console.log("-------..", process.env.JWT_SECRET);
  try {
    const { email, password } = req.body;

    const user = await await userModel.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User does not exist" });

    console.log(password, user.password);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    delete user.password;
    return res.status(201).json({ user, token });
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({ error: error.message });
  }
});

userRouter.post("/updateFriend", async (req, res) => {
  try {
    const { userId, friendId } = req.body;
    console.log("-------", userId, friendId);
    const user = await userModel.findById(userId);
    const friend = await userModel.findById(friendId);
    console.log("user and friend", user, friend);
    const isFriend = await userModel.findOne({
      _id: userId,
      friendsList: { $in: [friendId] },
    });
    console.log("isFriend", isFriend);

    if (isFriend?.firstName) {
      user.friendsList = user.friendsList.filter(
        item => item.toString() !== friendId
      );

      friend.friendsList = friend.friendsList.filter(
        item => item.toString() !== userId
      );
    } else {
      user.friendsList.push(mongoose.Types.ObjectId(friendId));
      friend.friendsList.push(mongoose.Types.ObjectId(userId));
    }
    await user.save();
    await friend.save();

    res.status(201).json({ user, friend });
  } catch (error) {
    console.log("Eror --- ---- ", error);
    res.status(400).json({ error: error.message });
  }
});

userRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id).populate("friendsList");
    res.status(200).json(user);
  } catch (error) {
    console.log("Errir", error);
    res.status(400).json({ error: error.message });
  }
});

userRouter.post("/getFriends", async (req, res) => {
  try {
    const { user } = req.body;
    const friendsList = await userModel.findById(user).populate("friendsList");
    console.log("--------", friendsList);
    res.status(201).json(friendsList);
  } catch (error) {
    console.log("Error -----", error);
    res.status(400).json({ error: error.message });
  }
});

userRouter.post("/updateProfile", async (req, res) => {
  try {
    let body = req.body;
    console.log("Body", body);
    const findUser = await userModel.findById(body.id);
    console.log("Finded User", findUser);
    if (!findUser) {
      return res.status(400).json({ msg: "User does not exist" });
    } else if (body?.password) {
      const isMatch = await bcrypt.compare(body.oldPassword, findUser.password);
      console.log("222");
      if (!isMatch)
        return res.status(400).json({ msg: "Old Password is Incorrect!!" });
      else {
        console.log("333");
        const salt = await bcrypt.genSalt();
        const hashPassword = await bcrypt.hash(body.password, salt);
        delete body.oldPassword;
        body = { ...body, password: hashPassword };
      }
    }
    const updateUser = await userModel.findByIdAndUpdate(
      body.id,
      { $set: { ...body } },
      {
        new: true,
      }
    );
    console.log("Updated User ---", updateUser);
    res.status(201).json(updateUser);
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error: error.message });
  }
});

module.exports = userRouter;
