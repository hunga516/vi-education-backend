class NewController {
    index(req, res) {
        res.render('news');
    }

    show(req, res) {
        console.log(req);
        res.send(``);
    }
}

export default new NewController();
