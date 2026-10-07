import type { CategoryFilterprop } from "../types/CategoryFilterprops";

function Categoryfilter({setCategory}:CategoryFilterprop){
    return(
         <select onChange={(e) => setCategory(e.target.value)}>
            <option value="">All Categories</option>
            <option value="Programming">Programming</option>
            <option value="Web Development">Web Development</option>
            <option value="Database">Database</option>
        </select>
    );
}

export default Categoryfilter;