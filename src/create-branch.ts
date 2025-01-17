import { Context } from '@actions/github/lib/context';
import { GitHub } from '@actions/github';

export async function createBranch(
  github: any,
  context: Context,
  branch: string
) {
  const toolkit: GitHub = new github(githubToken());
  let branchExists;
  // Sometimes branch might come in with refs/heads already
  branch = branch.replace('refs/heads/', '');

  // throws HttpError if branch already exists.
  try {
    await toolkit.repos.getBranch({
      ...context.repo,
      branch,
    });

    branchExists = true;
  } catch (error) {
    if (error.name === 'HttpError' && error.status === 404) {
      await toolkit.git.createRef({
        ref: `refs/heads/${branch}`,
        sha: context.sha,
        ...context.repo,
      });
    } else {
      throw Error(error);
    }
  }
}

function githubToken(): string {
  const token = process.env.GITHUB_TOKEN;

  const length = (token && token.length) || 'no length';

  if (!token) {
    throw ReferenceError(
      `No token defined in the environment variables. \n
      Token: ${token} \n
      typeof = ${typeof token} \n
      length = ${length}`
    );
  }

  return token;
}
