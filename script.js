// ----------------------------------- Selectors -----------------------------------
const days = document.querySelector(".days");
const hourly = document.querySelector(".hourly");
const currentMain = document.querySelector(".current-container");
const currentDetails = document.querySelector(".current-details-container");
const hourlySlider = document.querySelector(".hourly");
const dailySlider = document.querySelector(".days");

let isDown = false;
let startX;
let scrollLeft;
// ----------------------------------- Functions -----------------------------------

const getWeekDay = (timestamp) => {
  let dateObj = new Date(timestamp * 1000);
  return String(dateObj).substring(0, 3);
};

const createTime = (timestamp) => {
  let dateObj = new Date(timestamp * 1000);
  return String(dateObj).substring(16, 21);
};

const kelvinToCelsius = (kelvin) => {
  return Math.floor(kelvin - 273.15);
};

const createHour = (time, icon, temp, height) => {
  const hour = `<div class="hour">
                  <div class="time">${time}</div>
                  <img src="./icons/${icon}.svg" class="hour-icon" />
                  <div class="hour-temperature-container">
                    <div class="hour-scale-container" style="height: ${height}px">
                      <div class="hour-scale"></div>
                    </div>
                  </div>
                  <div class="hour-temperature">${temp}°C</div>
                </div>`;
  return hour;
};

const createDay = (date, icon, tempMax, tempMin, high, middle, low) => {
  const day = `<div class="day">
                <div class="date">${date}</div>
                <img src="./icons/${icon}.svg" class="daily-icon" />
                <div class="day-temperature-container">
                  <div class="day-max-temperature">${tempMax}°C</div>
                  <div class="day-scale-container">
                    <div class="day-scale scale-high" style="height: ${high}px"></div>
                    <div class="day-scale scale-middle" style="height: ${middle}px"></div>
                    <div class="day-scale scale-low" style="height: ${low}px"></div>
                  </div>
                  <div class="day-min-temperature">${tempMin}°C</div>
                </div>
               </div>`;
  return day;
};

const getHeights = (list) => {
  let max = list[0];
  let min = list[0];
  for (let i = 0; i < list.length; i++) {
    if (list[i] > max) {
      max = list[i];
    }
    if (list[i] < min) {
      min = list[i];
    }
  }

  const scala = max - min;
  const multiplier = 110 / scala;
  const heights = list.map((temp) => {
    const difference = temp - min;
    return Math.floor(difference * multiplier);
  });
  return heights;
};

window.addEventListener("load", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude;
      const long = position.coords.longitude;
      const time = position.timestamp;

      const APICall = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&exclude=minutely&appid=`;
      const APIKey = "d7a932016e5ed5c70fb62641942e2c8b";
      const APIRequest = APICall + APIKey;

      fetch(APIRequest)
        .then((response) => {
          const data = response.json();
          return data;
        })
        .then((data) => {
          // Create Hourly Forecast
          const dataHours = data.hourly;
          const data4hours = [];
          for (let i = 0; i < dataHours.length; i++) {
            if (i % 4 === 0) {
              data4hours.push(dataHours[i]);
            }
          }
          const tempList = data4hours.map((hour) => {
            return kelvinToCelsius(hour.temp);
          });
          const timeHeights = getHeights(tempList);
          let hours1 = [];
          timeHeights.forEach((height) => {
            hours1.push({ ["height"]: height + 10 });
          });
          let hours2 = [];
          data4hours.forEach((hour) => {
            hours2.push({
              ["time"]: createTime(hour.dt),
              ["icon"]: hour.weather[0].icon,
              ["temp"]: kelvinToCelsius(hour.temp),
            });
          });
          const hours3 = hours1.map((v, i) => ({ ...v, ...hours2[i] }));
          let hoursInnerHtml = "";
          hours3.forEach((hour) => {
            hoursInnerHtml += createHour(
              hour.time,
              hour.icon,
              hour.temp,
              hour.height
            );
          });
          hourly.innerHTML = hoursInnerHtml;

          // Create Daily Forecast
          const dataDays = data.daily;
          const daysObj = dataDays.map((day) => {
            return {
              ["day"]: getWeekDay(day.dt),
              ["icon"]: day.weather[0].icon,
              ["tempMax"]: kelvinToCelsius(day.temp.max),
              ["tempMin"]: kelvinToCelsius(day.temp.min),
            };
          });

          const tempsMax = daysObj.map((day) => {
            return day.tempMax;
          });

          const tempsMin = daysObj.map((day) => {
            return day.tempMin;
          });

          min_tempsMax = Math.min(...tempsMax);
          max_tempsMax = Math.max(...tempsMax);
          min_tempsMin = Math.min(...tempsMin);
          max_tempsMin = Math.max(...tempsMin);

          const scala = max_tempsMax - min_tempsMin;
          const multiplier = 120 / scala;

          const heightsHigh = tempsMax.map((temp) => {
            difference = max_tempsMax - temp;
            return Math.floor(difference * multiplier);
          });
          const heightsObjHigh = heightsHigh.map((height) => {
            return {
              ["heightHigh"]: height,
            };
          });

          const heightsLow = tempsMin.map((temp) => {
            difference = temp - min_tempsMin;
            return Math.floor(difference * multiplier);
          });
          const heightsObjLow = heightsLow.map((height) => {
            return {
              ["heightLow"]: height,
            };
          });

          const heightsMiddle = [];
          for (let i = 0; i < heightsHigh.length; i++) {
            heightsMiddle.push(120 - heightsHigh[i] - heightsLow[i]);
          }
          const heightsObjMiddle = heightsMiddle.map((height) => {
            return {
              ["heightMiddle"]: height,
            };
          });

          const heightsObj = heightsObjHigh.map((v, i) => ({
            ...v,
            ...heightsObjMiddle[i],
            ...heightsObjLow[i],
          }));

          const daysObject = daysObj.map((v, i) => ({
            ...v,
            ...heightsObj[i],
          }));

          hours1.map((v, i) => ({ ...v, ...hours2[i] }));

          let daysInnerHtml = "";
          daysObject.forEach((day) => {
            daysInnerHtml += createDay(
              day.day,
              day.icon,
              day.tempMax,
              day.tempMin,
              day.heightHigh,
              day.heightMiddle,
              day.heightsLow
            );
          });

          days.innerHTML = daysInnerHtml;

          // Current
          const currentData = data.current;
          // Current - Main
          const currentTemp = kelvinToCelsius(currentData.temp);
          const currentIcon = currentData.weather[0].icon;
          const mainDescription = currentData.weather[0].main;

          const main = `<img src="./icons/${currentIcon}.svg" class="main-icon" />
                        <div>
                          <div class="main-temperature">${currentTemp}°c</div>
                          <div class="main-description">${mainDescription}</div>
                        </div>`;
          currentMain.innerHTML = main;

          // Current - Details
          const tempFeelsLike = kelvinToCelsius(currentData.feels_like);
          const description = currentData.weather[0].description;
          const humidity = currentData.humidity;
          const pressure = currentData.pressure;
          const windSpeed = currentData.wind_speed;
          const windDegree = currentData.wind_deg;
          const sunrise = createTime(currentData.sunrise);
          const sunset = createTime(currentData.sunset);
          const uvIndex = currentData.uvi;

          const details = `
                                    <div class="left">
            <div class="details feels-like">
              <img src="./icons/description.svg" class="details-icon" />
              <div>
                <div class="details-text">feels like: ${tempFeelsLike}°C</div>
                <div class="details-text">${description}</div>
              </div>
            </div>

            <div class="details humidity">
              <img src="./icons/humidity.svg" class="details-icon" />
              <div class="details-text">humidity <br />${humidity}</div>
            </div>

            <div class="details preassure">
              <img src="./icons/pressure.svg" class="details-icon" />
              <div class="details-text">pressure <br />${pressure}</div>
            </div>

            <div class="details wind-speed">
              <img src="./icons/wind.svg" class="details-icon" />
              <div>
                <div class="details-text">speed: ${windSpeed} m/s</div>
                <div class="details-text">degree: ${windDegree}</div>
              </div>
            </div>
          </div>

          <div class="right">
            <div class="details sunrise">
              <img src="./icons/sunrise.svg" class="details-icon" />
              <div>
                <div class="details-text">sunrise</div>
                <div class="details-text">${sunrise}</div>
              </div>
            </div>

            <div class="details uv-undex">
              <img src="./icons/uv.svg" class="details-icon"/>
              <div>
                <div class="details-text">UV index</div>
                <div class="details-text">${uvIndex}</div>
              </div>
            </div>

            <div class="details sunset">
              <img src="./icons/sunset.svg" class="details-icon" />
              <div>
                <div class="details-text">sunset</div>
                <div class="details-text">${sunset}</div>
              </div>
            </div>
          </div>`;

          currentDetails.innerHTML = details;
        })
        .catch((error) => console.log(error));
    });
  }
});

// Hourly Slider
hourlySlider.addEventListener("mousedown", (e) => {
  isDown = true;
  hourlySlider.classList.add("active");
  startX = e.pageX - hourlySlider.offsetLeft;
  scrollLeft = hourlySlider.scrollLeft;
});
hourlySlider.addEventListener("mouseleave", () => {
  isDown = false;
  hourlySlider.classList.remove("active");
});
hourlySlider.addEventListener("mouseup", () => {
  isDown = false;
  hourlySlider.classList.remove("active");
});
hourlySlider.addEventListener("mousemove", (e) => {
  if (!isDown) return;
  e.preventDefault();
  const x = e.pageX - hourlySlider.offsetLeft;
  const walk = (x - startX) * 1.75;
  hourlySlider.scrollLeft = scrollLeft - walk;
});
// Daily Slider
dailySlider.addEventListener("mousedown", (e) => {
  isDown = true;
  dailySlider.classList.add("active");
  startX = e.pageX - dailySlider.offsetLeft;
  scrollLeft = dailySlider.scrollLeft;
});
dailySlider.addEventListener("mouseleave", () => {
  isDown = false;
  dailySlider.classList.remove("active");
});
dailySlider.addEventListener("mouseup", () => {
  isDown = false;
  dailySlider.classList.remove("active");
});
dailySlider.addEventListener("mousemove", (e) => {
  if (!isDown) return;
  e.preventDefault();
  const x = e.pageX - dailySlider.offsetLeft;
  const walk = (x - startX) * 1.75;
  dailySlider.scrollLeft = scrollLeft - walk;
});
