/*jshint esversion: 6*/

var github = require('./github');

function Fixup() {};

Fixup.checkFixupCommits = function(pr_number, repo_name, sha) {
    github.getPullRequestCommits(repo_name, pr_number, function(commits) {
        if (!commits) {
            console.error("Something went wrong, commits are not available");
        }
        var messages = commits.map(a => a.commit.message);
        var fixups = messages.filter(message => message.startsWith('fixup!') || message.startsWith('squash!'));
        var state = "success";
        var description = "no fixups found, you're good to go!";
        if (fixups.length > 0) {
            state = "failure";
            description = `found ${fixups.length} fixup ` + (fixups.length > 1 ? 'commits' : 'commit');
        }
        github.setCommitStatus(repo_name, sha, state, description, 'github-tools/fixup');
    });
};

module.exports = Fixup;