type SearchProps = {
  setSearch: (value: string) => void;
  placeholder?: string;
};

function Search({ setSearch, placeholder = "Search" }: SearchProps) {
  return (
    <input
      type="search"
      placeholder={placeholder}
      aria-label={placeholder}
      onChange={(event) => setSearch(event.target.value)}
      className="w-full rounded-xl border border-[#dfd2c3] bg-white px-4 py-3 outline-none transition focus:border-[#a9694f] focus:ring-2 focus:ring-[#a9694f]/20"
    />
  );
}

export default Search;