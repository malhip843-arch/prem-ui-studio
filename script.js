const $ = (s) => document.querySelector(s);
const menuToggle = $("#menuToggle");
menuToggle.addEventListener("click", () => $("#navLinks").classList.toggle("open"));
document.querySelectorAll(".nav-links a").forEach(a => a.addEventListener("click", () => $("#navLinks").classList.remove("open")));

const demos = {
  food: {
    label: "TASTE / FOOD DELIVERY",
    render: () => `
      <div class="mini-app">
        <div class="mini-app-head"><span>taste<span style="color:#8baa5d">.</span></span><small>Delivering to · Home⌄</small></div>
        <input class="demo-search" id="foodSearch" placeholder="⌕  Search dishes..." />
        <div class="demo-food-grid" id="foodGrid">
          ${foodCard("🥑","Green bowl","$8.50")} ${foodCard("🍕","Garden pizza","$12.00")} ${foodCard("🍜","Noodle soup","$9.25")}
          ${foodCard("🥪","Avocado toast","$7.00")} ${foodCard("🍓","Berry cup","$5.50")} ${foodCard("🥗","Fresh salad","$8.00")}
        </div><div class="cart-line"><span id="cartCount">Your bag · 0 items</span><b id="cartTotal">$0.00</b></div>
      </div>`,
    init: () => {
      let count=0,total=0;
      document.querySelectorAll(".add-food").forEach(btn=>btn.addEventListener("click",()=>{
        count++; total+=Number(btn.dataset.price);
        $("#cartCount").textContent=`Your bag · ${count} item${count===1?"":"s"}`;
        $("#cartTotal").textContent=`$${total.toFixed(2)}`;
        btn.textContent="Added ✓"; setTimeout(()=>btn.textContent="Add +",850);
      }));
      $("#foodSearch").addEventListener("input",e=>{
        const q=e.target.value.toLowerCase();
        document.querySelectorAll(".food-item").forEach(el=>el.style.display=el.dataset.name.includes(q)?"":"none");
      });
    }
  },
  ride: {
    label:"GO / RIDE BOOKING",
    render:()=>`<div class="mini-app"><div class="mini-app-head"><span>go<span style="color:#83a64e">.</span></span><small>City rides, made easy</small></div><div class="ride-demo"><div class="ride-map">📍</div><div class="ride-form"><h3 style="font:600 21px 'Space Grotesk';margin:0">Where to?</h3><label> PICK-UP LOCATION</label><input id="pickup" value="Current location"><label> DESTINATION</label><input id="destination" placeholder="Enter destination"><button class="demo-action" id="bookRide">Find my ride ↗</button><div class="ride-status" id="rideStatus">Ready when you are.</div></div></div></div>`,
    init:()=>$("#bookRide").addEventListener("click",()=>{
      const dest=$("#destination").value.trim();
      $("#rideStatus").textContent=dest?`✓ Ride options ready for ${dest} (demo).`:"Please enter a destination first.";
    })
  },
  shop: {
    label:"FORMA / ONLINE SHOPPING",
    render:()=>`<div class="mini-app"><div class="mini-app-head"><span>forma<span style="color:#a68f69">.</span></span><small>Bag · <b id="bagCount">0</b></small></div><p style="font:600 20px 'Space Grotesk';margin:18px 0 14px">The everyday edit.</p><div class="shop-demo-grid">
      ${shopCard("◒","Sculpt vase","$24")} ${shopCard("▱","Soft tote","$32")} ${shopCard("◉","Studio lamp","$58")}
    </div><div class="cart-line"><span id="shopMessage">Thoughtful things for everyday.</span><b id="shopTotal"></b></div></div>`,
    init:()=>{let n=0;document.querySelectorAll(".add-shop").forEach(btn=>btn.addEventListener("click",()=>{n++;$("#bagCount").textContent=n;$("#shopMessage").textContent="Added to your bag ✓";btn.textContent="Added ✓";}));}
  }
};
function foodCard(emoji,name,price){return `<div class="food-item" data-name="${name.toLowerCase()}"><div class="food-emoji">${emoji}</div><b>${name}</b><small>${price}</small><button class="add-food" data-price="${price.replace("$","")}">Add +</button></div>`}
function shopCard(emoji,name,price){return `<div class="shop-item"><div class="product-art">${emoji}</div><b>${name}</b><small>${price}</small><button class="add-shop">Add to bag +</button></div>`}
function showDemo(key){
  document.querySelectorAll(".demo-tab").forEach(t=>t.classList.toggle("active",t.dataset.demo===key));
  $("#demoLabel").textContent=demos[key].label;
  $("#demoContent").innerHTML=demos[key].render();
  demos[key].init();
}
document.querySelectorAll(".demo-tab").forEach(tab=>tab.addEventListener("click",()=>showDemo(tab.dataset.demo)));
showDemo("food");
