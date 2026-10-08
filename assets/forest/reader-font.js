(()=>{
 const body=document.querySelector('.reader-body'),settings=document.querySelector('.reader-settings');
 if(!body||!settings)return;
 const sizes=[0,23,27,32,38],key='beauty-reader-font-v1';let index=0;
 try{const saved=Number(localStorage.getItem(key));if(Number.isInteger(saved)&&saved>=0&&saved<sizes.length)index=saved;}catch{}
 const render=()=>{if(index)body.style.fontSize=sizes[index]+'px';else body.style.removeProperty('font-size');body.classList.toggle('reader-large',index>=2);settings.querySelector('.reader-font-status').textContent=index?sizes[index]+'px':'預設';settings.querySelector('[data-font-step="-1"]').disabled=index===0;settings.querySelector('[data-font-step="1"]').disabled=index===sizes.length-1;try{localStorage.setItem(key,String(index));}catch{}};
 settings.addEventListener('click',e=>{const button=e.target.closest('button');if(!button||!settings.contains(button))return;if(button.hasAttribute('data-font-reset'))index=0;else index=Math.max(0,Math.min(sizes.length-1,index+Number(button.dataset.fontStep)));render();});render();
})();
