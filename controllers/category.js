const Category = require('../models/category');

exports.getCategoryById = (req, res, next, id) => {
    Category.findById(id).exec((err, category) => {
        if(err || !category){
            return res.status(400).json({
                error: 'Sorry, something went wrong!'
            });
        }
        req.category = category;
        next();
    });
};

exports.createCategory = (req, res) => {
    const { name } = req.body;
    if(!name){
        return res.status(400).json({
            error: 'Name is required field!'
        });
    }
    Category.findOne({ name }).exec((err, category) => {
        if(err || !category){
            return res.status(400).json({
                error: 'Category name must be unique!'
            });
        }
        const newCategory = new Category({ name });
        newCategory.save((err, saved) => {
            if(err){
                return res.status(400).json({
                    error: 'Sorry, something went wrong!'
                });
            }
            return res.json({ category: saved });
        })
    })
};

exports.updateCategory = (req, res) => {
    const category = req.category;
    category.name = req.body.name;
    category.save((err, saved) => {
        if(err){
            return res.status(400).json({
                error: 'Sorry, something went wrong!'
            });
        }
        return res.status(200).json(saved)
    });
};

exports.removeCategory = (req, res) => {
    const category = req.category;
    category.remove((err, removedCategory) => {
        if(err){
            return res.status(400).json({
                error: 'Sorry something went wrong'
            });
        }
        return res.status(200).json({
            message: `Category "${removedCategory.name}" removed!`
        });
    })
};

exports.getCategory = (req, res) => {
    return res.status(200).json(req.category);
};

exports.getAllCategories = (req, res) => {
    Category.find().exec((err, categories) => {
        if(err || !categories){
            return res.status(400).json({
                error: 'No categories found in DB!'
            });
        }
        return res.json(categories);
    })
};