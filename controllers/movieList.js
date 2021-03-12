const params = {
	language: "en-US",
};

const fetchMovies = async (moviedb, sorted) => {
	let response = null;

	try {
		switch (sorted) {
			case "now_playing":
				response = await moviedb.movieNowPlaying(params);
				break;
			case "popular":
				response = await moviedb.moviePopular(params);
				break;
			case "top_rated":
				response = await moviedb.movieTopRated(params);
				break;
			case "upcoming":
				response = await moviedb.upcomingMovies(params);
				break;
			default:
				response = null;
		}

		return response;
	} catch (e) {
		throw e;
	}
};

const getMovie = (movie) => {
	return {
		id: movie.id,
		title: movie.title,
		date: movie.release_date,
		rating: movie.vote_average,
	};
};

const getStars = (credits) => {
	const stars = credits.cast
		.filter((star) => star.known_for_department === "Acting")
		.map((star) => {
			return {
				id: star.id,
				name: star.name,
			};
		});

	return stars;
};

const getDirector = (credits) => {
	const director = credits.crew.find((person) => person.job === "Director");

	if (!director) {
		return null;
	} else {
		return {
			id: director.id,
			name: director.name,
		};
	}
};

const handleMovieList = async (req, res, moviedb) => {
	const { sorted } = req.params;

	try {
		const movies = await fetchMovies(moviedb, sorted);

		if (!movies) {
			res.status(404).json("Page Not Found");
			return;
		}

		const filteredMovies = await Promise.all(
			movies.results.map(async (movie) => {
				const movie_id = movie.id;
				const credits = await moviedb.movieCredits(movie_id);
				const stars = getStars(credits);
				const director = getDirector(credits);

				return {
					id: movie_id,
					title: movie.title,
					date: movie.release_date,
					rating: movie.vote_average,
					genre_ids: movie.genre_ids,
					backdrop_path: movie.backdrop_path,
					poster_path: movie.poster_path,
					stars,
					director,
				};
			})
		);

		res.json(filteredMovies);
	} catch (e) {
		console.log(e);
		res.status(404).json(e);
	}
};

module.exports = {
	handleMovieList,
};
