import test from "node:test";
import assert from "assert";
import mongodb from "mongodb";

import { useBaileysAuthState } from "../dist/index";

test("connection: mongodb connection", async (t) => {
    const RANDOM_STRING = crypto.randomUUID().slice(0, 8);
    const APP_STORE = RANDOM_STRING + "_auth_store";
    const APP_SESSION = RANDOM_STRING + "_auth_session";
    const MONGO_HOST = process.env.TEST_MONGO_HOST || "localhost";
    const MONGO_USER = process.env.TEST_MONGO_USER || "mongo";
    const MONGO_PASSWORD = process.env.TEST_MONGO_PASSWORD || "password";
    const MONGO_DATABASE = RANDOM_STRING + "_mongo_auth";
    const MONGO_PORT = Number(process.env.TEST_MONGO_PORT || "27017");

    const mongoConnection = new mongodb.MongoClient(
        `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/?authSource=admin`,
    );
    await mongoConnection.connect();

    const mongoDatabaseChecker = async (collectionName: string, sessionName: string) => {
        const dbs = await mongoConnection.db().admin().listDatabases();
        const dbExists = dbs.databases.some((db) => db.name === MONGO_DATABASE);

        if (!dbExists) {
            throw new Error("mongo database is not created");
        }

        const db = mongoConnection.db(MONGO_DATABASE);
        const collections = await db.listCollections().toArray();
        const collectionExists = collections.some((col) => col.name === collectionName);

        if (!collectionExists) {
            throw new Error("mongo database collection is not created");
        }

        const collectSession = await db.collection(collectionName).find({
            session: sessionName,
        }).toArray();

        if (!collectSession.length) {
            throw new Error("session are not created or session name is not matched");
        }

        await db.dropDatabase();
    };

    await t.test("default connection string test", async () => {
        await assert.doesNotReject(async () => {
            const auth = await useBaileysAuthState(
                `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DATABASE}?authSource=admin`,
            );
            await auth.state.keys.set({
                "lid-mapping": {
                    foo: "bar",
                },
            });
            await auth.close();
            await mongoDatabaseChecker("baileys_session", "baileys_session");
        });
    });

    await t.test("custom collection name connection string test", async () => {
        await assert.doesNotReject(async () => {
            const auth = await useBaileysAuthState(
                `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DATABASE}?authSource=admin`,
                {
                    collection: APP_STORE,
                },
            );
            await auth.state.keys.set({
                "lid-mapping": {
                    foo: "bar",
                },
            });
            await auth.close();
            await mongoDatabaseChecker(APP_STORE, "baileys_session");
        });
    });

    await t.test("custom session name connection string test", async () => {
        await assert.doesNotReject(async () => {
            const auth = await useBaileysAuthState(
                `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DATABASE}?authSource=admin`,
                {
                    session: APP_SESSION,
                },
            );
            await auth.state.keys.set({
                "lid-mapping": {
                    foo: "bar",
                },
            });
            await auth.close();
            await mongoDatabaseChecker("baileys_session", APP_SESSION);
        });
    });

    await t.test("custom collection and session name connection string test", async () => {
        await assert.doesNotReject(async () => {
            const auth = await useBaileysAuthState(
                `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DATABASE}?authSource=admin`,
                {
                    collection: APP_STORE,
                    session: APP_SESSION,
                },
            );
            await auth.state.keys.set({
                "lid-mapping": {
                    foo: "bar",
                },
            });
            await auth.close();
            await mongoDatabaseChecker(APP_STORE, APP_SESSION);
        });
    });

    await t.test("default connection object test", async () => {
        await assert.doesNotReject(async () => {
            const auth = await useBaileysAuthState({
                dialect: "mongodb",
                user: MONGO_USER,
                password: MONGO_PASSWORD,
                host: MONGO_HOST,
                database: MONGO_DATABASE,
                port: MONGO_PORT,
                args: {
                    authSource: "admin",
                },
            });
            await auth.state.keys.set({
                "lid-mapping": {
                    foo: "bar",
                },
            });
            await auth.close();
            await mongoDatabaseChecker("baileys_session", "baileys_session");
        });
    });

    await t.test("custom collection name connection object test", async () => {
        await assert.doesNotReject(async () => {
            const auth = await useBaileysAuthState({
                dialect: "mongodb",
                user: MONGO_USER,
                password: MONGO_PASSWORD,
                host: MONGO_HOST,
                database: MONGO_DATABASE,
                port: MONGO_PORT,
                collection: APP_STORE,
                args: {
                    authSource: "admin",
                },
            });
            await auth.state.keys.set({
                "lid-mapping": {
                    foo: "bar",
                },
            });
            await auth.close();
            await mongoDatabaseChecker(APP_STORE, "baileys_session");
        });
    });

    await t.test("custom session name connection object test", async () => {
        await assert.doesNotReject(async () => {
            const auth = await useBaileysAuthState({
                dialect: "mongodb",
                user: MONGO_USER,
                password: MONGO_PASSWORD,
                host: MONGO_HOST,
                database: MONGO_DATABASE,
                port: MONGO_PORT,
                session: APP_SESSION,
                args: {
                    authSource: "admin",
                },
            });
            await auth.state.keys.set({
                "lid-mapping": {
                    foo: "bar",
                },
            });
            await auth.close();
            await mongoDatabaseChecker("baileys_session", APP_SESSION);
        });
    });

    await t.test("custom collection and session name connection object test", async () => {
        await assert.doesNotReject(async () => {
            const auth = await useBaileysAuthState({
                dialect: "mongodb",
                user: MONGO_USER,
                password: MONGO_PASSWORD,
                host: MONGO_HOST,
                database: MONGO_DATABASE,
                port: MONGO_PORT,
                collection: APP_STORE,
                session: APP_SESSION,
                args: {
                    authSource: "admin",
                },
            });
            await auth.state.keys.set({
                "lid-mapping": {
                    foo: "bar",
                },
            });
            await auth.close();
            await mongoDatabaseChecker(APP_STORE, APP_SESSION);
        });
    });

    await mongoConnection.close();
});
