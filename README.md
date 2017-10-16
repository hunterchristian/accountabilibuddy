# Accountabilibuddy
## Installation
Accountabilibuddy is registered as a public npm package. `a15y` is an abbreviation of `accountabilibuddy`.
`npm install --save-dev a15y`
## Usage
Accountabilibuddy is a command line tool to assist in dependency migration. When a dependency is updated, errors typically appear while running the `build` command for a given project. This tool will establish ownership for build errors via a mapping between errors and the `git blame` command. This assumes that the errors contain a file path which can be used for `git blame`.
To invoke the tool:
`a15y '{your build command}' '{string identifying error in console}' '{name of developer (optional)}'`

Example from a migration from Typscript 2.3 to Typescript 2.4 in reddit-desktop:
`a15y 'npm run build' 'ERROR in [at-loader]' 'Hunter Hodnett'`

Output from the `npm run build` command has errors in the following format:
```
ERROR in [at-loader] ./src/reddit/reducers/widgets/sidebar/index.ts:68:30 
    TS2339: Property 'payload' does not exist on type 'A'.

ERROR in [at-loader] ./src/reddit/reducers/widgets/sidebar/index.ts:91:30 
    TS2339: Property 'payload' does not exist on type 'A'.

ERROR in [at-loader] ./src/reddit/reducers/widgets/sidebar/index.ts:110:43 
    TS2339: Property 'payload' does not exist on type 'A'.

ERROR in [at-loader] ./src/reddit/reducers/widgets/sidebar/index.ts:121:48 
    TS2339: Property 'payload' does not exist on type 'A'.
```

We match errors in the output by defining the string that occurs before the filepath at which the error occurred. This is the `'ERROR in [at-loader]'` part of the above command.

If you want to see all errors for a command rather than filter by owner, just omit the developer name:
`a15y 'npm run build' 'ERROR in [at-loader]'`
