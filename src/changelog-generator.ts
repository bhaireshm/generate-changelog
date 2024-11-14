import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

export interface Config {
  repoUrl?: string;
  fileName?: string;
  changelogPath?: string;
  reverse?: boolean;
  title?: string;
  remoteName?: string;
  rangeOperator?: "..." | ".." | "space";
}

type GenerateChangelogOptions = {
  fromHash?: string;
  toHash?: string;
};

export class ChangelogGenerator {
  private config: Config;
  private readonly defaultCofig: Config = {
    fileName: "CHANGELOG.md",
    changelogPath: process.cwd(),
    reverse: false,
    remoteName: "origin",
    rangeOperator: "space"
  };

  constructor(config: Config) {
    this.config = {
      repoUrl: this.getRepoUrl(config.repoUrl),
      fileName: config.fileName ?? this.defaultCofig.fileName,
      changelogPath: config.changelogPath ?? this.defaultCofig.changelogPath,
      reverse: config.reverse ?? this.defaultCofig.reverse,
      title: config.title ?? this.defaultCofig.title,
      remoteName: config.remoteName ?? this.defaultCofig.remoteName,
      rangeOperator: config.rangeOperator ?? this.defaultCofig.rangeOperator
    };
  }

  private isGitRepository(): boolean {
    try {
      execSync("git status", { stdio: "ignore" });
      return true;
    } catch (error) {
      console.error("Not a git repository or no git binary found.");
      return false;
    }
  }

  private formatDate(date: string): string {
    const d = new Date(date);
    const day = (`0${d.getDate()}`).slice(-2);
    const month = (`0${d.getMonth() + 1}`).slice(-2);
    const year = d.getFullYear();
    return (this.config?.title as string)?.replace("{day}", day)?.replace("{month}", month)?.replace("{year}", year.toString());
  }

  private getRepoUrl(remoteName = this.defaultCofig.remoteName): string {
    try {
      return execSync(`git config --get remote.${remoteName}.url`).toString().trim();
    } catch (error) {
      console.error("Failed to get the repository URL.");
      process.exit(1);
    }
  }

  private getGitLog(from: string, to: string): string {
    try {
      const rangeOperator = this.config.rangeOperator === "space" ? " " : this.config.rangeOperator;
      return execSync(`git log ${from}${rangeOperator}${to} --pretty=format:"%H%x09%ad%x09%s" --date=iso`).toString().trim();
    } catch (error) {
      console.error("Failed to get the git log.");
      process.exit(1);
    }
  }

  private generateTitle(date: string): string {
    return `# ${this.formatDate(date)}`;
  }

  public setConfig(newConfig: Config) {
    this.config = { ...this.config, ...newConfig };
  }

  public generateChangelog(options: GenerateChangelogOptions): void {
    const { fromHash = "", toHash = "HEAD" } = options;

    if (!this.isGitRepository()) {
      console.log("Not a git repository or no git binary found.")
      process.exit(1);
    }

    try {
      const from = fromHash || execSync("git rev-list --max-parents=0 HEAD").toString().trim();
      const to = toHash;
      const repoUrl = this.config.repoUrl!;
      const log = this.getGitLog(from, to);

      // Split the log into an array of commits
      const commits = log.split("\n").map(line => {
        const [hash, date, ...messageParts] = line.split("\t");
        const message = messageParts.join("\t");
        return { hash: hash.replace(/"/g, ""), date, message };
      });

      // Reverse the order of commits if specified
      if (this.config.reverse) commits.reverse();

      const changelogPath = path.join(this.config.changelogPath!, this.config.fileName!);
      fs.writeFileSync(changelogPath, "", "utf8");

      let currentDate = "";
      let dateSection = "";

      // Iterate over each commit
      commits.forEach(commit => {
        const commitDate = this.formatDate(commit.date);

        // Add a new date header if the date changes
        if (commitDate !== currentDate) {
          if (currentDate) {
            // Write the date section to the file
            fs.appendFileSync(changelogPath, `${dateSection}***\n`, "utf8");
          }
          currentDate = commitDate;
          dateSection = `${this.generateTitle(commit.date)}\n`;
        }

        // Write the commit details
        const shortHash = commit.hash.slice(0, 6);
        const commitUrl = `${repoUrl.replace(/\.git$/, "")}/commit/${commit.hash}`;
        const commitMessageTitle = commit.message.split("\n")[0].replace(/- /g, "\n  - ");
        let commitMessageBody = commit.message.split("\n").slice(1).map(line => `  - ${line}`).join("\n");
        commitMessageBody = commitMessageBody.trim() ? `${commitMessageBody}\n` : "";
        const commitEntry = `- [${shortHash}](${commitUrl}) ${commitMessageTitle}\n${commitMessageBody}`;
        dateSection += commitEntry;
      });

      // Write the last date section to the file
      if (dateSection) {
        fs.appendFileSync(changelogPath, `${dateSection}***\n`, "utf8");
      }

      console.log(`${this.config.fileName} has been updated successfully.`);
    } catch (error) {
      console.error("An error occurred while generating the changelog:", error);
    }
  }
}

export default ChangelogGenerator;
