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
const port = process.env.PORT

// Create an HTTP server and attach Express
const server = http.createServer(app); 


//MongoDB database connection
connectDataBase()

// scp -i "dharakshaec2key.pem" -r "F:\DBMS\dharakshDBMS\dharaksha\frontend\build" ubuntu@65.2.133.173:/var/www/dharaksha/frontend/

// Attach Socket.io to the server
const io = new Server(server, {
    cors: {
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
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD"],
        credentials: true,
    },
});
socketHandler(io);


server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});




process.on("unhandledRejection", (err) => {

    console.log(`\n--- Unhandled Rejection ---`);
    console.log(`Error: ${err.message}`);
    console.log(`Stack Trace:\n${err.stack}`);
    console.log(`\n--- Unhandled Rejection ---`);

    console.log(`Shuting down the server due to unhandled Promise Rejection `);
    server.close(() => {
        process.exit(1);
    })
})

app.get("/", (_, res) => {
    res.send("Dharaksha Backend online with docker");
});