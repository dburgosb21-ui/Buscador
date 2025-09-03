(() => {
  const BASE = [
    "Clima hoy","Clima mañana","Clima en Bogotá","Noticias Colombia",
    "Resultados fútbol","Python tutorial","Python tkinter","Python requests",
    "Java vs Python","Cómo hacer arepas","Receta ajiaco","Machine learning",
    "Aprendizaje supervisado","Algoritmo k-means","Docker comandos básicos",
    "Git crear rama","Universidades en Colombia","Turismo eje cafetero","Vuelos baratos"
  ];

  const MAX_SUG = 7;
  const input = document.getElementById('q');
  const dd = document.getElementById('dd');
  const btn = document.getElementById('btn');
  const status = document.getElementById('status');

  const HIST_KEY = 'burgos_hist';
  let history = JSON.parse(localStorage.getItem(HIST_KEY) || '[]');

  let options = [];
  let idx = -1;

  function norm(s){ return (s||'').toString().trim().toLowerCase(); }

  function makeOption(text, source='base'){
    const el = document.createElement('div');
    el.className = 'opt';
    el.textContent = text;
    const info = document.createElement('small');
    info.textContent = source === 'hist' ? 'Historial' : 'Sugerencia';
    el.appendChild(info);
    el.addEventListener('click', ()=> choose(text));
    return el;
  }

  function renderDropdown(list){
    dd.innerHTML = '';
    options = [];
    idx = -1;
    if(!list.length){ hideDropdown(); return; }
    list.forEach(item => {
      const el = makeOption(item.text, item.source);
      dd.appendChild(el);
      options.push(el);
    });
    showDropdown();
  }

  function showDropdown(){ dd.hidden = false; input.setAttribute('aria-expanded','true'); }
  function hideDropdown(){ dd.hidden = true; input.setAttribute('aria-expanded','false'); options=[]; idx=-1; }

  function choose(text){
    input.value = text;
    hideDropdown();
    setStatus(`Seleccionado: "${text}"`);
  }

  function setStatus(t){ status.textContent = t; }

  function searchSim(q){
    if(!q) { setStatus('Escribe algo para buscar.'); return; }
    if(!history.includes(q)){ history.push(q); localStorage.setItem(HIST_KEY, JSON.stringify(history)); }
    setStatus(`Buscando: "${q}" (simulado)`);
  }

  function getMatches(q){
    const nq = norm(q);
    if(!nq) return [];
    const fromHist = history.filter(h => norm(h).includes(nq)).reverse().map(s => ({text:s, source:'hist'}));
    const fromBase = BASE.filter(b => norm(b).includes(nq) && !history.includes(b)).map(s => ({text:s, source:'base'}));
    return [...fromHist, ...fromBase].slice(0, MAX_SUG);
  }

  function update(){ renderDropdown(getMatches(input.value)); }

  input.addEventListener('keydown', (e) => {
    if(dd.hidden) return;
    if(e.key === 'ArrowDown'){ e.preventDefault(); if(options.length){ idx=(idx+1)%options.length; updateActive(); } }
    else if(e.key === 'ArrowUp'){ e.preventDefault(); if(options.length){ idx=(idx-1+options.length)%options.length; updateActive(); } }
    else if(e.key === 'Enter'){
      if(idx>=0 && options[idx]){
        e.preventDefault();
        const text = options[idx].childNodes[0].nodeValue;
        choose(text);
      } else {
        searchSim(input.value.trim()); hideDropdown();
      }
    } else if(e.key === 'Escape'){ hideDropdown(); }
  });

  function updateActive(){
    options.forEach((el,i)=>{ el.classList.toggle('active', i===idx); if(i===idx) el.scrollIntoView({block:'nearest'}); });
  }

  input.addEventListener('input', update);
  document.addEventListener('click', (e)=>{ if(!dd.contains(e.target) && e.target!==input) hideDropdown(); });
  btn.addEventListener('click', ()=>{ searchSim(input.value.trim()); hideDropdown(); });

  setStatus('Listo — escribe para ver sugerencias');
})();
