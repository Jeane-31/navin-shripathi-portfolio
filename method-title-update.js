/* Change process-section copy on homepage and method page; leave process steps and interactions intact. */
(() => {
  function apply() {
    document.querySelectorAll(".method-intro").forEach(section => {
      const title=section.querySelector("h2");
      if(title){
        title.innerHTML='How I <span class="scribble">cook?</span>';
        title.setAttribute("aria-label","How I cook?");
      }
      const description=section.querySelector("p");
      if(description && description.textContent.includes("There is a process behind the fun.")) description.remove();
    });
    document.querySelectorAll(".method-shell .story-ui-title").forEach(title => {
      const sceneLabel=title.querySelector(".js-scene-label");
      if(sceneLabel) title.replaceChildren(document.createTextNode("How I cook? "),sceneLabel);
      else title.textContent="How I cook?";
    });
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",apply,{once:true});
  else apply();
})();