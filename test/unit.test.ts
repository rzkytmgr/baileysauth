import test from "node:test";
import assert from "node:assert";
import utils from "../src/Utils";

test("unit test", async (t) => {
    await t.test("object properties omitter", async (t) => {
        const sourceObject = {
            fullname: "john",
            age: 20,
            hobby: ["guitar", "bass"],
            table: "test_table",
            session: "john",
        };

        // default parameter
        assert.equal("table" in (<typeof sourceObject> utils.omit(sourceObject)), false);

        // eleminate multiple properties
        const result: typeof sourceObject = utils.omit(sourceObject);
        assert.equal("table" in result || "session" in result, false);
        assert.equal("age" in result, true);

        // eleminate custom property
        assert.equal("fullname" in (<typeof sourceObject> utils.omit(sourceObject, ["fullname"])), false);
    });
});
