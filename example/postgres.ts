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
        const PG_DATABASE = "fbf54982_pg_auth";
        const PG_HOST = process.env.TEST_PG_HOST || "localhost";
        const PG_USER = process.env.TEST_PG_USER || "postgres";
        const PG_PASSWORD = process.env.TEST_PG_PASSWORD || "password";
        const PG_PORT = Number(process.env.TEST_PG_PORT || "5432");

        /** uncomment below if you want to use connection string */
        // const postgresConnectionString = `postgres://${PG_USER}:${PG_PASSWORD}@${PG_HOST}:${PG_PORT}/${PG_DATABASE}`;
        // const { saveCreds, state } = await useBaileysAuthState(postgresConnectionString, {
        //     /** v1.2.0 - you can custom table name and session name */
        //     table: APP_STORE,
        //     session: APP_SESSION
        // });

        const { saveCreds, state } = await useBaileysAuthState({
            dialect: "pg",
            database: PG_DATABASE,
            host: PG_HOST,
            user: PG_USER,
            password: PG_PASSWORD,
            port: PG_PORT,
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

initializer(".postgres.session");
