import mysql from "mysql2/promise";
import util from "@/Utils";
import { ConnectionBase } from "@/Services/base";
import type {
    BaileysAuthStateOptions,
    MySQLConnectionOptions,
    IConnectionBase,
} from "@/Types";

class MySQLConnection extends ConnectionBase<BaileysAuthStateOptions> implements IConnectionBase {
    constructor(private connection: mysql.Connection, options: BaileysAuthStateOptions) {
        super(options);
    }

    static async init(options: BaileysAuthStateOptions) {
        try {
            let connection: mysql.Connection,
                tableName = "baileys_session";

            if (typeof options === "string") {
                connection = await mysql.createConnection(options);
            } else {
                tableName = options.tableName || tableName;

                connection = await mysql.createConnection(
                    util.omit<BaileysAuthStateOptions, MySQLConnectionOptions>(options),
                );
            }

            await connection.execute(`
                CREATE TABLE IF NOT EXISTS \`${tableName}\` (
                    session VARCHAR(40) NOT NULL,
                    identifier VARCHAR(100) NOT NULL,
                    value TEXT DEFAULT NULL,
                    UNIQUE KEY \`idxunique\` (\`session\`, \`identifier\`),  
                    KEY \`idxsession\` (\`session\`), 
                    KEY \`idxidentifier\` (\`identifier\`) 
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
            `INSERT INTO \`${this.tableName}\` (session, identifier, value) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE value = ?;`,
            [this.sessionName, identifier, value, value],
        );
    }

    public async read(identifier: string) {
        const [result] = await this.connection.execute(
            `SELECT value FROM \`${this.tableName}\` WHERE identifier = ? AND session = ?`,
            [identifier, this.sessionName],
        );

        console.log(result);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return result.length > 0 ? JSON.parse(result[0].value, util.BufferReviver) : null;
    }

    public async remove(identifier: string) {
        await this.connection.execute(`DELETE FROM \`${this.tableName}\` WHERE identifier = ? AND session = ?`, [
            identifier,
            this.sessionName,
        ]);
    }
}

export { MySQLConnection };
