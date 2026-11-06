const REPO_URL = 'https://github.com/LoicViennois/KSP-DeltaV-Planner';

export const commitSha = __COMMIT_SHA__;
export const shortSha = commitSha.slice(0, 7);
export const commitUrl =
  commitSha !== 'dev' ? `${REPO_URL}/commit/${commitSha}` : REPO_URL;
export const repoUrl = REPO_URL;
export const sponsorUrl = 'https://github.com/sponsors/LoicViennois';
