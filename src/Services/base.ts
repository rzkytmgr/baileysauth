import { constants } from "@/Lib/constants";
import type { BaileysAuthStateOptions } from "@/Types";

class ConnectionBase<T extends BaileysAuthStateOptions> {
    protected sessionName: string = constants.DEFAULT_SESSION_NAME;
    protected tableName: string = constants.DEFAULT_STORE_NAME;
    protected isConnected: boolean = false;

    constructor(private options: T) {
        this.isConnected = true;

        if (typeof options !== "string") {
            this.sessionName = options.sessionName || this.sessionName;
            this.tableName = options.tableName || this.tableName;
        }
    }
}

export { ConnectionBase };
