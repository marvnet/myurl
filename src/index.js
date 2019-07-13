#!/usr/bin/env node

const express = require("express")
const app = express()

const models = require("./models")


// start app
models.sequelize.sync().then(() => {
    app.listen(process.env.PORT || 3000, () => {
        console.log("App listening on port " + process.env.PORT || 3000 + " !")
    })
})
