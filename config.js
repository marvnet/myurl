
module.exports = {
    title: "MyURL",
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