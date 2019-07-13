
module.exports = {
    title: "MyURL",
    domain: "localhost:8080",
    production: {
        dialect: "sqlite",
        storage: "./db.production.sqlite"
    },
    development: {
        dialect: "sqlite",
        storage: "./db.development.sqlite"
    },
    test: {
        dialect: "sqlite",
        storage: "./db.test.sqlite"
    }
}