#!/usr/bin/env node

const express = require("express")
const bodyParser = require("body-parser")
const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

const config = require("./../config")
const models = require("./models")

let debug = false

if(process.env.NODE_ENV == "production") {
    debug = false
} else {
    debug = true
}

let cache = {}

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
    <title>Admin > ${config.title}</title>

    <link rel="stylesheet" type="text/css" href="${config.bootstrapbase}css/bootstrap.min.css">
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <a class="navbar-brand" href="/admin">${config.title}</a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mr-auto">
            <li class="nav-item">
                <a class="nav-link" href="/admin">Admin</a>
            </li>
        </ul>
        </div>
    </nav>
    <main>
        <div class="container">
            <h1>${config.title}</h1>
            <form action="javascript:void(0);" onsubmit="javascript:createCallback();">
                <div class="form-group">
                    <label for="inputLink">Target URL</label>
                    <input type="text" class="form-control" id="inputLink" placeholder="Target URL">
                </div>
                <input type="submit" value="Create link" class="btn btn-primary">
            </form>
            <br>
            <div id="response">

            </div>
        </div>
    </main>

    <script type="application/javascript">
        function createLink(target) {
            var responseJson = {};
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.open("POST", "/api/create");
            xmlhttp.setRequestHeader("Content-Type", "application/json");
            xmlhttp.addEventListener("load", function (event) {
                responseJson = JSON.parse(xmlhttp.responseText);
                document.getElementById("response").innerHTML = '<div class="card"><div class="card-body"><b>Link created:</b> <a target="_blank" href="http://${config.domain}/' + responseJson.response.shortcode + '">${config.domain}/' + responseJson.response.shortcode + '</a></div></div>';
            });
            xmlhttp.send(JSON.stringify({target: target, key: "000000"}));
        }

        function createCallback() {
            createLink(document.getElementById("inputLink").value);
        }
    </script>

    <script type="application/javascript" src="${config.bootstrapbase}js/bootstrap.bundle.min.js"></script>
</body>
</html>
`)
})

const handleCreate = (params, res) => {
    if(params.target && params.key) {
        models.Link.create({
            target: params.target,
            shortcode: createCode(6)
        })
            .then((link) => {
                res.json({
                    status: "success",
                    code: "SUCCESS",
                    message: "Shortlink created.",
                    response: {
                        id: link.uuid,
                        shortcode: link.shortcode,
                        target: link.target
                    }
                })
            })
            .catch((error) => {
                res.json({
                    status: "error",
                    code: "DATABASE",
                    message: error
                })
            })
    } else {
        res.json({
            status: "error",
            code: "NO_PARAM",
            message: "Missing parameters."
        })
    }
}

const handleInsights = (params, res) => {
    if(params.shortcode && params.key) {
        models.Link.count({
            where: {
                shortcode: params.shortcode
            }
        })
            .then((count) => {
                if(
                    count
                    > 0
                ) {
                    models.Link.findOne({
                        where: {
                            shortcode: params.shortcode
                        }
                    })
                        .then((link) => {
                            res.json({
                                status: "success",
                                code: "SUCCESS",
                                message: "Insights retrieved.",
                                response: {
                                    uuid: link.uuid,
                                    shortcode: link.shortcode,
                                    target: link.target,
                                    created: link.createdAt,
                                    updated: link.updatedAt
                                }
                            })
                        })
                } else {
                    res.status(404)
                    res.json({
                        status: "error",
                        code: "NOT_FOUND",
                        message: "Requested shortlink not in database."
                    })
                }
            })
    } else {
        res.json({
            status: "error",
            code: "NO_PARAM",
            message: "Missing parameters."
        })
    }
}

app.get("/", (req, res, next) => {
    models.Link.count({
        where: {
            shortcode: "index"
        }
    })
        .then((count) => {
            if(
                count
                > 0
            ) {
                models.Link.findOne({
                    where: {
                        shortcode: "index"
                    }
                })
                    .then((link) => {
                        res.redirect(config.redirect, link.target)
                    })
            } else {
                res.redirect("/admin")
            }
        })
})

app.get("/api/create", (req, res, next) => {
    handleCreate(req.query, res)
})

app.post("/api/create", (req, res, next) => {
    handleCreate(req.body, res)
})

app.get("/api/insights", (req, res, next) => {
    handleInsights(req.query, res)
})

app.post("/api/insights", (req, res, next) => {
    handleInsights(req.body, res)
})

app.get("/:shortcode", (req, res, next) => {
    if(cache.indexOf(req.params.shortcode) > -1) {
        res.redirect(config.redirect, cache[req.params.shortcode])
    } else {
        models.Link.count({
            where: {
                shortcode: req.params.shortcode
            }
        })
            .then((count) => {
                if(
                    count
                    > 0
                ) {
                    models.Link.findOne({
                        where: {
                            shortcode: req.params.shortcode
                        }
                    })
                        .then((link) => {
                            cache[req.params.shortcode] = link.target
                            res.redirect(config.redirect, link.target)
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

        <link rel="stylesheet" type="text/css" href="${config.bootstrapbase}css/bootstrap.min.css">
    </head>
    <body>
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <a class="navbar-brand" href="/admin">${config.title}</a>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav mr-auto">
                <li class="nav-item">
                    <a class="nav-link" href="/admin">Admin</a>
                </li>
            </ul>
            </div>
        </nav>
        <main>
            <div class="container">
                <p>
                    <b>
                        The shortlink you requested could not be found.
                    </b>
                </p>
            </div>
        </main>
        <h1>404 > ${config.title}</h1>

        <script type="application/javascript" src="${config.bootstrapbase}js/bootstrap.bundle.min.js"></script>
    </body>
</html>
                    `)
                }
            })
    }
})


// start app
models.sequelize.sync().then(() => {
    app.listen(process.env.PORT || 3000, () => {
        console.log("App listening on port " + process.env.PORT || 3000 + " !")
        if(debug) console.log("Debug mode enabled.")
    })
})
