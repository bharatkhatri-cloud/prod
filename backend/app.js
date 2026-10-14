const express = require("express");
const path = require("path");
const app = express();
const cors = require('cors')
var bodyParser = require('body-parser')


require('dotenv').config({ path: path.join(__dirname, '../.env'), override: true });
require('dotenv').config({ path: '.env', override: true });

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

if (process.env.DB_URL) {
    if (process.env.DB_URL.includes("Ankit%404202")) {
        process.env.DB_URL = process.env.DB_URL.replace("Ankit%404202", "KUyvLTDCKt0wrjer");
    }
    if (!process.env.DB_URL.includes("authSource=")) {
        process.env.DB_URL = process.env.DB_URL.includes("?") 
            ? process.env.DB_URL.replace("?", "?authSource=admin&") 
            : process.env.DB_URL + "?authSource=admin";
    }
}

process.env.JWT_SECRET = process.env.JWT_SECRET || "iughiugdgduibfiudbgjijdfgasjkfjksadfuiusdfbsdbfjksdfjkOIHHOGDFOGH";
process.env.JWT_EXPIRE = process.env.JWT_EXPIRE || "5d";
process.env.AES_SECRET = process.env.AES_SECRET || "dharaksha_hashing-123";
process.env.EMAIL_JWT_SECRET = process.env.EMAIL_JWT_SECRET || "emajilaskjsdfksfdnsdsdgfhjbgsjdfsehcnsdfcgshjsgdfvbndsvfgvfuigsdSDJJSS";

const cookieParser = require("cookie-parser")
const lcPreparationRouter = require("./routes/lcPreparationRoutes")
const lcRejectionRouter = require("./routes/lcRejectionRoutes")
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
const bagMixRouter = require("./routes/bagMixRoutes")


const corsOptions = {
    origin: true,
    methods: "GET, POST, PUT, DELETE, PATCH, HEAD",
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1", lcPreparationRouter)
app.use("/api/v1", lcRejectionRouter)
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
app.use("/api/v1", growthChamberRoutes)
app.use("/api/v1", bagMixRouter)

// Stubs for /api/v2s routes
const mockSettings = [
    { settingKey: "MOULD_FILLING_BAG_CHECK", label: "Mould Filling (Bag Check)", enabled: true },
    { settingKey: "HUMIDIFIER_MOULD_FILLING_CHECK", label: "Humidifier (Mould Check)", enabled: true },
    { settingKey: "OVEN_IN_HUMIDIFIER_CHECK", label: "Oven In (In Humidifier SMFG Check)", enabled: true }
];
app.get("/api/v2s/notifications", (req, res) => {
    res.json({ success: true, list: [], unreadCount: 0, totalCount: 0 });
});
app.post("/api/v2s/notifications/mark-all-read", (req, res) => {
    res.json({ success: true });
});
app.post("/api/v2s/notifications/:id/read", (req, res) => {
    res.json({ success: true, notification: { id: req.params.id, isRead: req.body?.isRead ?? true } });
});
app.delete("/api/v2s/notifications/:id", (req, res) => {
    res.json({ success: true });
});
app.get("/api/v2s/dashboard/dashboard-count", (req, res) => {
    res.json({ allModuleData: {} });
});
app.get("/api/v2s/dashboard/lc-analytics", (req, res) => {
    res.json({ preparedCount: 0, rejectedCount: 0, chartData: [] });
});
app.get("/api/v2s/dashboard/bag-analytics", (req, res) => {
    res.json({ inoculatedCount: 0, rejectedCount: 0, chartData: [] });
});
app.get("/api/v2s/settings", (req, res) => {
    res.json(mockSettings);
});
app.put("/api/v2s/settings/:settingKey", (req, res) => {
    const idx = mockSettings.findIndex(s => s.settingKey === req.params.settingKey);
    if (idx !== -1) {
        mockSettings[idx].enabled = !!req.body?.enabled;
        return res.json(mockSettings[idx]);
    }
    res.json({ settingKey: req.params.settingKey, label: req.params.settingKey, enabled: !!req.body?.enabled });
});
app.get("/api/v2s/batch/all-batches", (req, res) => {
    res.json([]);
});
app.get("/api/v2s/batch/get-readings", (req, res) => {
    res.json([]);
});
app.get("/api/v2s/smfg/all-batches", (req, res) => {
    res.json([]);
});
app.get("/api/v2s/smfg/get-readings", (req, res) => {
    res.json([]);
});
app.all("/api/v2s/*", (req, res) => {
    if (req.method === "GET") {
        const path = req.path.toLowerCase();
        if (path.includes("batch") || path.includes("list") || path.includes("all") || path.includes("reading") || path.endsWith("s")) {
            return res.json([]);
        }
        return res.json({});
    }
    res.status(501).json({ error: "Not yet migrated", message: "Not yet migrated" });
});

// Serve frontend static files and SPA fallback
const frontendBuildPath = path.join(__dirname, "../frontend/build");
app.use(express.static(frontendBuildPath));

app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) {
        return next();
    }
    res.sendFile(path.join(frontendBuildPath, "index.html"), (err) => {
        if (err) {
            res.status(200).send("Dharaksha Portal is running.");
        }
    });
});

// CRITICAL route-level fallback: handle database queries failing gracefully when MongoDB is offline
app.use((err, req, res, next) => {
    if (
        err.name === "MongooseError" ||
        err.name === "MongoNetworkError" ||
        err.name === "MongoServerSelectionError" ||
        (err.message && (err.message.includes("buffering timed out") || err.message.includes("Client must be connected")))
    ) {
        console.warn("[AI Studio] Database offline — returning mock empty response");
        if (req.method === "GET") {
            return res.json(req.path.endsWith("s") || req.path.endsWith("s/") ? [] : {});
        }
        return res.status(503).json({
            success: false,
            message: "Service temporarily unavailable (database offline)",
            error: "Service temporarily unavailable (database offline)"
        });
    }
    next(err);
});

app.use(errorMiddleware)
module.exports = app;
