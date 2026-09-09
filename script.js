// Cấu hình Firebase Realtime Database
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

let db = null;
try {
  firebase.initializeApp(firebaseConfig);
  db = firebase.database();
} catch (e) {
  console.warn("Chạy ở chế độ mô phỏng giao diện tĩnh.");
}

let isDryerActive = false;

document.addEventListener('DOMContentLoaded', () => {
  const heightSlider = document.getElementById('height-slider');
  const heightVal = document.getElementById('height-val');
  const btnLift = document.getElementById('btn-lift');
  const btnLower = document.getElementById('btn-lower');
  const btnEstop = document.getElementById('btn-estop');
  const btnDryer = document.getElementById('dryer-btn');
  const btnSaveSchedule = document.getElementById('btn-save-schedule');

  heightSlider.addEventListener('input', (e) => {
    const val = e.target.value;
    heightVal.innerText = `${val}%`;
    if (db) db.ref('clothes_rack/target_height').set(parseInt(val));
  });

  btnLift.addEventListener('click', () => sendAction('lift_up'));
  btnLower.addEventListener('click', () => sendAction('lower_down'));
  btnEstop.addEventListener('click', () => sendAction('stop'));
  btnDryer.addEventListener('click', toggleDryer);
  btnSaveSchedule.addEventListener('click', saveSchedule);

  initFirebaseSensors();
});

function sendAction(actionType) {
  console.log("Lệnh điều khiển:", actionType);
  if (db) db.ref('clothes_rack/command').set(actionType);
}

function toggleDryer() {
  isDryerActive = !isDryerActive;
  const btn = document.getElementById('dryer-btn');
  if (isDryerActive) {
    btn.innerText = "BẬT";
    btn.className = "px-4 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white transition";
  } else {
    btn.innerText = "TẮT";
    btn.className = "px-4 py-1.5 rounded-lg text-xs font-bold bg-slate-200 text-slate-600 transition";
  }
  if (db) db.ref('clothes_rack/dryer_state').set(isDryerActive);
}

function saveSchedule() {
  const dropTime = document.getElementById('schedule-drop').value;
  const liftTime = document.getElementById('schedule-lift').value;
  alert(`Đã lưu lịch: Tự động phơi lúc ${dropTime} và thu gom lúc ${liftTime}`);
  if (db) {
    db.ref('clothes_rack/schedule').set({
      drop: dropTime,
      lift: liftTime
    });
  }
}

function initFirebaseSensors() {
  if (!db) return;

  db.ref('clothes_rack/sensors').on('value', (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    if (data.temperature) document.getElementById('temp-val').innerText = data.temperature;
    if (data.humidity) document.getElementById('hum-val').innerText = data.humidity;
    
    // Trạng thái mưa
    const rainEl = document.getElementById('rain-status');
    if (data.is_rain) {
      rainEl.innerText = "Phát Hiện Trời Mưa!";
      rainEl.className = "font-bold text-rose-600";
    } else {
      rainEl.innerText = "Trời Khô Ráo";
      rainEl.className = "font-bold text-blue-600";
    }

    // Cảnh báo Anti-tangle
    const tangleBox = document.getElementById('tangle-box');
    const tangleStatus = document.getElementById('tangle-status');
    if (data.is_tangled) {
      tangleBox.className = "p-3 bg-rose-50 border border-rose-300 rounded-xl flex items-center justify-between animate-pulse";
      tangleStatus.innerText = "KẸT CÁP / RỐI DÂY";
      tangleStatus.className = "text-[11px] font-bold uppercase bg-rose-200 text-rose-800 px-2 py-0.5 rounded";
    } else {
      tangleBox.className = "p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between";
      tangleStatus.innerText = "ỔN ĐỊNH";
      tangleStatus.className = "text-[11px] font-bold uppercase bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded";
    }
  });
}
