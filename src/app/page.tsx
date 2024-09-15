"use client"
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { useQuery } from "react-query";
import axios from "axios";
import { parseISO,format, fromUnixTime } from "date-fns";
import Container from "@/components/Container";
import WeatherIcon from "@/components/WeatherIcon";
import  {convertKtoC} from '@/utils/convertKtoC'
import { getDayOrNightIcon } from "@/utils/getDayorNightIcon";
import WeatherDetails from "@/components/WeatherDetails";
import { mToKm} from "@/utils/mToKm";
import { MpsToKpHr } from "@/utils/MpsToKpHr";
import ForecastWeatherDetail from "@/components/ForecastWeatherDetail";
import { useAtom } from "jotai";
import { loadingCityAtom, placeAtom } from "@/app/atom";
import { useEffect, useState } from "react";
import { formatInTimeZone } from 'date-fns-tz';
import { enIN } from 'date-fns/locale';
import Head from 'next/head';
import defaultData from './defaultData.json'; 

interface WeatherDetail {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    sea_level: number;
    grnd_level: number;
    humidity: number;
    temp_kf: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  clouds: {
    all: number;
  };
  wind: {
    speed: number;
    deg: number;
    gust: number;
  };
  visibility: number;
  pop: number;
  sys: {
    pod: string;
  };
  dt_txt: string;
}

interface WeatherData {
  cod: string;
  message: number;
  cnt: number;
  list: WeatherDetail[];
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

function returnWeatherColor(currWeather:string){
  if(currWeather=='clear sky')return '#87CEEB';
  else if(currWeather=='few clouds') return '#B0C4DE'
  else if(currWeather=='scattered clouds') return '#D3D3D3'
  else if(currWeather=='broken clouds') return '#A9A9A9'
  else if(currWeather=='overcast clouds') return '#696969'
  else if(currWeather=='shower rain') return '#778899'
  else if(currWeather=='rain') return '#708090'
  else if(currWeather=='light rain')return '#B0E0E6'
  else if(currWeather=='heavy intensity rain')return '#2F4F4F'
  else if(currWeather=='thunderstorm') return '#4B0082'
  else if(currWeather=='mist' || currWeather=='fog' || currWeather=='haze') return '#F5F5F5'
  else if(currWeather=='windy') return '#FFD700'
  else if(currWeather=='drizzle') return '#B0C4DE'
  else if(currWeather=='tornado' || currWeather=='hurricane' || currWeather=='hail') return '#B0E0E6'
}

// const defaultObject={
//   "dt": 1726401600,
//   "main": {
//     "temp": 299.26,
//     "feels_like": 299.26,
//     "temp_min": 299.26,
//     "temp_max": 299.26,
//     "pressure": 1005,
//     "humidity": 75,
//     "sea_level": 1005,
//     "grnd_level": 951,
//     "temp_kf": 0
//   },
//   "weather": [
//     {
//       "id": 500,
//       "main": "Rain",
//       "description": "light rain",
//       "icon": "10d"
//     }
//   ],
//   "clouds": {
//     "all": 89
//   },
//   "wind": {
//     "speed": 3.89,
//     "deg": 312,
//     "gust": 6.54
//   },
//   "rain": {
//     "3h": 1
//   },
//   "visibility": 10000,
//   "pop": 0.56,
//   "sys": {
//     "pod": "d"
//   },
//   "dt_txt": "2024-09-15 12:00:00"
// }


export default function Home() {
  const [place, setPlace] = useAtom(placeAtom);
  const [loadingCity] = useAtom(loadingCityAtom);
  const [currWeather, setCurrWeather]=useState('');
  const apiKey =process.env.NEXT_PUBLIC_API_KEY||null;/* Enter uor API key in the env.local file and access here using process.env.NEXT_PUBLIC_API_KEY*/
  const { isLoading, error, data, refetch} = useQuery<WeatherData>('repoData',async () =>{
    try{const {data}=await axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${place}&appid=${apiKey}&cnt=56`);
    setCurrWeather(data?.list[0]?.weather[0].description)
    return data;
    }catch(error){
    console.error('Error fetching weather data:', error," Using default data");
    setCurrWeather(defaultData?.list[0]?.weather[0].description)
      return defaultData; // Use the imported defaultData
    }
  }
  );

  useEffect(()=>{
    refetch()
  },[place,refetch])
  

  const firstData=(data?.list[0])
  // setCurrTemp(firstData?.main.temp??0);


  const uniqueDates = [
    ...new Set(
      data?.list.map(
        (entry) => new Date(entry.dt * 1000).toISOString().split("T")[0]
      )
    )
  ];


  const firstDataForEachDate = uniqueDates.map((date) => {
    return data?.list.find((entry) => {
      const entryDate = new Date(entry.dt * 1000).toISOString().split("T")[0];
      const entryTime = new Date(entry.dt * 1000).getHours();
      return entryDate === date && entryTime >= 6;
    });
  });

  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    // Function to update the current time
    const updateTime = () => {
      const now = new Date(); // Get current local time
      const timeString = now.toLocaleTimeString(); // Format it to a readable time string
      setCurrentTime(timeString);
    };

    updateTime()
  }, []);

  console.log(data);
  if (isLoading) return<div className="flex items-center min-h-screen justify-center">
    <p className="animate-bounce">Loading...</p>
  </div>
  return( 
  <>
    <Head>
        <title>Weather</title>
        <meta name="description" content="Description of my page" />
      </Head>
    <div className={`flex flex-col gap-4 min-h-screen`} style={{ backgroundColor:returnWeatherColor(currWeather) }}>
      <Navbar location={data?.city.name}/>
      <main className="px-3 max-w-7xl mx-auto flex flex-col gap-9 pb-10 pt-4 w-5/6">
      {loadingCity ? (
          <WeatherSkeleton />
        ) : (
        <>
        <section className="space-y-4">
          <div className="space-y-2">
            <h2 className="flex gap-1 text-2xl items-center flex-col sm:flex-row">
              <p>{format(parseISO(firstData?.dt_txt??''),"EEEE")}</p>
              <p className="text-xs sm:text-lg">({format(parseISO(firstData?.dt_txt??''),"dd.MM.yyyy")},{currentTime})</p>
            </h2>
          <Container className=" gap-10 6 items-center">
            <div className="flex flex-col px-4">
              <span className="text-5xl">
              {convertKtoC(firstData?.main.temp??296.37)}°
              </span>
              <div className="text-xs space-x-1 whitespace-nowrap">
                <span>Feels Like</span>
                <span>{convertKtoC(firstData?.main.feels_like??0)}°</span>
                <p className="text-xs space-x-2">
                  <span>
                  {convertKtoC(firstData?.main.temp_min??0)}°↓
                  </span>
                  <span>
                  {convertKtoC(firstData?.main.temp_max??0)}°↑
                  </span>
                </p>
              </div>
            </div>
            <div className="flex gap-10 sm:gap-16 overflow-x-auto w-full justify-between pr-3">
              {data?.list.map((d,index)=>(
                  <div key={index} className="flex flex-col justify-between gap-2 items-center text-xs font-semibold">
                    <p className="whitespace-nowrap">{format(parseISO(d.dt_txt),"h:mm a")}</p>
                    <WeatherIcon iconname={getDayOrNightIcon(d.weather[0].icon,d.dt_txt)}/>
                    <p>
                    {convertKtoC(d?.main.temp??296.37)}°
                    </p>
                  </div>
              ))}
            </div>
          </Container>
          </div>
          <div className="flex gap-4">
            <Container className="w-fit justify-center flex-col px-4 items-center">
              <p className="capitalize text-center">{firstData?.weather[0].description}</p>
              <WeatherIcon iconname={getDayOrNightIcon(firstData?.weather[0].icon??"",firstData?.dt_txt??"")}/>
            </Container>
            <Container className='bg-yellow-300/80 px-6 gap-4 justify-between overflow-x-auto'>
              <WeatherDetails visability={mToKm(firstData?.visibility??10000)}
              airPressure={`${firstData?.main.pressure} hPa`} humidity={`${firstData?.main.humidity}%`} sunrise={format(fromUnixTime(data?.city.sunrise??1702949452),"H:mm")} sunset={format(fromUnixTime(data?.city.sunset??1702949452),"H:mm")} windSpeed={MpsToKpHr(firstData?.wind.speed??1.64)}></WeatherDetails>
            </Container>
          </div>
        </section>
        <section className="flex w-full flex-col gap-4">
          <p className="text-2xl">Forecast (7 days)</p>
          {firstDataForEachDate.map((d,i)=>{
              return <ForecastWeatherDetail key={i} description={d?.weather[0].description ?? ""}
              weatherIcon={d?.weather[0].icon ?? "01d"}
              date={d ? format(parseISO(d.dt_txt), "dd.MM") : ""}
              day={d ? format(parseISO(d.dt_txt), "EEEE") :"" }
              feels_like={d?.main.feels_like ?? 0}
              temp={d?.main.temp ?? 0}
              temp_max={d?.main.temp_max ?? 0}
              temp_min={d?.main.temp_min ?? 0}
              airPressure={`${d?.main.pressure} hPa `}
              humidity={`${d?.main.humidity}% `}
              sunrise={format(
                fromUnixTime(data?.city.sunrise ?? 1702517657),
                "H:mm"
              )}
              sunset={format(
                fromUnixTime(data?.city.sunset ?? 1702517657),
                "H:mm"
              )}
              visability={`${mToKm(d?.visibility ?? 10000)} `}
              windSpeed={`${MpsToKpHr(d?.wind.speed ?? 1.64)} `}/>
          })}
          
        </section>
        </>
        )}
      </main>
    </div>
    </>
  )
}

function WeatherSkeleton() {
  return (
    <section className="space-y-8 ">
      {/* Today's data skeleton */}
      <div className="space-y-2 animate-pulse">
        {/* Date skeleton */}
        <div className="flex gap-1 text-2xl items-end ">
          <div className="h-6 w-24 bg-gray-300 rounded"></div>
          <div className="h-6 w-24 bg-gray-300 rounded"></div>
        </div>

        {/* Time wise temperature skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className="flex flex-col items-center space-y-2">
              <div className="h-6 w-16 bg-gray-300 rounded"></div>
              <div className="h-6 w-6 bg-gray-300 rounded-full"></div>
              <div className="h-6 w-16 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>

      {/* 7 days forecast skeleton */}
      <div className="flex flex-col gap-4 animate-pulse">
        <p className="text-2xl h-8 w-36 bg-gray-300 rounded"></p>

        {[1, 2, 3, 4, 5, 6, 7].map((index) => (
          <div key={index} className="grid grid-cols-2 md:grid-cols-4 gap-4 ">
            <div className="h-8 w-28 bg-gray-300 rounded"></div>
            <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
            <div className="h-8 w-28 bg-gray-300 rounded"></div>
            <div className="h-8 w-28 bg-gray-300 rounded"></div>
          </div>
        ))}
      </div>
    </section>
  );
}
