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

export type SQLBasedConnectionOptionsBase = ConnectionOptionsBase & {
    table: string;
};

export type NoSQLBasedConnectionOptionsBase = ConnectionOptionsBase & {
    collection: string;
};

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

/** Baileys Types */
export type AuthenticationState = {
    creds: AuthenticationCreds;
    keys: SignalKeyStore;
};

export type SignalCreds = {
    readonly signedIdentityKey: KeyPair;
    readonly signedPreKey: SignedKeyPair;
    readonly registrationId: number;
};

export type KeyPair = {
    public: Uint8Array;
    private: Uint8Array;
};

export type SignedKeyPair = {
    keyPair: KeyPair;
    signature: Uint8Array;
    keyId: number;
    timestampS?: number;
};

export type ProtocolAddress = {
    name: string;
    deviceId: number;
};

export type SignalIdentity = {
    identifier: ProtocolAddress;
    identifierKey: Uint8Array;
};

export type IMeDetails = {
    id: string;
    lid?: string;
    phoneNumber?: string;
    name?: string;
    notify?: string;
    verifiedName?: string;
    imgUrl?: string | null;
    status?: string;
};

export type IAccount = {
    details?: Uint8Array | null;
    accountSignatureKey?: Uint8Array | null;
    accountSignature?: Uint8Array | null;
    deviceSignature?: Uint8Array | null;
};

export type IMessageKey = {
    remoteJid?: string | null;
    fromMe?: boolean | null;
    id?: string | null;
    participant?: string | null;
};

export type MinimalMessage = {
    key: IMessageKey;
    messageTimestamp?: number | Long | null;
};

export type AccountSettings = {
    unarchiveChats: boolean;
    defaultDisappearingMode?: IConversation;
};

export type IConversation = {
    ephemeralExpiration?: number | null;
    ephemeralSettingTimestamp?: number | Long | null;
};

export type AuthenticationCreds = SignalCreds & {
    readonly noiseKey: KeyPair;
    readonly pairingEphemeralKeyPair: KeyPair;
    advSecretKey: string;
    me?: IMeDetails;
    account?: IAccount;
    signalIdentities?: SignalIdentity[];
    myAppStateKeyId?: string;
    firstUnuploadedPreKeyId: number;
    nextPreKeyId: number;
    lastAccountSyncTimestamp?: number;
    platform?: string;
    processedHistoryMessages: MinimalMessage[];
    accountSyncCounter: number;
    accountSettings: AccountSettings;
    registered: boolean;
    pairingCode: string | undefined;
    lastPropHash: string | undefined;
    routingInfo: Buffer | undefined;
    additionalData?: any | undefined;
};

type Awaitable<T> = T | Promise<T>;

export type SignalKeyStore = {
    get<T extends keyof SignalDataTypeMap>(type: T, ids: string[]): Awaitable<{ [id: string]: SignalDataTypeMap[T]; }>;
    set(data: SignalDataSet): Awaitable<void>;
    clear?(): Awaitable<void>;
};

export type SignalDataSet = { [T in keyof SignalDataTypeMap]?: { [id: string]: SignalDataTypeMap[T] | null; }; };

export type SignalDataTypeMap = {
    session: Uint8Array;
    "pre-key": KeyPair;
    "sender-key": Uint8Array;
    "sender-key-memory": { [jid: string]: boolean; };
    "app-state-sync-key": IAppStateSyncKey;
    "app-state-sync-version": LTHashState;
    "lid-mapping": string;
    "device-list": string[];
};

export type IAppStateSyncKey = {
    keyData?: Uint8Array | null;
    fingerprint?: IFingerprintState | null;
    timestamp?: number | Long | null;
};

export type IFingerprintState = {
    rawId?: number | null;
    currentIndex?: number | null;
    deviceIndexes?: number[] | null;
};

export type LTHashState = {
    version: number;
    hash: Buffer;
    indexValueMap: {
        [indexMacBase64: string]: { valueMac: Uint8Array | Buffer; };
    };
};

export type BaileysAuthState = {
    state: AuthenticationState;
    saveCreds: () => Promise<any>;
    wipeCreds: () => Promise<any>;
    close: () => Promise<void>;
};
