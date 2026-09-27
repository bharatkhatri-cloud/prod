const timerHandler = require("./timer");

const socketHandler = (io) => {
    io.on("connection", (socket) => {
        console.log(`🟢 Client connected: ${socket.id}`);
        timerHandler(io , socket);

        socket.on("disconnect", () => {
            console.log(`🔴 Client disconnected: ${socket.id}`);
        });
    });
};


module.exports = socketHandler;