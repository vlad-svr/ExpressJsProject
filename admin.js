module.exports = function (req, res, con, callback) {
    con.query(
        `SELECT * FROM user WHERE id="${req.cookies.id}" AND hash="${req.cookies.hash}"`,
        function (err, result) {
            if (err) throw err;
            let data = JSON.parse(JSON.stringify(result))[0]
            if (!data?.id) {
                res.redirect('/login')
                return
            }
            callback()
        });
}