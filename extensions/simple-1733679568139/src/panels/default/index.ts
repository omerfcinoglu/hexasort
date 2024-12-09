import { readFileSync } from 'fs-extra';
import { join } from 'path';

const templateContent = readFileSync(join(__dirname, '../../../static/template/default/index.html'), 'utf-8')

/**
 * @zh 如果希望兼容 3.3 之前的版本可以使用下方的代码
 * @en You can add the code below if you want compatibility with versions prior to 3.3
 */
// Editor.Panel.define = Editor.Panel.define || function(options: any) { return options }
module.exports = Editor.Panel.define({
    listeners: {
        show() { console.log('show'); },
        hide() { console.log('hide'); },
    },
    template: templateContent,
    style: readFileSync(join(__dirname, '../../../static/style/default/index.css'), 'utf-8'),
    $: {
        app: '#app',
    },
    methods: {
        hello() {
            if (this.$.app) {
                this.$.app.innerHTML = templateContent;
                console.log('[cocos-panel-html.default]: hello');
            }
        },
    },
    ready() {
        if (this.$.app) {
            this.$.app.innerHTML = templateContent;
        }
    },
    beforeClose() { },
    close() { },
});
