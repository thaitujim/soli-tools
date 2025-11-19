async function loadData() {
    try {
      const res = await fetch("data.json");
      const data = await res.json();
  
      const list = document.getElementById("list");
      list.innerHTML = "";
  
      data.items.forEach(item => {
        const div = document.createElement("div");
        div.className = "item";
        div.textContent = item;
        list.appendChild(div);
      });
  
    } catch (err) {
      console.error("Lỗi tải dữ liệu:", err);
    }
  }
  
  loadData();
  