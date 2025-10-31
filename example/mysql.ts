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
        const MYSQL_DATABASE = "mysql_auth";
        const MYSQL_HOST = process.env.TEST_MYSQL_HOST || "localhost";
        const MYSQL_USER = process.env.TEST_MYSQL_USER || "root";
        const MYSQL_PASSWORD = process.env.TEST_MYSQL_PASSWORD || "password";
        const MYSQL_PORT = Number(process.env.TEST_MYSQL_PORT || 3306);

        /** uncomment below if you want to use connection string */
        // const mysqlStringConnection = `mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DATABASE}`;
        // const { saveCreds, state } = await useBaileysAuthState(mysqlStringConnection);

        const { saveCreds, state } = await useBaileysAuthState({
            dialect: "mysql",
            database: MYSQL_DATABASE,
            host: MYSQL_HOST,
            user: MYSQL_USER,
            password: MYSQL_PASSWORD,
            port: MYSQL_PORT,
            session: APP_SESSION,
            table: APP_STORE,
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

initializer(".mysql.session");
