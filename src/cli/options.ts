const OPTIONS: Record<string, any> = {
  from: {
    alias: 'f',
    type: 'string',
    description: 'The starting commit hash',
    default: '',
  },
  to: {
    alias: 't',
    type: 'string',
    description: 'The ending commit hash',
    default: 'HEAD',
  },
  reverse: {
    alias: 'r',
    type: 'boolean',
    description: 'Reverse the order of commits',
    default: false,
  },
  repoUrl: {
    alias: 'u',
    type: 'string',
    description: 'The repository URL',
  },
  fileName: {
    alias: 'n',
    type: 'string',
    description: 'The name of the changelog file',
    default: 'CHANGELOG.md',
  },
  changelogPath: {
    alias: 'p',
    type: 'string',
    description: 'The path to save the changelog file',
    default: process.cwd(),
  },
  title: {
    alias: 'l',
    type: 'string',
    description: 'Title/Label of the changelog',
    default: 'Timeline: {day}-{month}-{year}',
  },
  remoteName: {
    alias: 'm',
    type: 'string',
    description: 'The name of the remote',
    default: 'origin',
  },
  rangeOperator: {
    alias: 'o',
    type: 'string',
    description: 'The range operator to use for the git log command',
    choices: ["...", "..", "space"],
    default: '..',
  },
};

export default OPTIONS;