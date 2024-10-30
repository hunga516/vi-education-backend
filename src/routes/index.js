import coursesRoute from './courses.route.js';
import usersRoute from './users.route.js';
import lessonsRoute from './lessons.route.js';
import chaptersRoute from './chapter.route.js';
import postsRoute from './posts.route.js';

function route(app) {
    app.use('/users', usersRoute);
    app.use('/courses', coursesRoute);
    app.use('/chapters', chaptersRoute);
    app.use('/lessons', lessonsRoute);
    app.use('/posts', postsRoute);
}

export default route;
