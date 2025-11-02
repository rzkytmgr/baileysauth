import test from "node:test";
import assert from "node:assert";
import crypto from "node:crypto";
import { useBaileysAuthState } from "../dist/index";
import mysql2 from "mysql2/promise";
import pg from "pg";
import mongodb from "mongodb";

test("core function test", async (t) => {
    /** constant variables */
    const RANDOM_STRING = crypto.randomUUID().slice(0, 8);
    const APP_STORE = RANDOM_STRING + "_auth_store";
    const APP_SESSION = RANDOM_STRING + "_auth_session";
    const MYSQL_HOST = process.env.TEST_MYSQL_HOST || "localhost";
    const MONGO_HOST = process.env.TEST_MONGO_HOST || "localhost";
    const PG_HOST = process.env.TEST_PG_HOST || "localhost";
    const MYSQL_USER = process.env.TEST_MYSQL_USER || "root";
    const MYSQL_PASSWORD = process.env.TEST_MYSQL_PASSWORD || "password";
    const MYSQL_DATABASE = RANDOM_STRING + "_mysql_auth";
    const MYSQL_PORT = Number(process.env.TEST_MYSQL_PORT || 3306);
    const PG_USER = process.env.TEST_PG_USER || "postgres";
    const PG_PASSWORD = process.env.TEST_PG_PASSWORD || "password";
    const PG_DATABASE = RANDOM_STRING + "_pg_auth";
    const PG_PORT = Number(process.env.TEST_PG_PORT || "5432");
    const MONGO_USER = process.env.TEST_MONGO_USER || "mongo";
    const MONGO_PASSWORD = process.env.TEST_MONGO_PASSWORD || "password";
    const MONGO_DATABASE = RANDOM_STRING + "_mongo_auth";
    const MONGO_PORT = Number(process.env.TEST_MONGO_PORT || "27017");

    const columns = ["session", "identifier", "value"];

    /** Error format */
    const ERR_INVALID_CONNECTION_STRING = {
        name: "TypeError",
        message: "Invalid connection string. doesn't looks like connection string",
    };

    const ERR_INVALID_CONNECTION_PROTOCOL = {
        name: "TypeError",
        message: "Cannot afford connection based on connection string you've input",
    };

    /** invalid connection string */
    await t.test("invalid connection string validation test", async () => {
        await assert.rejects(
            async () => await useBaileysAuthState("test"),
            ERR_INVALID_CONNECTION_STRING,
        );
        await assert.rejects(
            async () => await useBaileysAuthState("protocol://username:password"),
            ERR_INVALID_CONNECTION_STRING,
        );
        await assert.rejects(
            async () => await useBaileysAuthState("protocol://username:password@host:port"),
            ERR_INVALID_CONNECTION_STRING,
        );
        await assert.rejects(
            async () => await useBaileysAuthState("protocol://username:password@host:port/db"),
            ERR_INVALID_CONNECTION_STRING,
        );
    });

    /** invalid dialect */
    await t.test("invalid dialect validation test", async () => {
        await assert.rejects(
            async () => await useBaileysAuthState("protocol://username:password@host:0/db"),
            ERR_INVALID_CONNECTION_PROTOCOL,
        );
    });

    /** mysql connection */
    await t.test("mysql connection integration testing", async () => {
        const mysqlConnection = await mysql2.createConnection({
            user: MYSQL_USER,
            password: MYSQL_PASSWORD,
            host: MYSQL_HOST,
            port: MYSQL_PORT,
        });

        const mysqlDatabaseChecker = async (tableName: string) => {
            const [result]: any = await mysqlConnection.query(
                `select * from information_schema.columns where table_name = '${tableName}' and table_schema = '${MYSQL_DATABASE}'`,
            );

            if (!result.length) {
                throw new Error("table or columns are not created");
            }

            for (const data of result) {
                if (!columns.includes(data.COLUMN_NAME)) {
                    throw Error("some columns are missing");
                }
            }

            await mysqlConnection.query(
                `drop database \`${MYSQL_DATABASE}\``,
            );
        };

        await assert.doesNotReject(async () => {
            await mysqlConnection.query(`create database if not exists \`${MYSQL_DATABASE}\``);
            const mysqlStringConnection =
                `mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DATABASE}`;
            const auth = await useBaileysAuthState(mysqlStringConnection);
            await auth.close();
            await mysqlDatabaseChecker("baileys_session");
        });

        await assert.doesNotReject(async () => {
            await mysqlConnection.query(`create database if not exists \`${MYSQL_DATABASE}\``);
            const auth = await useBaileysAuthState({
                dialect: "mysql",
                user: MYSQL_USER,
                password: MYSQL_PASSWORD,
                host: MYSQL_HOST,
                database: MYSQL_DATABASE,
                port: MYSQL_PORT,
                session: APP_SESSION,
                table: APP_STORE,
            });
            await auth.close();
            await mysqlDatabaseChecker(APP_STORE);
        });

        await mysqlConnection.end();
    });

    /** postgresql connection */
    await t.test("postgresql connection integration testing", async () => {
        const postgresConnectionOptions = {
            user: PG_USER,
            password: PG_PASSWORD,
            host: PG_HOST,
            port: PG_PORT,
        };

        const postgresConnection = new pg.Client(postgresConnectionOptions);
        await postgresConnection.connect();

        const postgresDatabaseChecker = async (tableName: string) => {
            const internalPgConnection = new pg.Client({
                ...postgresConnectionOptions,
                database: PG_DATABASE,
            });

            await internalPgConnection.connect();
            const { rows } = await internalPgConnection.query(
                `select * from information_schema.columns where table_name = '${tableName}' and table_catalog = '${PG_DATABASE}'`,
            );

            if (!rows.length) {
                throw new Error("table or columns are not created");
            }

            for (const data of rows) {
                if (!columns.includes(data.column_name)) {
                    throw Error("some columns are missing");
                }
            }

            await internalPgConnection.end();

            await postgresConnection.query(
                `drop database "${PG_DATABASE}"`,
            );
        };

        await assert.doesNotReject(async () => {
            await postgresConnection.query(`create database "${PG_DATABASE}"`);
            const postgresConnectionString =
                `postgres://${PG_USER}:${PG_PASSWORD}@${PG_HOST}:${PG_PORT}/${PG_DATABASE}`;
            const auth = await useBaileysAuthState(postgresConnectionString);
            await auth.close();
            await postgresDatabaseChecker("baileys_session");
        });

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
                table: APP_STORE,
            });
            await auth.close();
            await postgresDatabaseChecker(APP_STORE);
        });

        await postgresConnection.end();
    });

    /** mongodb connection */
    await t.test("mongodb connection integration testing", async () => {
        const mongoConnection = new mongodb.MongoClient(
            `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/?authSource=admin`,
        );
        await mongoConnection.connect();

        const mongoDatabaseChecker = async (collectionName: string) => {
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

            await db.dropDatabase();
        };

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
            await mongoDatabaseChecker("baileys_session");
        });

        await assert.doesNotReject(async () => {
            const auth = await useBaileysAuthState({
                dialect: "mongodb",
                user: MONGO_USER,
                password: MONGO_PASSWORD,
                host: MONGO_HOST,
                database: MONGO_DATABASE,
                port: MONGO_PORT,
                session: APP_SESSION,
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
            await mongoDatabaseChecker(APP_STORE);
        });

        await mongoConnection.close();
    });
});
