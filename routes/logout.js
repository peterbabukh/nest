exports.get = function(req, res){

    req.session.destroy(function(err) {
        if (err) return console.log(err);

        res.redirect('/');
    });

};