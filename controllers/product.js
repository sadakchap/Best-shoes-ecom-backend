const { Product } = require('../models/product');
const formiable = require('formidable');
const _ = require('lodash');

//TODO: Saved product photos in firbase

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
    const sortBy = req.query.sortBy ? req.query.sortBy: "_id";
    const limit = req.query.limit ? req.query.limit : 8;

    Product.find()
        .select('-photo')
        .populate('category')
        .sort([[sortBy, "asc"]])
        .limit(limit)
        .exec((err, productd) => {
            if(err || !products){
                return res.status(400).json({
                    error: 'No products found!'
                });
            }
            return res.status(200).json(products);
        });
};

exports.createProduct = (req, res) => {
    let form = formiable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (err, fields, file) => {
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
            product.photo.data = fs.readFileSync(file.photo.path);
            product.photo.contentType = file.photo.type;
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

    form.parse(req, (err, fields, file) => {
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
            product.photo.data = fs.readFileSync(file.photo.path);
            product.photo.contentType = file.photo.type;
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

exports.photo = (req, res, next) => {
    if(req.product.photo.data){
        res.set("Content-Type", req.product.photo.contentType);
        return res.send(req.product.photo.data);
    }
    next();
};