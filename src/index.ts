import { BaileysAuthConnection } from "./core";
import util from "./Utils";
import type {
    AuthenticationCreds,
    BaileysAuthStateOptions,
    IConnectionBase,
    SignalDataTypeMap,
} from "./Types";

const useBaileysAuthState = async (options: BaileysAuthStateOptions) => {
    const connection = <IConnectionBase> await BaileysAuthConnection.connect(options);

    const creds: AuthenticationCreds = await connection.read("creds")
        || util.initializeAuthenticationCredentials();

    return {
        state: {
            creds,
            keys: {
                get: async (type: keyof SignalDataTypeMap, identifiers: string[]): Promise<any> => {
                    const data: Record<string, SignalDataTypeMap[typeof type]> = {};

                    await Promise.all(
                        identifiers.map(async (identifier) => {
                            let value = await connection.read(`${type}_${identifier}`);
                            if (type === "app-state-sync-key" && value) {
                                value = util.fromObject(value);
                            }
                            data[identifier] = value;
                        }),
                    );

                    return data;
                },

                set: async (data: Record<keyof SignalDataTypeMap, Record<string, any>>): Promise<any> => {
                    const handler = async (value: any, session: string) => {
                        if (value) {
                            await connection.store(value, session);
                        } else {
                            await connection.remove(session);
                        }
                    };

                    for (const type in data) {
                        const typeData = data[type as keyof SignalDataTypeMap];
                        for (const identifier in typeData) {
                            const value = typeData[identifier];
                            const session = `${type}_${identifier}`;
                            await handler(value, session);
                        }
                    }
                },
            },
        },
        saveCreds: async () => connection.store(creds, "creds"),
    };
};

export { useBaileysAuthState };
