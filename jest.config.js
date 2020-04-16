// jest config
module.exports = {
    clearMocks: true,
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1"
    },
    coverageDirectory: "coverage",
    moduleFileExtensions: [
        "js",
        "ts"
    ],
    testEnvironment: "node",
};
