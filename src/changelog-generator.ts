import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export interface Config {
  repoUrl?: string;
  fileName?: string;
  changelogPath?: string;
  reverse?: boolean;
}

export class ChangelogGenerator {
  private config: Config;
  private defaultRepoUrl: string;
  private defaultFileName: string = 'CHANGELOG.md';
  private defaultChangelogPath: string = process.cwd();

  constructor(config: Config = {}) {
    this.defaultRepoUrl = this.getRepoUrl();
    this.config = {
      repoUrl: config.repoUrl || this.defaultRepoUrl,
      fileName: config.fileName || this.defaultFileName,
      changelogPath: config.changelogPath || this.defaultChangelogPath,
      reverse: config.reverse || false,
    };
  }

  private isGitRepository(): boolean {
    try {
      execSync('git status', { stdio: 'ignore' });
      return true;
    } catch (error) {
      console.error('Not a git repository or no git binary found.');
      return false;
    }
  }

  private formatDate(date: string): string {
    const d = new Date(date);
    const day = (`0${d.getDate()}`).slice(-2);
    const month = (`0${d.getMonth() + 1}`).slice(-2);
    const year = d.getFullYear();
    return `Timeline: ${day}-${month}-${year}`;
  }

  private getRepoUrl(): string {
    try {
      return execSync('git config --get remote.origin.url').toString().trim();
    } catch (error) {
      console.error('Failed to get the repository URL.');
      process.exit(1);
    }
  }

  private getGitLog(from: string, to: string): string {
    try {
      return execSync(`git log ${from}..${to} --pretty=format:'%H%x09%ad%x09%s' --date=iso`).toString().trim();
    } catch (error) {
      console.error('Failed to get the git log.');
      process.exit(1);
    }
  }

  private generateTitle(date: string): string {
    return `# ${this.formatDate(date)}`;
  }

  public setConfig(newConfig: Config) {
    this.config = { ...this.config, ...newConfig };
  }

  public generateChangelog(fromHash: string = '', toHash: string = 'HEAD'): void {
    if (!this.isGitRepository()) {
      process.exit(1);
    }

    try {
      const from = fromHash || execSync('git rev-list --max-parents=0 HEAD').toString().trim();
      const to = toHash;
      const repoUrl = this.config.repoUrl || this.defaultRepoUrl;
      const log = this.getGitLog(from, to);

      // Split the log into an array of commits
      const commits = log.split('\n').map(line => {
        const [hash, date, ...messageParts] = line.split('\t');
        const message = messageParts.join('\t');
        return { hash: hash.replace(/'/g, ''), date, message };
      });

      // Reverse the order of commits if specified
      if (this.config.reverse) {
        commits.reverse();
      }

      const changelogPath = path.join(this.config.changelogPath!, this.config.fileName!);
      fs.writeFileSync(changelogPath, '', 'utf8');

      let currentDate = '';
      let dateSection = '';

      // Iterate over each commit
      commits.forEach(commit => {
        const commitDate = this.formatDate(commit.date);

        // Add a new date header if the date changes
        if (commitDate !== currentDate) {
          if (currentDate) {
            // Write the date section to the file
            fs.appendFileSync(changelogPath, `${dateSection}***\n`, 'utf8');
          }
          currentDate = commitDate;
          dateSection = `${this.generateTitle(commit.date)}\n`;
        }

        // Write the commit details
        const shortHash = commit.hash.slice(0, 6);
        const commitUrl = `${repoUrl.replace(/\.git$/, '')}/commit/${commit.hash}`;
        const commitMessageTitle = commit.message.split('\n')[0].replace(/- /g, "\n  - ");
        const commitMessageBody = commit.message.split('\n').slice(1).map(line => `  - ${line}`).join('\n');
        const commitEntry = `- [${shortHash}](${commitUrl}) ${commitMessageTitle}\n${commitMessageBody ? `${commitMessageBody}\n` : ''}`;
        dateSection += commitEntry;
      });

      // Write the last date section to the file
      if (dateSection) {
        fs.appendFileSync(changelogPath, `${dateSection}***\n`, 'utf8');
      }

      console.log(`${this.config.fileName} has been updated successfully.`);
    } catch (error) {
      console.error('An error occurred while generating the changelog:', error);
    }
  }
}

export default ChangelogGenerator;
