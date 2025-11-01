import ArtworksTable from "./components/ArtworksTable";

function App() {
  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center px-4 sm:px-6 md:px-10 py-10">
      <div className="max-w-5xl w-full text-center space-y-3 mb-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center mb-2">
          Artwork Gallery
        </h1>
        <p className="text-gray-400 text-sm sm:text-base md:text-lg">
          Browse artworks from the{" "}
          <span className="text-blue-400 font-semibold">
            Art Institute of India
          </span>{" "}
          <br className="sm:hidden" />
          (Built with PrimeReact, TypeScript & TailwindCSS)
        </p>
      </div>

      <ArtworksTable />
    </div>
  );
}

export default App;
