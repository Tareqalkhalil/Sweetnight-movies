PRAGMA foreign_keys = OFF;

DELETE FROM Episode;
DELETE FROM Season;
DELETE FROM MovieCategory;
DELETE FROM SeriesCategory;
DELETE FROM MovieCast;
DELETE FROM SeriesCast;
DELETE FROM MovieDirector;
DELETE FROM SeriesDirector;
DELETE FROM WatchlistItem;
DELETE FROM Favorite;
DELETE FROM Review;
DELETE FROM Rating;
DELETE FROM WatchHistory;
DELETE FROM Movie;
DELETE FROM Series;
DELETE FROM Person;

PRAGMA foreign_keys = ON;
