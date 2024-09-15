import cn from '@/utils/cn'
import Image from 'next/image'

type Props = {}
export default function WeatherIcon(props:React.HTMLProps<HTMLDivElement> & {iconname:string}) {
  return (
    <div {...props} className={cn('relative h-20 w-20')}>
        <Image alt='weather-icon' 
        width={100}
        height={100}
        className='absolute h-3/4 w-3/4 sm:h-full sm:w-full '
        src={`https://openweathermap.org/img/wn/${props.iconname}@4x.png`}></Image>
    </div>
  )
}