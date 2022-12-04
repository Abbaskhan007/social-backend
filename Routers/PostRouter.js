const postModel = require("../Models/postModel");
const mongoose = require("mongoose");

const express = require("express");

const postRouter = express.Router();

postRouter.post("/createPost", async (req, res) => {
  console.log("Req----", req.body);
  const { user, description, image } = req.body;
  const newPost = new postModel({
    user,
    description,
    image,
    likes: {},
  });
  newPost.save(async (err, post) => {
    if (post) {
      const posts = await postModel
        .find()
        .populate("user")
        .populate("comments.user")
        .sort({ createdAt: -1 });
      res.status(201).json(posts);
    } else {
      console.log("error ---", err);
      res.status(500).json({ msg: err.message });
    }
  });
});

postRouter.get("/getFeed", async (req, res) => {
  try {
    const posts = await postModel
      .find()
      .populate("user")
      .populate("comments.user")
      .sort({ createdAt: -1 });
    res.status(201).json(posts);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

postRouter.get("/:id/getFeed", async (req, res) => {
  try {
    const { id } = req.params;
    const posts = await postModel
      .find({ user: mongoose.Types.ObjectId(id) })
      .populate("user")
      .populate("comments.user")
      .sort({ createdAt: -1 });
    res.status(201).json(posts);
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({ msg: error.message });
  }
});

postRouter.patch("/likePost/:userId/:postId", async (req, res) => {
  try {
    const { postId, userId } = req.params;
    console.log("---------", postId, userId);
    const post = await postModel.findById(postId);
    const isLiked = post.likes.get(userId);
    if (isLiked) {
      post.likes.delete(userId);
    } else {
      post.likes.set(userId, true);
    }
    const updatedPost = await postModel
      .findByIdAndUpdate(
        postId,
        {
          likes: post.likes,
        },
        { new: true }
      )
      .populate("user")
      .populate("comments.user");
    res.status(201).json(updatedPost);
  } catch (error) {
    console.log("Error. ", error);
    res.status(500).json({ msg: error.message });
  }
});

postRouter.put("/comment", async (req, res) => {
  try {
    const { comment, postId, userId } = req.body;
    const post = await postModel.findById(postId);
    post.comments = [...post.comments, { comment, user: userId }];

    const updatedComments = await postModel
      .findByIdAndUpdate(
        postId,
        {
          comments: post.comments,
        },
        { new: true }
      )
      .populate("comments.user");

    res.status(201).json({ updatedComments });
  } catch (error) {
    console.log("Errr", error);
    res.status(500).json({ msg: error.message });
  }
});

module.exports = postRouter;
