"use strict";

const fs = require('fs');
const path = require('path');
const tools = require('@iconify/tools');
const cheerio = require('cheerio');

const outputFile = 'icons';

const sourceDir = path.dirname(__filename) + '/src';
const targetSVGDir = path.dirname(__filename) + '/svg';
const targetJSDir = path.dirname(__filename) + '/output';

const topicTypes = ['topic', 'announcement', 'sticky'];
const forumTypes = ['forum', 'forum-subforum', 'forum-locked', 'forum-link'];
const topicModifiers = ['locked', 'mine'];

let collection;

// Clean up old files
[targetSVGDir, targetJSDir].forEach(dir => {
    fs.readdirSync(dir).forEach(file => {
        fs.unlinkSync(dir + '/' + file);
    });
});

// Import all files
tools.ImportDir(sourceDir, {
}).then(result => {

    collection = result;

    let keys = collection.keys();

    // Make sure all files are present
    ['forum-background']. // background
        concat(forumTypes). // main icon for all forum types
        concat(['topic']). // + main topic icon
        concat(topicModifiers.map(mod => 'topic-' + mod)). // topic modifiers
        forEach(key => {
        if (keys.indexOf(key) === -1) {
            throw new Error('Missing required image: ' + key);
        }
    });

    // Clean up files
    return collection.forEach((svg, key) => tools.SVGO(svg, {
        mergePaths: true,
        'id-prefix': key + '-'
    }));

}).then(res => {

    // Change black to currentColor
    return collection.forEach(svg => tools.ChangePalette(svg, {
        '#000': 'currentColor'
    }));

}).then(res => {

    // Export SVG
    tools.ExportDir(collection, targetSVGDir);

}).then(res => {
    // Get all icons, split into <defs> and everything else
    let icons = {};
    collection.keys().forEach(key => {
        let svg = collection.items[key],
            $root = svg.$svg(':root'),
            defs = '',
            body = '';


        $root.children().each((index, child) => {
            let $child = cheerio(child);

            switch (child.tagName) {
                case 'defs':
                    defs += $child.html();
                    $child.remove();
                    break;
            }
        });

        body += $root.html();

        icons[key] = defs === '' ? body : {
            defs: defs,
            body: body
        }
    });

    let code = fs.readFileSync(sourceDir + '/' + outputFile + '.js', 'utf8');

    // code = code.replace('{/*replace*/}', JSON.stringify(icons));
    code = code.replace('{/*replace*/}', JSON.stringify(icons, null, 4).replace(/\n/g, '\n\t\t'));
    fs.writeFileSync(targetJSDir + '/' + outputFile + '.js', code, 'utf8');

    console.log('Exported icons: ' + collection.keys().join(', '));
    console.log('JS file length: ' + code.length + ' bytes.');

}).catch(err => {
    console.error(err);
});
