/* Remove the redundant artwork preservation statement from featured client sections only. */
(()=>{function remove(){document.querySelectorAll('.takeover .stage-caption').forEach(el=>el.remove());}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',remove,{once:true});else remove();})();
