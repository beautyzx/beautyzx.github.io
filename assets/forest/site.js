'use strict';
const books={bar:{title:'沒有招牌的酒吧',description:'林棠、江澈、陸曜、溫寧的故事。'},moon:{title:'眩光',description:'溫霜與季沉的故事。'},general:{title:'將軍穿越',description:'將軍穿越的奇幻故事。'}};
const dialog=document.getElementById('book-dialog');
document.querySelectorAll('[data-book]').forEach(card=>card.addEventListener('click',()=>{const book=books[card.dataset.book];document.getElementById('dialog-title').textContent=book.title;document.getElementById('dialog-description').textContent=book.description;dialog.showModal();}));
dialog.querySelectorAll('.dialog-close,.dialog-return').forEach(button=>button.addEventListener('click',()=>dialog.close()));
dialog.addEventListener('click',event=>{const box=dialog.getBoundingClientRect();if(event.target===dialog&&(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom))dialog.close();});
const catPhotos=[{src:'assets/xiaoruan/portrait-watercolor.webp',caption:'小軟本人'},{src:'assets/xiaoruan/side.webp',caption:'換個角度'},{src:'assets/xiaoruan/shelf.webp',caption:'趴好趴滿'},{src:'assets/xiaoruan/nap.webp',caption:'睡在電腦旁'},{src:'assets/xiaoruan/floor.webp',caption:'躺著看你'},{src:'assets/xiaoruan/peek.webp',caption:'抬頭看看'}];
const photoDialog=document.getElementById('photo-dialog');let currentPhoto=0;
function displayPhoto(index){currentPhoto=(index+catPhotos.length)%catPhotos.length;const p=catPhotos[currentPhoto];document.getElementById('photo-full').src=p.src;document.getElementById('photo-full').alt=p.caption+'，布偶貓小軟';document.getElementById('photo-title').textContent=p.caption+' · '+(currentPhoto+1)+' / '+catPhotos.length;}
document.querySelectorAll('[data-photo]').forEach(button=>button.addEventListener('click',()=>{displayPhoto(Number(button.dataset.photo));photoDialog.showModal();}));
document.querySelector('.photo-close').addEventListener('click',()=>photoDialog.close());
document.getElementById('photo-prev').addEventListener('click',()=>displayPhoto(currentPhoto-1));document.getElementById('photo-next').addEventListener('click',()=>displayPhoto(currentPhoto+1));
photoDialog.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'){event.preventDefault();displayPhoto(currentPhoto-1);}if(event.key==='ArrowRight'){event.preventDefault();displayPhoto(currentPhoto+1);}});
photoDialog.addEventListener('click',event=>{const b=photoDialog.getBoundingClientRect();if(event.target===photoDialog&&(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom))photoDialog.close();});
