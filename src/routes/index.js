import newRoute from './news.route.js';
import meRoute from './me.route.js';
import siteRoute from './site.route.js';
import coursesRoute from './courses.route.js';
import postsRoute from './posts.route.js';
import usersRoute from './users.route.js';

import apiCoursesRoute from './api/api.courses.route.js';

function route(app) {
    app.use('/news', newRoute);
    app.use('/posts', postsRoute);
    app.use('/users', usersRoute);
    app.use('/courses', coursesRoute);
    app.use('/api/courses', apiCoursesRoute);
    app.use('/me', meRoute);
    app.use('/', siteRoute);
}

export default route;
