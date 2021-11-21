const mapid = document.querySelector('.mapid ');

const mapMain = document.querySelector('.mapMain');
// cover
const cover = document.querySelector('.cover');
// 覆蓋圖
const bicycleTraval = document.querySelector('#bicycleTraval')
// 進入圖
const navbarQ = document.querySelector('.navbarQ');
// 資訊紐
const navbarQNews = document.querySelector('.navbarQNews');
// 資訊欄
const faMap = document.querySelector('#fa-map');
const rentBic = document.querySelector('.rentBic');
//當前座標
const searchPad = document.querySelector('.searchPad');
const searchBar = document.querySelector('.searchBar')

var myIcon = L.icon({
    iconUrl: '/pic/blueBear.svg',
    iconSize: [50, 50],

});

// cover監聽
cover.addEventListener('click',function(e){
    cover.classList.add('flyRight');
    cover.classList.add('z-index');
    bicycleTraval.classList.add('circleLelt')
    mapid.classList.remove('z-index');
})
// 首頁圖監聽
bicycleTraval.addEventListener('click',function(e){
    cover.classList.add('flyRight');
    cover.classList.add('z-index');
    bicycleTraval.classList.add('circleLelt')
    mapid.classList.remove('z-index');
})
// 資訊欄監聽
navbarQ.addEventListener('click',function(e){
  // console.log(mapMain.classList);
    cover.classList.add('flyRight');
    bicycleTraval.classList.add('circleLelt');
    cover.classList.add('z-index');
    mapid.classList.toggle('z-index');
    navbarQNews.classList.toggle('d-flex');
    navbarQNews.classList.toggle('d-none');
    navbarQNews.classList.toggle('z-index')    
})


//自行車資訊開始
const ServiceStatus = ['停止營運','正常營運','暫停營運'] 
const ServiceType =  ['YouBike1.0','YouBike2.0'] 
// console.log(ServiceStatus);
// console.log(ServiceType);


// Mapbox
const mymap = L.map('mapid').setView([0, 0], 18);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 26,
  id: 'mapbox/streets-v11',
  tileSize: 512,
  zoomOffset: -1,
  accessToken: 'pk.eyJ1IjoicGV0ZXI3NzczMCIsImEiOiJja3Vwa3A0OXUwMjY4Mm5vNnhwdnZhdTlyIn0.Dg3LQDPYUDWXLN1-sIohMA'
}).addTo(mymap);


// 使用 navigator web api 獲取當下位置(經緯度)
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function (position) {
      const longitude = position.coords.longitude;  // 經度
      const latitude = position.coords.latitude;  // 緯度
      // console.log(longitude)
      // console.log(latitude)

      // 重新設定 view 的位置
      mymap.setView([latitude, longitude], 13);
      // 將經緯度當作參數傳給 getData 執行
      getStationData(longitude, latitude);
    },
    // 錯誤訊息
    function (e) {
      const msg = e.code;
      const dd = e.message;
       console.error(msg)
       console.error(dd)
    }
  )
}

// 串接附近的自行車租借站位資料
let data = [];
function getStationData(longitude, latitude) {
  axios({
    method: 'get',
    url: `https://ptx.transportdata.tw/MOTC/v2/Bike/Station/NearBy?$spatialFilter=nearby(${latitude},${longitude},500)`,
    headers: GetAuthorizationHeader()
  })
    .then((response) => {
      // console.log('租借站位資料',response)
      data = response.data;
      // console.log(data);
      getAvailableData(longitude, latitude);

    })
    .catch((error) => console.log('error', error))
}


// 串接附近的即時車位資料
let filterData = [];
function getAvailableData(longitude, latitude) {
  axios({
    method: 'get',
    // url: 'https://ptx.transportdata.tw/MOTC/v2/Bike/Availability/Kaohsiung',
    url: `https://ptx.transportdata.tw/MOTC/v2/Bike/Availability/NearBy?$spatialFilter=nearby(${latitude},${longitude},500)`,
    headers: GetAuthorizationHeader()
  })
    .then((response) => {
      // console.log('車位資料',response)
      const availableData = response.data;
    
      // 比對
      availableData.forEach((availableItem) => {
        data.forEach((stationItem) => {
          // console.log(stationItem);
          if (availableItem.StationUID === stationItem.StationUID) {
            availableItem.StationName = stationItem.StationName
            availableItem.StationAddress = stationItem.StationAddress
            availableItem.StationPosition = stationItem.StationPosition
            filterData.push(availableItem)
          }
        })
      })
      // console.log('filterData', filterData)
      setMarker();

    })
    .catch((error) => console.log('error', error))
}



// 標記 icon
function setMarker() {
  filterData.forEach((item) => {
    // console.log(item.StationPosition.PositionLon, item.StationPosition.PositionLat)
    L.marker([item.StationPosition.PositionLat, item.StationPosition.PositionLon],{icon: myIcon}).addTo(mymap).bindPopup(
      `<div class="bicycleRent">
      <div class="bicycleRentMain">
          <div class="circle"></div>
          <h4>${ServiceStatus[item.ServiceStatus]}</h4>
      </div>
      <h2>${item.StationName['Zh_tw']}</h2>
      <h5>${item.StationName['En']}</h5>
      <h4>${item.StationAddress['Zh_tw']}</h4>
      <h5>${item.StationAddress['En']}</h5>
      <h5>更新時間：${item.UpdateTime}</h5>
      <div class="bicycleRentInfo">
          <div class="AvailableRentBikes">
              <h2>可借車輛</h2>
              <h1>${item.AvailableRentBikes}</h1>
          </div>
          <div class="AvailableReturnBikes">
              <h2>可停車位</h2>
              <h1>${item.AvailableReturnBikes}</h1>
          </div>
      </div>
  </div>`
    )
  })
}

//當前座標監聽
faMap.addEventListener('click',function(){
  setMarker();
})
rentBic.addEventListener('click',function(){
  setMarker();
})


//搜尋欄監聽
const lineSearch = document.querySelector('.lineSearch');
searchPad.addEventListener('click',function(){
  searchBar.classList.toggle('searchBarTransform');
  mapMain.classList.toggle('z-index');
})

lineSearch.addEventListener('click',function(){
  searchBar.classList.toggle('searchBarTransform');
  mapMain.classList.toggle('z-index');
})

//搜尋框
const city = document.querySelector('#city');
city.addEventListener('change',function(){
  let cityValue = city.value
  getAreaData(cityValue);
})

// 串接選擇地區的自行車資料
let searchData = [];
function getAreaData(cityValue) {
  axios({
    method: 'get',
    url: `https://ptx.transportdata.tw/MOTC/v2/Cycling/Shape/${cityValue}?$format=JSON`,
    headers: GetAuthorizationHeader()
  })
    .then((response) => {
      console.log('地區腳踏車租借',response)
      searchData = response.data;
      // console.log(searchData);
      townSelect();
    })
    .catch((error) => console.log('error', error))
}

// 選擇鄉鎮資料
const area = document.querySelector('#area')
const bicycleForm = document.querySelector('.bicycleForm');
function townSelect(){
  console.log(searchData[0].Town);
  str = `<option value="選擇鄉鎮">選擇鄉鎮</option>`
  let data = {
    undefined :0
  };
  searchData.forEach(function(item){
    // console.log(item.Town);
    if (data[item.Town] == undefined){
      str += `<option value="${item.Town}">${item.Town}</option>`
      data[item.Town] = 1;
    }else{
      data[item.Town] += 1;
    }
  })
  // console.log(data);
  // console.log(str);
  area.innerHTML = str;
}

let searchNewData = [];
  area.addEventListener('change',function(){
    console.log(area.value);
    let str = ""
    searchData.forEach(function(item){
      console.log(item);
      if(item.Town == area.value){
        str += `<div class="bicycleFormHover" name="${item.RouteName}"><h3 class="bicycleFormName">${item.RouteName}</h3>
      <h4>起點：${item.RoadSectionStart}</h4>
      <h4>終點：${item.RoadSectionEnd}</h4>
      <h5>全長:${item.CyclingLength}m</h5></div>       
      <div class="line"></div>`
      searchNewData.push(item);
      }
      
    })
    bicycleForm.innerHTML = str;
    //監聽所有class為bicycleFormHover的事件
    const bicycleFormHover = document.querySelectorAll('.bicycleFormHover')
    bicycleFormHover.forEach((el) => {
      el.addEventListener('click', () => {
        let roteName = el.getAttribute('name');
        // searchBar.classList.remove('searchBarTransform');

        // console.log(roteName);
        roteNameF(roteName);
      })
    })
  })

  function roteNameF(roteName){
    // console.log(searchNewData);
    searchNewData.forEach(function(item){
      console.log(item.RouteName);
      console.log(roteName);
      if(item.RouteName == roteName){
          geo = item.Geometry;
          // console.log(geo)
          
          // 畫線的方法
          polyLine(geo);
      }
    })
  }

  let myLayer = null;

function polyLine(geo) {
  // 建立一個 wkt 的實體
  const wicket = new Wkt.Wkt();
  const geojsonFeature = wicket.read(geo).toJson()
  
  // 預設樣式
  // myLayer = L.geoJSON(geojsonFeature).addTo(mymap);

  const myStyle = {
    "color": "#ff0000",
    "weight": 5,
    "opacity": 0.65
  };
  const myLayer = L.geoJSON(geojsonFeature, {
    style: myStyle
  }).addTo(mymap);


  myLayer.addData(geojsonFeature);
  // zoom the map to the layer
  mymap.fitBounds(myLayer.getBounds());

}


//載入交通部API金鑰
function GetAuthorizationHeader() {
  var AppID = '5f26e8783f97436e95dd2706ae3e476c';//Peter Chen擁有
  var AppKey = 'KckLmAGtZVRJyvvMA7aQoFg4XP0';//Peter Chen擁有

  var GMTString = new Date().toGMTString();
  var ShaObj = new jsSHA('SHA-1', 'TEXT');
  ShaObj.setHMACKey(AppKey, 'TEXT');
  ShaObj.update('x-date: ' + GMTString);
  var HMAC = ShaObj.getHMAC('B64');
  var Authorization = 'hmac username=\"' + AppID + '\", algorithm=\"hmac-sha1\", headers=\"x-date\", signature=\"' + HMAC + '\"';

  return { 'Authorization': Authorization, 'X-Date': GMTString /*,'Accept-Encoding': 'gzip'*/}; //如果要將js運行在伺服器，可額外加入 'Accept-Encoding': 'gzip'，要求壓縮以減少網路傳輸資料量
}
