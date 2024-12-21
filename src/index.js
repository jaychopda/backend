import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: './env'
})

connectDB()
.then(() => {
    app.listen(process.env.PORT || 3000, () => {
        console.log(`Server is running at port ${process.env.PORT || 3000}`)
    })
})
.catch((err)=>{
    console.log("Mongo DB Connection Failed!!!",err)
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