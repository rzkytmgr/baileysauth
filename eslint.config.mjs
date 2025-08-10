import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config({
    extends: [
        eslint.configs.recommended,
        tseslint.configs.recommended,
    ],
    rules: {
        "@typescript-eslint/no-unused-vars": "warn",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/ban-ts-comment": "off",
    },
    "ignores": [
        "node_modules",
        "dist/**/*",
    ],
});
