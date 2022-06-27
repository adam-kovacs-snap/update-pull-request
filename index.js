const core = require("@actions/core");
const github = require("@actions/github");

const request = {
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    pull_number: github.context.payload.pull_request.number,
};
const getInputs = async () => {

    const body = core.getInput("body");
    const token = core.getInput("token");
    const editMode = core.getInput("edit-mode");

    const errors = [];

    if (!body) {
        const message = "Missing field: 'body'.";
        core.setFailed(message);
        errors.push(message);
    }

    if (!["append", "replace"].includes(editMode)) {
        const message = `Invalid edit-mode '${editMode}'.`;
        core.setFailed(message);
        errors.push(message);
    }

    if (!token) {
        const message = "Missing field: 'token'.";
        core.setFailed(message);
        errors.push(message);
    }

    if (errors.length !== 0) {
        throw new Error(JSON.stringify(errors));
    }

    return {
        body, token, editMode
    };
}

const run = async () => {
    const inputs = await getInputs();

    const octokit = github.getOctokit(inputs.token);

    let body = inputs.body;

    if (inputs.editMode === "append") {
        body = `${github.context.payload.pull_request.body}\n${body}`;
    }

    await octokit.rest.pulls.update({ ...request, body });


}

void run().catch(console.log);
