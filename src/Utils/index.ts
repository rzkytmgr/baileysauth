/* @ts-ignore */
import * as libsignal from "libsignal";
import base64 from "@protobufjs/base64";
import { randomBytes } from "crypto";
import type {
    AuthenticationCreds,
    BaileysAuthStateOptions,
    KeyPair,
    AppDataSync,
} from "@/Types";

const omit = <T extends BaileysAuthStateOptions, U>(
    record: T,
    keys: string[] = ["dialect", "table", "session", "args", "collection"],
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

const fromObject = (object: AppDataSync) => {
    const message: AppDataSync = object || {};

    if (object.keyData !== null) {
        if (typeof object.keyData === "string") {
            base64.decode(object.keyData, message.keyData = new Uint8Array(base64.length(object.keyData)), 0);
        } else if (object.keyData.length >= 0) {
            message.keyData = object.keyData;
        }
    }

    if (object.fingerprint !== null && typeof object.fingerprint === "object") {
        const fingerprint = object.fingerprint;
        message.fingerprint = {
            rawId: fingerprint.rawId ? fingerprint.rawId >>> 0 : null,
            currentIndex: fingerprint.currentIndex ? fingerprint.currentIndex >>> 0 : null,
            deviceIndexes: Array.isArray(fingerprint.deviceIndexes)
                ? fingerprint.deviceIndexes.map((num) => num >>> 0)
                : [],
        };
    }

    if (object.timestamp !== null) {
        if (typeof object.timestamp === "string") {
            message.timestamp = parseInt(object.timestamp, 10);
        } else {
            message.timestamp = object.timestamp;
        }
    }

    return message;
};

export default {
    omit,
    initializeAuthenticationCredentials,
    BufferReplacer,
    BufferReviver,
    fromObject,
};
