import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { CORS_ORIGN } from "../config/env.js";


const app = express()

app.use(cors({
    origin:CORS_ORIGN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(urlencoded({extended: true,limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// routes
import userRouter from "./routes/user.routes.js"

// routes declaration
app.use("/api/v1/users",userRouter)


export { app }