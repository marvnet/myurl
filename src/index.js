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

app.get("/", (req, res, next) => {
    if(
        (
            models.Link.count({
                where: {
                    shortcode: "index"
                }
            })
        )
        > 0
    ) {
        models.Link.findOne({
            where: {
                shortcode: "index"
            }
        })
            .then((link) => {
                res.redirect(link.target)
            })
    } else {
        res.redirect("/admin")
    }
})

app.get("/:shortcode", (req, res, next) => {
    if(
        (
            models.Link.count({
                where: {
                    shortcode: req.params.shortcode
                }
            })
        )
        > 0
    ) {
        models.Link.findOne({
            where: {
                shortcode: req.params.shortcode
            }
        })
            .then((link) => {
                res.redirect(link.target)
            })
    } else {
        res.status(404)
        res.send(`
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>404 > nodeURL</title>
    </head>
    <body>
        <h1>404 > nodeURL</h1>
        <p>
            <b>
                The shortlink you requested could not be found.
            </b>
        </p>
    </body>
</html>
        `)
    }
})


// start app
models.sequelize.sync().then(() => {
    app.listen(process.env.PORT || 3000, () => {
        console.log("App listening on port " + process.env.PORT || 3000 + " !")
    })
})
