/*jshint esversion: 6*/

var github = require('./github');

function Requirements() {};

function pushInvalidLines(patch, invalid_versions) {
    // check each line
    patch.split("\n")
        // only take the additions we need
        .filter(line => line.startsWith('+'))
        .forEach(function(line) {
            // remove the '+' char at the beginning
            var clean_line = line.slice(1).trim();
            // ignore comments and whitespace
            if (!clean_line || clean_line.startsWith('#')) { return; }
            // only take violations to the PEP 440 rule (https://stackoverflow.com/questions/37972029/regex-to-match-pep440-compliant-version-strings)
            // and allow eggs
            var regex = 'git\\+ssh:\\/\\/git@[\\S]+\.[\\S]+@[\\d]+\.[\\d]+(?:\\.[\\d]+)?#egg=[\\S]+|[\\S]+==(?:\\d+!)?\\d+(?:\\.\\d+)(?:\\.\\d+)?(?:[\\.\\-\\_](?:a(?:lpha)?|b(?:eta)?|c|r(?:c|ev)?|pre(?:view)?)\\d*)?(?:\\.?(?:post|dev)\\d*)?'
            var matches = clean_line.match(regex);
            // if there's no match or the line doesn't equal the entire match, it's invalid
            if (!matches || matches[0] !== clean_line) {
                invalid_versions.push(clean_line);
            }
        });
    return invalid_versions;
}

Requirements.verifyForInvalidVersionUpgrades = function(pr_number, repo_name, sha) {
    github.getPullRequestFiles(repo_name, pr_number, function(files) {
        if (!files) {
            console.error("Something went wrong, files aren't available");
        }
        var state = "success";
        var description = "no requirements.txt issues found, you're good to go!";
        var requirements = files.filter(file => file.filename.includes('requirements.txt'));
        var invalid_versions = [];
        requirements.forEach(function(file) {
            pushInvalidLines(file.patch, invalid_versions);
        }, this);
        console.debug(invalid_versions.join('\n'));
        // get the patch and verify for syntax changes
        if (invalid_versions.length > 0) {
            state = "failure";
            description = `Found ${invalid_versions.length} invalid requirements.txt ` + (invalid_versions.length > 1 ? 'entries.' : 'entry.');
        }
        github.setCommitStatus(repo_name, sha, state, description, 'github-tools/requirements');
    });
};

module.exports = Requirements;