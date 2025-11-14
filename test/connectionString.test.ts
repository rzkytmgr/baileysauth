import test from "node:test";
import assert from "assert";

import { useBaileysAuthState } from "../dist/index";

test("connection: string connection", async (t) => {
    const ERR_INVALID_CONNECTION_STRING = {
        name: "TypeError",
        message: "Invalid connection string. doesn't looks like connection string",
    };

    const ERR_INVALID_CONNECTION_PROTOCOL = {
        name: "TypeError",
        message: "Cannot afford connection based on connection string you've input",
    };

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

    await t.test("invalid dialect validation test", async () => {
        await assert.rejects(
            async () => await useBaileysAuthState("protocol://username:password@host:0/db"),
            ERR_INVALID_CONNECTION_PROTOCOL,
        );
    });
});
