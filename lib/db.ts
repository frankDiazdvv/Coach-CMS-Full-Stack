//HERE WE CONNECT TO MONGODB

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

const connect = async () => {
    const connectionState = mongoose.connection.readyState; 

    if(connectionState === 1) {
        console.log("Already connected to MongoDB");
        return;
    }

    if(connectionState === 2) {
        console.log("Reconnecting to MongoDB...");
        return;
    }

    try {
        await mongoose.connect(MONGODB_URI!, {
            dbName: 'SimpleFitCluster',
            bufferCommands: true
        });
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Failed to connect to MongoDB", error);
        process.exit(1);
    }
};

export default connect;