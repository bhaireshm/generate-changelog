#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import pkg from "../../package.json";
import OPTIONS from "./options";
import ChangelogGenerator from '../changelog-generator';

const argv: any = yargs(hideBin(process.argv))
  .version(pkg.version).alias('version', 'v')

  .parserConfiguration({
    "short-option-groups": true,
    "camel-case-expansion": true,
    "dot-notation": true,
    "parse-numbers": true,
    "boolean-negation": true,
    "strip-dashed": true,
  })
  .wrap(process.stdout.columns > 125 ? 125 : process.stdout.columns)

  .options(OPTIONS)

  .help('h').alias('h', 'help')
  .argv;

const config = {
  repoUrl: argv.repoUrl,
  fileName: argv.fileName,
  changelogPath: argv.changelogPath,
  reverse: argv.reverse,
};

const changelogGenerator = new ChangelogGenerator(config);
changelogGenerator.generateChangelog(argv.from, argv.to);
