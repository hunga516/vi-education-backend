import coursesRoute from './courses.route.js';
import usersRoute from './users.route.js';
import lessonsRoute from './lessons.route.js';
import chaptersRoute from './chapter.route.js';
import postsRoute from './posts.route.js';
import commentsRoute from './comments.route.js';
import reactionsRoute from './reactions.route.js';
import takenotesRoute from './takenote.route.js';
import roomsRoute from './room.route.js';
import messagesRoute from './message.route.js';

function route(app) {
    app.use('/users', usersRoute);
    app.use('/courses', coursesRoute);
    app.use('/chapters', chaptersRoute);
    app.use('/lessons', lessonsRoute);
    app.use('/posts', postsRoute);
    app.use('/comments', commentsRoute);
    app.use('/reactions', reactionsRoute);
    app.use('/takenotes', takenotesRoute);
    app.use('/rooms', roomsRoute);
    app.use('/messages', messagesRoute);
}

export default route;
