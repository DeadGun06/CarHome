let activeTab = "all";
let selectedVehicle = null;

// Data version - เพิ่มทุกครั้งที่แก้ไข defaultVehicles
const DATA_VERSION = "1.1";

// Default vehicles data
const defaultVehicles = [

  {
    id: 1,
    type:"car",
    name:"Toyota Altis",
    model:"Altis",
    plate:"กว 508",
    image:"https://s.isanook.com/au/0/ud/0/1112/16.jpg",
    currentMileage: 65000,
    maintenance: [
      { id: 1, name: "น้ำมันเครื่อง", type: "km", kmInterval: 10000, lastServiceKm: 55000, status: "ok", notes: "" },
      { id: 2, name: "ยาง", type: "km", kmInterval: 50000, lastServiceKm: 15000, status: "ok", notes: "" },
      { id: 3, name: "ภาษีรถ", type: "date", dueDate: "2026-08-20", status: "warn", notes: "ต้องต่อภาษี" },
      { id: 4, name: "น้ำมันเกียร์", type: "km", kmInterval: 40000, lastServiceKm: 55000, status: "ok", notes: "" }
    ]
  },

  {
    id: 2,
    type:"car",
    name:"Honda Jazz",
    model:"Jazz",
    image:"https://www.carbase.my/upload/24/121/199/exterior/s19-1399661126-9866-honda-jazz.jpg",
    plate:"ขก 1201",
    currentMileage: 120000,
    maintenance: [
      { id: 1, name: "น้ำมันเครื่อง", type: "km", kmInterval: 10000, lastServiceKm: 120000, status: "ok", notes: "" },
      { id: 2, name: "ยาง", type: "km", kmInterval: 50000, lastServiceKm: 70000, status: "ok", notes: "" },
      { id: 3, name: "ภาษีรถ", type: "date", dueDate: "2026-05-15", status: "ok", notes: "ต้องต่อภาษี" },
      { id: 4, name: "น้ำมันเกียร์", type: "km", kmInterval: 40000, lastServiceKm: 80000, status: "ok", notes: "" }
    ]
  },

  {
    id: 3,
    type:"moto",
    name:"Honda PCX",
    model:"PCX",
    plate:"1 กพ 3825",
    image:"https://www.checkraka.com/uploaded/logo/42/42ff07bf3e683b310ecbb99a56fb6475.webp",
    currentMileage: 34500,
    maintenance: [
      { id: 1, name: "น้ำมันเครื่อง", type: "km", kmInterval: 2000, lastServiceKm: 30000, status: "ok", notes: "" },
      { id: 2, name: "ยาง", type: "km", kmInterval: 30000, lastServiceKm: 10000, status: "ok", notes: "" },
      { id: 3, name: "ภาษีรถ", type: "date", dueDate: "2026-03-13", status: "danger", notes: "เกินกำหนด" },
      { id: 4, name: "ชุดข้าง", type: "km", kmInterval: 7000, lastServiceKm: 28000, status: "ok", notes: "" }
    ]
  },

  {
    id: 4,
    type:"moto",
    name:"Honda Wave 110",
    model:"Wave 110",
    plate:"1กศ 660",
    image:"https://www.9carthai.com/wp-content/uploads/2019/12/HONDA-WAVE-110i-10.jpg",
    currentMileage: 18500,
    maintenance: [
      { id: 1, name: "น้ำมันเครื่อง", type: "km", kmInterval: 2000, lastServiceKm: 15000, status: "ok", notes: "" },
      { id: 2, name: "ยาง", type: "km", kmInterval: 30000, lastServiceKm: 5000, status: "ok", notes: "" },
      { id: 3, name: "ภาษีรถ", type: "date", dueDate: "2026-01-13", status: "ok", notes: "ต้องต่อภาษี" },
      { id: 4, name: "โซ่ สเตอร์", type: "km", kmInterval: 20000, lastServiceKm: 0, status: "ok", notes: "" }
    ]
  }

];

// Load vehicles from localStorage
let vehicles = loadVehicles();

// =======================
// Storage Functions
// =======================
function loadVehicles(){
  const saved = localStorage.getItem("homecars_vehicles");
  const savedVersion = localStorage.getItem("homecars_version");
  
  // ตรวจสอบ version - ถ้าไม่ตรงกันให้ลบข้อมูลเก่า
  if(savedVersion !== DATA_VERSION){
    localStorage.removeItem("homecars_vehicles");
    localStorage.setItem("homecars_version", DATA_VERSION);
    return defaultVehicles;
  }
  
  if(saved){
    try {
      return JSON.parse(saved);
    } catch(e) {
      return defaultVehicles;
    }
  }
  return defaultVehicles;
}

function saveVehicles(){
  localStorage.setItem("homecars_vehicles", JSON.stringify(vehicles));
  localStorage.setItem("homecars_version", DATA_VERSION);
}

function resetVehicles(){
  localStorage.removeItem("homecars_vehicles");
  localStorage.removeItem("homecars_version");
  vehicles = JSON.parse(JSON.stringify(defaultVehicles));
  render();
  updateStatusLegend();
}

// =======================
// อัปเดต Status Legend
// =======================
function updateStatusLegend(){
  // Clear existing content
  document.getElementById("ok-vehicles").innerHTML = "";
  document.getElementById("warn-vehicles").innerHTML = "";
  document.getElementById("danger-vehicles").innerHTML = "";

  // Group vehicles by worst maintenance status
  const statusGroups = { ok: [], warn: [], danger: [] };

  vehicles.forEach(v => {
    let worstStatus = 'ok';
    
    v.maintenance.forEach(m => {
      let itemStatus = m.status;
      
      // Calculate status for km-based items on the fly
      if(m.type === "km"){
        const nextServiceKm = m.lastServiceKm + m.kmInterval;
        const kmRemaining = nextServiceKm - v.currentMileage;
        itemStatus = kmRemaining < 0 ? 'danger' : (kmRemaining <= 3000 ? 'warn' : 'ok');
      }
      
      const priority = { 'danger': 3, 'warn': 2, 'ok': 1 };
      if(priority[itemStatus] > priority[worstStatus]) {
        worstStatus = itemStatus;
      }
    });

    statusGroups[worstStatus].push(v);
  });

  // Display vehicles for each status
  Object.keys(statusGroups).forEach(status => {
    const container = document.getElementById(`${status}-vehicles`);
    container.innerHTML = statusGroups[status].map(v => `
      <div onclick="openDetail(${v.id})" style="cursor: pointer; text-align: center; transition: transform 0.2s;">
        <img src="${v.image}" alt="${v.name}" style="width: 100%; height: 80px; object-fit: cover; border-radius: 6px; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
        <p style="font-size: 11px; margin-top: 6px; color: #666;">${v.name}</p>
      </div>
    `).join("");
  });

  updateUrgentInfo();
}

// =======================
// อัปเดตรายการเร่งด่วน
// =======================
function updateUrgentInfo(){
  const urgentItems = [];
  
  vehicles.forEach(v => {
    v.maintenance.forEach(m => {
      let itemStatus = m.status;
      let dueInfo = "";
      
      if(m.type === "km"){
        // Calculate status for km-based items
        const nextServiceKm = m.lastServiceKm + m.kmInterval;
        const kmRemaining = nextServiceKm - v.currentMileage;
        itemStatus = kmRemaining < 0 ? 'danger' : (kmRemaining <= 3000 ? 'warn' : 'ok');
        
        if(itemStatus === 'danger'){
          dueInfo = `เหลือ ${kmRemaining.toLocaleString('th-TH')} กม.`;
        } else if(itemStatus === 'warn'){
          dueInfo = `เหลือ ${kmRemaining.toLocaleString('th-TH')} กม.`;
        }
      } else {
        // Date-based items
        itemStatus = m.status;
        if(itemStatus === 'danger' || itemStatus === 'warn'){
          const today = new Date();
          const dueDate = new Date(m.dueDate);
          today.setHours(0, 0, 0, 0);
          dueDate.setHours(0, 0, 0, 0);
          const daysLeft = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));
          
          if(daysLeft < 0){
            dueInfo = `เกินกำหนด ${Math.abs(daysLeft)} วัน`;
          } else {
            dueInfo = `เหลือ ${daysLeft} วัน`;
          }
        }
      }
      
      if(itemStatus === 'danger' || itemStatus === 'warn'){
        urgentItems.push({
          status: itemStatus,
          vehicleName: v.name,
          itemName: m.name,
          dueInfo: dueInfo
        });
      }
    });
  });
  
  // Update count
  const warnCount = urgentItems.filter(u => u.status === 'warn').length;
  const dangerCount = urgentItems.filter(u => u.status === 'danger').length;
  const totalUrgent = warnCount + dangerCount;
  document.getElementById("urgentCount").textContent = `${totalUrgent} รายการ`;
  
  // Update alert content
  const alertContent = document.getElementById("alertContent");
  if(urgentItems.length === 0){
    alertContent.innerHTML = `<p style="color: #999;">ไม่มีรายการที่เร่งด่วน</p>`;
  } else {
    // Sort by danger first, then warn
    urgentItems.sort((a, b) => {
      if(a.status === 'danger' && b.status !== 'danger') return -1;
      if(a.status !== 'danger' && b.status === 'danger') return 1;
      return 0;
    });
    
    alertContent.innerHTML = urgentItems.map(item => `
      <div style="padding: 8px 0; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <p style="margin: 0; font-size: 14px;"><strong>${item.vehicleName}</strong> — ${item.itemName}</p>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #666;">${item.dueInfo}</p>
        </div>
        <span style="display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; ${item.status === 'danger' ? 'background: #E24B4A; color: white;' : 'background: #EF9F27; color: white;'}">${item.status === 'danger' ? '🔴 เร่งด่วน' : '🟡 เตือน'}</span>
      </div>
    `).join("");
    
    // Remove last border
    const lastDiv = alertContent.lastElementChild;
    if(lastDiv) lastDiv.style.borderBottom = 'none';
  }
}

// =======================
// เปิดรายละเอียดรถ
// =======================
function openDetail(vehicleId){
  selectedVehicle = vehicles.find(v => v.id === vehicleId);
  if(selectedVehicle){
    showDetailModal();
  }
}

// =======================
// แสดง Modal รายละเอียด
// =======================
function showDetailModal(){
  if(!selectedVehicle) return;

  const modal = document.getElementById("detailModal");
  const title = document.getElementById("detailTitle");
  const content = document.getElementById("detailContent");

  title.textContent = selectedVehicle.name;

  content.innerHTML = `
    <div style="width: 100%; height: 250px; overflow: hidden; border-radius: 8px; margin-bottom: 20px;">
      <img src="${selectedVehicle.image}" alt="${selectedVehicle.name}" style="width: 100%; height: 100%; object-fit: cover;">
    </div>
    
    <div style="margin-bottom: 20px;">
      <p><strong>รุ่น:</strong> ${selectedVehicle.model}</p>
      <p><strong>ทะเบียน:</strong> ${selectedVehicle.plate}</p>
      <p><strong>ประเภท:</strong> ${selectedVehicle.type === 'car' ? 'รถยนต์' : 'มอเตอร์ไซต์'}</p>
    </div>

    <h3 style="margin-top: 20px; margin-bottom: 15px;">🔧 สถานะการบำรุงรักษา</h3>
    <div id="maintenanceList"></div>

    <div style="margin-top: 20px; display: flex; gap: 10px;">
      <button class="btn-primary" onclick="showEditModal()" style="flex: 1;">✏️ แก้ไข</button>
      <button onclick="deleteVehicle(${selectedVehicle.id})" style="background: #E24B4A; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; flex: 1; font-size: 14px;">🗑️ ลบ</button>
      <button onclick="closeDetailModal()" style="background: #999; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; flex: 1; font-size: 14px;">ปิด</button>
    </div>
  `;

  const mainList = document.getElementById("maintenanceList");
  mainList.innerHTML = selectedVehicle.maintenance.map(m => {
    if(m.type === "km"){
      const nextServiceKm = m.lastServiceKm + m.kmInterval;
      const kmRemaining = nextServiceKm - selectedVehicle.currentMileage;
      const statusKm = kmRemaining < 0 ? 'danger' : (kmRemaining <= 3000 ? 'warn' : 'ok');
      return `
        <div style="background: #f5f5f5; padding: 12px; margin-bottom: 10px; border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div style="flex: 1;">
              <strong style="font-size: 14px;">⛽ ${m.name}</strong>
              <p style="font-size: 12px; color: #666; margin: 5px 0;">ครั้งล่าสุด: ${m.lastServiceKm.toLocaleString('th-TH')} กม.</p>
              <p style="font-size: 12px; color: #666; margin: 5px 0;">ครั้งถัดไป: ${nextServiceKm.toLocaleString('th-TH')} กม.</p>
              <p style="font-size: 13px; font-weight: bold; color: ${statusKm === 'danger' ? '#E24B4A' : (statusKm === 'warn' ? '#EF9F27' : '#1D9E75')}; margin: 8px 0;">💡 เหลือ ${Math.max(0, kmRemaining).toLocaleString('th-TH')} กม. จนถึงครั้งต่อไป</p>
            </div>
            <span class="status ${statusKm}" style="white-space: nowrap; margin-left: 10px;">${getStatusText(statusKm)}</span>
          </div>
        </div>
      `;
    } else {
      return `
        <div style="background: #f5f5f5; padding: 12px; margin-bottom: 10px; border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong>📅 ${m.name}</strong>
              <p style="font-size: 12px; color: #666; margin: 5px 0;">กำหนด: ${formatDate(m.dueDate)}</p>
              <p style="font-size: 12px; color: #666;">${m.notes}</p>
            </div>
            <span class="status ${m.status}" style="white-space: nowrap;">${getStatusText(m.status)}</span>
          </div>
        </div>
      `;
    }
  }).join("");

  modal.style.display = "block";
}

// =======================
// เปลี่ยนแปลงค่า
// =======================
function showEditModal(){
  if(!selectedVehicle) return;

  const editModal = document.getElementById("editModal");
  const editContent = document.getElementById("editContent");

  // Generate maintenance items HTML
  const maintenanceHTML = selectedVehicle.maintenance.map(m => {
    if(m.type === "km"){
      const nextServiceKm = m.lastServiceKm + m.kmInterval;
      const kmRemaining = nextServiceKm - selectedVehicle.currentMileage;
      const statusClass = kmRemaining < 0 ? 'danger' : (kmRemaining <= 3000 ? 'warn' : 'ok');
      
      return `
        <div style="background: #f9f9f9; padding: 12px; border-radius: 8px; border: 1px solid #ddd; margin-bottom: 10px;">
          <label style="display: block; font-weight: bold; margin-bottom: 8px;">⛽ ${m.name}</label>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
            <div>
              <label style="display: block; font-size: 12px; color: #666; margin-bottom: 4px;">ครั้งล่าสุด (กม.):</label>
              <input type="text" id="lastKm_${m.id}" value="${m.lastServiceKm.toLocaleString('th-TH')}" oninput="formatNumberInput(this); updateKmDisplay(${m.id}, ${m.kmInterval})" style="width: 100%; padding: 6px; border: 1px solid #ccc; border-radius: 4px;">
            </div>
            <div>
              <p style="font-size: 12px; color: #666; margin: 0 0 4px 0;">ระยะห่าง:</p>
              <p style="font-size: 14px; font-weight: bold; margin: 0;">${m.kmInterval.toLocaleString('th-TH')} กม.</p>
            </div>
          </div>
          <div style="background: #fff3cd; padding: 10px; border-radius: 4px;">
            <p style="font-size: 12px; color: #856404; margin: 0;">ครั้งถัดไป: <strong id="nextKm_${m.id}">${nextServiceKm.toLocaleString('th-TH')}</strong> กม.</p>
            <p style="font-size: 12px; color: #856404; margin: 5px 0 0 0;">เหลือ <strong id="kmRemaining_${m.id}">${Math.max(0, kmRemaining).toLocaleString('th-TH')}</strong> กม.</p>
          </div>
        </div>
      `;
    } else {
      return `
        <div style="background: #f9f9f9; padding: 12px; border-radius: 8px; border: 1px solid #ddd; margin-bottom: 10px;">
          <label style="display: block; font-weight: bold; margin-bottom: 8px;">📅 ${m.name}</label>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
            <div>
              <label style="display: block; font-size: 12px; color: #666; margin-bottom: 4px;">กำหนด:</label>
              <input type="date" id="date_${m.id}" value="${m.dueDate}" onchange="updateAutoStatus(${m.id})" style="width: 100%; padding: 6px; border: 1px solid #ccc; border-radius: 4px;">
            </div>
            <div>
              <label style="display: block; font-size: 12px; color: #666; margin-bottom: 4px;">สถานะ: (อัตโนมัติ)</label>
              <select id="status_${m.id}" disabled style="width: 100%; padding: 6px; border: 1px solid #ccc; border-radius: 4px; background: #e8f5e9; cursor: not-allowed;">
                <option value="ok">ปกติ</option>
                <option value="warn">เตือน</option>
                <option value="danger">เร่งด่วน</option>
              </select>
            </div>
          </div>
          
          <div>
            <label style="display: block; font-size: 12px; color: #666; margin-bottom: 4px;">หมายเหตุ:</label>
            <input type="text" id="notes_${m.id}" value="${m.notes}" placeholder="หมายเหตุ..." style="width: 100%; padding: 6px; border: 1px solid #ccc; border-radius: 4px;">
          </div>
        </div>
      `;
    }
  }).join("");

  // Set entire form at once
  editContent.innerHTML = `
    <div style="background: #e3f2fd; padding: 12px; border-radius: 8px; margin-bottom: 15px;">
      <label style="display: block; font-weight: bold; margin-bottom: 8px;">📊 ไมล์ปัจจุบัน:</label>
      <input type="text" id="currentMileage" value="${selectedVehicle.currentMileage.toLocaleString('th-TH')}" placeholder="เช่น 65,000 กม." oninput="formatNumberInput(this)" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px; margin-bottom: 8px;">
      <button class="btn-primary" onclick="saveCurrentMileage()" style="width: 100%; padding: 8px;">💾 บันทึกไมล์</button>
    </div>

    ${maintenanceHTML}

    <div style="margin-top: 20px; display: flex; gap: 10px;">
      <button onclick="closeEditModal()" style="background: #999; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; width: 100%; font-size: 14px;">ปิด</button>
    </div>
  `;

  // Set values for date-based items
  selectedVehicle.maintenance.forEach(m => {
    if(m.type !== "km"){
      const dateInput = document.getElementById(`date_${m.id}`);
      const statusInput = document.getElementById(`status_${m.id}`);
      const notesInput = document.getElementById(`notes_${m.id}`);
      
      if(dateInput) dateInput.value = m.dueDate;
      if(statusInput) statusInput.value = m.status;
      if(notesInput) notesInput.value = m.notes;
    }
  });

  // Add event listeners for km-based items (wrapped in closure)
  selectedVehicle.maintenance.forEach(m => {
    if(m.type === "km"){
      setTimeout(() => {
        const lastKmInput = document.getElementById(`lastKm_${m.id}`);
        const mId = m.id;
        const kInt = m.kmInterval;
        if(lastKmInput){
          // Already has oninput handler in HTML, but ensure event listeners work
          lastKmInput.addEventListener("change", function(){
            updateKmDisplay(mId, kInt);
          });
        }
      }, 0);
    }
  });

  editModal.style.display = "block";
  document.getElementById("detailModal").style.display = "none";
}

// =======================
// Format ตัวเลขกับลูกน้ำ
// =======================
function formatNumberInput(inputElement){
  // Remove all non-digits
  let value = inputElement.value.replace(/[^0-9]/g, '');
  
  // Convert to number and format with commas
  if(value) {
    const num = parseInt(value);
    inputElement.value = num.toLocaleString('th-TH');
  }
}

// =======================
// อัปเดตการแสดงผล km-based
// =======================
function updateKmDisplay(maintenanceId, kmInterval){
  const lastKmInput = document.getElementById(`lastKm_${maintenanceId}`);
  if(!lastKmInput) return;
  
  // Parse value, removing any commas
  const lastKm = parseInt(lastKmInput.value.replace(/[^0-9]/g, '')) || 0;
  const nextServiceKm = lastKm + kmInterval;
  const kmRemaining = nextServiceKm - selectedVehicle.currentMileage;
  
  // Update display
  const nextKmElement = document.getElementById(`nextKm_${maintenanceId}`);
  const kmRemainingElement = document.getElementById(`kmRemaining_${maintenanceId}`);
  
  if(nextKmElement) nextKmElement.textContent = nextServiceKm.toLocaleString('th-TH');
  if(kmRemainingElement) kmRemainingElement.textContent = Math.max(0, kmRemaining).toLocaleString('th-TH');
}

// =======================
// บันทึกไมล์ปัจจุบัน
// =======================
function saveCurrentMileage(){
  if(!selectedVehicle) return;

  // Validate mileage input
  const newMileageInput = document.getElementById("currentMileage");
  if(!newMileageInput) {
    alert("ไม่พบช่องไมล์ปัจจุบัน");
    return;
  }
  
  // Parse value, removing all non-digits
  const newMileage = parseInt(newMileageInput.value.replace(/[^0-9]/g, ''));
  if(isNaN(newMileage) || newMileage < 0) {
    alert("กรุณากรอกตัวเลขไมล์ที่ถูกต้อง");
    return;
  }
  
  // Update current mileage
  selectedVehicle.currentMileage = newMileage;

  // Update all maintenance items
  selectedVehicle.maintenance.forEach(m => {
    if(m.type === "km"){
      // Get updated lastServiceKm from input
      const lastKmInput = document.getElementById(`lastKm_${m.id}`);
      if(lastKmInput){
        const lastKm = parseInt(lastKmInput.value.replace(/[^0-9]/g, ''));
        if(!isNaN(lastKm) && lastKm >= 0){
          m.lastServiceKm = lastKm;
        }
      }
      // Calculate status for km-based items
      const nextServiceKm = m.lastServiceKm + m.kmInterval;
      const kmRemaining = nextServiceKm - selectedVehicle.currentMileage;
      m.status = kmRemaining < 0 ? 'danger' : (kmRemaining <= 3000 ? 'warn' : 'ok');
    } else {
      // Update date-based items from form inputs
      const dateInput = document.getElementById(`date_${m.id}`);
      const statusInput = document.getElementById(`status_${m.id}`);
      const notesInput = document.getElementById(`notes_${m.id}`);
      
      if(dateInput) m.dueDate = dateInput.value;
      if(statusInput) m.status = statusInput.value;
      if(notesInput) m.notes = notesInput.value;
    }
  });

  closeEditModal();
  showDetailModal();
  render();
  updateStatusLegend();
  saveVehicles();
}

// =======================
// อัปเดตการแสดงผล ครั้งถัดไป
// =======================
function updateNextServiceDisplay(){
  const currentMileage = parseInt(document.getElementById("currentMileage").value) || 0;
  
  selectedVehicle.maintenance.forEach(m => {
    if(m.type === "km"){
      const nextServiceKm = m.lastServiceKm + m.kmInterval;
      const kmRemaining = nextServiceKm - currentMileage;
      const statusClass = kmRemaining < 0 ? 'danger' : (kmRemaining <= 3000 ? 'warn' : 'ok');
      
      const nextKmElement = document.getElementById(`nextKm_${m.id}`);
      if(nextKmElement){
        nextKmElement.textContent = nextServiceKm.toLocaleString('th-TH');
      }
    }
  });
}

// =======================
// ปิด Modal
// =======================
function closeDetailModal(){
  document.getElementById("detailModal").style.display = "none";
  selectedVehicle = null;
}

function closeEditModal(){
  document.getElementById("editModal").style.display = "none";
}

// =======================
// ฟังก์ชันสมการ
// =======================
function formatDate(dateStr){
  const date = new Date(dateStr);
  return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
}

function getStatusText(status){
  const map = { 'ok': 'ปกติ', 'warn': 'เตือน', 'danger': 'เร่งด่วน' };
  return map[status] || status;
}
// =======================
// คำนวณสถานะอัตโนมัติ
// =======================
function updateAutoStatus(maintenanceId){
  const newDate = document.getElementById(`date_${maintenanceId}`).value;
  const newStatus = calculateStatus(newDate);
  document.getElementById(`status_${maintenanceId}`).value = newStatus;
}
function calculateStatus(dueDate){
  const today = new Date();
  const due = new Date(dueDate);
  
  // ลบเวลาออก เหลือแค่วันที่
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  
  const daysLeft = Math.floor((due - today) / (1000 * 60 * 60 * 24));
  
  if(daysLeft < 0) return 'danger';  // เลยกำหนดแล้ว
  if(daysLeft <= 7) return 'warn';   // ใกล้ครบกำหนด (เหลือ 7 วันขึ้นไป)
  return 'ok';                        // ปกติ
}
// =======================
// สร้างการ์ดรถ
// =======================
function cardHTML(v){

  let worstStatus = 'ok';
  
  v.maintenance.forEach(m => {
    let itemStatus = m.status;
    
    // Calculate status for km-based items on the fly
    if(m.type === "km"){
      const nextServiceKm = m.lastServiceKm + m.kmInterval;
      const kmRemaining = nextServiceKm - v.currentMileage;
      itemStatus = kmRemaining < 0 ? 'danger' : (kmRemaining <= 3000 ? 'warn' : 'ok');
    }
    
    const priority = { 'danger': 3, 'warn': 2, 'ok': 1 };
    if(priority[itemStatus] > priority[worstStatus]) {
      worstStatus = itemStatus;
    }
  });

  return `
    <div class="card" onclick="openDetail(${v.id})" style="cursor: pointer; transition: all 0.3s; overflow: hidden;">
      <div style="width: 100%; height: 180px; overflow: hidden; border-radius: 8px; margin-bottom: 12px;">
        <img src="${v.image}" alt="${v.name}" style="width: 100%; height: 100%; object-fit: cover;">
      </div>
      <h3>${v.name}</h3>
      <p><strong>รุ่น:</strong> ${v.model}</p>
      <p><strong>ทะเบียน:</strong> ${v.plate}</p>
      <p>ประเภท: ${v.type === 'car' ? 'รถยนต์' : 'มอเตอร์ไซต์'}</p>
      <p style="margin-top: 10px;">
        <span class="status ${worstStatus}" style="cursor: pointer;">สถานะ: ${getStatusText(worstStatus)}</span>
      </p>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px;">
        <button class="btn-primary" onclick="event.stopPropagation(); selectedVehicle = vehicles.find(v => v.id === ${v.id}); showEditModal();" style="width: 100%;">✏️ แก้ไข</button>
        <button onclick="event.stopPropagation(); deleteVehicle(${v.id});" style="background: #E24B4A; color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-weight: bold;">🗑️ ลบ</button>
      </div>
    </div>
  `;
}

// =======================
// เพิ่มรถใหม่
// =======================
function openAddVehicleModal(){
  document.getElementById("addVehicleModal").style.display = "block";
  // Reset form
  document.getElementById("addVehicleName").value = "";
  document.getElementById("addVehicleModel").value = "";
  document.getElementById("addVehiclePlate").value = "";
  document.getElementById("addVehicleType").value = "car";
  document.getElementById("addVehicleMileage").value = "";
  document.getElementById("previewImage").style.display = "none";
  document.getElementById("previewContent").style.display = "block";
  window.vehicleImageData = null;
}

function closeAddVehicleModal(){
  document.getElementById("addVehicleModal").style.display = "none";
  window.vehicleImageData = null;
}

function deleteVehicle(vehicleId){
  const vehicle = vehicles.find(v => v.id === vehicleId);
  if(!vehicle){
    alert("ไม่พบข้อมูลรถ");
    return;
  }
  
  if(confirm(`ยืนยันการลบรถ: ${vehicle.name}?\n\nการกระทำนี้ไม่สามารถยกเลิกได้`)){
    // Remove vehicle from array
    vehicles = vehicles.filter(v => v.id !== vehicleId);
    
    // Close modal and refresh
    closeDetailModal();
    render();
    updateStatusLegend();
    saveVehicles();
  }
}

function handleImageUpload(input){
  if(input.files && input.files[0]){
    const reader = new FileReader();
    reader.onload = function(e){
      window.vehicleImageData = e.target.result;
      document.getElementById("previewImage").src = e.target.result;
      document.getElementById("previewImage").style.display = "block";
      document.getElementById("previewContent").style.display = "none";
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function saveNewVehicle(){
  const name = document.getElementById("addVehicleName").value.trim();
  const model = document.getElementById("addVehicleModel").value.trim();
  const plate = document.getElementById("addVehiclePlate").value.trim();
  const type = document.getElementById("addVehicleType").value;
  const mileageInput = document.getElementById("addVehicleMileage").value;
  
  // Validate inputs
  if(!name){
    alert("กรุณากรอกชื่อรถ");
    return;
  }
  if(!model){
    alert("กรุณากรอกรุ่นรถ");
    return;
  }
  if(!plate){
    alert("กรุณากรอกทะเบียนรถ");
    return;
  }
  if(!mileageInput){
    alert("กรุณากรอกไมล์ปัจจุบัน");
    return;
  }
  
  if(!window.vehicleImageData){
    alert("กรุณาอัปโหลดรูปภาพรถ");
    return;
  }
  
  // Parse mileage
  const mileage = parseInt(mileageInput.replace(/[^0-9]/g, ''));
  if(isNaN(mileage) || mileage < 0){
    alert("กรุณากรอกไมล์ที่ถูกต้อง");
    return;
  }
  
  // Generate new ID
  const newId = Math.max(...vehicles.map(v => v.id), 0) + 1;
  
  // Create default maintenance items based on type
  let defaultMaintenance = [];
  if(type === "car"){
    defaultMaintenance = [
      { id: 1, name: "น้ำมันเครื่อง", type: "km", kmInterval: 10000, lastServiceKm: mileage, status: "ok", notes: "" },
      { id: 2, name: "ยาง", type: "km", kmInterval: 50000, lastServiceKm: mileage, status: "ok", notes: "" },
      { id: 3, name: "ภาษีรถ", type: "date", dueDate: "2027-04-20", status: "ok", notes: "ต้องต่อภาษี" },
      { id: 4, name: "น้ำมันเกียร์", type: "km", kmInterval: 40000, lastServiceKm: mileage, status: "ok", notes: "" }
    ];
  } else {
    defaultMaintenance = [
      { id: 1, name: "น้ำมันเครื่อง", type: "km", kmInterval: 2000, lastServiceKm: mileage, status: "ok", notes: "" },
      { id: 2, name: "ยาง", type: "km", kmInterval: 30000, lastServiceKm: mileage, status: "ok", notes: "" },
      { id: 3, name: "ภาษีรถ", type: "date", dueDate: "2027-04-20", status: "ok", notes: "ต้องต่อภาษี" },
      { id: 4, name: "โซ่ สเตอร์", type: "km", kmInterval: 20000, lastServiceKm: 0, status: "ok", notes: "" }
    ];
  }
  
  // Create new vehicle
  const newVehicle = {
    id: newId,
    type: type,
    name: name,
    model: model,
    plate: plate,
    image: window.vehicleImageData,
    currentMileage: mileage,
    maintenance: defaultMaintenance
  };
  
  // Add to vehicles array
  vehicles.push(newVehicle);
  
  // Close modal and refresh display
  closeAddVehicleModal();
  render();
  updateStatusLegend();
  saveVehicles();
}

// =======================
// ระบบค้นหา
// =======================
function render(){

  const q = document
    .getElementById("searchInput")
    .value
    .toLowerCase()
    .trim();

  let list = vehicles;

  // ระบบค้นหาแบบยืดหยุ่น (ค้นหาชื่อ, รุ่น, ทะเบียน แบบบางส่วน)
  if(q){

    list = list.filter(v => {

      // ทำความเป็นตัวพิมพ์เล็ก
      const name = (v.name || "").toLowerCase();
      const model = (v.model || "").toLowerCase();
      const plate = (v.plate || "").toLowerCase();

      // ลบช่องว่างออก
      const nameClean = name.replace(/\s+/g,"");
      const modelClean = model.replace(/\s+/g,"");
      const plateClean = plate.replace(/\s+/g,"");
      const qClean = q.replace(/\s+/g,"");

      // ค้นหาแบบยืดหยุ่น (รองรับค้นหาบางส่วน)
      return (

        // ค้นหาชื่อรถบางส่วน
        name.includes(q) ||
        nameClean.includes(qClean) ||

        // ค้นหารุ่นรถบางส่วน
        model.includes(q) ||
        modelClean.includes(qClean) ||

        // ค้นหาทะเบียนบางส่วน
        plate.includes(q) ||
        plateClean.includes(qClean)

      );

    });

  }

  const grid = document.getElementById("vehiclesGrid");

  grid.innerHTML = list.length
    ? list.map(cardHTML).join("")
    : `<div class="empty" style="text-align: center; padding: 40px; color: #999;">ไม่พบข้อมูล</div>`;

}

render();
updateStatusLegend();