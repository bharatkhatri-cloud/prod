// timerHandler.js

const Timer = require("../models/TimerModel");
const activeTimers = new Map();

// ✅ io added as first argument to broadcast to all connected clients
const timerHandler = (io, socket) => {

    // ✅ Check if a timer exists for the humidifier
    socket.on("checkTimer", async (data) => {
        const timer = await Timer.findOne({ dataId: data.humidiferSerialNo }); // this is the model for the timer data is finding from the timer model


        if (timer) {
            const targetTime = new Date(timer.expiresAt).getTime(); // expire time get from the database
            sendTimer(io, targetTime, data);  // ✅ io used here
        }
    });

    // ✅ Start a timer and broadcast to all
    socket.on("startTimer", async ({ data, submittedAt }) => { // start from the frontend triger  
        const targetTime = new Date(submittedAt).getTime() + 1 * 60 * 1000; // 1 minute

        //timer model database updated and the set the sumited time the the expire time
        await Timer.findOneAndUpdate(
            { dataId: data.humidiferSerialNo },
            {
                submittedAt, 
                expiresAt: new Date(targetTime),
            },
            { upsert: true, new: true }
        );
 
        // after then call the sentimer function 
        sendTimer(io, targetTime, data);  // ✅ io used here 
    });

    // ✅ Main logic to broadcast timer updates to all users
    function sendTimer(io, targetTime, data) {
        const serial = data.humidiferSerialNo;


        if (activeTimers.has(serial)) {
            clearInterval(activeTimers.get(serial));
        }

        const updateTimer = () => {
            const currentTime = Date.now();
            const timeLeft = Math.max(targetTime - currentTime, 0);

            // ✅ Broadcast to ALL users instead of a single user
            io.emit("timerUpdate", { data, timeLeft });

            if (timeLeft <= 0) {
                clearInterval(activeTimers.get(serial));
                activeTimers.delete(serial);

                io.emit("timerFinished", { data, message: "Time is up!" });
            }
        };

        updateTimer(); // call immediately
        const interval = setInterval(updateTimer, 1000); // then every second
        //set the timer for every unique humidifer seril number
        activeTimers.set(serial, interval);
    }

    socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
};

module.exports = timerHandler;
