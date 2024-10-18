import coursesRoute from './courses.route.js';
import postsRoute from './posts.route.js';
import usersRoute from './users.route.js';

function route(app) {
    app.use('/posts', postsRoute);
    app.use('/users', usersRoute);
    app.use('/courses', coursesRoute);
}

export default route;
