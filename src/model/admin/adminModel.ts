import mongoose, { Schema } from "mongoose";
import admin from "./adminType";


const adminSchema: Schema = new Schema<admin>({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },

})

const Admin = mongoose.model<admin>('Admin', adminSchema);
export default Admin;