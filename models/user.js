import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
{
    name:{
        type:String,
        required:true,
        trim:true
    },

    email:{
        type:String,
        required:true,
        unique:true, // this ensures that no two users can have the same email address
        trim:true,
        lowercase:true
    },

    password:{
        type:String,
        required:true
    },

    phone: {
        type: String,
        required: true,
        trim: true,

        match: [
            /^\d{10}$/,
            "Phone number must be exactly 10 digits"
        ]
    },

    address:{
        type:String,
        trim:true
    },

    profileImage:{
        type:String,
        default:""
    },

    role:{
        type:String,
        enum:["Admin","Customer","Supplier"],
        default:"Customer"
    },

    isBlocked:{
        type:Boolean,
        default:false
    }

},
{
    timestamps:true
});

const User = mongoose.model("User", userSchema);

export default User;

