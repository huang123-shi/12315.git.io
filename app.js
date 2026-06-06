// =======================
// 1. 校园 POI 数据
// 这里使用前端本地数组来模拟校园内地点数据
// 你后续可以根据实际情况修改名称和坐标
// =======================
const campusPOIs = [
  {
    name: "龙岩学院图书馆",
    type: "学习",
    address: "龙岩学院校内图书馆",
    position: [117.0385, 25.1008]
  },
  {
    name: "第一食堂",
    type: "餐饮",
    address: "龙岩学院校内第一食堂",
    position: [117.0376, 25.1002]
  },
  {
    name: "第二食堂",
    type: "餐饮",
    address: "龙岩学院校内第二食堂",
    position: [117.0392, 25.1010]
  },
  {
    name: "学生宿舍A区",
    type: "宿舍",
    address: "龙岩学院学生宿舍A区",
    position: [117.0368, 25.0995]
  },
  {
    name: "学生宿舍B区",
    type: "宿舍",
    address: "龙岩学院学生宿舍B区",
    position: [117.0400, 25.0998]
  },
  {
    name: "体育馆",
    type: "运动",
    address: "龙岩学院体育馆",
    position: [117.0412, 25.1005]
  },
  {
    name: "行政楼",
    type: "办公",
    address: "龙岩学院行政楼",
    position: [117.0389, 25.1018]
  },
  {
    name: "教学楼1号楼",
    type: "教学",
    address: "龙岩学院教学楼1号楼",
    position: [117.0379, 25.1013]
  },
  {
    name: "教学楼2号楼",
    type: "教学",
    address: "龙岩学院教学楼2号楼",
    position: [117.0398, 25.1015]
  },
  {
    name: "校医院",
    type: "医疗",
    address: "龙岩学院校医院",
    position: [117.0369, 25.1009]
  }
];

// =======================
// 2. 全局变量
// =======================
let map = null;
let currentPosition = null; // 当前定位位置
let currentMarker = null;   // 当前定位点标记
let poiMarkers = [];        // POI 标记集合
let walking = null;         // 路径规划对象

// 龙岩学院中心点（示例坐标，可根据实际微调）
const campusCenter = [117.0388, 25.1008];

// =======================
// 3. 初始化地图
// =======================
function initMap() {
  map = new AMap.Map("map", {
    zoom: 17,
    center: campusCenter,
    viewMode: "2D"
  });

  // 添加地图控件
  map.plugin(["AMap.Scale", "AMap.ToolBar"], function () {
    map.addControl(new AMap.Scale());
    map.addControl(new AMap.ToolBar());
  });

  // 初始化步行路线规划
  walking = new AMap.Walking({
    map: map
  });

  // 初始加载校园 POI
  renderPOIMarkers(campusPOIs);
}

// =======================
// 4. 渲染校园 POI 到地图
// =======================
function renderPOIMarkers(poiList) {
  // 先清除原有标记
  if (poiMarkers.length > 0) {
    map.remove(poiMarkers);
    poiMarkers = [];
  }

  poiList.forEach((poi) => {
    const marker = new AMap.Marker({
      position: poi.position,
      title: poi.name,
      map: map
    });

    marker.on("click", function () {
      showPOIInfo(poi);
      map.setCenter(poi.position);
    });

    poiMarkers.push(marker);
  });

  map.add(poiMarkers);
}

// =======================
// 5. 显示单个 POI 信息窗体
// =======================
function showPOIInfo(poi) {
  const infoWindow = new AMap.InfoWindow({
    content: `
      <div style="padding:10px;">
        <h3 style="margin-bottom:8px;">${poi.name}</h3>
        <p>类型：${poi.type}</p>
        <p>地址：${poi.address}</p>
        <button onclick='planRouteToPOI(${JSON.stringify(poi.position)})' style="
          margin-top:8px;
          width:100%;
          height:32px;
          background:#1677ff;
          color:#fff;
          border:none;
          border-radius:4px;
          cursor:pointer;
        ">到这里去</button>
      </div>
    `,
    offset: new AMap.Pixel(0, -30)
  });

  infoWindow.open(map, poi.position);
}

// =======================
// 6. 搜索校园 POI
// 按名称、类型、地址进行模糊搜索
// =======================
function searchCampusPOI() {
  const keyword = document.getElementById("keyword").value.trim();
  const resultList = document.getElementById("resultList");
  resultList.innerHTML = "";

  if (!keyword) {
    alert("请输入搜索关键词");
    return;
  }

  const results = campusPOIs.filter((poi) => {
    return (
      poi.name.includes(keyword) ||
      poi.type.includes(keyword) ||
      poi.address.includes(keyword)
    );
  });

  if (results.length === 0) {
    resultList.innerHTML = "<li>未找到相关地点</li>";
    return;
  }

  renderPOIMarkers(results);

  results.forEach((poi) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${poi.name}</strong><br>
      类型：${poi.type}<br>
      地址：${poi.address}
    `;

    li.addEventListener("click", function () {
      map.setCenter(poi.position);
      map.setZoom(18);
      showPOIInfo(poi);
    });

    resultList.appendChild(li);
  });
}

// =======================
// 7. 获取当前位置
// =======================
function locateMe() {
  map.plugin("AMap.Geolocation", function () {
    const geolocation = new AMap.Geolocation({
      enableHighAccuracy: true,
      timeout: 10000,
      buttonPosition: "RB",
      zoomToAccuracy: true
    });

    geolocation.getCurrentPosition(function (status, result) {
      if (status === "complete") {
        currentPosition = [result.position.lng, result.position.lat];

        // 更新当前位置文字
        document.getElementById("locationInfo").innerText =
          `经度：${result.position.lng.toFixed(6)}，纬度：${result.position.lat.toFixed(6)}`;

        // 删除旧定位点
        if (currentMarker) {
          map.remove(currentMarker);
        }

        // 新建当前位置标记
        currentMarker = new AMap.Marker({
          position: currentPosition,
          title: "我的位置",
          map: map,
          icon: "https://webapi.amap.com/theme/v1.3/markers/n/mark_bs.png"
        });

        map.setCenter(currentPosition);
        map.setZoom(17);
      } else {
        alert("定位失败，请检查是否允许浏览器获取位置");
        console.error(result);
      }
    });
  });
}

// =======================
// 8. 路径规划到某个 POI
// 默认起点为当前位置
// =======================
function planRouteToPOI(destination) {
  if (!currentPosition) {
    alert("请先点击“我的位置”进行定位，再进行路径规划");
    return;
  }

  walking.clear();

  walking.search(currentPosition, destination, function (status, result) {
    if (status === "complete") {
      console.log("路径规划成功", result);
    } else {
      alert("路径规划失败，请重试");
      console.error(result);
    }
  });
}

// 为了让 infoWindow 中按钮能调用
window.planRouteToPOI = planRouteToPOI;

// =======================
// 9. 清除路线
// =======================
function clearRoute() {
  if (walking) {
    walking.clear();
  }
}

// =======================
// 10. 绑定事件
// =======================
function bindEvents() {
  document.getElementById("searchBtn").addEventListener("click", searchCampusPOI);
  document.getElementById("locateBtn").addEventListener("click", locateMe);
  document.getElementById("clearRouteBtn").addEventListener("click", clearRoute);

  document.getElementById("keyword").addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      searchCampusPOI();
    }
  });
}

// =======================
// 11. 页面加载完成后执行
// =======================
window.onload = function () {
  initMap();
  bindEvents();
};