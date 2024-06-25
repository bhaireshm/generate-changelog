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
};

export default OPTIONS;