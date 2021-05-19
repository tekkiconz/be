const express = require('express');
const router = express.Router();
const BOOKS_PER_PAGE = require('../helpers/configs').NUMBER_BOOK_PER_PAGE;
const Book = require('../models/book');
const Like = require('../models/like');
const Comment = require('../models/comment');
const Activity = require('../models/activity');
const Category = require('../models/category');
const fileUpload = require('express-fileupload');

router.use(fileUpload());

const auth = require('./middleware/auth');


// ------------------- GET ---------------------------
// GET /api/books
router.get('/books', async (req, res) => {

    // page start at index 0
    var page = req.query.page;
    var ord = req.query.orderBy;
    var cat = req.query.category;

    var start = page * BOOKS_PER_PAGE;
    var end = (page + 1) * BOOKS_PER_PAGE;

    // Sort: 1 -> ASC
    //      -1 -> DESC

    switch (ord) {
        case 'bookName':
            await Book.find(cat ? { category: cat } : {})
                .sort({ bookname: 1 })
                .then(data => {
                    if (!data) {
                        res.status(404).end('books not found');
                    } else {
                        res.status(200).json(data.slice(start, end)).end();
                    }
                })
                .catch(err => {
                    console.log(`Error: ${err.message}`);
                    res.status(400).end(`Error: ${err.message}`);
                });
            break;
        case 'author':
            await Book.find(cat ? { category: cat } : {})
                .sort({ author: 1 })
                .then(data => {
                    if (!data) {
                        res.status(404).end('books not found');
                    } else {
                        res.status(200).json(data.slice(start, end)).end();
                    }
                })
                .catch(err => {
                    console.log(`Error: ${err.message}`);
                    res.status(400).end(`Error: ${err.message}`);
                });
            break;
        case 'category':
            await Book.find(cat ? { category: cat } : {})
                .sort({ category: 1 })
                .then(data => {
                    if (!data) {
                        res.status(404).end('books not found');
                    } else {
                        res.status(200).json(data.slice(start, end)).end();
                    }
                })
                .catch(err => {
                    console.log(`Error: ${err.message}`);
                    res.status(400).end(`Error: ${err.message}`);
                });
            break;
        case 'userid':
            await Book.find(cat ? { category: cat } : {})
                .sort({ userid: 1 })
                .then(data => {
                    if (!data) {
                        res.status(404).end('books not found');
                    } else {
                        res.status(200).json(data.slice(start, end)).end();
                    }
                })
                .catch(err => {
                    console.log(`Error: ${err.message}`);
                    res.status(400).end(`Error: ${err.message}`);
                });
            break;
        default: // sort by name
            await Book.find(cat ? { category: cat } : {})
                .sort({ bookname: 1 })
                .then(data => {
                    if (!data) {
                        res.status(404).end('books not found');
                    } else {
                        res.status(200).json(data.slice(start, end)).end();
                    }
                })
                .catch(err => {
                    console.log(`Error: ${err.message}`);
                    res.status(400).end(`Error: ${err.message}`);
                });
            break;
    }
});

// GET /api/books/5
router.get('/books/:bookID', async (req, res) => {
    var bid = req.params.bookID;
    console.log(bid);
    await Book.findOne({ _id: bid })
        .then(data => {
            if (!data) {
                res
                    .status(404)
                    .json({ err: `Book (ID : ${bid}) not found` })
                    .end();
            } else {
                res.status(200).json(data).end();
            }
        })
        .catch(err => {
            console.log(`Error: ${err.message}`);
            res.status(400).end(`Error: ${err.message}`);
        });
});

// GET /api/books/5/likes
router.get('/books/:bookID/likes', async (req, res) => {
    var bid = req.params.bookID;
    await Book.findOne({ _id: bid })
        .then(data => {
            if (!data) {
                res
                    .status(400)
                    .json({ err: 'Fail to get book likesCount' })
                    .end();
            } else {
                res.status(200).json({ likes: data.likesCount }).end();
            }
        })
        .catch(err => {
            console.log(`Error: ${err.message}`);
            res.status(400).end(`Error: ${err.message}`);
        });
});

// GET /api/books/5/comments
router.get('/books/:bookID/comments', async (req, res) => {
    var bid = req.params.bookID;

    await Comment.find({ bookID: bid }).sort({ createAt: 1 })
        .then(data => {
            if (!data) {
                res
                    .status(404)
                    .json({ err: 'Fail to get book comments' })
                    .end();
            } else {
                console.log('books:', data);
                res.status(200).json(data).end();
            }
        })
        .catch(err => {
            console.log(`Error: ${err.message}`);
            res.status(400).end(`Error: ${err.message}`);
        });
});

// GET /api/books/categories
router.get('/books/categories', async (req, res) => {
    await Category.find({})
        .then(data => {
            if (!data) {
                res.status(404).end('not found any categories');
            }
            res.status(200).json(data).end();
        })
        .catch(err => {
            console.log(`Error: ${err.message}`);
            res.status(400).end(`Error: ${err.message}`);
        });
});

// ------------------- POST ---------------------------
// POST /api/books
router.post('/', async (req, res) => {
    // get book's info
    var newBook = new Book({
        bookname: req.body.bookname,
        author: req.body.author,
        description: req.body.description,
        userid: req.body.userid,
        category: req.body.category,
        likesCount: 0
    });
    // var newActivity = new Activity({
    //     bookid: newBook._id,
    //     bookname: newBook.bookname,
    //     userid: req.user._id,
    //     nameact: 'Post Book'
    // })
    // newActivity.save();
    // console.log(newActivity)


    // save book's info
    await newBook.save((err, book) => {
        if (err) {
            console.log(`Error: ${err.message}`);
            res.status(400).end(`Error: ${err.message}`);
        }
        // save file to server        
        var bookFile = req.files.bookfile;
        var prevFile = req.files.prevfile;
        var exts = prevFile.name.split('.');
        var ext = '.' + exts[exts.length - 1];
        var bookname = 'book_' + book.id + '.pdf';
        var prevname = 'img_' + book.id + ext;

        bookFile.mv(process.cwd() + '/public/books/' + bookname, error => {
            if (error) {
                res.status(400).end(`Error: ${err.message}`);
            }
        });
        prevFile.mv(process.cwd() + '/public/book-previews/' + prevname, error => {
            if (error) {
                res.status(400).end(`Error: ${err.message}`);
            }
        });
        newBook.bookname = bookname;
        newBook.previewname = prevname;
        res.status(200).json(newBook).end();
    });
});

// POST /api/books/images
router.post('/images', async (req, res) => {
    console.log(process.cwd());
    var bookname = 'book_' + 1 + '.pdf';
        var prevname = 'img_' + 1 + '';
        var bookFile = req.files.bookfile;
        var prevFile = req.files.prevfile;
        var exts = prevFile.name.split('.');
        var ext = '.' + exts[exts.length - 1];
        console.log(ext);
    res.end();
})

// POST /api/books/5/likes
router.post('/:bookID/likes', auth, async (req, res) => {
    var bid = req.params.bookID;
    var uid = req.user._id;
    const book = Book.findOne({ _id: bid });
    if (!book) {
        throw new Error()
    }


    await Like.findOne({ bookid: bid, userid: uid })
        .then(data => {
            if (data) {
                res.status(403).end(`User ${uid} liked book ${bid}`);
            } else {
                Book.findOne({ _id: bid })
                    .then(bdata => {
                        var newActivity = new Activity({
                            bookid: bid,
                            userid: req.user._id,
                            nameact: 'Like'
                        })
                        newActivity.save()
                        let currLikeCount = bdata.likesCount;
                        let newLike = new Like({
                            userid: uid,
                            bookid: bid
                        });

                        newLike.save()
                            .then(() => {
                                console.log(`User ${uid} has liked book ${bid}`);
                            })
                            .catch(err => console.log(`Error: ${err.message}`));

                        Book.updateOne(
                            { _id: bid },
                            {
                                $set: {
                                    "likesCount": currLikeCount + 1
                                }
                            }
                        );
                        res.status(200).end('Increased like count');
                    })
                    .catch(err => {
                        console.log(`Error: ${err.message}`);
                        res.status(400).end(`Error: ${err.message}`);
                    });
            }
        })
        .catch(err => {
            console.log(`Error: ${err.message}`);
            res.status(400).end(`Error: ${err.message}`);
        });
});

// POST /api/books/5/comments
router.post('/:bookID/comments', auth, async (req, res) => {
    var bid = req.params.bookID;
    var newCmt = new Comment({
        userid: req.user._id,
        bookid: bid,
        cmt: req.body.cmt
    });
    var newActivity = new Activity({
        bookid: bid,
        userid: req.user._id,
        nameact: 'Comment'
    })
    newActivity.save()
    console.log(newActivity)
    await newCmt.save()
        .then(() => {
            res.status(200).end(`New comment on book ${bid}`);
        })
        .catch(err => {
            console.log(`Error: ${err.message}`);
            res.status(400).end(`Error: ${err.message}`);
        });
});

// POST /api/books/categories
router.post('/books/categories', async (req, res) => {
    var ctype = req.body.type;
    var newCat = new Category({
        type: ctype
    });
    await newCat.save()
        .then(() => {
            res.status(200).end(`New category: ${ctype}`);
        })
        .catch(err => {
            console.log(`Error: ${err.message}`);
            res.status(400).end(`Error: ${err.message}`);
        });
});

module.exports = router;