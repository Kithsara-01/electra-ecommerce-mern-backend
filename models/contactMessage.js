import mongoose from "mongoose";

const contactMessageSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    replies: [
        {
          sender: {
            type: String,
            enum: ["Customer", "Admin"],
            required: true,
          },

          message: {
            type: String,
            required: true,
            trim: true,
          },

          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],

    isRead: {
      type: Boolean,
      default: false,
    },

    hasUnreadAdminReply: {
      type: Boolean,
      default: false,
    },

  },
  {
    timestamps: true,
  }
);

const ContactMessage = mongoose.model(
  "ContactMessage",
  contactMessageSchema
);

export default ContactMessage;
