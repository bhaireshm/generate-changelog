# Changelog Generator

A simple and efficient tool to generate a `CHANGELOG.md` file for your Git repository. This tool lists all the commits between two specified commits, formatted by date and including commit messages and bodies.

## Features

- Generates a `CHANGELOG.md` file with commit details.
- Supports specifying a range of commits.
- Option to reverse the order of commits.
- Customizable repository URL, file name, changelog path, and title format.
- Supports multiple range operators ("...", "..", "space") for specifying commit ranges.

## Installation

Install the package globally via npm:

```bash
npm install -g @bhaireshm/gencl
```

## Usage

### Using the `generateChangelog` Function

You can use the `generateChangelog` function in your Node.js scripts to generate a changelog programmatically.

#### Function Signature

```typescript
generateChangelog(fromHash = '', toHash = 'HEAD'): void
```

#### Example

```typescript
import ChangelogGenerator from "@bhaireshm/gencl";

const config = {
  repoUrl: "https://github.com/username/repo",
  fileName: "MY_CHANGELOG.md",
  changelogPath: "/path/to/save",
  reverse: true,
  title: "My Changelog",
  remoteName: "origin",
  rangeOperator: "...",
};

const changelogGenerator = new ChangelogGenerator(config);
changelogGenerator.generateChangelog({ fromHash: "abc1234", toHash: "def5678" });
```

### Using the CLI

You can also use the CLI to generate a changelog. The available options are:

| Option            | Alias | Description                          | Default                        |
| ----------------- | ----- | ------------------------------------ | ------------------------------ |
| `--from`          | `-f`  | The starting commit hash.            | empty string                   |
| `--to`            | `-t`  | The ending commit hash.              | HEAD                           |
| `--reverse`       | `-r`  | Reverse the order of commits.        | false                          |
| `--repoUrl`       | `-u`  | The repository URL.                  | remote.{remoteName}.url        |
| `--fileName`      | `-n`  | The name of the changelog file.      | CHANGELOG.md                   |
| `--changelogPath` | `-p`  | The path to save the changelog file. | current working directory      |
| `--title`         | `-l`  | The title of the changelog.          | Timeline: {day}-{month}-{year} |
| `--remoteName`    | `-m`  | The name of the remote.              | origin                         |
| `--rangeOperator` | `-o`  | The range operator to use.           | space                          |

### CLI Examples

#### Simple Example

Generate a changelog from the last commit to the current commit:

```bash
gencl -f HEAD~1 -t HEAD
```

#### Custom Repository URL and File Name

Generate a changelog with a custom repository URL and file name:

```bash
gencl -f abc1234 -t def5678 -u https://github.com/username/repo -n MY_CHANGELOG.md
```

#### Reverse Order and Custom Title

Generate a changelog with the commits in reverse order and a custom title:

```bash
gencl -f abc1234 -t def5678 -r -l "My Changelog"
```

#### Custom Range Operator

Generate a changelog using a custom range operator:

```bash
gencl -f abc1234 -t def5678 -o "..."
```
