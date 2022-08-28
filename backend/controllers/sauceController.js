const Sauce = require('../models/Sauce');
const fs = require('fs');


exports.add = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    console.log('sauceObject', sauceObject)
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: [],
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });

    sauce.save()
        .then(() => { res.status(201).json({ message: 'product added !' }) })
        .catch(error => { res.status(400).json({ message: error }) })
};


exports.getById = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ message: error }));
}

exports.get = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ message: error }));
}


exports.delete = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() => { res.status(200).json({ message: 'product deleted !' }) })
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};


exports.modify = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
    delete sauceObject._userId;

    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Product modified !' }))
                    .catch(error => res.status(401).json({ message: error }));
            }

        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};


exports.like = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {

            // ADD LIKE
            // user is not in usersLiked array + user clicked on like 
            if (!sauce.usersLiked.includes(req.body.userId) && req.body.like === 1) {
                Sauce.updateOne({ _id: req.params.id },
                    {
                        $inc: { likes: 1 },
                        $push: { usersLiked: req.body.userId }
                    })
                    .then(() => { res.status(201).json({ message: 'User has liked' }) })
                    .catch(error => res.status(404).json({ message: error }));
            }

            // CANCEL LIKE
            // user is in usersLiked array + user clicked on like  
            if (sauce.usersLiked.includes(req.body.userId) && req.body.like === 0) {
                Sauce.updateOne({ _id: req.params.id },
                    {
                        $inc: { likes: -1 },
                        $pull: { usersLiked: req.body.userId }
                    })
                    .then(() => { res.status(201).json({ message: 'User has cancelled his like' }) })
                    .catch(error => res.status(404).json({ message: error }));
            }

            // ADD DISLIKE
            // user is not in usersDisliked array + user clicked on dislike 
            if (!sauce.usersDisliked.includes(req.body.userId) && req.body.like === -1) {
                Sauce.updateOne({ _id: req.params.id },
                    {
                        $inc: { dislikes: 1 },
                        $push: { usersDisliked: req.body.userId }
                    })
                    .then(() => { res.status(201).json({ message: 'User has disliked' }) })
                    .catch(error => res.status(404).json({ message: error }));
            }

            // CANCEL LIKE
            // user is in usersDisliked array + user clicked on like  
            if (sauce.usersDisliked.includes(req.body.userId) && req.body.like === 0) {
                Sauce.updateOne({ _id: req.params.id },
                    {
                        $inc: { dislikes: -1 },
                        $pull: { usersDisliked: req.body.userId }
                    })
                    .then(() => { res.status(201).json({ message: 'User has cancelled his dislike' }) })
                    .catch(error => res.status(404).json({ message: error }));
            }

        })
}