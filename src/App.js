import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { useMovies } from "./useMovies";
import { useLocalStorageState } from "./useLocalStorageState";
import { useKey } from "./useKey";

const average = (arr) =>
    arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const key = "fc9fa929";

export default function App() {
    const [query, setQuery] = useState("");
    const [selectedId, setSelectedId] = useState(null);
    const { movies, isLoading, error } = useMovies(query); // custom hook

    const [watched, setWatched] = useLocalStorageState([], "watched");

    function handleSelectedMovie(id) {
        setSelectedId((selectedId) => (id === selectedId ? null : id));
    }

    function handleCloseMovie() {
        setSelectedId(null);
    }

    function handleAddWatched(movie) {
        setWatched((watched) => [...watched, movie]);

        // localStorage.setItem("watched", JSON.stringify([...watched, movie]));
    }

    function handleDeleteWatched(id) {
        setWatched((watched) => watched.filter((movie) => movie.imdbId !== id));
    }

    return (
        <>
            <NavBar>
                <Search query={query} setQuery={setQuery} />
                <NumResults movies={movies} />
            </NavBar>
            <Main>
                <Box>
                    {/* {isLoading ? <Loader /> : <MovieList movies={movies} />} */}
                    {isLoading && <Loader />}
                    {!isLoading && !error && (
                        <MovieList
                            movies={movies}
                            onSelectMovie={handleSelectedMovie}
                        />
                    )}
                    {error && <ErrorMessage message={error} />}
                </Box>

                <Box>
                    {selectedId ? (
                        <MovieDetails
                            selectedId={selectedId}
                            onCloseMovie={handleCloseMovie}
                            onAddWatched={handleAddWatched}
                            watched={watched}
                        />
                    ) : (
                        <>
                            <WatchedSummary watched={watched} />
                            <WatchedMoviesList
                                watched={watched}
                                onDeleteWatched={handleDeleteWatched}
                            />
                        </>
                    )}
                </Box>
            </Main>
        </>
    );
}

function Loader() {
    return <p className="loader">Loading...</p>;
}

function ErrorMessage({ message }) {
    return (
        <p className="error">
            <span>⛔</span>
            {message}
        </p>
    );
}

function NavBar({ children }) {
    return (
        <nav className="nav-bar">
            <Logo />
            {children}
        </nav>
    );
}

function Logo() {
    return (
        <div className="logo">
            <span role="img">🍿</span>
            <h1>usePopcorn</h1>
        </div>
    );
}

function NumResults({ movies }) {
    let arrLength = movies?.length || 0;
    return (
        <p className="num-results">
            Found <strong>{arrLength}</strong> results
        </p>
    );
}

function Search({ query, setQuery }) {
    const inputEl = useRef(null);

    useKey("Enter", function () {
        if (document.activeElement === inputEl.current) return;
        inputEl.current.focus();
        setQuery("");
    });


    return (
        <input
            className="search"
            type="text"
            placeholder="Search movies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            ref={inputEl}
        />
    );
}

function Main({ children }) {
    return <main className="main">{children}</main>;
}

function Box({ children }) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="box">
            <button
                className="btn-toggle"
                onClick={() => setIsOpen((open) => !open)}
            >
                {isOpen ? "–" : "+"}
            </button>
            {isOpen && children}
        </div>
    );
}

// function Listbox({ children }) {
//     const [isOpen1, setIsOpen1] = useState(true);

//     return (
//         <div className="box">
//             <button
//                 className="btn-toggle"
//                 onClick={() => setIsOpen1((open) => !open)}
//             >
//                 {isOpen1 ? "–" : "+"}
//             </button>
//             {isOpen1 && children}
//         </div>
//     );
// }

// function WatchedBox() {
//     const [watched, setWatched] = useState(tempWatchedData);
//     const [isOpen2, setIsOpen2] = useState(true);

//     return (
//         <div className="box">
//             <button
//                 className="btn-toggle"
//                 onClick={() => setIsOpen2((open) => !open)}
//             >
//                 {isOpen2 ? "–" : "+"}
//             </button>
//             {isOpen2 && (
//                 <>
//                     <WatchedSummary watched={watched} />

//                     <WatchedMoviesList watched={watched} />
//                 </>
//             )}
//         </div>
//     );
// }

function MovieList({ movies, onSelectMovie }) {
    return (
        <ul className="list list-movies">
            {movies?.map((movie) => (
                <Movie
                    movie={movie}
                    key={movie.imdbID}
                    onSelectMovie={onSelectMovie}
                />
            ))}
        </ul>
    );
}

function Movie({ movie, onSelectMovie }) {
    return (
        <li onClick={() => onSelectMovie(movie.imdbID)}>
            <img src={movie.Poster} alt={`${movie.Title} poster`} />
            <h3>{movie.Title}</h3>
            <div>
                <p>
                    <span>🗓</span>
                    <span>{movie.Year}</span>
                </p>
            </div>
        </li>
    );
}

function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watched }) {
    const [movie, setMovie] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [userRating, setUserRating] = useState(0);

    const countRef = useRef(0);

    useEffect(
        function () {
            if (userRating) countRef.current++;
        },
        [userRating]
    );

    const isWatched = watched
        .map((watchedMovie) => watchedMovie.imdbId)
        .includes(selectedId);

    const watchedUserRating = watched.find(
        (movie) => movie.imdbId === selectedId
    )?.userRating;

    const {
        Title: title,
        Year: year,
        Poster: poster,
        Runtime: runTime,
        imdbRating,
        Plot: plot,
        Released: released,
        Actors: actors,
        Director: director,
        Genre: genre,
    } = movie;

    function handleAdd() {
        const newWatchedMovie = {
            imdbId: selectedId,
            title,
            year,
            poster,
            imdbRating: Number(imdbRating),
            runTime: Number(runTime.split(" ").at(0)),
            userRating,
            countRatingDecisions: countRef.current,
        };

        onAddWatched(newWatchedMovie);
        onCloseMovie();
    }

    useKey("Escape", onCloseMovie);

    // useEffect(
    //     function () {
    //         function callBack(e) {
    //             if (e.code === "Escape") onCloseMovie();
    //         }

    //         document.addEventListener("keydown", callBack);

    //         return function () {
    //             document.removeEventListener("keydown", callBack);
    //         };
    //     },
    //     [onCloseMovie]
    // );

    useEffect(
        function () {
            setIsLoading(true);
            async function getMovieDetails() {
                const res = await fetch(
                    `https://www.omdbapi.com/?apikey=${key}&i=${selectedId}`
                );

                const data = await res.json();
                setMovie(data);
                setIsLoading(false);
            }

            getMovieDetails();
        },
        [selectedId]
    );

    useEffect(
        function () {
            if (!title) return;
            document.title = `Movie | ${title}`;

            return function () {
                document.title = "usePopcorn";
            };
        },
        [title]
    );

    return (
        <div className="details">
            {isLoading ? (
                <Loader />
            ) : (
                <>
                    <header>
                        <button className="btn-back" onClick={onCloseMovie}>
                            &larr;
                        </button>
                        <img src={poster} alt={`poster of ${movie} movie`} />
                        <div className="details-overview">
                            <h2>{title}</h2>
                            <p>
                                {released} &bull; {runTime}
                            </p>
                            <p>{genre}</p>
                            <p>
                                <span>⭐</span> {imdbRating} IMDB rating
                            </p>
                        </div>
                    </header>

                    <section>
                        <div className="rating">
                            {isWatched ? (
                                `You rated this movie with ${watchedUserRating} ⭐`
                            ) : (
                                <>
                                    <StarRating
                                        maxRating={10}
                                        size={24}
                                        onSetRating={setUserRating}
                                    />
                                    {userRating > 0 && (
                                        <button
                                            className="btn-add"
                                            onClick={handleAdd}
                                        >
                                            + Add to list
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                        <p>
                            <em>{plot}</em>
                        </p>
                        <p>Starring {actors}</p>
                        <p>Directed bt {director}</p>
                    </section>
                </>
            )}
        </div>
    );
}

function WatchedSummary({ watched }) {
    const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
    const avgUserRating = average(watched.map((movie) => movie.userRating));
    const avgRunTime = average(watched.map((movie) => movie.runTime));

    return (
        <div className="summary">
            <h2>Movies you watched</h2>
            <div>
                <p>
                    <span>#️⃣</span>
                    <span>{watched.length} movies</span>
                </p>
                <p>
                    <span>⭐️</span>
                    <span>{avgImdbRating.toFixed(1)}</span>
                </p>
                <p>
                    <span>🌟</span>
                    <span>{avgUserRating.toFixed(1)}</span>
                </p>
                <p>
                    <span>⏳</span>
                    <span>{avgRunTime.toFixed(2)} min</span>
                </p>
            </div>
        </div>
    );
}

function WatchedMoviesList({ watched, onDeleteWatched }) {
    return (
        <ul className="list">
            {watched.map((movie) => (
                <WatchedMovies
                    movie={movie}
                    key={movie.imdbId}
                    onDeleteWatched={onDeleteWatched}
                />
            ))}
        </ul>
    );
}

function WatchedMovies({ movie, onDeleteWatched }) {
    return (
        <li>
            <img src={movie.poster} alt={`${movie.title} poster`} />
            <h3>{movie.title}</h3>
            <div>
                <p>
                    <span>⭐️</span>
                    <span>{movie.imdbRating}</span>
                </p>
                <p>
                    <span>🌟</span>
                    <span>{movie.userRating}</span>
                </p>
                <p>
                    <span>⏳</span>
                    <span>{movie.runTime} min</span>
                </p>
                <button
                    className="btn-delete"
                    onClick={() => onDeleteWatched(movie.imdbId)}
                >
                    X
                </button>
            </div>
        </li>
    );
}
