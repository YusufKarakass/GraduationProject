import express from "express"
import dotenv from "dotenv";
import conn from "./db.js"
import pageRoute from "./routes/pageRoute.js"
import userRoute from "./routes/userRoute.js"
import cookieParser from "cookie-parser";
import { checkUser } from "./middlewares/authMiddleware.js";
import axios from "axios";


dotenv.config()

//connection to the DB
conn();

const app = express()
const port = process.env.PORT


app.set("view engine", "ejs");

// Static Files middleware
app.use(express.static('public'));
/* app.use(express.json()) 
app.use(express.urlencoded({extended: true})) */

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(cookieParser())

// routes 
app.use(checkUser);
app.use("/", pageRoute);
app.use("/users", userRoute);

app.post('/analyze', async (req, res) => {
    try {
        const response = await axios.post('http://127.0.0.1:5000/analyze', {
            image: req.body.image
        });
        res.json(response.data);
    } catch (error) {
        res.status(400).json({ error: 'Analiz yapılamadı.' });
    }
});


app.listen(port, () => {
    console.log(`App is working ${port}`)
})