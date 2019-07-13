#!/usr/bin/env node

const express = require("express")
const app = express()

const config = require("./../config")
const models = require("./models")

const createCode = (length) => {
    let result = ""
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890"
    const charactersLength = characters.length
    for(let i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(
                Math.random() * charactersLength
            )
        )
    }
    return result
}

app.get("/admin", (req, res, next) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${config.title}</title>
</head>
<body>
    <h1>${config.title}</h1>
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

app.get("/api/create", (req, res, next) => {
    if(req.query.target && req.query.key) {
        models.Link.create({
            target: req.query.target
        })
    } else {
        res.json({
            status: "error",
            code: "NO_PARAM",
            message: "Missing parameters."
        })
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
        <title>404 > ${config.title}</title>
        <meta name="robots" content="noindex,nofollow">
    </head>
    <body>
        <h1>404 > ${config.title}</h1>
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
