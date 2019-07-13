
module.exports = {
    title: "MyURL",
    domain: "localhost:8080",
    redirect: 302,
    usecdnjs: false,
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