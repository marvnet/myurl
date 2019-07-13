
module.exports = {
    title: "MyURL",
    domain: "localhost:8080",
    redirect: 302,
    bootstrapbase: "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.3.1/",
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