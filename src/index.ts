import * as fs from 'fs';
import simpleGit, { SimpleGit, LogResult } from 'simple-git';
import * as path from 'path';

// Ensure you are in a git repository
const isGitRepository = async (git: SimpleGit): Promise<boolean> => {
  try {
    await git.status();
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

// Main function to generate changelog
const generateChangeLog = async (fromHash: string = '', toHash: string = 'HEAD'): Promise<void> => {
  const git: SimpleGit = simpleGit();
  if (!await isGitRepository(git)) {
    process.exit(1);
  }

  try {
    const from = fromHash || (await git.raw(['rev-list', '--max-parents=0', 'HEAD'])).trim();
    const to = toHash;
    const repoUrl = (await git.listRemote(['--get-url'])).trim();
    const log: LogResult = await git.log({ from, to });

    // Create or clear the CHANGELOG.md file
    const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
    fs.writeFileSync(changelogPath, '', 'utf8');

    let currentDate = '';
    let dateSection = '';

    // Iterate over each commit
    for (const commit of log.all) {
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
      const commitMessageTitle = commit.message.split('\n')[0].replace(/- /g, "\n  - ");
      const commitMessageBody = commit.message.split('\n').slice(1).join('\n').replace(/- /g, "\n  - ");
      const commitEntry = `- [${shortHash}](${commitUrl}) ${commitMessageTitle}\n${commitMessageBody}\n`;
      dateSection += commitEntry;
    }

    // Write the last date section to the file
    if (dateSection) {
      fs.appendFileSync(changelogPath, `${dateSection}***\n`, 'utf8');
    }

    console.log('CHANGELOG.md has been updated successfully.');

  } catch (error) {
    console.error('An error occurred while generating the changelog:', error);
  }
};

generateChangeLog(process.argv[2] ?? "", process.argv[3] ?? "");
