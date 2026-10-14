// Handling Uncaught Exception
process.on("uncaughtException", (err) => {
    console.log(`\n--- Uncaught Exception ---`);
    console.log(`Error: ${err.message}`);
    console.log(`Stack Trace:\n${err.stack}`);
    console.log(`\n--- Unhandled Rejection ---`);

    console.log(`Shutting down the server due to an uncaught exception.`);
    process.exit(1);
});
const app = require("./app");
const http = require("http"); // Import HTTP module for WebSockets
const { Server } = require("socket.io"); // Import Socket.io
const connectDataBase = require("./connectDB")
const socketHandler = require("./socket/index"); // Import Socket.IO handler
const port = process.env.PORT || 3000;

// Create an HTTP server and attach Express
const server = http.createServer(app); 


//MongoDB database connection
connectDataBase()

// Attach Socket.io to the server
const io = new Server(server, {
    cors: {
        origin: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD"],
        credentials: true,
    },
});
socketHandler(io);


const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

server.listen(port, "0.0.0.0", () => {
    console.log(`Server is running on http://0.0.0.0:${port}`);
    const buildIndex = path.join(__dirname, "../frontend/build/index.html");
    if (!fs.existsSync(buildIndex)) {
        console.log("Frontend build not found, building in background...");
        exec("npm run build:frontend", { cwd: path.join(__dirname, "..") }, (err) => {
            if (err) console.error("Background frontend build error:", err.message);
            else console.log("Background frontend build complete.");
        });
    }
});




process.on("unhandledRejection", (err) => {
    console.warn(`Unhandled Rejection: ${err.message}`);
});