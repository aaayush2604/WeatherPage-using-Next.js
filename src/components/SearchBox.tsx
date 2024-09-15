import React from 'react';
import { FaSearchLocation } from "react-icons/fa";
import cn from '@/utils/cn';

type Props = {
    className?: string,
    value:string,
    onChange:React.ChangeEventHandler<HTMLInputElement> | undefined,
    onSubmit:React.FormEventHandler<HTMLFormElement> | undefined
}
export default function SearchBox(props: Props) {
  return (
    <form className={cn("flex relative items-center justify-center h-10", props.className)} onSubmit={props.onSubmit}>
        <input type="text" placeholder="Search Location" className="px-4 py-2 w-[230px] border border-gray-300 rounded-l-md focus:outline-none focus:border-blue-500 h-full" onChange={props.onChange} value={props.value}/>
        <button className="px-4 py-[9px] bg-blue-500 text-white rounded-r-md focus:outline-none hover:bg-blue-600 whitespace-nowrap h-full" type='submit'>
        <FaSearchLocation />
        </button>
    </form>
  )
}