# Changelog Generator

A simple and efficient tool to generate a `CHANGELOG.md` file for your Git repository. This tool lists all the commits between two specified commits, formatted by date and including commit messages and bodies.

## Features

- Generates a `CHANGELOG.md` file with commit details.
- Supports specifying a range of commits.
- Option to reverse the order of commits.
- Customizable repository URL, file name, changelog path, and title format.

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
generateChangelog(fromHash: string = '', toHash: string = 'HEAD'): void
```

#### Example

```typescript
import ChangelogGenerator from "@bhaireshm/gencl";

const config = {
  repoUrl: "https://github.com/username/repo",
  fileName: "MY_CHANGELOG.md",
  changelogPath: "/path/to/save",
  reverse: true,
};

const changelogGenerator = new ChangelogGenerator(config);
changelogGenerator.generateChangelog("abc1234", "def5678");
```

### Using the CLI

The package also provides a CLI tool to generate the changelog directly from the command line.

#### Command

```bash
gencl [options]
```

#### Options

- `--from, -f`: The starting commit hash. Defaults to the first commit if not provided.
- `--to, -t`: The ending commit hash. Defaults to `HEAD` if not provided.
- `--reverse, -r`: If set to `true`, the commit order will be reversed (latest commits first).
- `--repoUrl, -u`: The repository URL.
- `--fileName, -n`: The name of the changelog file. Defaults to `CHANGELOG.md`.
- `--changelogPath, -p`: The path to save the changelog file. Defaults to the current directory.

#### Examples

1. **Generate changelog from the first commit to HEAD:**

   ```bash
   gencl
   ```

2. **Generate changelog from a specific commit to HEAD:**

   ```bash
   gencl --from abc1234
   ```

3. **Generate changelog between two specific commits:**

   ```bash
   gencl --from abc1234 --to def5678
   ```

4. **Generate changelog in reverse order:**

   ```bash
   gencl --from abc1234 --to def5678 --reverse
   ```

5. **Specify custom repository URL, file name, and changelog path:**

   ```bash
   gencl --repoUrl https://github.com/username/repo --fileName MY_CHANGELOG.md --changelogPath /path/to/save
   ```
