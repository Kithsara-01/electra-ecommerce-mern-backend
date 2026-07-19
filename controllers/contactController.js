import ContactMessage from "../models/contactMessage.js";

// ==============================
// Send Contact Message
// ==============================
export const sendContactMessage = async (req, res) => {
  try {
    const { fullName, email, subject, message } = req.body;

    if (!fullName || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    const contactMessage = await ContactMessage.create({
      fullName,
      email,
      subject,
      message,
    });

    return res.status(201).json({
      success: true,
      message: "Your message has been sent successfully.",
      contactMessage,
    });
  } catch (error) {
    console.error("Send Contact Message Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send message.",
    });
  }
};

// ==============================
// Get All Contact Messages (Admin)
// ==============================
export const getAllContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      totalMessages: messages.length,
      messages,
    });
  } catch (error) {
    console.error("Get Contact Messages Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch messages.",
    });
  }
};

export const getMyContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find({
      email: req.user.email,
    })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error("Get My Contact Messages Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch your messages.",
    });
  }
};

export const getMyContactMessageById = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await ContactMessage.findOne({
      _id: id,
      email: req.user.email,
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }
    if (message.hasUnreadAdminReply) {
      message.hasUnreadAdminReply = false;
      await message.save();
    }

    res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    console.error("Get My Contact Message Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch message.",
    });
  }
};

// ==============================
// Get Unread Message Count
// ==============================
export const getUnreadMessageCount = async (req, res) => {
  try {
    const unreadCount = await ContactMessage.countDocuments({
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error("Unread Count Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch unread count.",
    });
  }
};

// ==============================
// Get Customer Unread Reply Count
// ==============================
export const getCustomerUnreadReplyCount = async (req, res) => {
  try {
    const unreadReplyCount = await ContactMessage.countDocuments({
      email: req.user.email,
      hasUnreadAdminReply: true,
    });

    return res.status(200).json({
      success: true,
      unreadReplyCount,
    });
  } catch (error) {
    console.error("Customer Unread Reply Count Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch unread reply count.",
    });
  }
};

// ==============================
// Get Contact Message By ID
// ==============================
export const getContactMessageById = async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    console.error("Get Contact Message Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch message.",
    });
  }
};

// ==============================
// Mark Contact Message As Read
// ==============================
export const markMessageAsRead = async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    message.isRead = true;

    await message.save();

    return res.status(200).json({
      success: true,
      message: "Message marked as read.",
    });
  } catch (error) {
    console.error("Mark Message As Read Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update message.",
    });
  }
};

// ==============================
// Reply To Contact Message
// ==============================
export const replyToContactMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Reply message is required.",
      });
    }

    const contactMessage = await ContactMessage.findById(req.params.id);

    if (!contactMessage) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

   contactMessage.replies.push({
      sender: req.user.role,
      message: message.trim(),
    });

    if (req.user.role === "Admin") {
      contactMessage.hasUnreadAdminReply = true;
    } else {
      contactMessage.isRead = false;
    }

    await contactMessage.save();

    return res.status(200).json({
      success: true,
      message: "Reply sent successfully.",
      replies: contactMessage.replies,
    });
  } catch (error) {
    console.error("Reply Contact Message Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send reply.",
    });
  }
};

// ==============================
// Delete Contact Message
// ==============================
export const deleteContactMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    await ContactMessage.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Contact Message Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete message.",
    });
  }
};



/////testing comment