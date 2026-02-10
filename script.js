const $=s=>document.querySelector(s);
const toast=$("#toast");
const phoneInput=$("#phone");
function showToast(m,ok=true){toast.hidden=false;toast.textContent=m;toast.style.borderColor=ok?"rgba(201,162,74,.35)":"rgba(255,180,180,.35)";}
function hideToast(){toast.hidden=true;toast.textContent="";}
function setLoading(v){const b=$("#submitBtn");b.classList.toggle("loading",v);b.disabled=v;}
function setError(id,msg){const e=document.querySelector(`[data-err-for="${id}"]`);if(e)e.textContent=msg||"";}
function validEmail(v){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());}
function cfg(){return window.AUREO||{tgToken:"",tgChatId:""};}
const burger=$("#burger"),mobile=$("#mobile");
if(burger&&mobile){burger.addEventListener("click",()=>{const o=burger.getAttribute("aria-expanded")==="true";burger.setAttribute("aria-expanded",String(!o));mobile.hidden=o;});mobile.addEventListener("click",e=>{if(e.target.tagName==="A"){burger.setAttribute("aria-expanded","false");mobile.hidden=true;}});}
let iti=null;
if(phoneInput&&window.intlTelInput){iti=window.intlTelInput(phoneInput,{initialCountry:"us",preferredCountries:["us","ca"],separateDialCode:true,utilsScript:"https://cdn.jsdelivr.net/npm/intl-tel-input@19.5.6/build/js/utils.js"});}
async function tgSendMessage(token,chatId,text){
  const url=`https://api.telegram.org/bot${token}/sendMessage`;
  const res=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:chatId,text,parse_mode:"HTML",disable_web_page_preview:true})});
  const j=await res.json();
  if(!j.ok) throw new Error(j.description||"Telegram error");
}
async function tgSendDocument(token,chatId,file,caption){
  const url=`https://api.telegram.org/bot${token}/sendDocument`;
  const fd=new FormData();
  fd.append("chat_id",chatId);
  fd.append("document",file,file.name);
  if(caption) fd.append("caption",caption);
  const res=await fetch(url,{method:"POST",body:fd});
  const j=await res.json();
  if(!j.ok) throw new Error(j.description||"Telegram upload error");
}
function escapeHtml(s){
  return String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
}
document.addEventListener("DOMContentLoaded",()=>{
  const form=$("#leadForm");
  if(!form) return;
  form.addEventListener("submit",async e=>{
    e.preventDefault();hideToast();
    ["firstName","phone","email","message"].forEach(id=>setError(id,""));
    const firstName=$("#firstName").value.trim();
    const lastName=$("#lastName").value.trim();
    const email=$("#email").value.trim();
    const message=$("#message").value.trim();
    const files=$("#files").files?Array.from($("#files").files):[];
    const phoneRaw=phoneInput?phoneInput.value.trim():"";
    const phoneE164=iti?iti.getNumber():(phoneRaw||"");
    let ok=true;
    if(!firstName){setError("firstName","First name is required.");ok=false;}
    if(!phoneRaw){setError("phone","Phone is required.");ok=false;}
    if(!email||!validEmail(email)){setError("email","Please enter a valid email.");ok=false;}
    if(!message){setError("message","Message is required.");ok=false;}
    if(files.length>8){showToast("Please attach up to 8 images.",false);ok=false;}
    if(!ok) return;
    const c=cfg();
    if(!c.tgToken||!c.tgChatId){showToast("Telegram is not configured. Open config.js and paste bot token + chat id.",false);return;}
    setLoading(true);
    try{
      const now=new Date();
      const text=[
        "<b>New website request</b>",
        "",
        `<b>Name:</b> ${escapeHtml(firstName)}${lastName?(" "+escapeHtml(lastName)):""}`,
        `<b>Phone:</b> ${escapeHtml(phoneRaw)}${phoneE164?(" ("+escapeHtml(phoneE164)+")"):""}`,
        `<b>Email:</b> ${escapeHtml(email)}`,
        "",
        `<b>Message:</b> ${escapeHtml(message)}`,
        "",
        `<i>${now.toLocaleString()}</i>`
      ].join("\n");
      await tgSendMessage(c.tgToken,c.tgChatId,text);
      for(let i=0;i<files.length;i++){
        const f=files[i];
        if(f.size>8*1024*1024) throw new Error(`File too large: ${f.name} (max 8MB)`);
        await tgSendDocument(c.tgToken,c.tgChatId,f,`Attachment ${i+1}/${files.length}`);
      }
      form.reset();
      if(iti) iti.setNumber("");
      showToast("Thank you! Your request has been sent. We will contact you soon.",true);
    }catch(err){
      console.error(err);
      showToast("Sorry — something went wrong. Please call us at +1 (943) 238-9384.",false);
    }finally{
      setLoading(false);
    }
  });
});
