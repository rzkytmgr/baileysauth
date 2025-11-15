import { constants } from "@/Lib/constants";
import type {
    BaileysAuthStateArgs,
    BaileysAuthStateOptions,
} from "@/Types";

class ConnectionBase<T extends BaileysAuthStateOptions> {
    protected session: string = constants.DEFAULT_SESSION_NAME;
    protected table: string = constants.DEFAULT_STORE_NAME;
    protected isConnected: boolean = false;

    constructor(private options: T, args?: BaileysAuthStateArgs) {
        this.isConnected = true;

        if (typeof options === "string") {
            this.session = args?.session || this.session;
            this.table = args?.table || args?.collection || this.table;
        } else {
            this.session = options.session || this.session;
            if (options.dialect === "mongodb") {
                this.table = options.collection || this.table;
            } else {
                this.table = options.table || this.table;
            }
        }
    }
}

export { ConnectionBase };
