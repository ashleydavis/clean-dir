const minimist = require("minimist");
const fs = require("fs-extra");

async function main() {
    const argv = minimist(process.argv.slice(2));
    if (argv._.length === 0) {
        console.error(`No arguments.`)
        console.log(`Usage:`);
        console.log(`    clean-dir <directory>`);
        process.exit(1);
    }

    const dir = argv._[0];
    console.log(`Cleaning from ${dir}`);

    cleanDir(dir);
}

async function cleanDir(dir) {

    const items = await fs.readdir(dir);
    const promises = items.map(async item => {
        const itemPath = `${dir}/${item}`;
        if (item === "node_modules") {
            await fs.remove(itemPath);
            console.log(`Removed ${itemPath}`);
            return;
        }

        const stat = await fs.stat(itemPath);
        if (stat.isDirectory()) {
            await cleanDir(itemPath);
        }
    });

    await Promise.all(promises);
}

main()
    .catch(err => {
        console.error(`Failed with error:`);
        confirm.error(err);
    });