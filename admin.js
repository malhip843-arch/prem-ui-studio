const initial=[
{id:"a1",name:"Taste — Food delivery",category:"FOOD & LIFESTYLE",description:"A joyful food ordering experience."},
{id:"a2",name:"Go — Ride booking",category:"MOBILITY",description:"A simple city ride booking concept."},
{id:"a3",name:"Forma — Shopping",category:"COMMERCE",description:"Thoughtful objects for everyday living."}
];
const KEY="prem-ui-studio-projects-v1";
let projects;
try{projects=JSON.parse(localStorage.getItem(KEY))||initial}catch(e){projects=initial}
const $=s=>document.querySelector(s);
function save(){localStorage.setItem(KEY,JSON.stringify(projects));render()}
function render(){
 $("#totalProjects").textContent=String(projects.length).padStart(2,"0");
 $("#projectList").innerHTML=projects.length?projects.map((p,i)=>`<div class="project-row"><div class="project-icon">${["✳","◈","◉","✦"][i%4]}</div><div class="project-info"><b>${escapeHtml(p.name)}</b><small>${escapeHtml(p.category)} · ${escapeHtml(p.description)}</small></div><div class="row-actions"><button data-edit="${p.id}">Edit</button><button class="delete" data-delete="${p.id}">Delete</button></div></div>`).join(""):"<p class='sub'>No projects yet. Add your first project.</p>";
 document.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>openForm(b.dataset.edit));
 document.querySelectorAll("[data-delete]").forEach(b=>b.onclick=()=>{if(confirm("Delete this project?")){projects=projects.filter(p=>p.id!==b.dataset.delete);save()}});
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function openForm(id=""){const p=projects.find(x=>x.id===id);$("#editId").value=id;$("#name").value=p?.name||"";$("#category").value=p?.category||"";$("#description").value=p?.description||"";$("#formTitle").textContent=id?"Edit project":"Add a project";$("#formPanel").hidden=false;$("#name").focus()}
function closeForm(){$("#formPanel").hidden=true;$("#projectForm").reset();$("#editId").value=""}
$("#addBtn").onclick=()=>openForm();$("#closeForm").onclick=closeForm;$("#cancelBtn").onclick=closeForm;
$("#projectForm").onsubmit=e=>{e.preventDefault();const id=$("#editId").value;const item={id:id||("p"+Date.now()),name:$("#name").value.trim(),category:$("#category").value.trim().toUpperCase(),description:$("#description").value.trim()};if(id)projects=projects.map(p=>p.id===id?item:p);else projects.push(item);save();closeForm()};
render();