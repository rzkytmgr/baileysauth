import type Long from "long";
import type {
    Collection,
    MongoClient,
    MongoClientOptions,
} from "mongodb";
import type {
    ConnectionOptions,
    Connection as MySQLConnection,
} from "mysql2/promise";
import type {
    ConnectionConfig,
    Client as PostgeSQLClient,
} from "pg";
import type {
    AuthenticationCreds,
    AuthenticationState,
    SignalDataTypeMap,
    KeyPair,
} from "baileys/lib/Types/Auth";

export type SessionDBResult = {
    name: string;
    session: string;
    value: string;
};

export type IConnectionBase = {
    store: (data: any, identifier: string) => Promise<any>;
    remove: (identifier: string) => Promise<any>;
    read: (identifier: string) => Promise<any>;
    wipe: () => Promise<any>;
    close: () => Promise<void>;
};

export type ConnectionOptionsBase = {
    session: string;
};

export type SQLBasedConnectionOptionsBase = Partial<
    ConnectionOptionsBase & {
        table: string;
    }
>;

export type NoSQLBasedConnectionOptionsBase = Partial<
    ConnectionOptionsBase & {
        collection: string;
    }
>;

export type BaileysAuthStateArgs = Partial<
    ConnectionOptionsBase & NoSQLBasedConnectionOptionsBase & SQLBasedConnectionOptionsBase
>;

export type PostgreSQLConnectionClient = PostgeSQLClient;
export type MySQLConnectionClient = MySQLConnection;
export type MongoDBConnectionCollection = Collection;
export type MongoDBConnectionClient = MongoClient;

export type MySQLRequiredAuthFields = "host" | "user" | "password" | "database";
export type MySQLOptionalAuthFields = "port";

export type PostgreRequiredAuthFields = MySQLRequiredAuthFields;
export type PostgreOptionalAuthFields = MySQLOptionalAuthFields;

export type SQLConnectionOptions<
    T extends object,
    RequiredFields extends keyof T,
    OptionalFields extends keyof T,
> =
    & SQLBasedConnectionOptionsBase
    & Required<Pick<T, RequiredFields>>
    & Partial<Pick<T, OptionalFields>>
    & {
        args?: Omit<T, RequiredFields | OptionalFields>;
    };

export type MySQLBaseConnectionOptions = ConnectionOptions;
export type MySQLConnectionOptions =
    & { dialect: "mysql"; }
    & SQLConnectionOptions<
        MySQLBaseConnectionOptions,
        MySQLRequiredAuthFields,
        MySQLOptionalAuthFields
    >;

export type PostgreSQLBaseConnectionOptions = ConnectionConfig;
export type PostgreSQLConnectionOptions =
    & { dialect: "pg"; }
    & SQLConnectionOptions<
        PostgreSQLBaseConnectionOptions,
        PostgreRequiredAuthFields,
        PostgreOptionalAuthFields
    >;

export type MongoDBBaseConnectionOptions = MongoClientOptions;
export type MongoDBConnectionOptions = { dialect: "mongodb"; } & NoSQLBasedConnectionOptionsBase & {
    host: string;
    user: string;
    password: string;
    database: string;
    port?: string | number;
    args?: MongoDBBaseConnectionOptions;
};

export type BaileysAuthStateOptions =
    | string
    | MySQLConnectionOptions
    | PostgreSQLConnectionOptions
    | MongoDBConnectionOptions;

export type Fingerprint = {
    rawId: number | null;
    currentIndex: number | null;
    deviceIndexes: number[] | null;
};

export type AppDataSync = {
    message: { rawId: number | null; };
    keyData: Uint8Array;
    fingerprint: Fingerprint;
    timestamp: Long | number;
};

export type BaileysAuthState = {
    state: AuthenticationState;
    saveCreds: () => Promise<any>;
    wipeCreds: () => Promise<any>;
    close: () => Promise<void>;
};

export type {
    AuthenticationCreds,
    SignalDataTypeMap,
    KeyPair,
};
