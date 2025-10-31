import { useBaileysAuthState } from "../dist/index";
import QRCode from "qrcode";
import { Boom } from "@hapi/boom";
import {
    DisconnectReason,
    makeWASocket,
} from "baileys";

const initializer = async (session: string) => {
    try {
        const APP_STORE = "_auth_store";
        const APP_SESSION = session;
        const MONGO_DATABASE = "mongo_auth";
        const MONGO_HOST = process.env.TEST_MONGO_HOST || "localhost";
        const MONGO_USER = process.env.TEST_MONGO_USER || "mongo";
        const MONGO_PASSWORD = process.env.TEST_MONGO_PASSWORD || "password";
        const MONGO_PORT = Number(process.env.TEST_MONGO_PORT || "27017");

        /** uncomment below if you want to use connection string */
        // const mongoConnectionString = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DATABASE}?authSource=admin`;
        // const { saveCreds, state } = await useBaileysAuthState(mongoConnectionString);

        const { saveCreds, state } = await useBaileysAuthState({
            dialect: "mongodb",
            database: MONGO_DATABASE,
            host: MONGO_HOST,
            user: MONGO_USER,
            password: MONGO_PASSWORD,
            port: MONGO_PORT,
            session: APP_SESSION,
            collection: APP_STORE,
            args: {
                authSource: "admin",
            },
        });

        const socket = makeWASocket({
            auth: state,
        });

        socket.ev.on("creds.update", saveCreds);
        socket.ev.on("connection.update", async (listener) => {
            const { qr, connection, lastDisconnect } = listener;

            if (qr) {
                console.log(
                    await QRCode.toString(qr, {
                        small: true,
                        type: "terminal",
                    }),
                );
            }

            if (connection === "close") {
                console.log("Closed");
                if ((lastDisconnect?.error as Boom)?.output.statusCode !== DisconnectReason.loggedOut) {
                    console.log("Loggedout");
                    initializer(session);
                }
            }
        });

        socket.ev.on("messages.upsert", (args) => {
            console.log("Message", args);
        });
    } catch (_err) {
        console.debug("Auth State Error:", _err);
    }
};

initializer(".mongo.session");
