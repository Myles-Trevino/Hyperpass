import { defineConfig } from "eslint/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all
});

export default defineConfig([{
	files: ["**/*.ts"],

	extends: compat.extends(
		"plugin:@angular-eslint/recommended",
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:@typescript-eslint/recommended-requiring-type-checking",
		"plugin:@angular-eslint/template/process-inline-templates",
	),

	languageOptions: {
		ecmaVersion: 5,
		sourceType: "script",

		parserOptions: {
			project: ["tsconfig.json"],
			createDefaultProgram: true,
		},
	},

	rules: {
		"no-constant-condition": ["error", {
			checkLoops: false,
		}],

		"no-empty": "off",
		"no-loss-of-precision": "off",
		"no-promise-executor-return": "error",
		"no-prototype-builtins": "off",
		"no-template-curly-in-string": "error",
		"no-unexpected-multiline": "off",
		"no-unreachable-loop": "error",
		"no-unsafe-optional-chaining": "error",
		"no-useless-backreference": "error",
		"array-callback-return": "error",
		"block-scoped-var": "error",
		"default-case-last": "error",
		"default-param-last": "off",
		"dot-notation": "off",
		eqeqeq: "error",
		"grouped-accessor-pairs": "error",
		"guard-for-in": "off",
		"no-alert": "error",
		"no-caller": "error",
		"no-constructor-return": "error",
		"no-else-return": "error",
		"no-eq-null": "error",
		"no-eval": "error",
		"no-extend-native": "error",
		"no-extra-bind": "error",
		"no-extra-label": "error",
		"no-floating-decimal": "error",
		"no-implicit-coercion": "error",

		"no-implicit-globals": ["error", {
			lexicalBindings: false,
		}],

		"no-implied-eval": "error",
		"no-invalid-this": "off",
		"no-iterator": "error",
		"no-labels": "error",
		"no-lone-blocks": "error",
		"no-loop-func": "off",
		"no-multi-spaces": "error",
		"no-multi-str": "error",
		"no-new": "error",
		"no-new-func": "error",
		"no-new-wrappers": "error",
		"no-nonoctal-decimal-escape": "error",
		"no-octal-escape": "error",
		"no-proto": "error",
		"no-redeclare": "off",
		"no-return-assign": "error",
		"no-return-await": "off",
		"no-script-url": "error",
		"no-self-compare": "error",
		"no-sequences": "error",
		"no-throw-literal": "off",
		"no-unmodified-loop-condition": "error",
		"no-unused-expressions": "off",
		"no-useless-call": "error",
		"no-useless-concat": "error",
		"no-useless-return": "error",
		"no-void": "error",
		"prefer-promise-reject-errors": "error",

		"prefer-regex-literals": ["error", {
			disallowRedundantWrapping: true,
		}],

		"require-await": "error",
		"wrap-iife": "error",
		yoda: "error",
		"array-bracket-spacing": "error",
		"block-spacing": "error",
		"brace-style": "off",
		camelcase: "error",
		"comma-dangle": "off",
		"comma-spacing": "off",
		"comma-style": "error",
		"computed-property-spacing": "error",
		"consistent-this": ["error", "self"],
		"func-call-spacing": "off",
		"eol-last": "error",
		"func-name-matching": "error",
		"func-names": "error",
		indent: "off",
		"jsx-quotes": "error",
		"key-spacing": "error",
		"keyword-spacing": "off",
		"linebreak-style": "error",

		"lines-around-comment": ["error", {
			beforeLineComment: true,
			allowBlockStart: true,
			allowObjectStart: true,
			allowArrayStart: true,
			allowClassStart: true,
		}],

		"lines-between-class-members": "off",
		"new-parens": "error",
		"no-bitwise": "error",
		"no-mixed-operators": "error",
		"no-multi-assign": "error",

		"no-multiple-empty-lines": ["error", {
			max: 2,
			maxEOF: 0,
		}],

		"no-nested-ternary": "error",
		"no-new-object": "error",
		"no-trailing-spaces": "error",
		"no-unneeded-ternary": "error",
		"no-whitespace-before-property": "error",

		"object-curly-newline": ["error", {
			consistent: true,
		}],

		"object-curly-spacing": "error",
		"one-var": ["error", "never"],
		"operator-assignment": "error",
		"operator-linebreak": ["error", "after"],
		"prefer-exponentiation-operator": "error",
		"prefer-object-spread": "error",
		"quote-props": ["error", "consistent"],
		quotes: "off",
		semi: "off",
		"semi-spacing": "error",
		"semi-style": "error",
		"space-before-function-paren": "off",
		"space-in-parens": "error",
		"space-unary-ops": "error",
		"spaced-comment": ["error", "always"],
		"switch-colon-spacing": "error",
		"template-tag-spacing": "error",
		"unicode-bom": "error",
		strict: "error",
		"init-declarations": "off",
		"no-label-var": "error",
		"no-shadow": "off",
		"arrow-parens": "error",
		"arrow-spacing": "error",
		"generator-star-spacing": "error",
		"no-confusing-arrow": "error",
		"no-dupe-class-members": "off",
		"no-duplicate-imports": "off",
		"no-useless-computed-key": "error",
		"no-useless-constructor": "off",
		"no-useless-rename": "error",
		"no-var": "error",
		"object-shorthand": "error",
		"prefer-const": "error",
		"prefer-numeric-literals": "error",
		"prefer-rest-params": "error",
		"prefer-spread": "error",
		"prefer-template": "error",
		"rest-spread-spacing": "error",
		"symbol-description": "error",
		"template-curly-spacing": "error",
		"yield-star-spacing": "error",
		"@typescript-eslint/array-type": "error",
		"@typescript-eslint/ban-tslint-comment": "error",
		"@typescript-eslint/ban-types": "off",
		"@typescript-eslint/class-literal-property-style": "error",
		"@typescript-eslint/consistent-indexed-object-style": "error",
		"@typescript-eslint/consistent-type-assertions": "error",
		"@typescript-eslint/consistent-type-definitions": ["error", "type"],
		"@typescript-eslint/explicit-function-return-type": "error",
		"@typescript-eslint/explicit-member-accessibility": "error",
		"@typescript-eslint/member-ordering": "error",
		"@typescript-eslint/method-signature-style": "error",
		"@typescript-eslint/naming-convention": "off",
		"@typescript-eslint/no-base-to-string": "error",
		"@typescript-eslint/no-confusing-non-null-assertion": "error",
		"@typescript-eslint/no-confusing-void-expression": "error",
		"@typescript-eslint/no-floating-promises": "off",
		"@typescript-eslint/no-invalid-void-type": "error",
		"@typescript-eslint/no-require-imports": "error",

		"@typescript-eslint/no-unnecessary-boolean-literal-compare": ["error", {
			allowComparingNullableBooleansToTrue: false,
			allowComparingNullableBooleansToFalse: false,
		}],

		"@typescript-eslint/no-unnecessary-condition": ["error", {
			allowConstantLoopConditions: true,
		}],

		"@typescript-eslint/no-unnecessary-qualifier": "error",
		"@typescript-eslint/no-unnecessary-type-arguments": "error",
		"@typescript-eslint/no-unnecessary-type-constraint": "error",
		"@typescript-eslint/non-nullable-type-assertion-style": "error",
		"@typescript-eslint/prefer-for-of": "error",
		"@typescript-eslint/prefer-function-type": "error",
		"@typescript-eslint/prefer-includes": "error",
		"@typescript-eslint/prefer-literal-enum-member": "error",
		"@typescript-eslint/prefer-nullish-coalescing": "error",
		"@typescript-eslint/prefer-readonly": "error",
		"@typescript-eslint/prefer-reduce-type-parameter": "error",
		"@typescript-eslint/prefer-string-starts-ends-with": "error",
		"@typescript-eslint/prefer-ts-expect-error": "error",
		"@typescript-eslint/require-array-sort-compare": "error",

		"@typescript-eslint/strict-boolean-expressions": ["error", {
			allowNullableString: true,
		}],

		"@typescript-eslint/switch-exhaustiveness-check": "error",
		"@typescript-eslint/unified-signatures": "error",
		"@typescript-eslint/default-param-last": "error",
		"@typescript-eslint/dot-notation": "error",
		"@typescript-eslint/init-declarations": "error",
		"@typescript-eslint/no-dupe-class-members": "error",
		"@typescript-eslint/no-invalid-this": "error",
		"@typescript-eslint/no-loop-func": "error",
		"@typescript-eslint/no-loss-of-precision": "error",
		"@typescript-eslint/no-redeclare": "error",
		"@typescript-eslint/no-shadow": "error",
		"@typescript-eslint/no-unused-expressions": "error",
		"@typescript-eslint/no-unused-vars": "off",
		"@typescript-eslint/no-useless-constructor": "error",
		"@typescript-eslint/return-await": "error",

		"@typescript-eslint/no-misused-promises": [
			"error",
			{
				"checksVoidReturn": false
			}
		],
		"@typescript-eslint/switch-exhaustiveness-check": [
			"error",
			{
				"considerDefaultExhaustiveForUnions": true
			}
		]
	},
}, {
	files: ["**/*.html"],
	extends: compat.extends("plugin:@angular-eslint/template/recommended"),
	rules: {},
}]);