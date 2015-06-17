# Push It Real Good

> Testing push notifications with [Polymer](https://www.polymer-project.org/1.0/) and a bit of Salt-N-Pepa

## Running locally

1. Clone the repo and run `npm install` from the local repo root.
2. Start up your local mongo instance, if it is not already running on your local machine. If you do not have mongo installed on your machine, [get it up and running](http://docs.mongodb.org/manual/installation/) before you proceed.
3. Start up the server with `gulp serve`.
4. Open http://localhost:3000 in Chrome. You will need to [make sure notifications are enabled](https://support.google.com/chrome/answer/3220216?hl=en) in order for the demo to work properly.
5. Push it!

## Local build commands
* `gulp build` →
    Compiles project CSS, Javascript, images, and HTML from `src` and saves to `dist`
* `gulp serve` →
    Compiles project files and starts the local server

Either command can be run with one or more of the following options:
* `--watch` →
    Watch for changes, and re-compile the project files when changes are made to `src`
* `--minify` → Re-compiles project files with production-ready minified Javascript
