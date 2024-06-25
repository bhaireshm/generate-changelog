import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Ensure you are in a git repository
const isGitRepository = (): boolean => {
  try {
    execSync('git status', { stdio: 'ignore' });
    return true;
  } catch (error) {
    console.error('Not a git repository or no git binary found.');
    return false;
  }
};

// Format the date as dd-mm-yyyy
const formatDate = (date: string): string => {
  const d = new Date(date);
  const day = (`0${d.getDate()}`).slice(-2);
  const month = (`0${d.getMonth() + 1}`).slice(-2);
  const year = d.getFullYear();
  return `Timeline: ${day}-${month}-${year}`;
};

// Get the remote URL of the repository
const getRepoUrl = (): string => {
  try {
    return execSync('git config --get remote.origin.url').toString().trim();
  } catch (error) {
    console.error('Failed to get the repository URL.');
    process.exit(1);
  }
};

// Get the log of commits between two hashes
const getGitLog = (from: string, to: string): string => {
  try {
    return execSync(`git log ${from}..${to} --pretty=format:'%H%x09%ad%x09%s' --date=iso`).toString().trim();
  } catch (error) {
    console.error('Failed to get the git log.');
    process.exit(1);
  }
};

// Main function to generate changelog
const generateChangeLog = (fromHash: string = '', toHash: string = 'HEAD', reverse: boolean = false): void => {
  if (!isGitRepository()) {
    process.exit(1);
  }

  try {
    const from = fromHash || execSync('git rev-list --max-parents=0 HEAD').toString().trim();
    const to = toHash;
    const repoUrl = getRepoUrl();
    const log = getGitLog(from, to);

    // Split the log into an array of commits
    const commits = log.split('\n').map(line => {
      const [hash, date, ...messageParts] = line.split('\t');
      const message = messageParts.join('\t');
      return { hash, date, message };
    });

    // Reverse the order of commits if specified
    if (reverse) {
      commits.reverse();
    }

    // Create or clear the CHANGELOG.md file
    const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
    fs.writeFileSync(changelogPath, '', 'utf8');

    let currentDate = '';
    let dateSection = '';

    // Iterate over each commit
    commits.forEach(commit => {
      const commitDate = formatDate(commit.date);

      // Add a new date header if the date changes
      if (commitDate !== currentDate) {
        if (currentDate) {
          // Write the date section to the file
          fs.appendFileSync(changelogPath, `${dateSection}***\n`, 'utf8');
        }
        currentDate = commitDate;
        dateSection = `# ${currentDate}\n`;
      }

      // Write the commit details
      const shortHash = commit.hash.slice(0, 6);
      const commitUrl = `${repoUrl.replace(/\.git$/, '')}/commit/${commit.hash}`;
      const commitMessageTitle = commit.message.split('\n')[0];
      const commitMessageBody = commit.message.split('\n').slice(1).map(line => `  - ${line}`).join('\n');
      const commitEntry = `- [${shortHash}](${commitUrl}) ${commitMessageTitle}\n${commitMessageBody ? `${commitMessageBody}\n` : ''}`;
      dateSection += commitEntry;
    });

    // Write the last date section to the file
    if (dateSection) {
      fs.appendFileSync(changelogPath, `${dateSection}***\n`, 'utf8');
    }

    console.log('CHANGELOG.md has been updated successfully.');
  } catch (error) {
    console.error('An error occurred while generating the changelog:', error);
  }
};

// Example usage
const fromHash = process.argv[2] ?? '';
const toHash = process.argv[3] ?? 'HEAD';
const reverse = process.argv[4] === 'true';
generateChangeLog(fromHash, toHash, reverse);
