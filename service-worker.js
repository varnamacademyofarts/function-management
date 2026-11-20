const CACHE_NAME="function-manager-shell-v1";
const SHELL_FILES=["./","./index.html","./manifest.json","./icons/icon-192.svg","./icons/icon-512.svg"];
self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(SHELL_FILES)).then(()=>self.skipWaiting())));
self.addEventListener("activate",event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("function-manager-shell-")&&k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",event=>{
 const req=event.request;if(req.method!=="GET")return;
 const url=new URL(req.url),scope=new URL(self.registration.scope);
 if(url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;
 const allowed=new Set(SHELL_FILES.map(p=>new URL(p,scope).pathname));
 if(req.mode==="navigate"){
  event.respondWith(fetch(req).then(res=>{if(res&&res.ok)caches.open(CACHE_NAME).then(c=>c.put(new URL("./",scope).href,res.clone()));return res;}).catch(()=>caches.match(new URL("./",scope).href).then(v=>v||caches.match(new URL("./index.html",scope).href))));
  return;
 }
 if(!allowed.has(url.pathname))return;
 event.respondWith(caches.match(req).then(v=>v||fetch(req).then(res=>{if(res&&res.ok)caches.open(CACHE_NAME).then(c=>c.put(req,res.clone()));return res;})));
});