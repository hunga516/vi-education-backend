import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import express from 'express';
import morgan from 'morgan';
import { engine } from 'express-handlebars';
import methodOverride from 'method-override';

const port = process.env.PORT || 3001;
import route from './routes/index.js'
import Connect from './config/db/index.js';
import SortMiddleware from './app/middlewares/SortMiddleware.js';
import icons from './public/icons/index.js';
import cors from 'cors';

import { Server } from "socket.io";
import { createServer } from 'node:http';


const app = express();


//Use socket.io
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'https://vi-education.vercel.app', // Xác định trực tiếp domain của frontend
        methods: ['GET', 'POST']
    }
});


const users = {};

io.on('connection', (socket) => {
    socket.on('user:join-room', (data) => {
        socket.join(data.room);
        users[socket.id] = data.userId;
        console.log(`${users[socket.id]} joined room: ${data.room}`);

        const usersInRoom = io.sockets.adapter.rooms.get(data.room);

        if (usersInRoom) {
            const userIdsInRoom = [...usersInRoom].map(socketId => users[socketId]);
            console.log('User IDs in room:', userIdsInRoom);

            // Gửi danh sách userId về client
            socket.to(data.room).emit('user:update-online', userIdsInRoom);
            socket.emit('user:update-online', userIdsInRoom);
        } else {
            console.log('No users in room');
        }
    });

    socket.on('user:left-room', (data) => {
        socket.leave(data.room);
        delete users[socket.id];

        const usersInRoom = io.sockets.adapter.rooms.get(data.room);

        if (usersInRoom) {
            const userIdsInRoom = [...usersInRoom].map(socketId => users[socketId]);
            console.log('User IDs in room:', userIdsInRoom);

            // Gửi danh sách userId về client
            socket.to(data.room).emit('user:update-online', userIdsInRoom);
            socket.emit('user:update-online', userIdsInRoom);
        } else {
            console.log('No users left in the room');
        }
    });

    socket.on('disconnect', () => {
        console.log(`User ${users[socket.id]} disconnected`, socket.id);
        delete users[socket.id]; // Xóa user khi ngắt kết nối
    });
});








app.use((req, res, next) => {
    req.io = io
    next()
})

// Enable CORS
app.use(cors());

// Method POST Override
app.use(methodOverride('_method'));

// Middleware để xử lý dữ liệu form
app.use(express.urlencoded({ extended: true }));

// Middleware để xử lý dữ liệu JSON
app.use(express.json());

// Connect to database
Connect();

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// HTTP logger
app.use(morgan('combined'));

//Custom middleware
app.use(SortMiddleware)

// Template engine
app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'resource', 'views', 'layouts'),
    partialsDir: path.join(__dirname, 'resource', 'views', 'partials'),
    helpers: {
        sortable: function (field, sort) {
            const currentType = field === sort.column ? sort.type : "default"

            const types = {
                default: "desc",
                desc: "asc",
                asc: "desc"
            }

            const iconsType = {
                default: "elevator",
                desc: "down",
                asc: "up"
            }

            const type = types[currentType] //or sort.type
            const iconType = iconsType[currentType]
            return `
                <span>
                <a href="?_sort&column=${field}&type=${type}">
                    ${icons[iconType]}
                </a>
                </span>
                   `
        },
    }
}));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resource', 'views'));

// Routes init
route(app)

server.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

