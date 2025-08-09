import { MySQLConnection } from "@/Services";
import type { BaileysAuthStateOptions } from "@/Types";

class BaileysAuthConnection {
    static async connect(options: BaileysAuthStateOptions) {
        let dialect: string | null = null;

        if (typeof options === "string") {
            const regex =
                /^([a-zA-Z][a-zA-Z0-9+\-.]*):\/\/([^\s:@\\/]+)(:[^\s@\\/]*)?@([^\s:\\/]+)(:\d+)?(\/[^\s?#]*)?$/;

            if (!regex.test(options)) {
                throw new TypeError("Invalid connection string. doesn't looks like connection string");
            }

            const connectionPrefix = options.match(/^([^:]+):\/\//);
            if (connectionPrefix) {
                dialect = connectionPrefix[1];
            }
        } else {
            dialect = options.dialect;
        }

        switch (dialect) {
            case "mysql":
                return await MySQLConnection.init(options);
            case "pg":
            case "postgres":
            case "postgresql":
                return "postgresql";
            case "mongodb":
            case "mongodb+srv":
                return "mongodb";
            default:
                throw new TypeError("Cannot afford connection based on connection string you've input");
        }
    }
}

export { BaileysAuthConnection };
