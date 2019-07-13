#!/usr/bin/env node

const express = require("express")
const app = express()

const models = require("./models")

app.get("/admin", (req, res, next) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>nodeURL</title>
</head>
<body>
    <h1>nodeURL</h1>
</body>
</html>
`)
})


// start app
models.sequelize.sync().then(() => {
    app.listen(process.env.PORT || 3000, () => {
        console.log("App listening on port " + process.env.PORT || 3000 + " !")
    })
})
