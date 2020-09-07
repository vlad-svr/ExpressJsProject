let express = require('express');
let app = express();
const { check, validationResult } = require('express-validator');
const mysql = require("mysql");
const config = require("./config");
const nodemailer = require("nodemailer");
let cookie = require('cookie');
let cookieParser = require('cookie-parser')
let checkAdmin = require("./admin")
let generateString = require("./generate")

app.use(express.static('public'));
app.set('view engine', 'pug');

app.use(express.json())
app.use(express.urlencoded())
app.use(cookieParser())


app.use(function (req, res, next) {
    let url = ['/admin', '/admin-order']
    if (url.includes(req.originalUrl)) {
        checkAdmin(req, res, con, next);
        return;
    } else {
        next()
    }
})

let con = mysql.createConnection({
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.nameDatabase
});

app.listen(3000, function () {
    console.log('node express work on 3000 port')
})


app.get("/", function (req, res) {
    let goods = new Promise(function (resolve, reject) {
        con.query(`select id,name, cost, image, category from (select id,name,cost,image,category, if(if(@curr_category != category, @curr_category := category, '') != '', @k := 0, @k := @k + 1) as ind   from goods, ( select @curr_category := '' ) v ) goods where ind < 3`,
            function (err, result, fields) {
                if (err) return reject(err)
                resolve(result)
            })
    })
    let catDescription = new Promise(function (resolve, reject) {
        con.query(`SELECT * FROM category`,
            function (err, result, fields) {
                if (err) return reject(err)
                resolve(result)
            })
    })

    Promise.all([goods, catDescription]).then(function (value) {
        res.render('index', {
            goods: JSON.parse(JSON.stringify(value[0])),
            cat: JSON.parse(JSON.stringify(value[1])),
            currency: config.currency
        });
    })
})

app.get("/cat/:id", function (req, res) {
    let catId = req.params.id;
    let cat = new Promise(function (resolve, reject) {
        con.query(`SELECT * FROM category WHERE id = ${catId}`,
            function (err, results) {
                if (err) throw err;
                resolve(results);
            });
    })

    let goods = new Promise(function (resolve, reject) {
        con.query(`SELECT * FROM goods WHERE category = ${catId}`,
            function (err, results) {
                if (err) throw err;
                resolve(results);
            });
    })

    Promise.all([cat, goods])
        .then(function (value) {
            res.render('cat', {
                cat: JSON.parse(JSON.stringify(value[0])),
                goods: JSON.parse(JSON.stringify(value[1])),
                currency: config.currency
            });
        })
        .catch(function (err) {
            throw err;
        })

})

app.get("/goods/:id", function (req, res) {
    let id = req.params.id;
    con.query(`SELECT * FROM goods WHERE id = ${id}`,
        function (err, result) {
            if (err) throw err;
            let data = JSON.parse(JSON.stringify(result));

            con.query(`SELECT * FROM images WHERE goods_id = ${data[0]['id']}`,
                function (err2, result2) {
                    console.log(data[0]['id'])
                    let images = JSON.parse(JSON.stringify(result2));
                    if (!images['0']?.id) images = null;
                    console.log(data)
                    res.render('goods', {
                        goods: data,
                        images: images,
                        currency: config.currency
                    });
                })
        });
})


app.post("/get-category-list", function (req, res) {
    con.query(`SELECT id, category FROM category`,
        function (err, result) {
            if (err) throw err;
            res.json(result)
        });
})

app.post("/get-goods-info", function (req, res) {
    let id = req.body;
    let strId = id.key.join(',')
    if (id.key.length != 0) {
        con.query(`SELECT * FROM goods WHERE id IN (${strId})`,
            function (err, result) {
                if (err) throw err;
                let goods = {}
                for (let i = 0; i < result.length; i++) {
                    goods[result[i]['id']] = result[i]
                }
                goods.currency = config.currency
                res.json(goods)
            });
    } else {
        res.send('0')
    }
})


app.get("/order", function (req, res) {
    res.render('order');
})

app.post("/finish-order", [
    check('cart').exists({ checkFalsy: true })
        .withMessage('Нет товаров'),

    check('username').trim().not().isEmpty()
        .withMessage('Неверное имя пользователя'),

    check('phone').trim().isMobilePhone('be-BY')
        .withMessage('Неверный формат номера телефона'),

    check('email').trim().isEmail()
        .withMessage('Неверный email'),

    check('address').trim().not().isEmpty()
        .withMessage('Некорректный адрес'),
], function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    let data = req.body
    let key = Object.keys(data.cart)

    con.query(`SELECT * FROM goods WHERE id IN (${key.join(',')})`,
        function (err, result) {
            if (err) throw err;

            sendMail(data, result).catch(console.error)
            saveOrder(data, result)
            res.send('1')
        });

})

app.get("/admin", function (req, res) {
    res.render('admin/admin')
})


app.get("/admin-order", function (req, res) {
    con.query(`SELECT 
            shop_order.id as id,
            shop_order.user_id as user_id,
            shop_order.goods_id as goods_id,
            shop_order.goods_cost as goods_cost,
            shop_order.goods_amount as goods_amount,
            shop_order.total as total,
            from_unixtime(date, '%Y-%m-%d %h:%m') as human_date,
            user_info.user_name as user,
            user_info.user_phone as phone,
            user_info.address as address
        FROM
            shop_order
        LEFT JOIN
            user_info 
        ON shop_order.user_id = user_info.id
        ORDER BY id DESC`,
        function (err, result) {
            if (err) throw err;
            res.render('admin/admin-order', {
                order: JSON.parse(JSON.stringify(result)),
                currency: config.currency
            });
        });
})

/**
 * Login form
 */
app.route("/login")
    .get(function (req, res) {
        res.render('login');
    })

    .post(function (req, res) {
        con.query(`SELECT * FROM user WHERE login="${req.body.login}" and password="${req.body.password}"`,
            function (err, result) {
                if (err) throw err;
                let data = JSON.parse(JSON.stringify(result))[0]
                if (!data?.id) {
                    res.redirect('/login')
                    // res.status(422).send('0')
                    return
                }
                let hashString = generateString(32);
                res.cookie('hash', hashString,
                    { expires: new Date(Date.now() + 2 * 100000000) });
                res.cookie('id', data.id);

                sql = `UPDATE user SET hash='${hashString}' WHERE id=${data.id}`;
                con.query(sql, function (err, resultQuery) {
                    if (err) throw err;
                    res.redirect('/admin')
                })
                // res.send('work')
            });
    })

function saveOrder(data, result) {
    let sql = `INSERT INTO user_info (user_name, user_phone, user_email, address) VALUES ('${data.username}', '${data.phone}', '${data.email}', '${data.address}')`
    con.query(sql,
        function (err, res) {
            if (err) throw err;
            let userId = res.insertId;
            date = new Date() / 1000
            console.log('date: ', date)
            console.log('date2: ', new Date())
            console.log('result: ', result)
            console.log('data: ', data)
            for (let i = 0; i < result.length; i++) {
                sql = `INSERT INTO shop_order(date, user_id, goods_id, goods_cost, goods_amount, total) 
                VALUES (${date}, ${userId}, ${result[i]['id']}, ${result[i]['cost']}, ${data.cart[result[i]['id']]},  ${data.cart[result[i]['id']] * result[i]['cost']})`;
                con.query(sql, (err, res) => {
                    if (err) throw err;
                    console.log(res)
                })
            }
        });
}

async function sendMail(data, result) {
    let res = '<h2>Order in lite shop</h2>';
    let total = 0;
    for (let i = 0; i < result.length; i++) {
        res += `<p>${result[i]['name']} - ${result[i]['id']} - ${data.cart[result[i]['id']]}шт. - ${formatPrice(result[i]['cost'] * data.cart[result[i]['id']])} ${config.currency}</p>`;
        total += result[i]['cost'] * data.cart[result[i]['id']]
    }
    console.log(res)
    res += '<hr>';
    res += `Total: ${formatPrice(total)} ${config.currency}`;
    res += `<hr>Phone: ${data.phone}`;
    res += `<hr>Username: ${data.username}`;
    res += `<hr>Address: ${data.address}`;
    res += `<hr>Email: ${data.email}`;


    let testAccount = await nodemailer.createTestAccount();

    let transporter = nodemailer.createTransport({
        host: config.mail.host,
        port: config.mail.port,
        secure: config.mail.secure, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass // generated ethereal password
        }
    });

    let info = await transporter.sendMail({
        from: config.mail.info.from, // sender address
        to: data.email, // list of receivers
        subject: config.mail.info.subject, // Subject line
        text: `Заказ №${Date.now()}`, // plain text body
        html: res // html body
    });
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

function formatPrice(price) {
    return price.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$& ')
}


