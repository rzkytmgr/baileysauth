import test from "node:test";
import assert from "assert";
import pg from "pg";

import { useBaileysAuthState } from "../dist/index";

test("connection: postgres connection", async (t) => {
    const columns = ["session", "identifier", "value"];

    const RANDOM_STRING = crypto.randomUUID().slice(0, 8);
    const APP_STORE = RANDOM_STRING + "_auth_store";
    const APP_SESSION = RANDOM_STRING + "_auth_session";
    const PG_HOST = process.env.TEST_PG_HOST || "localhost";
    const PG_USER = process.env.TEST_PG_USER || "postgres";
    const PG_PASSWORD = process.env.TEST_PG_PASSWORD || "password";
    const PG_DATABASE = RANDOM_STRING + "_pg_auth";
    const PG_PORT = Number(process.env.TEST_PG_PORT || "5432");

    const postgresConnectionOptions = {
        user: PG_USER,
        password: PG_PASSWORD,
        host: PG_HOST,
        port: PG_PORT,
    };

    const postgresConnection = new pg.Client(postgresConnectionOptions);
    await postgresConnection.connect();

    const postgresDatabaseChecker = async (tableName: string, sessionName: string) => {
        const internalPgConnection = new pg.Client({
            ...postgresConnectionOptions,
            database: PG_DATABASE,
        });

        await internalPgConnection.connect();
        const table = await internalPgConnection.query(
            `select * from information_schema.columns where table_name = '${tableName}' and table_catalog = '${PG_DATABASE}'`,
        );

        if (!table.rows.length) {
            throw new Error("table or columns are not created");
        }

        for (const data of table.rows) {
            if (!columns.includes(data.column_name)) {
                throw Error("some columns are missing");
            }
        }

        const data = await internalPgConnection.query(
            `select * from "${tableName}" where session = '${sessionName}'`,
        );

        if (!data.rows.length) {
            throw new Error("session are not created or session name is not matched");
        }

        await internalPgConnection.end();

        await postgresConnection.query(
            `drop database "${PG_DATABASE}"`,
        );
    };

    await t.test("default connection string test", async () => {
        await assert.doesNotReject(async () => {
            await postgresConnection.query(`create database "${PG_DATABASE}"`);
            const postgresConnectionString =
                `postgres://${PG_USER}:${PG_PASSWORD}@${PG_HOST}:${PG_PORT}/${PG_DATABASE}`;
            const auth = await useBaileysAuthState(postgresConnectionString);
            await auth.state.keys.set({
                "lid-mapping": {
                    foo: "bar",
                },
            });
            await auth.close();
            await postgresDatabaseChecker("baileys_session", "baileys_session");
        });
    });

    await t.test("custom table name connection string test", async () => {
        await assert.doesNotReject(async () => {
            await postgresConnection.query(`create database "${PG_DATABASE}"`);
            const postgresConnectionString =
                `postgres://${PG_USER}:${PG_PASSWORD}@${PG_HOST}:${PG_PORT}/${PG_DATABASE}`;
            const auth = await useBaileysAuthState(postgresConnectionString, {
                table: APP_STORE,
            });
            await auth.state.keys.set({
                "lid-mapping": {
                    foo: "bar",
                },
            });
            await auth.close();
            await postgresDatabaseChecker(APP_STORE, "baileys_session");
        });
    });

    await t.test("custom session name connection string test", async () => {
        await assert.doesNotReject(async () => {
            await postgresConnection.query(`create database "${PG_DATABASE}"`);
            const postgresConnectionString =
                `postgres://${PG_USER}:${PG_PASSWORD}@${PG_HOST}:${PG_PORT}/${PG_DATABASE}`;
            const auth = await useBaileysAuthState(postgresConnectionString, {
                session: APP_SESSION,
            });
            await auth.state.keys.set({
                "lid-mapping": {
                    foo: "bar",
                },
            });
            await auth.close();
            await postgresDatabaseChecker("baileys_session", APP_SESSION);
        });
    });

    await t.test("custom table and session name connection string test", async () => {
        await assert.doesNotReject(async () => {
            await postgresConnection.query(`create database "${PG_DATABASE}"`);
            const postgresConnectionString =
                `postgres://${PG_USER}:${PG_PASSWORD}@${PG_HOST}:${PG_PORT}/${PG_DATABASE}`;
            const auth = await useBaileysAuthState(postgresConnectionString, {
                table: APP_STORE,
                session: APP_SESSION,
            });
            await auth.state.keys.set({
                "lid-mapping": {
                    foo: "bar",
                },
            });
            await auth.close();
            await postgresDatabaseChecker(APP_STORE, APP_SESSION);
        });
    });

    await t.test("default connection object test", async () => {
        await assert.doesNotReject(async () => {
            await postgresConnection.query(`create database "${PG_DATABASE}"`);
            const auth = await useBaileysAuthState({
                dialect: "pg",
                user: PG_USER,
                password: PG_PASSWORD,
                host: PG_HOST,
                database: PG_DATABASE,
                port: PG_PORT,
            });
            await auth.state.keys.set({
                "lid-mapping": {
                    foo: "bar",
                },
            });
            await auth.close();
            await postgresDatabaseChecker("baileys_session", "baileys_session");
        });
    });

    await t.test("custom table name connection object test", async () => {
        await assert.doesNotReject(async () => {
            await postgresConnection.query(`create database "${PG_DATABASE}"`);
            const auth = await useBaileysAuthState({
                dialect: "pg",
                user: PG_USER,
                password: PG_PASSWORD,
                host: PG_HOST,
                database: PG_DATABASE,
                port: PG_PORT,
                table: APP_STORE,
            });
            await auth.state.keys.set({
                "lid-mapping": {
                    foo: "bar",
                },
            });
            await auth.close();
            await postgresDatabaseChecker(APP_STORE, "baileys_session");
        });
    });

    await t.test("custom session name connection object test", async () => {
        await assert.doesNotReject(async () => {
            await postgresConnection.query(`create database "${PG_DATABASE}"`);
            const auth = await useBaileysAuthState({
                dialect: "pg",
                user: PG_USER,
                password: PG_PASSWORD,
                host: PG_HOST,
                database: PG_DATABASE,
                port: PG_PORT,
                session: APP_SESSION,
            });
            await auth.state.keys.set({
                "lid-mapping": {
                    foo: "bar",
                },
            });
            await auth.close();
            await postgresDatabaseChecker("baileys_session", APP_SESSION);
        });
    });

    await t.test("custom table and session name connection object test", async () => {
        await assert.doesNotReject(async () => {
            await postgresConnection.query(`create database "${PG_DATABASE}"`);
            const auth = await useBaileysAuthState({
                dialect: "pg",
                user: PG_USER,
                password: PG_PASSWORD,
                host: PG_HOST,
                database: PG_DATABASE,
                port: PG_PORT,
                table: APP_STORE,
                session: APP_SESSION,
            });
            await auth.state.keys.set({
                "lid-mapping": {
                    foo: "bar",
                },
            });
            await auth.close();
            await postgresDatabaseChecker(APP_STORE, APP_SESSION);
        });
    });

    await postgresConnection.end();
});
