const express = require("express");
const app = express();
const cors = require('cors')
var bodyParser = require('body-parser')


// require('dotenv').config({ path: 'config/.env' })
require('dotenv').config({ path: '.env' })

// Strip surrounding quotes from all process.env variables (common issue with Docker --env-file)
for (const key in process.env) {
    let value = process.env[key];
    if (value && typeof value === 'string') {
        value = value.trim();
        if ((value.startsWith("'") && value.endsWith("'")) || 
            (value.startsWith('"') && value.endsWith('"'))) {
            process.env[key] = value.slice(1, -1);
        }
    }
}

const cookieParser = require("cookie-parser")
const lcPreparationRouter = require("./routes/lcPreparationRoutes")
const lcRejectionRouter = require("./routes/lcRejectionRoutes")
const jamPreparationRouter = require("./routes/jamPreparationRoutes")
const bagInoculationRouter = require("./routes/bagInoculationRoutes")
const bagIncubationRouter = require("./routes/bagIncubationRoutes")
const mouldFillingRouter = require("./routes/mouldFillingRoutes")
const mouldRejectionRouter = require("./routes/mouldRejectionRoutes")
const moldIncubationRouter = require("./routes/mouldIncubationRoutes")
const deMouldingPieceRouter = require("./routes/deMouldingPiecesRoutes")
const rejectDeMouldingRouter = require("./routes/deMouldingRejectionRoutes")
const ovenInRouter = require("./routes/ovenInRoutes")
const ovenOutRouter = require("./routes/ovenOutRoutes")
const dashboardRouter = require("./routes/dashboardRoutes")
const userRoutes = require('./routes/userRoutes')
const { errorMiddleware } = require("./middleware/errorMiddleware")
const growthChamberRoutes = require('./routes/growthChamberRoutes')


const corsOptions = {
    // origin: ["https://www.dharaksha-dbs.online", "https://dharaksha-dbs.online"],
    origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://www.dharakshaproduction.shop",
    "http://dharakshaproduction.shop",
    "https://www.dharakshaproduction.shop",
    "https://dharakshaproduction.shop",
    "https://djc6qbd0doicb.cloudfront.net"
  ],
    methods: "GET, POST, PUT, DELETE, PATCH, HEAD",
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
// app.use(bodyParser.json({ limit: '50mb' }))
// app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }))

app.use("/api/v1", lcPreparationRouter)
app.use("/api/v1", lcRejectionRouter)
app.use("/api/v1", jamPreparationRouter)
app.use("/api/v1", bagInoculationRouter)
app.use("/api/v1", bagIncubationRouter)
app.use("/api/v1", mouldFillingRouter)
app.use("/api/v1", mouldRejectionRouter)
app.use("/api/v1", moldIncubationRouter)
app.use("/api/v1", deMouldingPieceRouter)
app.use("/api/v1", rejectDeMouldingRouter)
app.use("/api/v1", ovenInRouter)
app.use("/api/v1", ovenOutRouter)
app.use("/api/v1", dashboardRouter)
app.use("/api/v1", userRoutes)
app.use("/api/v1",growthChamberRoutes)

app.use(errorMiddleware)
module.exports = app;
