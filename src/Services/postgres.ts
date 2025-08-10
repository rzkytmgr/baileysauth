import util from "@/Utils";
import { constants } from "@/Lib/constants";
import { ConnectionBase } from "@/Services/base";
import type {
    BaileysAuthStateOptions,
    IConnectionBase,
    PostgreSQLConnectionClient,
    PostgreSQLConnectionOptions,
} from "@/Types";

class PostgreSQLConnection extends ConnectionBase<BaileysAuthStateOptions> implements IConnectionBase {
    constructor(private connection: PostgreSQLConnectionClient, options: BaileysAuthStateOptions) {
        super(options);
    }

    static async init(options: BaileysAuthStateOptions) {
        try {
            const pg = await import("pg");

            let client: PostgreSQLConnectionClient,
                tableName = constants.DEFAULT_STORE_NAME;

            if (typeof options === "string") {
                client = new pg.Client({ connectionString: options });
            } else {
                tableName = options.tableName || tableName;
                client = new pg.Client(
                    util.omit<BaileysAuthStateOptions, PostgreSQLConnectionOptions>(options),
                );
            }

            await client.connect();
            await client.query(`
                CREATE TABLE IF NOT EXISTS "${tableName}" (
                    session VARCHAR(40) NOT NULL,
                    identifier VARCHAR(100) NOT NULL,
                    value TEXT DEFAULT NULL,
                    CONSTRAINT idx_unique UNIQUE (session, identifier)
                );
            `);

            await client.query(`CREATE INDEX IF NOT EXISTS idx_session ON "${tableName}" (session);`);
            await client.query(`CREATE INDEX IF NOT EXISTS idx_identifier ON "${tableName}" (identifier);`);

            return new PostgreSQLConnection(client, options);
        } catch (err) {
            console.error("Error PostgreSQL Connection", err);
            throw err;
        }
    }

    public async store(data: unknown, identifier: string) {
        const value = JSON.stringify(data, util.BufferReplacer);
        await this.connection.query(
            `INSERT INTO "${this.tableName}" (session, identifier, value) VALUES ($1, $2, $3) ON CONFLICT (session, identifier) DO UPDATE SET value = EXCLUDED.value;`,
            [this.sessionName, identifier, value],
        );
    }

    public async read(identifier: string) {
        const { rows } = await this.connection.query(
            `SELECT value FROM "${this.tableName}" WHERE identifier = $1 AND session = $2`,
            [identifier, this.sessionName],
        );
        // @ts-ignore
        return rows.length > 0 ? JSON.parse(rows[0].value, util.BufferReviver) : null;
    }

    public async remove(identifier: string) {
        await this.connection.query(
            `DELETE FROM "${this.tableName}" WHERE identifier = $1 AND session = $2`,
            [identifier, this.sessionName],
        );
    }

    public async wipe() {
        await this.connection.query(
            `DELETE FROM "${this.tableName}" WHERE session = ?`,
            [this.sessionName],
        );
    }
}

export { PostgreSQLConnection };
