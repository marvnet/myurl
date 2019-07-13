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
    <form action="javascript:void(0);" onsubmit="javascript:createCallback();">
        <input type="text" placeholder="Zieladresse" id="targetInput"><br>
        <input type="submit" value="Erstellen">
    </form>
    <p>
        <b id="response"></b>
    </p>

    <script type="application/javascript">
        function createLink(target) {
            var responseJson = {};
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.open("POST", "/api/create");
            xmlhttp.setRequestHeader("Content-Type", "application/json");
            xmlhttp.addEventListener("load", function (event) {
                responseJson = JSON.parse(xmlhttp.responseText);
                console.log(xmlhttp.responseText)
                console.log(responseJson)
                document.getElementById("response").innerHTML = 'Link created: <a href="http://${config.domain}/' + responseJson.response.shortcode + '">${config.domain}/' + responseJson.response.shortcode + '</a>';
            });
            xmlhttp.send(JSON.stringify({target: target, key: "000000"}));
        }

        function createCallback() {
            createLink(document.getElementById("targetInput").value);
        }
    </script>
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
    handleCreate(req.query, res)
})

app.post("/api/create", (req, res, next) => {
    handleCreate(req.body, res)
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
