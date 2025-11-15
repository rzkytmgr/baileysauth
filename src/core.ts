import type {
    BaileysAuthStateArgs,
    BaileysAuthStateOptions,
} from "@/Types";
import {
    MongoDBConnection,
    MySQLConnection,
    PostgreSQLConnection,
} from "@/Services";

class BaileysAuthConnection {
    static async connect(
        conn: BaileysAuthStateOptions,
        args?: BaileysAuthStateArgs,
    ) {
        let dialect: string | null = null;

        if (typeof conn === "string") {
            const regex =
                // eslint-disable-next-line no-useless-escape
                /^([a-zA-Z][a-zA-Z0-9+\-.]*):\/\/([^:@\s\/]+(?::[^@\s\/]*)?@)?([^\s:\/]+)(?::(\d+))?(\/[^?#\s]*)?(\?[^#\s]*)?$/;

            if (!regex.test(conn)) {
                throw new TypeError("Invalid connection string. doesn't looks like connection string");
            }

            const connectionPrefix = conn.match(/^([^:]+):\/\//);
            if (connectionPrefix) {
                dialect = connectionPrefix[1];
            }

            const dialectMapping: { [key: string]: string; } = {
                postgres: "pg",
                postgresql: "pg",
                "mongodb+srv": "mongodb",
            };

            dialect = dialectMapping[dialect!] || dialect;
        } else {
            dialect = conn.dialect;
        }

        switch (dialect) {
            case "mysql":
                // @ts-ignore: options variable should be string or instance of MySQLConnectionOptions
                return await MySQLConnection.init(conn, args);
            case "pg":
                // @ts-ignore: options variable should be string or instance of PostgreSQLConnectionOptions
                return await PostgreSQLConnection.init(conn, args);
            case "mongodb":
                // @ts-ignore: options variable should be string or instance of MongoDBConnectionOptions
                return await MongoDBConnection.init(conn, args);
            default:
                throw new TypeError("Cannot afford connection based on connection string you've input");
        }
    }
}

export { BaileysAuthConnection };
