import util from "@/Utils";
import { constants } from "@/Lib/constants";
import { ConnectionBase } from "@/Services/base";
import type {
    BaileysAuthStateOptions,
    IConnectionBase,
    MongoDBConnectionClient,
    MongoDBConnectionCollection,
    MongoDBConnectionOptions,
} from "@/Types";

class MongoDBConnection extends ConnectionBase<BaileysAuthStateOptions> implements IConnectionBase {
    constructor(private connection: MongoDBConnectionCollection, options: BaileysAuthStateOptions) {
        super(options);
    }

    static async init(options: BaileysAuthStateOptions) {
        try {
            const mongo = await import("mongodb");

            let client: MongoDBConnectionClient,
                tableName = constants.DEFAULT_STORE_NAME;

            if (typeof options === "string") {
                client = new mongo.MongoClient(options);
            } else {
                tableName = options.tableName || tableName;
                const excludeOptions = ["dialect", "tableName", "sessionName", "connection", "database"];

                client = new mongo.MongoClient(
                    // @ts-ignore
                    options.connection,
                    util.omit<BaileysAuthStateOptions, MongoDBConnectionOptions>(options, excludeOptions),
                );
            }

            await client.connect();
            const db = typeof options !== "string" ? client.db(options.database) : client.db();
            const conn = db.collection(tableName);

            return new MongoDBConnection(conn, options);
        } catch (err) {
            console.error("Error MongoDB Connection", err);
            throw err;
        }
    }

    public async store(data: unknown, identifier: string) {
        const value = JSON.stringify(data, util.BufferReplacer);
        await this.connection.updateOne({
            session: this.sessionName,
            identifier,
        }, {
            $set: {
                session: this.sessionName,
                identifier,
                value,
            },
        }, {
            upsert: true,
        });
    }

    public async read(identifier: string) {
        const result = await this.connection.findOne({
            identifier,
            session: this.sessionName,
        });
        return result ? JSON.parse(result.value, util.BufferReviver) : null;
    }

    public async remove(identifier: string) {
        await this.connection.deleteOne({
            identifier,
            session: this.sessionName,
        });
    }

    public async wipe() {
        await this.connection.deleteOne({
            session: this.sessionName,
        });
    }
}

export { MongoDBConnection };
