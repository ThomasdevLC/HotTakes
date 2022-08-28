const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const sauceController = require('../controllers/sauceController');

router.post('/', auth, multer, sauceController.add);
router.get('/', auth, sauceController.get);
router.get('/:id', auth, sauceController.getById);
router.put('/:id', auth, multer, sauceController.modify);
router.delete('/:id', auth, sauceController.delete);
router.post('/:id/like', auth, sauceController.like);

module.exports = router;




