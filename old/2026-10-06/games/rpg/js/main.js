"use strict";
import {selectOrigin,startGame,restartGame,saveGame,loadGame,
  useItemFromInv,setScenesRef,gotoScene} from './engine.js';
import {handleUrge} from './urge.js';
import {SCENES} from '../data/scenes.js';

setScenesRef(SCENES);

// expose gotoScene for ending.js callbacks via window
window._gotoScene=gotoScene;

// expose onclick handlers
window.selectOrigin=selectOrigin;
window.startGame=startGame;
window.restartGame=restartGame;
window.saveGame=saveGame;
window.loadGame=loadGame;
window.useItemFromInv=useItemFromInv;
window.handleUrge=handleUrge;

// resume save if available
window.addEventListener('load',()=>{
  try{
    const data=localStorage.getItem('xjqxt_save');
    if(data){
      const s=document.createElement('button');
      s.className='start-btn';
      s.textContent='繼續上次的旅程';
      s.style.marginTop='10px';
      s.onclick=loadGame;
      document.querySelector('#title-screen').appendChild(s);
    }
  }catch(e){}
});
