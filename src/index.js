const minimist = require("minimist");
const fs = require("fs-extra");
const path = require("path");
const { dir } = require("console");

async function main() {
    const argv = minimist(process.argv.slice(2));
    if (argv._.length === 0) {
        console.error(`No arguments.`)
        console.log(`Usage:`);
        console.log(`    clean-copy <src-directory> <dest-directory>`);
        process.exit(1);
    }

    const srcDirectory = argv._[0];
    const destDirectory = argv._[1];
    console.log(`Copying from ${srcDirectory} to ${destDirectory}`);

    copyDir(srcDirectory, destDirectory);
}

async function copyDir(srcDirectory, destDirectory) {

    await fs.ensureDir(destDirectory);
    
    const items = await fs.readdir(srcDirectory);
    const filteredItems = items.filter(item => item !== "node_modules");
    const statItems = await Promise.all(
        filteredItems.map(item => {
            return fs.stat(path.join(srcDirectory, item))
                .then(stat => {
                    return {
                        name: item,
                        isDirectory: stat.isDirectory(),
                    };
                });
        })
    );

    const directories = statItems.filter(item => item.isDirectory);
    const files = statItems.filter(item => !item.isDirectory);

    await Promise.all(
        files.map(item => 
            copyFile(
                path.join(srcDirectory, item.name), 
                path.join(destDirectory, item.name)
            )
        )
    );

    await Promise.all(
        directories.map(item => 
            copyDir(
                path.join(srcDirectory, item.name), 
                path.join(destDirectory, item.name)
            )
        )
    )
}

async function copyFile(srcPath, destPath) {
    await fs.copyFile(srcPath, destPath);
}

main()
    .catch(err => {
        console.error(`Failed with error:`);
        confirm.error(err);
    });