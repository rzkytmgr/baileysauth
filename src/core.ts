import type { BaileysAuthStateOptions } from "@/Types";
import {
    MongoDBConnection,
    MySQLConnection,
    PostgreSQLConnection,
} from "@/Services";

class BaileysAuthConnection {
    static async connect(options: BaileysAuthStateOptions) {
        let dialect: string | null = null;

        if (typeof options === "string") {
            const regex =
                /^([a-zA-Z][a-zA-Z0-9+\-.]*):\/\/([^:@\s\/]+(?::[^@\s\/]*)?@)?([^\s:\/]+)(?::(\d+))?(\/[^?#\s]*)?(\?[^#\s]*)?$/;

            if (!regex.test(options)) {
                throw new TypeError("Invalid connection string. doesn't looks like connection string");
            }

            const connectionPrefix = options.match(/^([^:]+):\/\//);
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
            dialect = options.dialect;
        }

        switch (dialect) {
            case "mysql":
                // @ts-ignore: options variable should be string or instance of MySQLConnectionOptions
                return await MySQLConnection.init(options);
            case "pg":
                // @ts-ignore: options variable should be string or instance of PostgreSQLConnectionOptions
                return await PostgreSQLConnection.init(options);
            case "mongodb":
                // @ts-ignore: options variable should be string or instance of MongoDBConnectionOptions
                return await MongoDBConnection.init(options);
            default:
                throw new TypeError("Cannot afford connection based on connection string you've input");
        }
    }
}

export { BaileysAuthConnection };
