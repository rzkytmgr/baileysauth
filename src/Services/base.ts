import { constants } from "@/Lib/constants";
import type { BaileysAuthStateOptions } from "@/Types";

class ConnectionBase<T extends BaileysAuthStateOptions> {
    protected session: string = constants.DEFAULT_SESSION_NAME;
    protected table: string = constants.DEFAULT_STORE_NAME;
    protected isConnected: boolean = false;

    constructor(private options: T) {
        this.isConnected = true;

        if (typeof options !== "string") {
            this.session = options.session || this.session;
            if (options.dialect === 'mongodb') {
                this.table = options.collection || this.table;
            } else {
                this.table = options.table || this.table;
            }
        }
    }
}

export { ConnectionBase };
