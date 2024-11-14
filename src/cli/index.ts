#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import pkg from "../../package.json";
import ChangelogGenerator from '../changelog-generator';
import OPTIONS from "./options";

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

const changelogGenerator = new ChangelogGenerator(argv);
changelogGenerator.generateChangelog({ fromHash: argv.from, toHash: argv.to });
