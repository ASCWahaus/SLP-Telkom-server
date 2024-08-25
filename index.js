import app from "./server.js"
import bodyParser from "body-parser"
import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config({
    path: './config/config.env'
})

const port = process.env.PORT || 8000

mongoose.connect(
    process.env.SOCIALLEARNING_DB_URI, 
    { 
        useNewUrlParser: true, 
        useUnifiedTopology: true,
        // wtimeoutMS : 9000, 
    })

    .catch(err => {
        console.error(err.stack)
        process.exit(1)
    })

    .then(()=> {
        app.listen(port, () => {
            console.log(`listening on port ${port}`)
        })
    })
//
//
