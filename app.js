const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at localhost://30000");
    });
  } catch (e) {
    console.log(`DB ERROR:${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};
const directorsObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

//API-1
app.get(`/movies/`, async (request, response) => {
  const getMoviesQuery = `SELECT movie_name FROM movie;`;
  const movieNamesArray = await db.all(getMoviesQuery);
  response.send(
    movieNamesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});
//API-2
app.post(`/movies/`, async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
  INSERT INTO movie(director_id,movie_name,lead_actor)
  VALUES(${directorId},'${movieName}','${leadActor}');`;
  const dbResponse = await db.run(addMovieQuery);
  const movieId = dbResponse.lastID;
  response.send("Movie Successfully Added");
});
//API3
app.get(`/movies/:movieId/`, async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `SELECT * FROM movie WHERE movie_id=${movieId};`;
  const movie = await db.get(getMovieQuery);
  response.send(convertDbObjectToResponseObject(movie));
});
//API4
app.put(`/movies/:movieId/`, async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const movieUpdateQuery = `
    UPDATE movie
     SET
      director_id=${directorId},
      movie_name='${movieName}',
      lead_actor='${leadActor}'
    WHERE movie_id=${movieId};`;
  await db.run(movieUpdateQuery);
  response.send("Movie Details Updated");
});

//API5
app.delete(`/movies/:movieId/`, async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `DELETE FROM movie WHERE movie_id=${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//API6
app.get(`/directors/`, async (request, response) => {
  const getDirectorsQuery = `SELECT * FROM director ORDER BY director_id;`;
  const getDirectorsArray = await db.all(getDirectorsQuery);
  response.send(getDirectorsArray.map((every) => directorsObject(every)));
});

//API7
app.get(`/directors/:directorId/movies/`, async (request, response) => {
  const { directorId } = request.params;
  const getMoviesQuery = `SELECT movie_name FROM movie WHERE director_id=${directorId};`;
  const getMoviesArray = await db.all(getMoviesQuery);
  response.send(
    getMoviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});
module.exports = app;
