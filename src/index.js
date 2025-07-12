import { app } from "./app.js";
import connectDB from "./db/index.js";
import { PORT } from "../config/env.js";

connectDB() //async returns promise
.then(()=>{
    app.listen(PORT || 8000,()=>{
        console.log(`server is running at port: ${PORT}`)
    })
})
.catch((err)=>{
    console.log("MONGODB connection failed !!!",err)
})