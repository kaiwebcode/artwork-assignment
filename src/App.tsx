import ArtworksTable from "./components/ArtworksTable";

function App() {
  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center p-10">
      <h1 className="text-4xl font-extrabold text-center mb-2">
        Artwork Gallery 
      </h1>
      <p className="text-gray-400 text-center mb-10">
        Browse artworks from the Art institute of india
        (Built with PrimeReact, TypeScript & TailwindCSS)
      </p>

      <ArtworksTable />
    </div>
  );
}

export default App;
