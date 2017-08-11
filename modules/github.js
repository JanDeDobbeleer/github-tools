/*jshint esversion: 6*/

var github = require('octonode');

function GitHub() {};

GitHub.setCommitStatus = function(repo_name, sha, state, description, context) {
    var ghrepo = github.client(process.env.GITHUB_API_KEY).repo(repo_name);
    ghrepo.status(sha, {
        "state": state,
        "description": description,
        "context": context
    }, function(err, data, headers) {
        if (err) {
            console.log("error: " + err);
            console.log("data: " + data);
            console.log("headers:" + headers);
            return;
        }
        console.log('Commit status successfully set');
    });
};

GitHub.getPullRequestCommits = function(repo_name, pr_number, callback) {
    github.client(process.env.GITHUB_API_KEY).get(`/repos/${repo_name}/pulls/${pr_number}/commits`, {}, function(err, status, body, headers) {
        callback(body);
    });
}

GitHub.getPullRequestFiles = function(repo_name, pr_number, callback) {
    github.client(process.env.GITHUB_API_KEY).get(`/repos/${repo_name}/pulls/${pr_number}/files`, {}, function(err, status, body, headers) {
        callback(body);
    });
}

module.exports = GitHub;