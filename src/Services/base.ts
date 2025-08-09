import { BaileysAuthStateOptions } from "@/Types";

class ConnectionBase<T extends BaileysAuthStateOptions> {
    protected sessionName: string = "baileys_session";
    protected tableName: string = "baileys_session";
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
