/**
 * Colored console output utilities
 * Uses chalk for terminal colors
 */

import chalk from 'chalk';

export const logger = {
  info: (message: string) => {
    console.log(chalk.blue('ℹ'), message);
  },

  success: (message: string) => {
    console.log(chalk.green('✅'), message);
  },

  warning: (message: string) => {
    console.log(chalk.yellow('⚠️'), message);
  },

  error: (message: string) => {
    console.log(chalk.red('❌'), message);
  },

  step: (step: number, message: string) => {
    console.log(chalk.cyan(`\n[Step ${step}]`), chalk.bold(message));
  },

  section: (title: string) => {
    console.log('\n' + chalk.bold.underline(title));
  },

  dim: (message: string) => {
    console.log(chalk.dim(message));
  },

  highlight: (message: string) => {
    console.log(chalk.bold.yellow(message));
  },

  code: (code: string) => {
    console.log(chalk.gray('  ' + code));
  },

  url: (url: string) => {
    console.log(chalk.blue.underline(url));
  },

  newline: () => {
    console.log('');
  },
};
