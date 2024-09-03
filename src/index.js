import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import express from 'express';
import morgan from 'morgan';
import { engine } from 'express-handlebars';
import methodOverride from 'method-override';

const port = 3000;
import route from './routes/index.js'
import Connect from './config/db/index.js';
import SortMiddleware from './app/middlewares/SortMiddleware.js';
import icons from './public/icons/index.js';
import getIcon from './public/icons/index.js';
const app = express();

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

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

