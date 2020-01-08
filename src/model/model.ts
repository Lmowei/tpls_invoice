/*
 * @Description: file content
 * @Author: JasonYang
 * @Date: 2019-08-27 11:14:54
 * @LastEditTime : 2020-01-02 17:50:22
 */

import './model.scss';
import html2canvas from 'html2canvas';

setTimeout(()=>{
    let capture: HTMLElement | any = document.querySelector("#capture");
    html2canvas(capture).then(canvas => {
        canvas.style.position = 'absolute';
        canvas.style.top = '0px';
        canvas.style.width = '100vw';
        canvas.style.height = 'auto';
        document.body.appendChild(canvas);
        capture.remove();
    });
},500);





