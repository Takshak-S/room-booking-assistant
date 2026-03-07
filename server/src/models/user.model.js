import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    firebaseUid: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["STUDENT", "FACULTY","ADMIN"],
        required: true
    },
    mobileNumber : String,
    approved:{
        type: Boolean,
        default: false
    },
    approvedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    approvedAt:{
        type: Date,
        default: Date.now
    }
})

export default mongoose.model("User", UserSchema);
