/* eslint-disable @typescript-eslint/ban-ts-comment */
/* @ts-ignore */
import * as libsignal from "libsignal";
import { randomBytes } from "crypto";
import type {
    AuthenticationCreds,
    BaileysAuthStateOptions,
    KeyPair,
    Fingerprint,
    AppDataSync,
} from "@/Types";

const omit = <T extends BaileysAuthStateOptions, U>(
    record: T,
    keys: string[] = ["dialect", "tableName", "sessionName"],
): U => {
    return <U> Object.fromEntries(
        Object.entries(record).filter(([key]) => !keys.includes(key)),
    );
};

const BufferReplacer = (k: any, value: any) => {
    if (Buffer.isBuffer(value) || value instanceof Uint8Array || value?.type === "Buffer") {
        return { type: "Buffer", data: Buffer.from(value?.data || value).toString("base64") };
    }
    return value;
};

const BufferReviver = (_: any, value: any) => {
    if (typeof value === "object" && !!value && (value.buffer === true || value.type === "Buffer")) {
        const val = value.data || value.value;
        return typeof val === "string" ? Buffer.from(val, "base64") : Buffer.from(val || []);
    }
    return value;
};

const allocate = (str: string) => {
    let p = str.length;

    if (!p) {
        return new Uint8Array(1);
    }

    let n = 0;

    while (--p % 4 > 1 && str.charAt(p) === "=") {
        ++n;
    }

    return new Uint8Array(Math.ceil(str.length * 3) / 4 - n).fill(0);
};

const parseTimestamp = (timestamp: string | number | Long) => {
    if (typeof timestamp === "string") {
        return parseInt(timestamp, 10);
    }

    if (typeof timestamp === "number") {
        return timestamp;
    }

    return timestamp;
};

export const fromObject = (args: AppDataSync) => {
    const f: Fingerprint = {
        ...args.fingerprint,
        deviceIndexes: Array.isArray(args.fingerprint.deviceIndexes) ? args.fingerprint.deviceIndexes : [],
    };

    const message = {
        keyData: Array.isArray(args.keyData) ? args.keyData : new Uint8Array(),
        fingerprint: {
            rawId: f.rawId || 0,
            currentIndex: f.rawId || 0,
            deviceIndexes: f.deviceIndexes,
        },
        timestamp: parseTimestamp(args.timestamp),
    };

    if (typeof args.keyData === "string") {
        message.keyData = allocate(args.keyData);
    }

    return message;
};

const generateSignalPubKey = (pubKey: Uint8Array | Buffer) =>
    pubKey.length === 33 ? pubKey : Buffer.concat([
        Buffer.from([5]),
        pubKey,
    ]);

const generateKeyPair = (): KeyPair => {
    const { pubKey, privKey } = libsignal.curve.generateKeyPair();
    const generatedKeyPair = {
        private: Buffer.from(privKey),
        public: Buffer.from((pubKey as Uint8Array).slice(1)),
    };
    return generatedKeyPair;
};

const signKey = (privateKey: Uint8Array, buf: Uint8Array) => libsignal.curve.calculateSignature(privateKey, buf);

const signedKeyPair = (identityKeyPair: KeyPair, keyId: number) => {
    const preKey = generateKeyPair();
    const pubKey = generateSignalPubKey(preKey.public);
    const signature = signKey(identityKeyPair.private, pubKey);
    return { keyPair: preKey, signature, keyId };
};

const initializeAuthenticationCredentials = (): AuthenticationCreds => {
    const identityKey = generateKeyPair();
    return {
        noiseKey: generateKeyPair(),
        pairingEphemeralKeyPair: generateKeyPair(),
        signedIdentityKey: identityKey,
        signedPreKey: signedKeyPair(identityKey, 1),
        registrationId: Uint16Array.from(randomBytes(2))[0]! & 16383,
        advSecretKey: randomBytes(32).toString("base64"),
        processedHistoryMessages: [],
        nextPreKeyId: 1,
        firstUnuploadedPreKeyId: 1,
        accountSyncCounter: 0,
        accountSettings: {
            unarchiveChats: false,
        },
        registered: false,
        pairingCode: undefined,
        lastPropHash: undefined,
        routingInfo: undefined,
    };
};

export default { initializeAuthenticationCredentials, fromObject, BufferReplacer, BufferReviver, omit };
