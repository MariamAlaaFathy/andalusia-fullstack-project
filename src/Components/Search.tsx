import type { Searchprops } from "../types/Searchprops";

function Search({setSearch}: Searchprops){
   
   return(
    <div>
        <input 
        type="text"
        placeholder="search courses"
        
        onChange={(e)=> {
            console.log(e.target.value);
            setSearch(e.target.value) }}
        />
    </div>
   )
}

export default Search;