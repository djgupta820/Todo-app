const menu = document.querySelector('#menu')
const nav = document.querySelector("#sidenav")
let ocMenu = document.querySelector('#oc-menu')
let flag = true

menu.addEventListener('click', (e)=>{
    if(flag){
        nav.style.left = '0';
        ocMenu.className = 'fa fa-times'
        flag = !flag
    }else{
        nav.style.left = '-300px'
        ocMenu.className = 'fa fa-bars'
        flag = !flag
    }
})
