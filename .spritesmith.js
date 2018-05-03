const fs = require('fs')
const path = require('path')

var srcPath = './ClientApp/sprites/'
var destPath = './ClientApp/spritesheet/'

if (process.argv.length <= 2) {
    throw new Error('You need to pass a folder argument')
    return
}

// Parse params
var folder = process.argv[2]
var prefix = process.argv[3] || '~/spritesheet/'
var srcPath = path.join(srcPath, folder)

var format = function(str, ...args) {
    return str.replace(/{(\d+)}/g, (match, number) => {
        return args[number] || ''
    })
}

var deleteFolderRecursive = function(folder) {
    if (!fs.existsSync(folder)) {
        return
    }
    fs.readdirSync(folder).forEach( (file, index) => {
        var abs = path.join(folder, file)
        if (fs.statSync(abs).isDirectory()) {
            deleteFolderRecursive(abs)
        } else {
            fs.unlinkSync(abs)
        }
    })
    fs.rmdirSync(folder)
}

var tasks = []

if (fs.statSync(srcPath).isDirectory()) {
    // Delete whole folder
    var destPath = path.join(destPath, folder)
    deleteFolderRecursive(destPath)

    // Check for custom template
    var template = folder + "/template.scss";
    
    var task = {
        src: srcPath + '/*.png',
        destImage: destPath + '.png',
        destCSS: destPath + '.scss',
        // As reference in the SCSS. 
        // Spritesheet is a alias in webpack.base.conf.js
        imgPath: prefix + folder + '.png'   
    } 
    if (fs.existsSync(template)) {
        task.cssTemplate = function (data) {
            var sprites = data.items.map(i => {
                return format(
                        '${0}: {0} {1} {2} {3} {4} \'{5}\';', 
                        i.name, 
                        i.px.width,
                        i.px.height,
                        i.px.offset_x,
                        i.px.offset_y,
                        i.escaped_image
                    )
            })
            return sprites.join('\r\n') +
                '\r\n$sprites: ' +
                data.items.map(i => '$' + i.name).join(' ') +
                ';\r\n\r\n' +
                fs.readFileSync(template, 'utf8')
        }
    }
        
    tasks.push(task);
}

module.exports = tasks