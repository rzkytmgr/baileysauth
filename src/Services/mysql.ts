import util from "@/Utils";
import { constants } from "@/Lib/constants";
import { ConnectionBase } from "@/Services/base";
import type {
    BaileysAuthStateOptions,
    IConnectionBase,
    MySQLConnectionOptions,
    MySQLConnectionClient,
    MySQLBaseConnectionOptions,
    BaileysAuthStateArgs,
} from "@/Types";
class MySQLConnection extends ConnectionBase<BaileysAuthStateOptions> implements IConnectionBase {
    constructor(
        private connection: MySQLConnectionClient,
        conn: BaileysAuthStateOptions,
        args?: BaileysAuthStateArgs,
    ) {
        super(conn, args);
    }

    static async init(conn: string | MySQLConnectionOptions, args?: BaileysAuthStateArgs) {
        try {
            const mysql = await import("mysql2/promise");

            let connection: MySQLConnectionClient,
                table = constants.DEFAULT_STORE_NAME;

            if (typeof conn === "string") {
                table = args?.table || table;
                connection = await mysql.createConnection(conn);
            } else {
                const connectionOptions = util.omit<MySQLConnectionOptions, MySQLBaseConnectionOptions>({
                    ...conn,
                    ...conn.args,
                });
                table = conn.table || table;
                connection = await mysql.createConnection(connectionOptions);
            }

            await connection.execute(`
                CREATE TABLE IF NOT EXISTS \`${table}\` (
                    session VARCHAR(40) NOT NULL,
                    identifier VARCHAR(100) NOT NULL,
                    value TEXT DEFAULT NULL,
                    UNIQUE KEY idx_unique (session, identifier),  
                    KEY idx_session (session), 
                    KEY idx_identifier (identifier) 
                );
            `);

            return new MySQLConnection(connection, conn, args);
        } catch (_err) {
            if (!constants.BAILEYSAUTH_TESTING) {
                console.error("Error MySQL Connection", _err);
            }

            throw _err;
        }
    }

    public async store(data: unknown, identifier: string) {
        const value = JSON.stringify(data, util.BufferReplacer);
        await this.connection.execute(
            `INSERT INTO \`${this.table}\` (session, identifier, value) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE value = ?;`,
            [this.session, identifier, value, value],
        );
    }

    public async read(identifier: string) {
        const [result] = await this.connection.execute(
            `SELECT value FROM \`${this.table}\` WHERE identifier = ? AND session = ?`,
            [identifier, this.session],
        );

        // @ts-ignore
        return result.length > 0 ? JSON.parse(result[0].value, util.BufferReviver) : null;
    }

    public async remove(identifier: string) {
        await this.connection.execute(
            `DELETE FROM \`${this.table}\` WHERE identifier = ? AND session = ?`,
            [identifier, this.session],
        );
    }

    public async wipe() {
        await this.connection.execute(
            `DELETE FROM \`${this.table}\` WHERE session = ?`,
            [this.session],
        );
    }

    public async close() {
        await this.connection.end();
    }
}

export { MySQLConnection };
