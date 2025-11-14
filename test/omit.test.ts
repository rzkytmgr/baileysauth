import test from "node:test";
import assert from "node:assert";
import utils from "../src/Utils";

test("utils: object key omit", async (t) => {
    const testingObject = {
        fullname: "John Doe",
        age: 28,
        hobby: [
            "guitar",
            "gaming",
        ],
        session: "johnsession",
        table: "johntable",
    };

    await t.test("omit default keys parameter test", async () => {
        /** Default parameter ["dialect", "table", "session", "args", "collection"] */
        assert.equal("table" in <typeof testingObject> utils.omit(testingObject), false);
    });

    await t.test("omit empty keys parameter test", async () => {
        /** replace default keys parameter */
        assert.equal("session" in <typeof testingObject> utils.omit(testingObject, []), true);
    });

    await t.test("omit custom object property passed in keys parameter", async () => {
        /** omit custom property */
        assert.equal("fullname" in (<typeof testingObject> utils.omit(testingObject, ["fullname"])), false);
    });

    await t.test("omit multiple custom object properties", async () => {
        /** omit multiple object properties */
        const omitKeys = <typeof testingObject> utils.omit(testingObject, ["hobby", "session"]);
        assert.equal("session" in omitKeys || "hobby" in omitKeys, false);
        assert.equal("table" in omitKeys, true);
    });
});
