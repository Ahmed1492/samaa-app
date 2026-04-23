import React, { useEffect, useState, useRef, useCallback } from "react";
import "./weather.css";
import axios from "axios";
import {
  IoMdSunny,
  IoMdRainy,
  IoMdCloudy,
  IoMdSnow,
  IoMdThunderstorm,
  IoMdSearch,
  IoMdLocate,
} from "react-icons/io";
import {
  BsCloudHaze2Fill,
  BsCloudDrizzleFill,
  BsEye,
  BsWater,
  BsThermometer,
  BsWind,
  BsCloudy,
  BsArrowUp,
  BsArrowDown,
  BsSpeedometer2,
  BsCloudFill,
  BsSunrise,
  BsSunset,
  BsCompass,
  BsGlobe2,
} from "react-icons/bs";
import { TbTemperatureCelsius } from "react-icons/tb";
import { ImSpinner8 } from "react-icons/im";

const APIKey = "fb0ca108623a0b063c43610469a29a14";

// ── Translations ──────────────────────────────────────────────────────────────
const t = {
  en: {
    searchPlaceholder: "Search city or country…",
    searchBtn: "Search",
    sunrise: "Sunrise",
    sunset: "Sunset",
    visibility: "Visibility",
    feelsLike: "Feels Like",
    humidity: "Humidity",
    wind: "Wind",
    pressure: "Pressure",
    cloudCover: "Cloud Cover",
    windDir: "Wind Dir.",
    seaLevel: "Sea Level",
    emptyError: "Please enter a city name",
    langLabel: "عربي",
  },
  ar: {
    searchPlaceholder: "ابحث عن مدينة أو دولة…",
    searchBtn: "بحث",
    sunrise: "شروق الشمس",
    sunset: "غروب الشمس",
    visibility: "الرؤية",
    feelsLike: "يبدو كأنه",
    humidity: "الرطوبة",
    wind: "الرياح",
    pressure: "الضغط",
    cloudCover: "الغيوم",
    windDir: "اتجاه الريح",
    seaLevel: "مستوى البحر",
    emptyError: "الرجاء إدخال اسم المدينة",
    langLabel: "English",
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatTime = (unix, timezoneOffset) => {
  const d = new Date((unix + timezoneOffset) * 1000);
  let h = d.getUTCHours();
  const m = String(d.getUTCMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
};

const windDirection = (deg, lang) => {
  const en = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const ar = ["ش", "ش.ش.ش", "ش.ش", "ج.ش.ش", "ج", "ج.ج.غ", "غ", "ش.غ"];
  const dirs = lang === "ar" ? ar : en;
  return dirs[Math.round(deg / 45) % 8];
};

const date = new Date();
const formattedDate = `${date.getUTCDate()} / ${date.getUTCMonth() + 1} / ${date.getUTCFullYear()}`;

// ── Component ─────────────────────────────────────────────────────────────────
export const Weather = () => {
  // ── Read lang from localStorage on first render ──
  const [lang, setLang] = useState(() => localStorage.getItem("samaa_lang") || "en");

  const [data, setData]               = useState(null);
  const [location, setLocation]       = useState("cairo");
  const [inputValue, setInputValue]   = useState("");
  const [shake, setShake]             = useState(false);
  const [error, setError]             = useState(null);
  // initialLoad: true only until the very first successful fetch — shows full-screen spinner
  const [initialLoad, setInitialLoad] = useState(true);
  // fetching: true during any subsequent fetch — card stays visible, just dims slightly
  const [fetching, setFetching]       = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);

  const debounceRef = useRef(null);
  const wrapperRef  = useRef(null);
  const tr    = t[lang];
  const isRTL = lang === "ar";

  // ── Persist lang to localStorage ──────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem("samaa_lang", lang);
    document.documentElement.dir  = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang, isRTL]);

  // ── Auto-dismiss error after 3 s ──────────────────────────────────────────
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), 3000);
    return () => clearTimeout(timer);
  }, [error]);

  // ── Close suggestions on outside click ───────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target))
        setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Fetch weather ─────────────────────────────────────────────────────────
  // langOnly = true when only the language changed (city is the same)
  // In that case we still fetch to get translated description, but we
  // never show an error — if it fails silently we just keep the old data.
  const fetchWeather = useCallback(async (langOnly = false) => {
    if (initialLoad) {
      // first ever load — show full-screen spinner
    } else {
      setFetching(true);
    }
    try {
      const res = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${APIKey}&lang=${lang}`
      );
      setData(res.data);
      if (!langOnly) setError(null);
    } catch (err) {
      // Only show error when the user explicitly searched a new city
      if (!langOnly) {
        setError(err?.response?.data?.message || (isRTL ? "المدينة غير موجودة" : "City not found"));
      }
    } finally {
      setInitialLoad(false);
      setFetching(false);
    }
  }, [location, lang, isRTL, initialLoad]);

  // Re-fetch when location changes (new city search)
  const prevLocationRef = useRef(null);
  useEffect(() => {
    if (prevLocationRef.current === null) {
      // very first mount
      prevLocationRef.current = location;
      fetchWeather(false);
      return;
    }
    if (prevLocationRef.current !== location) {
      prevLocationRef.current = location;
      fetchWeather(false);
    }
  }, [location, fetchWeather]);

  // Re-fetch when lang changes — silent, keeps existing card visible
  const prevLangRef = useRef(lang);
  useEffect(() => {
    if (prevLangRef.current !== lang) {
      prevLangRef.current = lang;
      fetchWeather(true);
    }
  }, [lang, fetchWeather]);

  // ── Fetch suggestions (debounced 350 ms) ─────────────────────────────────
  const fetchSuggestions = useCallback((query) => {
    clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await axios.get(
          `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${APIKey}`
        );
        setSuggestions(res.data);
        setShowSuggestions(res.data.length > 0);
        setActiveSuggestion(-1);
      } catch {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 350);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    if (error) setError(null);
    fetchSuggestions(val);
  };

  const selectSuggestion = (city) => {
    const q = city.state
      ? `${city.name},${city.state},${city.country}`
      : `${city.name},${city.country}`;
    setLocation(q);
    setInputValue("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestion((p) => Math.min(p + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestion((p) => Math.max(p - 1, 0));
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    } else if (e.key === "Enter" && activeSuggestion >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[activeSuggestion]);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (inputValue.trim() !== "") {
      setLocation(inputValue.trim());
      setInputValue("");
      setSuggestions([]);
    } else {
      setShake(true);
      setError(tr.emptyError);
      setTimeout(() => setShake(false), 500);
    }
  };

  const getWeatherIcon = (condition) => {
    switch (condition) {
      case "Clouds":       return <BsCloudy />;
      case "Haze":         return <BsCloudHaze2Fill />;
      case "Rain":         return <IoMdRainy />;
      case "Clear":        return <IoMdSunny />;
      case "Drizzle":      return <BsCloudDrizzleFill />;
      case "Snow":         return <IoMdSnow />;
      case "Thunderstorm": return <IoMdThunderstorm />;
      default:             return <IoMdCloudy />;
    }
  };

  // Only show full-screen spinner on the very first load
  if (initialLoad) {
    return (
      <div className="container">
        <ImSpinner8 className="reloadingIcone" />
      </div>
    );
  }

  return (
    <div className={`container ${isRTL ? "rtl" : ""}`}>

      {/* ── Error toast ── */}
      {error && (
        <div className="notFoundCity" key={error}>
          <span>{error}</span>
        </div>
      )}

      {/* ── Language toggle ── */}
      <button
        className="langToggle"
        onClick={() => setLang((l) => (l === "en" ? "ar" : "en"))}
        aria-label="Toggle language"
      >
        <BsGlobe2 />
        <span>{tr.langLabel}</span>
      </button>

      {/* ── Search ── */}
      <div className="searchWrapper" ref={wrapperRef}>
        <form className={`search ${shake ? "shake" : ""}`} onSubmit={handleSearch}>
          <IoMdSearch className="searchIcon" />
          <input
            placeholder={tr.searchPlaceholder}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            type="text"
            autoComplete="off"
            dir={isRTL ? "rtl" : "ltr"}
          />
          <button type="submit">{tr.searchBtn}</button>
        </form>

        {showSuggestions && (
          <ul className="suggestions">
            {suggestions.map((city, i) => (
              <li
                key={`${city.name}-${city.lat}-${city.lon}`}
                className={`suggestionItem ${i === activeSuggestion ? "active" : ""}`}
                onMouseDown={() => selectSuggestion(city)}
              >
                <IoMdLocate className="suggestionIcon" />
                <div className="suggestionText">
                  <span className="suggestionCity">{city.name}</span>
                  <span className="suggestionSub">
                    {[city.state, city.country].filter(Boolean).join(", ")}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Card — dims while fetching but never unmounts ── */}
      {data && (
        <div className={`card ${fetching ? "cardFetching" : ""}`}>

          <div className="cardTop">
            <div className="icon">{getWeatherIcon(data.weather[0].main)}</div>
            <div className="countryName">
              <h2>{data.name}, {data.sys.country}</h2>
              <span className="date">{formattedDate}</span>
            </div>
          </div>

          <div className="divider" />

          <div className="cardBody">
            <span className="temp">{Math.round(data.main.temp)}</span>
            <span className="tempUnit"><TbTemperatureCelsius /></span>
          </div>

          <div className="minMaxRow">
            <span className="minMax">
              <BsArrowUp className="minMaxIcon up" />
              {Math.round(data.main.temp_max)}°
            </span>
            <span className="minMax">
              <BsArrowDown className="minMaxIcon down" />
              {Math.round(data.main.temp_min)}°
            </span>
          </div>

          <p className="description">{data.weather[0].description}</p>

          <div className="divider" />

          <div className="sunRow">
            <div className="sunItem">
              <BsSunrise className="sunIcon" />
              <div className="sunInfo">
                <span className="statLabel">{tr.sunrise}</span>
                <span className="statValue">{formatTime(data.sys.sunrise, data.timezone)}</span>
              </div>
            </div>
            <div className="sunDivider" />
            <div className="sunItem">
              <BsSunset className="sunIcon" />
              <div className="sunInfo">
                <span className="statLabel">{tr.sunset}</span>
                <span className="statValue">{formatTime(data.sys.sunset, data.timezone)}</span>
              </div>
            </div>
          </div>

          <div className="divider" />

          <div className="cardBottom">
            <div className="stat">
              <BsEye className="statIcon" />
              <div className="statInfo">
                <span className="statLabel">{tr.visibility}</span>
                <span className="statValue">{(data.visibility / 1000).toFixed(1)} km</span>
              </div>
            </div>
            <div className="stat">
              <BsThermometer className="statIcon" />
              <div className="statInfo">
                <span className="statLabel">{tr.feelsLike}</span>
                <span className="statValue">{Math.round(data.main.feels_like)} °C</span>
              </div>
            </div>
            <div className="stat">
              <BsWater className="statIcon" />
              <div className="statInfo">
                <span className="statLabel">{tr.humidity}</span>
                <span className="statValue">{data.main.humidity} %</span>
              </div>
            </div>
            <div className="stat">
              <BsWind className="statIcon" />
              <div className="statInfo">
                <span className="statLabel">{tr.wind}</span>
                <span className="statValue">{data.wind.speed} m/s</span>
              </div>
            </div>
            <div className="stat">
              <BsSpeedometer2 className="statIcon" />
              <div className="statInfo">
                <span className="statLabel">{tr.pressure}</span>
                <span className="statValue">{data.main.pressure} hPa</span>
              </div>
            </div>
            <div className="stat">
              <BsCloudFill className="statIcon" />
              <div className="statInfo">
                <span className="statLabel">{tr.cloudCover}</span>
                <span className="statValue">{data.clouds.all} %</span>
              </div>
            </div>
            <div className="stat">
              <BsCompass className="statIcon" />
              <div className="statInfo">
                <span className="statLabel">{tr.windDir}</span>
                <span className="statValue">{windDirection(data.wind.deg, lang)} ({data.wind.deg}°)</span>
              </div>
            </div>
            <div className="stat">
              <BsThermometer className="statIcon" />
              <div className="statInfo">
                <span className="statLabel">{tr.seaLevel}</span>
                <span className="statValue">{data.main.sea_level ?? data.main.pressure} hPa</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
