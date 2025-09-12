import util from "@/Utils";
import { constants } from "@/Lib/constants";
import { ConnectionBase } from "@/Services/base";
import type {
    BaileysAuthStateOptions,
    IConnectionBase,
    MongoDBBaseConnectionOptions,
    MongoDBConnectionClient,
    MongoDBConnectionCollection,
    MongoDBConnectionOptions,
} from "@/Types";

class MongoDBConnection extends ConnectionBase<BaileysAuthStateOptions> implements IConnectionBase {
    constructor(private connection: MongoDBConnectionCollection, options: BaileysAuthStateOptions) {
        super(options);
    }

    static async init(options: string | MongoDBConnectionOptions) {
        try {
            const mongo = await import("mongodb");

            let client: MongoDBConnectionClient,
                collection = constants.DEFAULT_STORE_NAME;

            if (typeof options === "string") {
                client = new mongo.MongoClient(options);
            } else {
                collection = options.collection || collection;
                const connectionString = `mongodb://${options.user}:${options.password}@${options.host}:${options.port || 27017}/${options.database}`;
                client = new mongo.MongoClient(connectionString, options.args);
            }

            await client.connect();
            const db = typeof options !== "string" ? client.db(options.database) : client.db();
            const conn = db.collection(collection);

            return new MongoDBConnection(conn, options);
        } catch (err) {
            console.error("Error MongoDB Connection", err);
            throw err;
        }
    }

    public async store(data: unknown, identifier: string) {
        const value = JSON.stringify(data, util.BufferReplacer);
        await this.connection.updateOne({
            session: this.session,
            identifier,
        }, {
            $set: {
                session: this.session,
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
            session: this.session,
        });
        return result ? JSON.parse(result.value, util.BufferReviver) : null;
    }

    public async remove(identifier: string) {
        await this.connection.deleteOne({
            identifier,
            session: this.session,
        });
    }

    public async wipe() {
        await this.connection.deleteOne({
            session: this.session,
        });
    }
}

export { MongoDBConnection };
