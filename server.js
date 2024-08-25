import express from "express"
import cors from "cors"
import contents from "./routes/contentsRoute.js"
import auth from "./routes/authRoute.js"
import users from "./routes/usersRoute.js"
import errorHandler from "./middleware/error.js"

const app = express();

app.use(express.json({limit : "30mb", extended: true}));
app.use(express.urlencoded({limit : "30mb", extended: true}));
app.use(cors());

//prefix routes

app.use("/api/v1/contents", contents)
app.use("/api/v1/auth", auth)
app.use("/api/v1/users", users)


app.use("*", (req, res) => res.status(404).json({error: "not found"}))

//Error Handler -> diakhir middleware
app.use(errorHandler);

export default app