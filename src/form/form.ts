/*
 * @Description: file content
 * @Author: JasonYang
 * @Date: 2019-08-27 11:11:02
 * @LastEditTime: 2019-09-06 14:00:03
 */
import './form.scss';

// html dom 接口
interface htmlDomProtected {
    docForm: any,
}

const htmlDom: { docForm: Element | null } = {
    docForm: document.querySelector('#docForm'),
};

// chSelect class
class chSelect {
    private readonly options: Array<string>;
    private readonly inputID: string;
    private currentNode: HTMLElement | null;
    private currentInput: HTMLInputElement;
    private isBlur: boolean;
    private readonly offsetTop: Number;
    private readonly callback: Function | null;
    constructor(inputID: string, offsetTop: Number, arrayStr: Array<string>, callback: Function | null) {
        this.options = arrayStr;
        this.inputID = inputID;
        this.offsetTop = offsetTop;
        this.callback = callback;
        // elements select
        this.currentNode = document.getElementById(this.inputID);
        let mapInput = this.inputID.replace('select', '');
        // @ts-ignore
        this.currentInput = document.getElementById(mapInput.toLowerCase());
        // @ts-ignore
        this.currentInput.addEventListener('focus', this.focusHandle);
        this.isBlur = true;
        // @ts-ignore
        this.currentInput.addEventListener('blur', this.blurHandle);
    }

    focusHandle = () => {
        // @ts-ignore
        console.log('focus');
        let chSelect = document.createElement('div');
        chSelect.className = 'ch-select';
        chSelect.id = 'activeSelect';
        chSelect.style.top = this.offsetTop + 'px';
        for (let i=0; i<this.options.length; i++) {
            let li = document.createElement('div');
            li.className = 'ch-select-li';
            li.innerText = this.options[i];
            chSelect.addEventListener('mouseenter', () => {
                this.isBlur = false;
            });
            chSelect.addEventListener('mouseleave', () => {
                this.isBlur = true;
            });
            li.addEventListener('click', (e) => {
                // @ts-ignore
                this.currentInput.value = e.target.innerText;
                chSelect.remove();
                this.isBlur = true;
                // select over callback
                if(this.callback) {
                    this.callback();
                }
            });
            chSelect.appendChild(li);
        }
        let liClean = document.createElement('div');
        liClean.className = 'ch-select-li ch-select-clean';
        liClean.innerText = '清除';
        liClean.addEventListener('click', () => {
            // @ts-ignore
                this.currentInput.value = '';
                chSelect.remove();
                this.isBlur = true;
                // select over callback
                if(this.callback) {
                    this.callback();
                }
        });
        chSelect.appendChild(liClean);
        // @ts-ignore
        this.currentNode.appendChild(chSelect);
    };

    blurHandle = () => {
        if(this.isBlur) {
            // @ts-ignore
            document.getElementById('activeSelect').remove();
        }
    };
}

const role = ['运动员', '治安员'];
const roleEn = ['Athlete', 'Security'];

const country = ['中国代表团', '冬季奥运会组织委员会'];
const countryEn = ['People\'s Republic of China', 'Organizing Committee for Olympic Games'];

const countrySample = ['CHN', 'USA', 'JPN', 'RUS'];
const sexSample = ['M', 'F'];
const trafficSample = ['TA', 'T', 'A'];
const diningSample = ['dining', 'drinking'];
const venueSample = ['SA', 'CA', 'IA'];
const villageSample = ['MAV', 'MCA', 'AV'];

const diningIcon = [
    "data:image/png;base64,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",
    "data:image/png;base64,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"
];

const areaO = ['2', '3', '4'];
const areaP = ['R', 'S', 'T'];

// array test
function test_array(value: string | Number, target_array: Array<any>) {
    for(let i=0; i<target_array.length; i++) {
        if(target_array[i] === value) {
            return i;
        }
    }
    return null;
}

// @ts-ignore
let value_b_sync = () => {
    // @ts-ignore
    let syncValue = document.getElementById('b').value;
    // @ts-ignore
    if(test_array(syncValue, role) !== null) {
        // @ts-ignore
        document.getElementById('e').value = roleEn[test_array(syncValue, role)];
    } else {
        // @ts-ignore
        document.getElementById('e').value = '';
    }
    // @ts-ignore
    document.getElementById('f').value = syncValue;
};

// @ts-ignore
let value_h_sync = () => {
    // @ts-ignore
    let syncValue = document.getElementById('h').value;
    // @ts-ignore
    if(test_array(syncValue, country) !== null) {
        // @ts-ignore
        document.getElementById('g').value = countryEn[test_array(syncValue, country)];
    } else {
        // @ts-ignore
        document.getElementById('g').value = '';
    }
};

// @ts-ignore
let value_l_sync = () => {
    // @ts-ignore
    document.getElementById('iconLayout') && document.getElementById('iconLayout').remove();
    // @ts-ignore
    let syncValue = document.getElementById('l').value;
    let imgIndex = test_array(syncValue, diningSample);
    let iconLayout = document.createElement('div');
    iconLayout.className = 'ch-select-icon';
    iconLayout.id = 'iconLayout';
    // @ts-ignore
    if(imgIndex !== null) {
        let iconImg = new Image();
        iconImg.src = diningIcon[imgIndex];
        iconLayout.appendChild(iconImg);
    }
    // @ts-ignore
    document.getElementById('selectL').appendChild(iconLayout);
};

// instantiate
let a = new chSelect('selectA', 85, ['Aa', 'Bb'], null);
// @ts-ignore
let b = new chSelect('selectB', 60, role, value_b_sync);
// @ts-ignore
let h = new chSelect('selectH', 35, country, value_h_sync);
// @ts-ignore
let i = new chSelect('selectI', 65, countrySample, null);
// @ts-ignore
let j = new chSelect('selectJ', 65, sexSample, null);
// @ts-ignore
let k = new chSelect('selectK', 65, trafficSample, null);
// @ts-ignore
let l = new chSelect('selectL', 65, diningSample, value_l_sync);
// @ts-ignore
let m = new chSelect('selectM', 65, venueSample, null);
// @ts-ignore
let n = new chSelect('selectN', 65, villageSample, null);
// @ts-ignore
let o = new chSelect('selectO', 85, areaO, null);
// @ts-ignore
let p = new chSelect('selectP', 85, areaP, null);

// loadend fill back
setTimeout(
    function () {
        // @ts-ignore
        if(htmlDom.docForm.dataset.load === 'loadend') {
            value_b_sync();
            value_h_sync();
            value_l_sync();
        }
    }, 500);

// layui script 补填
let layscripts = document.createElement('script');
layscripts.setAttribute('type', 'text/javascript');
layscripts.textContent = `

layui.use(['form', 'jquery', 'upload', 'layer', 'laydate'], function () {
    var form = layui.form;
    var laydate = layui.laydate;
    var $ = layui.$;
    var upload = layui.upload;
    upload.render({
        elem:'#avatar',
        url:'/upload/file?childFile=userPhoto',
        size:1024,
        exts: 'png|jpg|jpeg|gif',
        accept: 'file',
        done: function (res) {
            $("#imageSrc").val(res.data.serverPath);
            $("#seeImageSrc").css("display", "block");
            $("#seeImageSrc").attr("src", res.data.serverPath);
        }
    });

    form.loadEnd = function () {
        return document.querySelector('#docForm').dataset.load = 'loadend';
    };

    form.submitBefore = function () {
        $("#docName").val($("#d").val());
        return true;
    }
});
`;

// @ts-ignore
htmlDom.docForm.appendChild(layscripts);







