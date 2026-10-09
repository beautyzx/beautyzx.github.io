(()=>{
 const body=document.querySelector('.reader-body'),settings=document.querySelector('.reader-settings');
 if(!body||!settings)return;
 const sizes=[0,23,27,32,38],key='beauty-reader-font-v1',typeKey='beauty-reader-typeface-v1';
 const choices=[['round','圓體'],['sans','黑體'],['serif','明體']];
 let index=0,typeface='serif';
 try{
  const saved=Number(localStorage.getItem(key));
  if(Number.isInteger(saved)&&saved>=0&&saved<sizes.length)index=saved;
  const savedType=localStorage.getItem(typeKey);
  if(choices.some(([value])=>value===savedType))typeface=savedType;
 }catch{}
 const typeSettings=document.createElement('div');
 typeSettings.className='reader-typefaces';
 typeSettings.setAttribute('role','group');
 typeSettings.setAttribute('aria-label','閱讀字體');
 const label=document.createElement('span');label.textContent='字體';typeSettings.append(label);
 choices.forEach(([value,text])=>{
  const button=document.createElement('button');
  button.type='button';button.dataset.typeface=value;button.textContent=text;
  typeSettings.append(button);
 });
 settings.after(typeSettings);
 const render=()=>{
  if(index)body.style.fontSize=sizes[index]+'px';else body.style.removeProperty('font-size');
  body.classList.toggle('reader-large',index>=2);
  settings.querySelector('.reader-font-status').textContent=index?sizes[index]+'px':'預設';
  settings.querySelector('[data-font-step="-1"]').disabled=index===0;
  settings.querySelector('[data-font-step="1"]').disabled=index===sizes.length-1;
  body.dataset.typeface=typeface;
  typeSettings.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.typeface===typeface)));
  try{localStorage.setItem(key,String(index));localStorage.setItem(typeKey,typeface);}catch{}
 };
 settings.addEventListener('click',e=>{
  const button=e.target.closest('button');
  if(!button||!settings.contains(button))return;
  if(button.hasAttribute('data-font-reset'))index=0;
  else if(button.hasAttribute('data-font-step'))index=Math.max(0,Math.min(sizes.length-1,index+Number(button.dataset.fontStep)));
  else return;
  render();
 });
 typeSettings.addEventListener('click',e=>{
  const button=e.target.closest('button');
  if(!button||!typeSettings.contains(button))return;
  typeface=button.dataset.typeface;render();
 });
 render();
})();
