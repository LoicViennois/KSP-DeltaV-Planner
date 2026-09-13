import { gitInfo } from './git-info';

export const environment = {
  production: true,
  commitSha: gitInfo.commitSha,
  shortSha: gitInfo.shortSha,
};
