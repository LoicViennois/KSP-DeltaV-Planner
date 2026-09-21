import { gitInfo } from './git-info';

export const environment = {
  commitSha: gitInfo.commitSha,
  shortSha: gitInfo.shortSha,
};
