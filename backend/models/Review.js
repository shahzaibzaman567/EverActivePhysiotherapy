import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Reviews can be submitted by guests or users
    },
    name: {
      type: String,
      required: [true, 'Please add your name'],
      trim: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please select a rating between 1 and 5'],
      min: 1,
      max: 5,
    },
    text: {
      type: String,
      required: [true, 'Please add review description text'],
      trim: true,
    },
    youtubeUrl: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return true;
          // Simple validation check for YouTube links (embed, watch, or share link)
          return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(v);
        },
        message: 'Please enter a valid YouTube video URL',
      },
    },
  },
  {
    timestamps: true,
  }
);

const Review = mongoose.model('Review', reviewSchema);
export default Review;
