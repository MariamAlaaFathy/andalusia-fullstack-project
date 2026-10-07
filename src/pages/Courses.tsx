import { useEffect, useState } from "react";

import NavBar from "../Components/NavBar";
import Search from "../Components/Search";
import type { Coursetype } from "../types/Coursetype";

function Courses() {

    const [courses, setCourses] = useState<Coursetype[]>([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");

    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    const totalPages = Math.ceil(totalCount / pageSize);

    useEffect(() => {

        async function getCourses() {

            const response = await fetch(
                `http://localhost:5075/api/Courses?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}&page=${page}&pageSize=${pageSize}`
            );

            const data = await response.json();

            console.log("courses returned:", data);

            setCourses(data.data);
            setTotalCount(data.totalCount);
        }

        getCourses();

    }, [search, category, page, pageSize]);


    return (
        <div className="min-h-screen bg-[#f7f1e8] text-[#171717]">

            <NavBar />

            <main className="mx-auto max-w-[1300px] px-8 py-10">

                
                <div className="mb-8">

                    <h1 className="font-serif text-5xl font-bold">
                        Courses
                    </h1>

                    <p className="mt-3 text-[17px] text-[#765f52]">
                        {totalCount} courses across 4 categories
                    </p>

                </div>


               
                <div className="mb-7 flex items-center gap-3">

               
                    <div className="flex-1">
                        <Search setSearch={setSearch} />
                    </div>


                   
                    <button
                        onClick={() => {
                            setCategory("");
                            setPage(1);
                        }}
                        className={`rounded-full border px-5 py-3 text-[16px] transition ${
                            category === ""
                                ? "border-[#b36d4c] bg-[#b36d4c] text-white"
                                : "border-[#dfd2c3] bg-white text-[#765f52] hover:bg-[#f1e7db]"
                        }`}
                    >
                        All
                    </button>

                    <button
                        onClick={() => {
                            setCategory("Web Development");
                            setPage(1);
                        }}
                        className={`whitespace-nowrap rounded-full border px-5 py-3 text-[16px] transition ${
                            category === "Web Development"
                                ? "border-[#b36d4c] bg-[#b36d4c] text-white"
                                : "border-[#dfd2c3] bg-white text-[#765f52] hover:bg-[#f1e7db]"
                        }`}
                    >
                        Web Development
                    </button>

                    <button
                        onClick={() => {
                            setCategory("Backend Development");
                            setPage(1);
                        }}
                        className={`whitespace-nowrap rounded-full border px-5 py-3 text-[16px] transition ${
                            category === "Backend Development"
                                ? "border-[#b36d4c] bg-[#b36d4c] text-white"
                                : "border-[#dfd2c3] bg-white text-[#765f52] hover:bg-[#f1e7db]"
                        }`}
                    >
                        Backend Development
                    </button>

                    <button
                        onClick={() => {
                            setCategory("Data");
                            setPage(1);
                        }}
                        className={`rounded-full border px-5 py-3 text-[16px] transition ${
                            category === "Data"
                                ? "border-[#b36d4c] bg-[#b36d4c] text-white"
                                : "border-[#dfd2c3] bg-white text-[#765f52] hover:bg-[#f1e7db]"
                        }`}
                    >
                        Data
                    </button>


                  
                    <select
                        className="h-[50px] rounded-xl border-2 border-[#171717] bg-white px-5 text-[16px] outline-none"
                    >
                        <option>Newest</option>
                        <option>Oldest</option>
                    </select>

                </div>


            
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">

                    {courses.map((course) => (

                        <div
                            key={course.id}
                            className="overflow-hidden rounded-xl border border-[#dfd2c3] bg-white"
                        >

                        
                            <div className="h-[115px] bg-[#eee2d5]">
                            </div>


                          
                            <div className="p-5">

                                
                                <div className="mb-3 flex items-center justify-between gap-2">

                                    <span className="text-[14px] font-medium uppercase text-[#a55335]">
                                        {course.category}
                                    </span>

                                    <span className="rounded-full bg-[#e5eee8] px-3 py-1 text-[13px] font-medium text-[#166534]">
                                        Active
                                    </span>

                                </div>


                              
                                <h2 className="font-serif text-[23px] font-bold leading-tight">
                                    {course.name}
                                </h2>


                        
                                <p className="mt-5 font-bold text-[15px]">
                                    {course.price === 0
                                        ? "Free"
                                        : `$${course.price}`
                                    }
                                </p>

                            </div>

                        </div>

                    ))}

                </div>


                
                <div className="mt-10 flex items-center justify-center gap-6">

                    <button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        className="rounded-lg border border-[#d8cabc] bg-white px-5 py-2 text-[#765f52] transition hover:bg-[#eee2d5] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Previous
                    </button>

                    <span className="font-medium text-[#765f52]">
                        Page {page} of {totalPages}
                    </span>

                    <button
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages}
                        className="rounded-lg border border-[#d8cabc] bg-white px-5 py-2 text-[#765f52] transition hover:bg-[#eee2d5] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Next
                    </button>

                </div>

            </main>

        </div>
    );
}

export default Courses;