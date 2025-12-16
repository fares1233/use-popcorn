import { useEffect, useState } from "react";

const key = "fc9fa929";


export function useMovies(query) {
    const [movies, setMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(
        function () {
            // callBack?.();

            const controller = new AbortController();

            setIsLoading(true);
            setError("");
            async function fetchMovies() {
                try {
                    const res = await fetch(
                        `https://www.omdbapi.com/?i=tt3896198&apikey=${key}&s=${query}`,
                        { signal: controller.signal }
                    );

                    if (!res.ok)
                        throw new Error(
                            "Some thig went wrong while fetching movies"
                        );

                    const data = await res.json();
                    if (data.Response === "False")
                        throw new Error("Movie not found");

                    setMovies(data.Search);
                    setError("");
                } catch (err) {
                    if (err.name !== "AbortError") setError(err.message);
                } finally {
                    setIsLoading(false);
                }
            }

            if (query.length < 3) {
                setMovies([]);
                setError("");
                setIsLoading(false);
                return;
            }

            // handleCloseMovie();
            fetchMovies();

            return function () {
                controller.abort();
            };
        },
        [query]
    );
    return { movies, isLoading, error };
}
