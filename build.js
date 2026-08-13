
const fs = require("fs");
const path = require("path");

const root = __dirname;
const source = path.join(root, "content", "products");
const out = path.join(root, "public");
const products = [];

function parseFrontmatter(text) {
  const match = text.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return {};
  const lines = match[1].split(/\r?\n/);
  const obj = {};
  for (const line of lines) {
    const i = line.indexOf(":");
    if (i < 0) continue;
    const key = line.slice(0,i).trim();
    let val = line.slice(i+1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1,-1);
    } else if (/^\d+$/.test(val)) val = Number(val);
    else if (val === "true") val = true;
    else if (val === "false") val = false;
    obj[key] = val;
  }
  return obj;
}

fs.mkdirSync(out, {recursive:true});
fs.cpSync(path.join(root,"assets"), path.join(out,"assets"), {recursive:true});

for (const file of fs.readdirSync(source).filter(f=>f.endsWith(".md"))) {
  const data = fs.readFileSync(path.join(source,file),"utf8");
  const p = parseFrontmatter(data);
  products.push({...p, slug:path.basename(file,".md")});
}

fs.writeFileSync(path.join(out,"products.json"), JSON.stringify(products,null,2));

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Lumière Capilar | Catálogo</title>
<meta name="description" content="Catálogo online de Lumière Capilar">
<style>
:root{--bg:#f8f6f8;--card:#fff;--text:#211e22;--muted:#777079;--line:#e8e2e9;--accent:#17151a;--brand:#6b3c86}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font-family:Arial,Helvetica,sans-serif}
header{position:sticky;top:0;z-index:20;background:rgba(248,246,248,.95);backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}
.nav{max-width:1150px;margin:auto;padding:17px 22px;display:flex;justify-content:space-between;align-items:center}.logo{font-weight:900;letter-spacing:.12em}.logo span{color:var(--brand)}
button{font:inherit}.cart{border:0;background:#211e22;color:white;border-radius:999px;padding:11px 16px;font-weight:800}
.hero{max-width:1150px;margin:auto;padding:60px 22px 25px}.eyebrow{color:var(--brand);font-weight:900;font-size:12px;letter-spacing:.14em;text-transform:uppercase}
h1{font-size:clamp(44px,7vw,74px);line-height:.94;letter-spacing:-.06em;margin:12px 0 16px}.hero p{color:var(--muted);font-size:16px;line-height:1.6;max-width:680px}
.notice{margin-top:22px;border:1px solid var(--line);background:white;border-radius:18px;padding:14px 16px;color:var(--muted);font-size:13px}
.tools{max-width:1150px;margin:auto;padding:12px 22px 26px;display:flex;gap:12px}.search,.select{height:54px;border:1px solid var(--line);background:white;border-radius:28px;padding:0 20px;font-size:16px;outline:none}.search{flex:1}.select{min-width:200px}
main{max-width:1150px;margin:auto;padding:0 22px 70px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.card{background:white;border:1px solid var(--line);border-radius:22px;overflow:hidden}.photo{height:330px;display:flex;align-items:center;justify-content:center;padding:18px}.photo img{width:100%;height:100%;object-fit:contain}.body{padding:20px}.cat{font-size:11px;color:#9b6872;letter-spacing:.13em;font-weight:900;text-transform:uppercase}.name{font-size:20px;font-weight:900;margin:9px 0 7px;text-transform:uppercase}.size{color:var(--muted);margin-bottom:9px}.stock{color:#587461;font-size:14px;margin-bottom:16px}.price{font-size:25px;font-weight:900}.cash{color:var(--brand);font-weight:800;font-size:14px;margin-top:5px}.add{margin-top:18px;width:100%;border:0;background:#211e22;color:#fff;border-radius:999px;padding:13px;font-weight:800;cursor:pointer}
.empty{text-align:center;color:var(--muted);padding:50px;display:none}
.drawer{position:fixed;inset:0;display:none;z-index:50}.drawer.open{display:block}.shade{position:absolute;inset:0;background:rgba(0,0,0,.35)}.panel{position:absolute;right:0;top:0;height:100%;width:min(430px,100%);background:#fff;padding:22px;display:flex;flex-direction:column}.panel h2{margin:0}.close{border:0;background:#eee;border-radius:50%;width:38px;height:38px}.items{flex:1;overflow:auto;margin:18px 0}.item{display:flex;gap:12px;padding:12px 0;border-bottom:1px solid var(--line)}.item img{width:65px;height:65px;object-fit:contain;border:1px solid var(--line);border-radius:12px}.item strong{font-size:14px}.qty{display:flex;gap:8px;align-items:center;margin-top:8px}.qty button{border:1px solid var(--line);background:white;border-radius:8px;width:28px;height:28px}.total{font-size:20px;font-weight:900;margin:12px 0}.wa{border:0;background:#25d366;color:#fff;border-radius:14px;padding:14px;font-weight:900}
@media(max-width:800px){.grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:560px){.grid{grid-template-columns:1fr}.tools{flex-direction:column}.select{width:100%}.photo{height:300px}}
</style>
</head>
<body>
<header><div class="nav"><div class="logo">LUMIÈRE <span>CAPILAR</span></div><button class="cart" onclick="openCart()">🛒 Pedido (<span id="count">0</span>)</button></div></header>
<section class="hero"><div class="eyebrow">Catálogo online</div><h1>Cuidado capilar<br>profesional.</h1><p>Encontrá tus productos, consultá precios y armá tu pedido directamente desde el catálogo.</p><div class="notice">💳 <b>Transferencia:</b> precio publicado con IVA/impuestos. &nbsp; 💵 <b>Efectivo:</b> precio especial indicado en cada producto.</div></section>
<div class="tools"><input class="search" id="search" placeholder="Buscar producto..." oninput="render()"><select class="select" id="category" onchange="render()"><option value="">Todas las categorías</option></select><select class="select" id="order" onchange="render()"><option value="default">Ordenar</option><option value="low">Precio menor</option><option value="high">Precio mayor</option><option value="az">A-Z</option></select></div>
<main><div id="grid" class="grid"></div><div id="empty" class="empty">No encontramos productos.</div></main>
<footer style="border-top:1px solid var(--line);padding:28px;text-align:center;color:var(--muted);font-size:13px">LUMIÈRE CAPILAR · Catálogo sujeto a disponibilidad</footer>
<div class="drawer" id="drawer"><div class="shade" onclick="closeCart()"></div><aside class="panel"><div style="display:flex;justify-content:space-between;align-items:center"><h2>Tu pedido</h2><button class="close" onclick="closeCart()">×</button></div><div id="items" class="items"></div><div class="total">Total transferencia: $<span id="total">0</span></div><button class="wa" onclick="sendWhatsApp()">Enviar pedido por WhatsApp</button></aside></div>
<script>
const WHATSAPP="549XXXXXXXXXX";
let products=[],cart=JSON.parse(localStorage.getItem("lumiereCart")||"[]");
const money=n=>Number(n).toLocaleString("es-AR");
fetch("products.json").then(r=>r.json()).then(d=>{products=d;setupCategories();render()});
function setupCategories(){const c=[...new Set(products.map(p=>p.category).filter(Boolean))];document.querySelector("#category").innerHTML='<option value="">Todas las categorías</option>'+c.map(x=>'<option>'+x+'</option>').join("")}
function render(){const q=document.querySelector("#search").value.toLowerCase();const c=document.querySelector("#category").value;const o=document.querySelector("#order").value;let list=products.filter(p=>(!c||p.category===c)&&(p.title+" "+p.description).toLowerCase().includes(q));if(o==="low")list.sort((a,b)=>a.transfer-b.transfer);if(o==="high")list.sort((a,b)=>b.transfer-a.transfer);if(o==="az")list.sort((a,b)=>a.title.localeCompare(b.title));document.querySelector("#grid").innerHTML=list.map(p=>'<article class="card"><div class="photo"><img src="'+p.image+'" alt="'+p.title+'"></div><div class="body"><div class="cat">'+(p.category||"Otros")+'</div><div class="name">'+p.title+'</div><div class="size">'+(p.size||"")+'</div><div class="stock">'+(p.stock?"● Stock disponible":"● Sin stock")+'</div><div class="price">$ '+money(p.transfer)+'</div><div class="cash">💵 Efectivo: $ '+money(p.cash)+'</div><button class="add" onclick="add(\\''+p.slug+'\\')">Agregar</button></div></article>').join("");document.querySelector("#empty").style.display=list.length?"none":"block";updateCount()}
function add(id){cart.push(id);save();openCart()}function save(){localStorage.setItem("lumiereCart",JSON.stringify(cart));updateCount()}function updateCount(){document.querySelector("#count").textContent=cart.length}
function openCart(){renderCart();document.querySelector("#drawer").classList.add("open")}function closeCart(){document.querySelector("#drawer").classList.remove("open")}
function renderCart(){const m={};cart.forEach(id=>m[id]=(m[id]||0)+1);const e=Object.entries(m);document.querySelector("#items").innerHTML=e.length?e.map(([id,q])=>{const p=products.find(x=>x.slug===id);return '<div class="item"><img src="'+p.image+'"><div><strong>'+p.title+'</strong><br><small>'+p.size+' · $ '+money(p.transfer)+'</small><div class="qty"><button onclick="change(\\''+id+'\\',-1)">−</button><span>'+q+'</span><button onclick="change(\\''+id+'\\',1)">+</button></div></div></div>'}).join(""):'<p style="color:#777">Todavía no agregaste productos.</p>';document.querySelector("#total").textContent=money(cart.reduce((s,id)=>s+products.find(p=>p.slug===id).transfer,0))}
function change(id,d){if(d>0)cart.push(id);else{const i=cart.indexOf(id);if(i>=0)cart.splice(i,1)}save();renderCart()}
function sendWhatsApp(){if(!cart.length)return;const m={};cart.forEach(id=>m[id]=(m[id]||0)+1);let msg="Hola! Quiero consultar por este pedido:%0A%0A";Object.entries(m).forEach(([id,q])=>{const p=products.find(x=>x.slug===id);msg+="• "+q+" x "+p.title+" "+p.size+" — $"+money(p.transfer)+" c/u%0A"});window.open("https://wa.me/"+WHATSAPP+"?text="+msg,"_blank")}
</script>
</body></html>`;
fs.writeFileSync(path.join(out,"index.html"),html);
