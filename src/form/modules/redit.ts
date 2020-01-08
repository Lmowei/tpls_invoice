/*
 * @Description: form r-edit module
 * @Author: JasonYang
 * @Date: 2019-09-01 00:46:38
 * @LastEditTime: 2019-09-06 10:11:40
 */

/*
 * 用于 form 的编辑模组
 * 使用方式：entry 中引入该模块，绑定在编辑区域id上，为该区域创建监听事件
 * 示例：reditbind.addEventListener('click', (e:any)=>{
            let newredit = new Redit('ReditBind', e.target);
         });
 * html中把需要编辑的元素添加 data-redit="redit"，如果是非表单元素，确保添加了 contenteditable="true"
 * 示例：<span data-redit="redit" contenteditable="true">
 * ！！！模块并不主动存储编辑后的数据到表单中，但提供了方法可以获取到编辑目标的格式化存储字符串
 * 获取字符串方法：.getencodestr()
 * 返回字符串格式：内容%s字号%s缩放比
 * 内容做了折行判断，<br>或者\n会被替换为%br
 */

import fzplusicon from '../../img/fz-plus.svg';
import fzmulticon from '../../img/fz-mult.svg';
import italicicon from '../../img/italic.svg';

let selected:HTMLElement;
let oldredit:HTMLElement;


export default class Redit {
    public bindid: string;
    public target: HTMLElement | HTMLFormElement | any;
    public redit: HTMLElement;
    public scale: number;
    public fzshower: HTMLElement;
    private selectedstyle: Record<string, string> = {};
    
    constructor(bindID: string, target: HTMLElement) {
        this.bindid = bindID;
        this.target = target;
        // 获取绑定容器的transform scale设置
        this.scale = this.getscale();
        // 初始化this.target所需样式
        this.selectedstyle = {
            'background': 'hsl(48, 100%, 80%)',
            'box-shadow': `0 0 ${this.scale * 10}px hsl(48, 100%, 80%)`,
        };
        // 初始化 fzshower
        this.fzshower = this.fzshowerplugin(12, 8);
        
        if (this.target.dataset.redit !== 'redit' && this.target.dataset.redit !== 'on') {
            this.cleanselectedstyle();
        } else if (this.target.dataset.redit === 'redit') {
            this.initredit(() => {
                this.selectedstyle;
            });
            
        }
    }

    /**
     * @description: 为了让redit有更冗余的font-size设置空间，容器可能会设置transform scale
     *               检查容器是否有transform scale，redit需要与其保持一致
     * @param {绑定的容器ID HTMLElementID: string} 
     * @return: 100 or scale number
     */
    public getscale() {
        let dom: HTMLElement | null = document.getElementById(this.bindid);
        let transformScale = dom && window.getComputedStyle(dom).getPropertyValue("transform");
        if (transformScale === 'none') {
            return 100;
        } else {
            return 1 / Number(transformScale && transformScale.replace(/(matrix\(|\))/ig, '').split(',')[0]);
        }
    }

    /**
     * @description: 获取点击元素的位置，推断出redit所需要的位置
     * @return: {x, y}
     */
    public setoffset() {
        let x = this.target.offsetLeft;
        let y = this.target.offsetTop - 32;

        return {x: x, y: y};
    }

    /**
     * @description: 初始化设置，构建并显示redit
     * @param {bingdHTMLElement id} 
     */
    private initredit(callback:Function): void {
        // 创建redit
        this.redit = this.createredit();
        // 注册插件
        this.redit.appendChild(this.fzplugin(12, 8).fzplus);
        this.redit.appendChild(this.fzshower);
        this.redit.appendChild(this.fzplugin(12, 8).fzmult);
        // this.redit.appendChild(this.fsitalicplugin(12, 8)); 未完成
        // 注册到 dom 上
        let dom = document.getElementById(this.bindid);
        dom && dom.appendChild(this.redit);
        // 设置选中元素样式
        this.setselectedstyle();
        // 更新位置
        this.updatereditoffset();
        // 设置全局
        this.updateglobalredit();
        callback();
    }

    /**
     * @description: 创建 redit 容器
     * @return: this.redit
     */
    private createredit() {
        let div = document.createElement('div');
        div.id = 'newRedit';
        div.dataset.redit = 'on';
        div.style.cssText = `position:absolute;z-index:99;
        margin:0;padding:0 5px;
        white-space:nowrap;
        background:hsl(48, 100%, 70%);border-radius:5px 5px 0 0;`;
        
        return div;
    }

    private updatereditoffset(): void {
        this.redit.style.top = this.setoffset().y + 'px';
        this.redit.style.left = this.setoffset().x + 'px';
    }

    /**
     * @description: 设置selected的样式
     */
    private setselectedstyle(): void {
        this.cleanselectedstyle();
        Object.getOwnPropertyNames(this.selectedstyle).forEach((key: string) => {
            this.target.style.setProperty(key, this.selectedstyle[key]);
        });
    }

    /**
     * @description: 清空selected的样式
     */ 
    private cleanselectedstyle(): void {
        if (selected) {
            Object.getOwnPropertyNames(this.selectedstyle).forEach((key: string) => {
                selected.style.setProperty(key, '');
            });
        }
        oldredit && oldredit.remove();
    }

    /**
     * @description: 更改字号插件
     * @param {插件icon高度, icon的padding} 
     * @return: 插件，HTMLElement
     */
    private fzplugin(height: number, padding: number) {
        let h = height;
        let pd = padding;

        // font-size: plus
        let fzplus: HTMLElement = document.createElement('div');
        fzplus.dataset.redit = 'on';
        fzplus.style.cssText = `display:inline-block;
        height:${h + 'px'};line-height:${h + 'px'};
        margin:0;padding:${pd + 'px'};
        vertical-align:top;cursor:pointer;`;
        fzplus.innerHTML = `<img style="display:block;height:100%;margin:0;padding:0;opacity:.4;" 
        data-redit="on" src=${fzplusicon}>`;

        fzplus.addEventListener('click', ()=>{
            let fz = window.getComputedStyle(this.target).getPropertyValue('font-size');
            this.target.style.fontSize = (parseInt(fz) + 1) + 'px';
            this.fzshower.innerHTML = parseInt(this.target.style.fontSize) + '';
            this.updatereditoffset();
        });

        // font-size: mult
        let fzmult: HTMLElement = document.createElement('div');
        fzmult.dataset.redit = 'on';
        fzmult.style.cssText = `display:inline-block;
        height:${h + 'px'};line-height:${h + 'px'};
        margin:0;padding:${pd + 'px'};
        vertical-align:top;cursor:pointer;`;
        fzmult.innerHTML = `<img style="display:block;height:100%;margin:0;padding:0;opacity:.4;" 
        data-redit="on" src=${fzmulticon}>`;

        fzmult.addEventListener('click', () => {
            let fz = window.getComputedStyle(this.target).getPropertyValue('font-size');
            if(parseInt(fz) <= 12) {
                return;
            } else {
                this.target.style.fontSize = (parseInt(fz) - 1) + 'px';
                this.fzshower.innerHTML = parseInt(this.target.style.fontSize) + '';
                this.updatereditoffset();
            }
        })

        return { fzplus: fzplus, fzmult: fzmult};
    }

    /**
     * @description: 字号显示插件
     * @param {插件字号, padding}
     * @return: 插件，HTMLElement
     */
    private fzshowerplugin(height: number, padding: number) {
        let h = height;
        let pd = padding;
        
        let fzshower = document.createElement('div');
        fzshower.dataset.redit = 'on';
        fzshower.style.cssText = `display:inline-block;
        height:${h + 'px'};line-height:${h + 'px'};
        margin:0;padding:${pd + 'px'};
        font-size:${h + 'px'};
        vertical-align:top;`;

        let currentfz = window.getComputedStyle(this.target).getPropertyValue('font-size');

        fzshower.innerHTML = parseInt(currentfz) + '';

        return fzshower;

        // this.fzshower.innerHTML = parseInt(window.getComputedStyle(this.target).getPropertyValue('font-size')) / (1 * this.scale) + '';
    }

    /**
     * @description: 更改文字斜体插件 **未完成**
     * @param {插件icon高度, icon的padding} 
     * @return: 插件，HTMLElement
     */
    // private fsitalicplugin(height: number, padding: number) {
    //     let h = height * this.scale;
    //     let pd = padding * this.scale;

    //     // font-size: plus
    //     let fs: HTMLElement = document.createElement('div');
    //     fs.dataset.redit = 'on';
    //     fs.style.cssText = `display:inline-block;
    //     height:${h + 'px'};line-height:${h + 'px'};
    //     margin:0;padding:${pd + 'px'};
    //     vertical-align:top;cursor:pointer;`;
    //     fs.innerHTML = `<img style="display:block;height:100%;margin:0;padding:0;opacity:.4;" 
    //     data-redit="on" src=${italicicon}>`;

    //     // this.target.addEventListener('mouseup', ()=>{
    //     //     let selectedstr: any = window.getSelection();
            
    //     //     let sstr: any = window.getSelection();
    //     //     console.log(sstr.getRangeAt(0));
    //     //     console.log(sstr.toString());
    //     // Range { startContainer: text, startOffset: 9, endContainer: text, endOffset: 12, collapsed: false, … }
    //     // });

    //     fs.addEventListener('click', ()=>{
    //         let thisstr = this.target.innerHTML;
    //         let selectedstr: any = window.getSelection();
    //         let start: number = selectedstr.getRangeAt(0).startOffset;
    //         let end: number = selectedstr.getRangeAt(0).endOffset;
    //         this.target.innerHTML = thisstr.slice(0, start) + `<i>${selectedstr.toString()}</i>` + thisstr.slice(end);
    //         console.log(start);
           
    //     });

    //     return fs;
    // }

    /**
     * @description: redit 全局设置
     */
    private updateglobalredit(): void {
        oldredit = this.redit;
        selected = this.target;
    }

    /**
     * @description: 格式化存放字符串
     * @return: string, 格式：内容%s字号%s缩放比
     */
    public getencodestr() {
        let str = '';
        if(this.target.dataset.redit === 'redit') {
            if (this.target.tagName !== 'INPUT' && this.target.tagName !== 'TEXTAREA') {
                str = this.target.textContent;
                // console.log('innerText:' + this.target.innerText);
                // console.log('textContent:' + this.target.textContent);
                // console.log('innerHTML:' + this.target.innerHTML);
                
                str = str.replace(/(\n|\r\n)/ig, '%br');
                str += `%s${window.getComputedStyle(this.target).getPropertyValue('font-size')}`;

                // console.log('innerTextR:' + this.target.innerText.replace(/\n/ig, '%br'));
                // console.log('textContentR:' + this.target.textContent.replace(/\n/ig, '%br'));
                
            } else if (this.target.tagName === 'INPUT' || this.target.tagName === 'TEXTAREA') {
                str = this.target.value.replace(/(\n\r|\n)/ig, '%br');
                str += `%s${window.getComputedStyle(this.target).getPropertyValue('font-size')}%s${this.scale}`;
            }
        }
        
        return str;
    }
}




