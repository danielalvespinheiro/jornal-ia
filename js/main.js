(function(){
 const root=document.body.dataset.root||"", page=document.body.dataset.page;
 /* Store: troque por fetch('/api/...') quando houver backend. */
 /* Conteúdo vem de /content/*.json, editado pelo painel /admin. Nada é executado como HTML: tudo passa por esc() e safe(). */
 const NORM={timeline:t=>[t.year,t.title,t.text,t.image],articles:a=>({...a,sections:(a.sections||[]).map(s=>[s.heading,s.text]),refs:(a.refs||[]).map(r=>r.ref||r)}),lessons:l=>({...l,extra:(l.extra||[]).map(x=>x.item||x)})};
 const safe=(p,re)=>{p=String(p||"");return /^\/assets\/[\w\-\/.%]+$/.test(p)&&!p.includes("..")&&re.test(p)?p:""};
 const Store={list:k=>fetch(root+"content/"+k+".json").then(r=>{if(!r.ok)throw 0;return r.json()}).then(d=>(d.items||[]).map(NORM[k]||(x=>x))).catch(()=>{document.getElementById("main").insertAdjacentHTML("afterbegin","<p class='meta'>Não foi possível carregar o conteúdo.</p>");return []}),
  get:(k,id)=>Store.list(k).then(l=>l.find(x=>x.id===id))};
 const $=(s,r=document)=>r.querySelector(s), esc=t=>String(t).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const fmt=d=>new Date(d+"T12:00:00").toLocaleDateString("pt-BR",{day:"numeric",month:"long",year:"numeric"});
 const nav=[["index.html","Início"],["pages/historia.html","História"],["pages/aulas.html","Aulas"],["pages/biblioteca.html","Biblioteca"],["pages/videos.html","Vídeo aulas"],["pages/artigos.html","Artigos"],["pages/sobre.html","Sobre"]];
 const here=location.pathname.split("/").pop()||"index.html";
 $("#masthead").innerHTML=`<p class="dateline">${new Date().toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</p><a class="brand" href="${root}index.html">A Gazeta da Inteligência Artificial</a><p class="tagline">Jornal, arquivo e biblioteca do conhecimento</p>
 <button class="menu-btn" aria-expanded="false" aria-controls="nav">Menu</button><nav id="nav" aria-label="Principal">${nav.map(n=>`<a href="${root}${n[0]}"${n[0].endsWith(here)?' aria-current="page"':""}>${n[1]}</a>`).join("")}</nav>`;
 $("#colophon").innerHTML=`<p>A Gazeta da Inteligência Artificial. Conteúdo demonstrativo com fins educacionais.</p>`;
 const mb=$(".menu-btn");mb.onclick=()=>{const o=$("#nav").classList.toggle("open");mb.setAttribute("aria-expanded",o)};
 /* Ilustração sépia de apoio (substitua por fotos em assets/images) */
 const fig=(t,cap,img)=>{const s=safe(img,/\.(jpe?g|png|webp|avif)$/i);return `<figure class="fig">${s?`<img class="plate" src="${esc(s)}" alt="${esc(cap||t)}" loading="lazy">`:`<div class="plate" role="img" aria-label="${esc(cap||t)}"><span>${esc(t)}</span></div>`}${cap?`<figcaption>${esc(cap)}</figcaption>`:""}</figure>`};
 const artCard=a=>`<article class="item"><p class="kicker">${esc(a.cat)}</p><h3><a href="${root}pages/artigo.html?id=${a.id}">${esc(a.title)}</a></h3><p>${esc(a.sub)}</p><p class="meta">${fmt(a.date)}</p></article>`;
 function filterable(key,render,fields){
  Store.list(key).then(items=>{
   const cats=[...new Set(items.map(i=>i.cat))],box=$("#list"),q=$("#q"),sel=$("#cat"),cnt=$("#count");
   sel.innerHTML='<option value="">Todas as categorias</option>'+cats.map(c=>`<option>${esc(c)}</option>`).join("");
   const run=()=>{const t=q.value.trim().toLowerCase(),c=sel.value;
    const r=items.filter(i=>(!c||i.cat===c)&&(!t||fields.some(f=>String(i[f]||"").toLowerCase().includes(t))));
    box.innerHTML=r.map(render).join("")||'<p>Nenhum resultado. Tente outro termo ou limpe o filtro.</p>';cnt.textContent=r.length+" resultado(s)";};
   q.oninput=sel.onchange=run;run();
  });
 }
 const P={
  home(){
   Store.list("articles").then(a=>{$("#recent").innerHTML=a.slice(0,3).map(artCard).join("");
    $("#lead").innerHTML=`<p class="kicker">${esc(a[1].cat)}</p><h2 class="lead-title"><a href="${root}pages/artigo.html?id=${a[1].id}">${esc(a[1].title)}</a></h2><p class="deck">${esc(a[1].sub)}</p>${fig(a[1].year,a[1].title,a[1].image)}`});
   Store.list("library").then(l=>$("#home-lib").innerHTML=l.slice(0,4).map(x=>`<li><a href="${root}pages/biblioteca.html">${esc(x.title)}</a> <span class="meta">${esc(x.type)}</span></li>`).join(""));
   Store.list("videos").then(v=>$("#home-vid").innerHTML=v.slice(0,3).map(x=>`<li><a href="${root}pages/videos.html">${esc(x.title)}</a> <span class="meta">${esc(x.dur)}</span></li>`).join(""));
   Store.list("timeline").then(t=>$("#home-arch").innerHTML=t.slice(1,5).map(x=>`<li><strong>${x[0]}</strong> ${esc(x[1])}</li>`).join(""));
   Store.list("lessons").then(l=>$("#home-learn").innerHTML=l.slice(0,4).map(x=>`<li><a href="${root}pages/aulas.html">${esc(x.title)}</a> <span class="meta">${esc(x.level)}</span></li>`).join(""));
  },
  history(){
   Store.list("timeline").then(t=>{$("#timeline").innerHTML=t.map((e,i)=>`<li><button aria-expanded="false" aria-controls="e${i}"><span class="year">${e[0]}</span> ${esc(e[1])}</button><div id="e${i}" hidden>${fig(e[0],e[1],e[3])}<p>${esc(e[2])}</p></div></li>`).join("");
    $("#timeline").onclick=ev=>{const b=ev.target.closest("button");if(!b)return;const d=document.getElementById(b.getAttribute("aria-controls")),o=d.hidden;d.hidden=!o;b.setAttribute("aria-expanded",o)}});
  },
  lessons(){filterable("lessons",l=>`<article class="item"><p class="kicker">${esc(l.level)}</p><h3>${esc(l.title)}</h3><p>${esc(l.desc)}</p><details><summary>Ver conteúdo e materiais</summary><p>${esc(l.content)}</p><ul>${l.extra.map(e=>`<li>${esc(e)}</li>`).join("")}</ul></details></article>`,["title","desc","level"])},
  library(){filterable("library",b=>`<article class="item"><p class="kicker">${esc(b.type)}, ${esc(b.cat)}</p><h3>${esc(b.title)}</h3><p>${esc(b.desc)}</p><p class="actions"><a class="btn" href="${esc(safe(b.file,/\.pdf$/i))}" target="_blank" rel="noopener">Visualizar</a> <a class="btn" href="${esc(safe(b.file,/\.pdf$/i))}" download>Baixar PDF</a></p></article>`,["title","desc","type"])},
  videos(){filterable("videos",v=>`<article class="item"><button class="thumb" data-src="${esc(safe(v.src,/\.(mp4|webm)$/i))}" data-embed="${/^[\w-]{11}$/.test(v.embed||"")?v.embed:""}" data-t="${esc(v.title)}" aria-label="Assistir: ${esc(v.title)}">${fig(v.dur,"",v.thumb)}</button><p class="kicker">${esc(v.cat)}</p><h3>${esc(v.title)}</h3><p>${esc(v.desc)}</p></article>`,["title","desc","cat"]);
   const dlg=$("#player"),vd=$("video",dlg);$("#list").onclick=e=>{const b=e.target.closest(".thumb");if(!b)return;const em=b.dataset.embed;$("#emb").innerHTML=em?`<iframe src="https://www.youtube-nocookie.com/embed/${em}" title="${esc(b.dataset.t)}" allowfullscreen></iframe>`:"";vd.hidden=!!em;if(!em)vd.src=b.dataset.src;$("#vt").textContent=b.dataset.t;$("#verr").hidden=true;dlg.showModal();vd.play().catch(()=>{})};
   vd.onerror=()=>$("#verr").hidden=false;$("#close").onclick=()=>dlg.close();dlg.onclose=()=>{$("#emb").innerHTML="";vd.pause();vd.removeAttribute("src")}},
  articles(){filterable("articles",artCard,["title","sub","cat"])},
  article(){const id=new URLSearchParams(location.search).get("id");
   Store.get("articles",id).then(a=>{const m=$("#article");if(!a){m.innerHTML="<p>Artigo não encontrado. <a href='artigos.html'>Voltar aos artigos</a>.</p>";return}
    document.title=a.title+" · A Gazeta da IA";
    m.innerHTML=`<p class="kicker">${esc(a.cat)}</p><h1>${esc(a.title)}</h1><p class="deck">${esc(a.sub)}</p><p class="meta">Por ${esc(a.author)}, ${fmt(a.date)}</p>${fig(a.year,"Imagem de capa",a.image)}${a.sections.map(s=>`<section><h2>${esc(s[0])}</h2><p>${esc(s[1])}</p></section>`).join("")}<section><h2>Referências</h2><ul class="refs">${a.refs.map(r=>`<li>${esc(r)}</li>`).join("")}</ul></section>`;
    Store.list("articles").then(all=>$("#related").innerHTML=all.filter(x=>x.id!==a.id).sort((x,y)=>(y.cat===a.cat)-(x.cat===a.cat)).slice(0,3).map(artCard).join(""))});}
 };
 if(P[page])P[page]();
})();
