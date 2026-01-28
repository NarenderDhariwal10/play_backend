import dotenv from "dotenv";
dotenv.config();
import connectDB from "./db/connect_db.js";

const PORT = process.env.PORT || 800

connectDB()
.then( () =>{
    app.listen(PORT , () => console.log(`Server runing on port : ${PORT}`))
})
.catch((err) => 
    console.log(`MONGODB connection error`,err)
)