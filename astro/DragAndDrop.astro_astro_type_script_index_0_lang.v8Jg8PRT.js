const L=[{iconName:"toyota",brandName:"Toyota"},{iconName:"volkswagen",brandName:"Volkswagen"},{iconName:"ford",brandName:"Ford"},{iconName:"honda",brandName:"Honda"},{iconName:"nissan",brandName:"Nissan"},{iconName:"bmw",brandName:"BMW"},{iconName:"audi",brandName:"Audi"},{iconName:"hyundai",brandName:"Hyundai"},{iconName:"kia",brandName:"Kia"},{iconName:"chevrolet",brandName:"Chevrolet"},{iconName:"jeep",brandName:"Jeep"},{iconName:"subaru",brandName:"Subaru"},{iconName:"mazda",brandName:"Mazda"},{iconName:"volvo",brandName:"Volvo"},{iconName:"porsche",brandName:"Porsche"},{iconName:"ferrari",brandName:"Ferrari"},{iconName:"lamborghini",brandName:"Lamborghini"},{iconName:"mclaren",brandName:"McLaren"},{iconName:"astonmartin",brandName:"Aston Martin"},{iconName:"bentley",brandName:"Bentley"},{iconName:"rollsroyce",brandName:"Rolls-Royce"},{iconName:"jaguar",brandName:"Jaguar"},{iconName:"landrover",brandName:"Land Rover"},{iconName:"mini",brandName:"Mini"},{iconName:"fiat",brandName:"Fiat"},{iconName:"alfaromeo",brandName:"Alfa Romeo"},{iconName:"maserati",brandName:"Maserati"},{iconName:"peugeot",brandName:"Peugeot"},{iconName:"renault",brandName:"Renault"},{iconName:"citroen",brandName:"Citroën"},{iconName:"opel",brandName:"Opel"},{iconName:"skoda",brandName:"Skoda"},{iconName:"seat",brandName:"Seat"},{iconName:"suzuki",brandName:"Suzuki"},{iconName:"mitsubishi",brandName:"Mitsubishi"},{iconName:"smart",brandName:"Smart"},{iconName:"tesla",brandName:"Tesla"},{iconName:"lucid",brandName:"Lucid"},{iconName:"polestar",brandName:"Polestar"},{iconName:"apple",brandName:"Apple"},{iconName:"samsung",brandName:"Samsung"},{iconName:"sony",brandName:"Sony"},{iconName:"microsoft",brandName:"Microsoft"},{iconName:"google",brandName:"Google"},{iconName:"amazon",brandName:"Amazon"},{iconName:"facebook",brandName:"Facebook"},{iconName:"netflix",brandName:"Netflix"},{iconName:"spotify",brandName:"Spotify"},{iconName:"adobe",brandName:"Adobe"},{iconName:"intel",brandName:"Intel"},{iconName:"amd",brandName:"AMD"},{iconName:"nvidia",brandName:"NVIDIA"},{iconName:"panasonic",brandName:"Panasonic"},{iconName:"lg",brandName:"LG"},{iconName:"sharp",brandName:"Sharp"},{iconName:"toshiba",brandName:"Toshiba"},{iconName:"hitachi",brandName:"Hitachi"},{iconName:"nikon",brandName:"Nikon"},{iconName:"fujifilm",brandName:"Fujifilm"},{iconName:"kodak",brandName:"Kodak"},{iconName:"leica",brandName:"Leica"},{iconName:"dji",brandName:"DJI"},{iconName:"cisco",brandName:"Cisco"},{iconName:"oracle",brandName:"Oracle"},{iconName:"ibm",brandName:"IBM"}];let p=0,g=0;const x=5,k=5,o=document.querySelector(".score"),l=o?.querySelector(".correct"),N=o?.querySelector(".total"),c=o?.querySelector("#play-again-btn"),i=document.querySelector(".draggable-items"),d=document.querySelector(".matching-pairs");let y,v;!o||!l||!N||!c||!i||!d?console.error("Required DOM elements not found"):(C(),E());function E(){const a=document.querySelector(".brand-grid");a&&L.forEach(n=>{const t=document.createElement("div");t.style.cssText=`
      background: white;
      padding: 1rem;
      border-radius: 8px;
      border: 1px solid #ddd;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    `;const e=document.createElement("img");e.src=`https://api.iconify.design/simple-icons:${n.iconName}.svg`,e.alt=n.brandName,e.style.cssText=`
      width: 60px;
      height: 60px;
      object-fit: contain;
      margin-bottom: 0.5rem;
    `;const s=document.createElement("div");s.textContent=n.brandName,s.style.cssText=`
      font-weight: bold;
      margin-bottom: 0.25rem;
      color: #333;
    `;const r=document.createElement("div");r.textContent=`Icon: ${n.iconName}`,r.style.cssText=`
      font-size: 0.8rem;
      color: #666;
      margin-bottom: 0.25rem;
    `;const b=document.createElement("div");b.textContent=`URL: api.iconify.design/simple-icons:${n.iconName}.svg`,b.style.cssText=`
      font-size: 0.7rem;
      color: #999;
      word-break: break-all;
    `;const m=document.createElement("div");m.textContent="Loading...",m.style.cssText=`
      font-size: 0.8rem;
      margin-top: 0.5rem;
      padding: 0.25rem;
      border-radius: 4px;
      background: #f0f0f0;
    `,e.onload=()=>{m.textContent="✅ Working",m.style.background="#d4edda",m.style.color="#155724"},e.onerror=()=>{const u=["logos","brands","mdi","simple-icons"];let f=0;const h=()=>{if(f<u.length){const S=u[f];e.src=`https://api.iconify.design/${S}:${n.iconName}.svg`,f++}else m.textContent="❌ Not Found",m.style.background="#f8d7da",m.style.color="#721c24"};e.onerror=h,h()},t.appendChild(e),t.appendChild(s),t.appendChild(r),t.appendChild(b),t.appendChild(m),a.appendChild(t)})}function C(){if(!i||!d)return;const a=I(x,L),t=[...a].sort((e,s)=>e.brandName.toLowerCase().localeCompare(s.brandName.toLowerCase()));for(let e=0;e<a.length;e++)i.insertAdjacentHTML("beforeend",`
      <img src="https://api.iconify.design/simple-icons:${a[e].iconName}.svg" alt="${a[e].brandName}" class="draggable" draggable="true" id="${a[e].iconName}">
    `);for(let e=0;e<t.length;e++)d.insertAdjacentHTML("beforeend",`
      <div class="matching-pair">
        <span class="label">${t[e].brandName}</span>
        <span class="droppable" data-brand="${t[e].iconName}"></span>
      </div>
    `);y=document.querySelectorAll(".draggable"),v=document.querySelectorAll(".droppable"),y.forEach(e=>{e.addEventListener("dragstart",T)}),v.forEach(e=>{e.addEventListener("dragenter",M),e.addEventListener("dragover",A),e.addEventListener("dragleave",D),e.addEventListener("drop",w)})}function T(a){a.dataTransfer&&a.dataTransfer.setData("text",a.target.id)}function M(a){const n=a.target;n.classList&&n.classList.contains("droppable")&&!n.classList.contains("dropped")&&n.classList.add("droppable-hover")}function A(a){const n=a.target;n.classList&&n.classList.contains("droppable")&&!n.classList.contains("dropped")&&a.preventDefault()}function D(a){const n=a.target;n.classList&&n.classList.contains("droppable")&&!n.classList.contains("dropped")&&n.classList.remove("droppable-hover")}function w(a){a.preventDefault();const n=a.target;if(n.classList.remove("droppable-hover"),!a.dataTransfer)return;const t=a.dataTransfer.getData("text"),e=n.getAttribute("data-brand"),s=t===e;if(g++,s){const r=document.getElementById(t);if(r){n.classList.add("dropped"),r.classList.add("dragged"),r.setAttribute("draggable","false");const b=r.alt;n.innerHTML=`<img src="https://api.iconify.design/simple-icons:${t}.svg" alt="${b}" style="max-width: 100%; max-height: 100%; object-fit: contain;min-width: 50px;}">`}p++}o&&(o.style.opacity="0"),setTimeout(()=>{l&&(l.textContent=p.toString()),N&&(N.textContent=g.toString()),o&&(o.style.opacity="1")},200),p===Math.min(k,x)&&c&&(c.style.display="block",setTimeout(()=>{c&&c.classList.add("play-again-btn-entrance")},200))}c&&c.addEventListener("click",B);function B(){!c||!i||!d||!o||!l||!N||(c.classList.remove("play-again-btn-entrance"),p=0,g=0,i.style.opacity="0",d.style.opacity="0",setTimeout(()=>{o&&(o.style.opacity="0")},100),setTimeout(()=>{if(c&&(c.style.display="none"),i)for(;i.firstChild;)i.removeChild(i.firstChild);if(d)for(;d.firstChild;)d.removeChild(d.firstChild);C(),l&&(l.textContent=p.toString()),N&&(N.textContent=g.toString()),i&&(i.style.opacity="1"),d&&(d.style.opacity="1"),o&&(o.style.opacity="1")},500))}function I(a,n){let t=[],e=[...n];a>e.length&&(a=e.length);for(let s=1;s<=a;s++){const r=Math.floor(Math.random()*e.length);t.push(e[r]),e.splice(r,1)}return t}
