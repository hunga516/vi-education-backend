import newRoute from './news.route.js'; // Đổi extension sang .js nếu cần
import meRoute from './me.route.js'; // Đổi extension sang .js nếu cần
import siteRoute from './site.route.js'; // Đổi extension sang .js nếu cần
import coursesRoute from './courses.route.js'; // Đổi extension sang .js nếu cần

function route(app) {
    app.use('/news', newRoute);
    app.use('/courses', coursesRoute);
    app.use('/me', meRoute);
    app.use('/', siteRoute);
}

export default route;
