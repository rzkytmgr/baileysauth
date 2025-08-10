import util from "@/Utils";
import { constants } from "@/Lib/constants";
import { ConnectionBase } from "@/Services/base";
import type {
    BaileysAuthStateOptions,
    IConnectionBase,
    MySQLConnectionOptions,
    MySQLConnectionClient,
} from "@/Types";
class MySQLConnection extends ConnectionBase<BaileysAuthStateOptions> implements IConnectionBase {
    constructor(private connection: MySQLConnectionClient, options: BaileysAuthStateOptions) {
        super(options);
    }

    static async init(options: BaileysAuthStateOptions) {
        try {
            const mysql = await import("mysql2/promise");

            let connection: MySQLConnectionClient,
                tableName = constants.DEFAULT_STORE_NAME;

            if (typeof options === "string") {
                connection = await mysql.createConnection(options);
            } else {
                tableName = options.tableName || tableName;

                connection = await mysql.createConnection(
                    util.omit<BaileysAuthStateOptions, MySQLConnectionOptions>(options),
                );
            }

            await connection.execute(`
                CREATE TABLE IF NOT EXISTS ${tableName} (
                    session VARCHAR(40) NOT NULL,
                    identifier VARCHAR(100) NOT NULL,
                    value TEXT DEFAULT NULL,
                    UNIQUE KEY idx_unique (session, identifier),  
                    KEY idx_session (session), 
                    KEY idx_identifier (identifier) 
                );
            `);

            return new MySQLConnection(connection, options);
        } catch (err) {
            console.error("Error MySQL Connection", err);
            throw err;
        }
    }

    public async store(data: unknown, identifier: string) {
        const value = JSON.stringify(data, util.BufferReplacer);
        await this.connection.execute(
            `INSERT INTO ${this.tableName} (session, identifier, value) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE value = ?;`,
            [this.sessionName, identifier, value, value],
        );
    }

    public async read(identifier: string) {
        const [result] = await this.connection.execute(
            `SELECT value FROM ${this.tableName} WHERE identifier = ? AND session = ?`,
            [identifier, this.sessionName],
        );

        // @ts-ignore
        return result.length > 0 ? JSON.parse(result[0].value, util.BufferReviver) : null;
    }

    public async remove(identifier: string) {
        await this.connection.execute(
            `DELETE FROM ${this.tableName} WHERE identifier = ? AND session = ?`,
            [identifier, this.sessionName],
        );
    }

    public async wipe() {
        await this.connection.execute(
            `DELETE FROM ${this.tableName} WHERE session = ?`,
            [this.sessionName],
        );
    }
}

export { MySQLConnection };
