const Product = require('../models/product');
const formiable = require('formidable');
const _ = require('lodash');
const uploadImage = require('../helpers/uploadToStorage');

exports.getProductById = (req, res, next, id) => {
    Product.findById(id).exec((err, product) => {
        if(err || !product){
            return res.status(400).json({
                error: 'sorry, somethinng went wrong!'
            });
        }
        req.product = product;
        next();
    });
};

exports.getProduct = (req, res) => {
    return res.json(req.product);
};

exports.getAllProducts = (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit) : 9;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    
    Product.find()
        .populate('category')
        .sort('-createdAt')
        .skip(limit * (page - 1))
        .limit(limit)
        .exec((err, products) => {
            if(err || !products){
                return res.status(400).json({
                    error: 'No products found!'
                });
            }
            return res.status(200).json(products);
        });
};

exports.filterProductByQuery = (req, res) => {
    const serachText = req.query.q;
    if(!serachText){
        res.status(400).json({
            message: 'Empty query!'
        });
    }
    Product.find({'name' : new RegExp(serachText, 'i')}).exec((err, products) => {
        if(err){
            return res.status(400).json({
                error: `problem with ${err.message}`
            });
        }
        return res.status(200).json(products)
    });
};

exports.createProduct = (req, res) => {
    let form = formiable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, async (err, fields, file) => {
        if(err){
            return res.status(400).json({
                error: `problem with ${err.message}`
            });
        }
        const { name, price, desc, stock, category } = fields;
        if(!name || !price || !desc || !stock || !category){
            return res.status(400).json({
                error: 'All fields are required!'
            });
        }
        let product = new Product(fields);
        
        // handle file
        if(file.photo){
            if(file.photo.size > 3000000){
                return res.status(400).json({ error: 'file size too big' });
            }
            const upload = await uploadImage(file.photo);
            if(upload.error){
                return res.status(500).json({
                    error: upload.error
                });
            }
            product.photo_url = upload.downloadURL;
        }
        product.save((err, savedProduct) => {
            if(err){
                return res.status(400).json({
                    error: 'sorry, something went wrong!'
                });
            }
            return res.status(200).json(savedProduct);
        });
    })
};

exports.updateProduct = (req, res) => {
    let form = formiable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, async (err, fields, file) => {
        if(err){
            return res.status(400).json({
                error: `problem with ${err.message}`
            });
        }
        
        let product = req.product;
        product = _.extend(product, fields);
        
        // handle file
        if(file.photo){
            if(file.photo.size > 3000000){
                return res.status(400).json({ error: 'file size too big' });
            }
            const upload = await uploadImage(file.photo);
            if(upload.error){
                return res.status(500).json({
                    error: upload.error
                });
            }
            product.photo_url = upload.downloadURL;
        }

        product.save((err, updatedProduct) => {
            if(err || !updatedProduct){
                return res.status(400).json({
                    error: 'sorry, something went wrong!'
                });
            }
            return res.status(200).json(updatedProduct);
        });
    })

};

exports.removeProduct = (req, res) => {
    const product = req.product;
    product.remove((err, removed) => {
        if(err){
            return res.status(400).json({
                error: 'sorry, something went wrong!'
            });
        }
        return res.status(200).json({
            message: `Product ${removed.name} deleted!`
        });
    });
};

exports.getAllUniqueCategory = (req, res) => {
    Product.distinct("category", {}, (err, products) => {
        if(err || !products){
            return res.status(400).json({
                error: 'No products found!'
            });
        }
        return res.status(200).json(products);
    })
};

// middlewares
exports.updateStock = (req, res, next) => {
    let myOperations = req.body.order.products.map(product => {
        return {
            updateOne: {
                filter: { _id: product._id },
                update: {$inc: {stock: -product.count, sold: +product.count} }
            }
        }
    });

    Product.bulkWrite(myOperations, (err, products) => {
        if(err){
            console.log(err.message);
            return res.status(400).json({ error: 'Bulk operations failed!' });
        }
        next();
    })
};