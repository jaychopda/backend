import dotenv from "dotenv";
import connectDB from "./db/index.js";

connectDB();

dotenv.config({
    path: './env'
})




/*
import express from 'express';
const app = express();

;(async () =>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);

        app.on("Error",(error)=>{
            console.log("Error : ",error);
            throw error
        });

        app.listen(process.env.PORT, ()=>{
            console.log(`App Listening on port ${process.env.PORT}`);
        })

    } catch (error) {
        console.error("Error : ",error)
    }
})

*/