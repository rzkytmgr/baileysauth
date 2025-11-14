import test from "node:test";
import assert from "assert";
import mysql2 from "mysql2/promise";

import { useBaileysAuthState } from "../dist/index";

test("connection: mysql connection", async (t) => {
    const columns = ["session", "identifier", "value"];

    const RANDOM_STRING = crypto.randomUUID().slice(0, 8);
    const APP_STORE = RANDOM_STRING + "_auth_store";
    const APP_SESSION = RANDOM_STRING + "_auth_session";
    const MYSQL_HOST = process.env.TEST_MYSQL_HOST || "localhost";
    const MYSQL_USER = process.env.TEST_MYSQL_USER || "root";
    const MYSQL_PASSWORD = process.env.TEST_MYSQL_PASSWORD || "password";
    const MYSQL_DATABASE = RANDOM_STRING + "_mysql_auth";
    const MYSQL_PORT = Number(process.env.TEST_MYSQL_PORT || 3306);

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

    await t.test("mysql connection string test", async () => {
        await assert.doesNotReject(async () => {
            await mysqlConnection.query(`create database if not exists \`${MYSQL_DATABASE}\``);
            const mysqlStringConnection =
                `mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DATABASE}`;
            const auth = await useBaileysAuthState(mysqlStringConnection);
            await auth.close();
            await mysqlDatabaseChecker("baileys_session");
        });
    });

    await t.test("mysql connection object string test", async () => {
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
    });

    await mysqlConnection.end();
});
