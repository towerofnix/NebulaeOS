try {
    require.resolve("chalk");
} catch (e) {
    console.error("\"chalk\" module was not found.");
    process.exit(-1);
}

const chalk = require("chalk");

try {
    require.resolve("electron");
} catch (e) {
    console.error(chalk.red("\"electron\" module was not found"));
}

require("child_process").spawn(
    require("electron"),
    [
        "."
    ].concat(
        process.argv.slice(2)
    ), {
        cwd: __dirname
    }).stdout.on("data", data => {
    console.log(data.toString());
});