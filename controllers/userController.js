import User from "../models/user.js";

// Get Logged In User Profile
export const getMyProfile = async(req, res) => {
    try {
    // Find logged in user
    const user = await User.findById(req.user._id).select("-password");

    // Check user exists
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Send user data
    return res.status(200).json({
      success: true,
      user: user // කෙලින්ම user ඔබ්ජෙක්ට් එක මේ විදිහට පැකට් කරලා යවන්න
});
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }

};

// Update Logged In User Profile
export const updateMyProfile = async (req, res) => {

    try {
    // Get data from request body
    const { name, phone, address, profileImage } = req.body;

    // Find logged in user
    const user = await User.findById(req.user._id);

    // Check user exists
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Update user details
    user.name = name || user.name;
    user.phone = phone || user.phone; 
    user.address = address || user.address;
    user.profileImage = profileImage || user.profileImage;

    // Save updated user
    await user.save();

    // Send response
    res.status(200).json({
      message: "Profile updated successfully",
      user,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get All Users (Admin Only)
export const getAllUsers = async (req, res) => {
    try {
    // Get all users
    const users = await User.find().select("-password");

    // Send users
    res.status(200).json(users);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }

};

// Get Single User By ID (Admin Only)
export const getUserById = async (req, res) => {
    try {
    // Find user by ID
    const user = await User.findById(req.params.id).select("-password");

    // Check user exists
    if (!user) {
      return res.status(404).json({
        message: "User not found with this user ID",
      });
    }

    // Send user
    res.status(200).json(user);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }

};

// Block User (Admin Only)
export const blockUser = async (req, res) => {
    try {
    // Find user by ID
    const user = await User.findById(req.params.id);

    // Check user exists
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Block user
    user.isBlocked = true;

    // Save changes
    await user.save();

    // Send response
    res.status(200).json({
      message: "User blocked successfully",
      user,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }

};

// Unblock User (Admin Only)
export const unblockUser = async (req, res) => {
    try {
    // Find user by ID
    const user = await User.findById(req.params.id);

    // Check user exists
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Unblock user
    user.isBlocked = false;

    // Save changes
    await user.save();

    // Send response
    res.status(200).json({
      message: "User unblocked successfully",
      user,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }

};