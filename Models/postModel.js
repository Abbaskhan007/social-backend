const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    image: String,
    description: String,
    likes: {
      type: Map,
      of: Boolean,
    },
    comments: {
      type: [
        {
          comment: {
            type: String,
            required: true,
          },
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        },
      ],
      default: []
    },
  },
  { timestamps: true }
);

const postModel = mongoose.model("Post", postSchema);
module.exports = postModel;
