import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    settings: {
      next: {
        rootDir: __dirname,
      },
    },
    rules: {
      // App Router only — no /pages directory to lint for HTML links
      "@next/next/no-html-link-for-pages": "off",
    },
  },
];

export default eslintConfig;


// import { dirname } from "path";
// import { fileURLToPath } from "url";
// import { FlatCompat } from "@eslint/eslintrc";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const compat = new FlatCompat({
//   baseDirectory: __dirname,
// });

// export default [
//   ...compat.extends("next/core-web-vitals", "next/typescript"),
//   {
//     rules: {
//       "@typescript-eslint/no-explicit-any": "off",
//     },
//   },
// ];
