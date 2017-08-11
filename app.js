/*jshint esversion: 6*/

var express = require('express');
var bodyParser = require('body-parser');
var xhub = require('express-x-hub');
var fixup = require('./modules/fixup');
var requirements = require('./modules/requirements');

var app = express();

// settings
app.use(xhub({ algorithm: 'sha1', secret: process.env.XHUB_SECRET }));
app.use(bodyParser.json()); // for parsing application/json
var port = process.env.PORT || 3000;

var authenticateAndRespond = function(req, res, handler) {
    var isValid = req.isXHubValid();
    if (!isValid) {
        res.status(404).end();
        return;
    }
    res.status(200).end();
    handler();
};

app.get('/', function(req, res) {
    res.send('hello world');
});

app.post('/github-fixup-hook', function(req, res) {
    authenticateAndRespond(req, res, function() {
        fixup.checkFixupCommits(
            req.body.pull_request.number,
            req.body.pull_request.head.repo.full_name,
            req.body.pull_request.head.sha);
    });
});

app.post('/github-requirements-hook', function(req, res) {
    authenticateAndRespond(req, res, function() {
        requirements.verifyForInvalidVersionUpgrades(
            req.body.pull_request.number,
            req.body.pull_request.head.repo.full_name,
            req.body.pull_request.head.sha);
    });
});

app.listen(port, function() {
    console.log(`App listening on port ${port}!`);
});